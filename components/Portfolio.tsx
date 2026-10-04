"use client";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type gsap from "gsap";
import { Header } from "./Header";
import { OpticalLens } from "./OpticalLens";
import { Footer } from "./Footer";
import { Hero } from "@/sections/Hero";
import { SelectedWork } from "@/sections/SelectedWork";
import { About } from "@/sections/About";
import { Contact } from "@/sections/Contact";
import type { SectionId } from "@/data/site";
import { desktopStageQuery } from "@/animations/config";

export function Portfolio() {
  const root = useRef<HTMLDivElement>(null);
  const scrollTween = useRef<gsap.core.Tween | null>(null);
  const engine = useRef<ReturnType<
    typeof import("@/animations/experience").createExperienceMotion
  > | null>(null);
  const prepareMotion = useRef<(() => Promise<void>) | null>(null);
  const navigationRequest = useRef(0);
  const formInteraction = useRef(0);
  const navigationTarget = useRef<SectionId>("home");
  const [active, setActive] = useState<SectionId>("home");
  const navigate = useCallback(
    (id: SectionId, event?: React.MouseEvent<HTMLAnchorElement>) => {
      event?.preventDefault();
      scrollTween.current?.kill();
      const request = ++navigationRequest.current;
      const move = () => {
        if (request !== navigationRequest.current) return;
        const element = document.getElementById(id);
        if (!element) return;
        const enhanced =
          root.current?.querySelector<HTMLElement>(".experience")?.dataset
            .enhanced === "true";
        const headerOffset = Math.max(
          76,
          root.current?.querySelector(".header")?.getBoundingClientRect().height ?? 76,
        );
        const y =
          id === "home"
            ? 0
            : id === "work" && enhanced
              ? innerHeight
              : element.getBoundingClientRect().top +
                scrollY -
                (id === "work" ? headerOffset : 0);
        setActive(id);
        navigationTarget.current = id;
        history.pushState(null, "", `#${id}`);
        const interactionAtStart = formInteraction.current;
        const focusSection = () => {
          // An enquiry may start before the scroll animation finishes.
          if (formInteraction.current === interactionAtStart && !element.contains(document.activeElement))
            element.focus({ preventScroll: true });
        };
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced || !engine.current || !matchMedia(desktopStageQuery).matches) {
          window.scrollTo({ top: y, behavior: reduced ? "instant" : "smooth" });
          element.focus({ preventScroll: true });
          return;
        }
        scrollTween.current = engine.current.scroll(y, focusSection);
      };
      if (
        !engine.current &&
        prepareMotion.current &&
        matchMedia("(prefers-reduced-motion: no-preference)").matches
      ) {
        void prepareMotion.current().then(move);
      } else move();
    },
    [],
  );
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const stage = element.querySelector<HTMLElement>(".experience")!;
    const hero = element.querySelector<HTMLElement>(".hero")!;
    const work = element.querySelector<HTMLElement>(".selected-work")!;
    [
      hero,
      work,
      document.getElementById("about"),
      document.getElementById("contact"),
    ].forEach((el) => {
      if (el) el.tabIndex = -1;
    });
    let disposed = false;
    let loading: Promise<void> | null = null;
    const desktop = matchMedia(
      `${desktopStageQuery} and (prefers-reduced-motion: no-preference)`,
    );
    const motionAllowed = matchMedia("(prefers-reduced-motion: no-preference)");
    const loadMotion = (): Promise<void> => {
      if (!motionAllowed.matches || engine.current) return Promise.resolve();
      if (loading) return loading;
      loading = import("@/animations/experience")
        .then(({ createExperienceMotion }) => {
          if (disposed) return;
          engine.current = createExperienceMotion(element, setActive);
          engine.current.refresh();
        })
        .catch(() => {
          /* Native scrolling remains available if the optional motion chunk fails. */
        })
        .finally(() => {
          loading = null;
        });
      return loading;
    };
    prepareMotion.current = loadMotion;
    const sectionNodes = Array.from(element.querySelectorAll<HTMLElement>(".about,.contact"));
    const updateMotion = () => {
      const nearSection = sectionNodes.some((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top < innerHeight + 400 && rect.bottom > 0;
      });
      if (desktop.matches || nearSection) void loadMotion();
    };
    desktop.addEventListener("change", updateMotion);
    motionAllowed.addEventListener("change", updateMotion);
    const preload = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void loadMotion();
    }, { rootMargin: "400px 0px" });
    sectionNodes.forEach((section) => preload.observe(section));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            (stage.dataset.enhanced !== "true" ||
              !["home", "work"].includes(entry.target.id))
          )
            setActive(entry.target.id as SectionId);
        });
      },
      { rootMargin: "-30% 0px -45% 0px" },
    );
    element
      .querySelectorAll(".hero,.selected-work,.about,.contact")
      .forEach((el) => observer.observe(el));
    const anchor = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      const id = link?.getAttribute("href")?.slice(1);
      if (
        id &&
        ["home", "work", "about", "contact"].includes(id) &&
        !event.defaultPrevented
      ) {
        event.preventDefault();
        navigate(id as SectionId);
      }
    };
    const cancel = () => {
      navigationRequest.current++;
      scrollTween.current?.kill();
    };
    const refreshLayout = () => { engine.current?.refresh(); };
    const settleContact = (event: Event) => {
      if (scrollTween.current?.isActive() && navigationTarget.current !== "contact") {
        event.preventDefault();
        return;
      }
      cancel();
    };
    const trackFormInteraction = (event: Event) => {
      if (event.target instanceof Element && event.target.closest(".contact-form")) formInteraction.current++;
    };
    element.addEventListener("focusin", trackFormInteraction);
    element.addEventListener("pointerdown", trackFormInteraction);
    window.addEventListener("portfolio:layout", refreshLayout);
    window.addEventListener("portfolio:contact-success", settleContact);
    element.addEventListener("click", anchor);
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    const hash = location.hash.slice(1);
    const initialRequest = navigationRequest.current;
    const initial = requestAnimationFrame(() => {
      const ready = desktop.matches || ["work", "about", "contact"].includes(hash)
        ? loadMotion()
        : Promise.resolve();
      void ready.then(() => {
        if (
          !disposed &&
          navigationRequest.current === initialRequest &&
          hash &&
          ["home", "work", "about", "contact"].includes(hash)
        )
          navigate(hash as SectionId);
      });
    });
    return () => {
      cancelAnimationFrame(initial);
      disposed = true;
      cancel();
      prepareMotion.current = null;
      desktop.removeEventListener("change", updateMotion);
      motionAllowed.removeEventListener("change", updateMotion);
      preload.disconnect();
      engine.current?.dispose();
      engine.current = null;
      observer.disconnect();
      element.removeEventListener("click", anchor);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("portfolio:layout", refreshLayout);
      window.removeEventListener("portfolio:contact-success", settleContact);
      element.removeEventListener("focusin", trackFormInteraction);
      element.removeEventListener("pointerdown", trackFormInteraction);
    };
  }, [navigate]);
  return (
    <div ref={root}>
      <Header active={active} onNavigate={navigate} />
      <main id="main" tabIndex={-1}>
        <div className="experience">
          <div className="visual-stage">
            <div className="atmosphere" aria-hidden="true">
              <div className="atmosphere-shadow" />
              <div className="atmosphere-light" />
              <div className="atmosphere-fine" />
            </div>
            <Hero />
            <div className="work-departure"><SelectedWork /></div>
          </div>
        </div>
        <About />
        <Contact />
      </main>
      <Footer isHome />
      <OpticalLens />
    </div>
  );
}
