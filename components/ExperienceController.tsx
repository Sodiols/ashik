"use client";
import { useEffect } from "react";
import type { SectionId } from "@/data/site";
import { reducedMotionQuery, stageQuery } from "@/animations/config";

type Engine = ReturnType<
  typeof import("@/animations/experience").createExperienceMotion
>;
const ids: SectionId[] = ["home", "work", "about", "contact"];
const isSection = (id: string): id is SectionId => ids.includes(id as SectionId);
// Safari has no requestIdleCallback.
const hasIdle = () => typeof window.requestIdleCallback === "function";
const idle = (callback: () => void): number =>
  hasIdle()
    ? window.requestIdleCallback(callback, { timeout: 2500 })
    : window.setTimeout(callback, 1200);
const cancelIdle = (handle: number) =>
  hasIdle() ? window.cancelIdleCallback(handle) : window.clearTimeout(handle);

/**
 * Homepage behaviour without React state: section navigation, aria-current,
 * and loading the optional motion engine. The page is fully usable with
 * native scrolling before (or without) the engine.
 *
 * Motion loads after the first paint when the browser is idle, or earlier on
 * the first scroll intent. Navigation never waits for it.
 */
export function ExperienceController() {
  useEffect(() => {
    const stage = document.querySelector<HTMLElement>(".experience");
    const [hero, work, about, contact] = ids.map((id) => document.getElementById(id));
    if (!stage || !hero || !work || !about || !contact) return;
    const nodes: Record<SectionId, HTMLElement> = { home: hero, work, about, contact };
    const root = document.documentElement;
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".header nav a"));
    const reduced = matchMedia(reducedMotionQuery);
    const spatial = matchMedia(stageQuery);

    let engine: Engine | null = null;
    let loading: Promise<void> | null = null;
    let disposed = false;
    let active: SectionId | null = null;
    let target: SectionId | null = null;
    let request = 0;
    let scrollTween: { kill(): void; isActive(): boolean } | null = null;
    let formInteraction = 0;
    let idleHandle = 0;
    let refreshFrame = 0;

    // Off-screen scenes skip rendering at startup (.defer-render). Render them
    // before anything depends on exact geometry.
    const reveal = () => {
      if (!root.hasAttribute("data-rendered")) root.setAttribute("data-rendered", "");
    };

    const setActive = (id: SectionId) => {
      if (id === active) return;
      active = id;
      for (const link of links) {
        if (link.hash === `#${id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    };

    const load = (): Promise<void> => {
      if (engine || reduced.matches) return Promise.resolve();
      reveal();
      loading ??= import("@/animations/experience")
        .then(({ createExperienceMotion }) => {
          if (disposed) return;
          engine = createExperienceMotion(
            { stage, hero, work, about, contact },
            (id) => {
              if (!target) setActive(id);
            },
            resumeNavigation,
          );
          resumeNavigation();
        })
        .catch(() => {
          // Native scrolling remains; allow a later retry.
          loading = null;
        });
      return loading;
    };

    // Spatial viewports: after load, when idle. Flow viewports: as About nears.
    const schedule = () => {
      if (engine || reduced.matches || !spatial.matches) return;
      const start = () => {
        cancelIdle(idleHandle);
        idleHandle = idle(() => void load());
      };
      if (document.readyState === "complete") start();
      else window.addEventListener("load", start, { once: true });
    };
    const approaching = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void load();
      },
      { rootMargin: "400px 0px" },
    );
    approaching.observe(about);
    approaching.observe(contact);

    const sections = new IntersectionObserver(
      (entries) => {
        if (target) return;
        for (const entry of entries) {
          const id = entry.target.id as SectionId;
          // The pinned stage reports home/work itself.
          if (!entry.isIntersecting) continue;
          if (stage.hasAttribute("data-enhanced") && (id === "home" || id === "work")) continue;
          setActive(id);
        }
      },
      { rootMargin: "-30% 0px -45% 0px" },
    );
    ids.forEach((id) => sections.observe(nodes[id]));

    const targetY = (id: SectionId) => {
      if (id === "home") return 0;
      if (id === "work" && engine?.spatial) return innerHeight;
      return nodes[id].getBoundingClientRect().top + scrollY;
    };

    // Keep a native navigation that was already under way on course when the
    // motion engine arrives or ScrollTrigger re-measures mid-scroll.
    const resumeNavigation = () => {
      if (target && !scrollTween) window.scrollTo({ top: targetY(target), behavior: "smooth" });
    };

    const cancelNavigation = () => {
      scrollTween?.kill();
      scrollTween = null;
      target = null;
    };

    const navigate = (id: SectionId) => {
      cancelNavigation();
      reveal();
      const element = nodes[id];
      const current = ++request;
      target = id;
      setActive(id);
      history.pushState(null, "", `#${id}`);
      const y = targetY(id);
      const interactionAtStart = formInteraction;
      const focus = () => {
        // An enquiry may start before the scroll finishes; keep that focus.
        if (formInteraction === interactionAtStart && !element.contains(document.activeElement))
          element.focus({ preventScroll: true });
      };
      if (reduced.matches) {
        window.scrollTo({ top: y, behavior: "instant" });
        target = null;
        focus();
        return;
      }
      if (engine?.spatial) {
        scrollTween = engine.scroll(y, () => {
          scrollTween = null;
          target = null;
          focus();
        });
        return;
      }
      window.scrollTo({ top: y, behavior: "smooth" });
      focus();
      // Only this navigation may clear its own target.
      const settle = () => {
        if (current === request) target = null;
      };
      window.addEventListener("scrollend", settle, { once: true });
      window.setTimeout(settle, 1500);
      void load();
    };

    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.hash.slice(1) ?? "";
      if (!isSection(id)) return;
      event.preventDefault();
      navigate(id);
    };

    // A real scroll gesture cancels programmatic navigation and is the
    // earliest signal to bring in spatial motion.
    const intent = () => {
      cancelNavigation();
      reveal();
      if (spatial.matches) void load();
    };
    // Any scroll (including programmatic) renders deferred scenes and warms
    // motion, but only a real gesture (above) cancels navigation.
    const scrolled = () => {
      reveal();
      if (spatial.matches) void load();
    };
    const keyIntent = (event: KeyboardEvent) => {
      if (["PageDown", "PageUp", "ArrowDown", "ArrowUp", " ", "End", "Home"].includes(event.key))
        intent();
    };
    const focusIntent = (event: FocusEvent) => {
      if (event.target instanceof Element && event.target.closest(".defer-render, .defer-render-flow")) reveal();
    };
    const trackForm = (event: Event) => {
      if (event.target instanceof Element && event.target.closest(".contact-form")) formInteraction++;
    };
    // ScrollTrigger.refresh() re-applies the scroll position, which would cut
    // short a smooth scroll in progress; wait until scrolling has settled.
    let lastScroll = 0;
    const trackScroll = () => (lastScroll = performance.now());
    const refresh = () => {
      window.clearTimeout(refreshFrame);
      refreshFrame = window.setTimeout(() => {
        if (scrollTween?.isActive() || performance.now() - lastScroll < 200) refresh();
        else engine?.refresh();
      }, 200);
    };
    const settleContact = (event: Event) => {
      if (scrollTween?.isActive() && target !== "contact") {
        event.preventDefault();
        return;
      }
      cancelNavigation();
    };
    const mediaChange = () => schedule();

    document.addEventListener("click", click);
    document.addEventListener("focusin", trackForm);
    document.addEventListener("focusin", focusIntent);
    document.addEventListener("pointerdown", trackForm);
    window.addEventListener("scroll", scrolled, { passive: true, once: true });
    window.addEventListener("scroll", trackScroll, { passive: true });
    window.addEventListener("wheel", intent, { passive: true });
    window.addEventListener("touchstart", intent, { passive: true });
    window.addEventListener("keydown", keyIntent);
    window.addEventListener("portfolio:layout", refresh);
    window.addEventListener("portfolio:contact-success", settleContact);
    spatial.addEventListener("change", mediaChange);
    reduced.addEventListener("change", mediaChange);
    void document.fonts?.ready.then(refresh);

    const hash = location.hash.slice(1);
    if (isSection(hash)) {
      setActive(hash);
      if (hash !== "home") {
        // The browser jumped using placeholder sizes; settle on the real position.
        reveal();
        nodes[hash].scrollIntoView({ block: "start", behavior: "instant" });
      }
    }
    schedule();

    return () => {
      disposed = true;
      cancelNavigation();
      cancelIdle(idleHandle);
      window.clearTimeout(refreshFrame);
      window.removeEventListener("scroll", trackScroll);
      approaching.disconnect();
      sections.disconnect();
      document.removeEventListener("click", click);
      document.removeEventListener("focusin", trackForm);
      document.removeEventListener("focusin", focusIntent);
      document.removeEventListener("pointerdown", trackForm);
      window.removeEventListener("scroll", scrolled);
      window.removeEventListener("wheel", intent);
      window.removeEventListener("touchstart", intent);
      window.removeEventListener("keydown", keyIntent);
      window.removeEventListener("portfolio:layout", refresh);
      window.removeEventListener("portfolio:contact-success", settleContact);
      spatial.removeEventListener("change", mediaChange);
      reduced.removeEventListener("change", mediaChange);
      engine?.dispose();
      engine = null;
    };
  }, []);
  return null;
}
