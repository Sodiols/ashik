"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type gsap from "gsap";
import { projects } from "@/data/projects";
import { motion } from "@/animations/config";
import { ProjectCard } from "./ProjectCard";
import { ProjectPagination } from "./ProjectPagination";
export function ProjectStack() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const current = useRef(0);
  const locked = useRef(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const engine = useRef<typeof gsap | null>(null);
  const previous = useRef(0);
  const [engineReady, setEngineReady] = useState(false);
  useEffect(() => {
    const element = root.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let disposed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        import("gsap")
          .then((module) => {
            if (disposed) return;
            engine.current = module.default;
            element.dataset.motionReady = "true";
            setEngineReady(true);
          })
          .catch(() => {
            /* The CSS transform transition remains available. */
          });
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, []);
  const select = useCallback((index: number) => {
    if (
      index < 0 ||
      index >= projects.length ||
      locked.current ||
      index === current.current
    )
      return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    locked.current = !reduceMotion;
    setActive(index);
    current.current = index;
    if (!reduceMotion)
      lockTimer.current = setTimeout(() => {
        locked.current = false;
      }, motion.panel * 1000);
  }, []);
  useLayoutEffect(() => {
    const element = root.current;
    const surface = element?.querySelector<HTMLElement>(".project-stack-cards");
    if (!element || !surface) return;
    const cards = Array.from(surface.querySelectorAll<HTMLElement>(".project-card"));
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const from = previous.current;
    previous.current = active;
    let width = surface.clientWidth;
    let height = surface.clientHeight;
    const rankOf = (index: number) => index - active;
    const position = (rank: number) => ({
      x: Math.max(0, Math.min(rank, 3)) * width * 0.12,
      y: Math.max(0, Math.min(rank, 3)) * height * -0.162,
      filter: `blur(${Math.max(0, Math.min(rank, 3)) * 1.8}px)`,
    });
    const gsap = engine.current;
    const settle = () => {
      cards.forEach((card, i) => {
        const rank = rankOf(i);
        if (gsap) {
          gsap.set(card, { ...position(rank), autoAlpha: rank >= 0 && rank < 3 ? 1 : 0, zIndex: 10 - rank });
        } else {
          // CSS owns the same geometry when motion is disabled or unavailable.
          card.style.removeProperty("transform");
          card.style.removeProperty("filter");
          card.style.removeProperty("opacity");
          card.style.removeProperty("visibility");
          card.style.removeProperty("z-index");
        }
      });
    };
    let timeline: gsap.core.Timeline | null = null;
    if (!gsap || reduced || from === active) {
      settle();
    } else {
      const forward = active > from;
      const outgoing = cards[from];
      const incoming = cards[active];
      timeline = gsap.timeline({ onComplete: settle });
      if (forward) {
        // Keep the old front plane above the deck until it has left the viewport.
        gsap.set(outgoing, { autoAlpha: 1, zIndex: 20 });
        timeline.to(outgoing, {
          x: width * 1.15,
          y: height * -0.105,
          filter: "blur(1.8px)",
          duration: motion.panel,
          ease: "power3.inOut",
        }, 0);
      } else {
        // Reverse the same path: the previous panel returns from the right.
        gsap.set(incoming, { x: width * 1.15, y: height * -0.105, filter: "blur(1.8px)", autoAlpha: 1, zIndex: 20 });
        timeline.to(incoming, { ...position(0), duration: motion.panel, ease: "power3.inOut" }, 0);
      }
      cards.forEach((card, i) => {
        if ((forward && i === from) || (!forward && i === active)) return;
        const rank = rankOf(i);
        if (rank < 0 || rank >= 3) {
          if (!forward && i === from) {
            timeline!.to(card, { ...position(3), duration: motion.panel, ease: "power3.inOut" }, 0);
          } else gsap.set(card, { autoAlpha: 0, zIndex: 10 - rank });
          return;
        }
        const oldRank = i - from;
        if (forward && rank === 2 && oldRank >= 3) {
          // Reveal a new rear plane only as the departing front clears the deck.
          gsap.set(card, { ...position(3), autoAlpha: 0, zIndex: 8 });
          timeline!.set(card, { autoAlpha: 1 }, motion.panel * 0.78);
          timeline!.to(card, { ...position(2), duration: motion.panel * 0.22, ease: "power1.out" }, motion.panel * 0.78);
          return;
        }
        if (oldRank < 0 || oldRank >= 3) gsap.set(card, { ...position(rank + 1), autoAlpha: 1 });
        gsap.set(card, { autoAlpha: 1, zIndex: 10 - rank });
        timeline!.to(card, { ...position(rank), duration: motion.panel - 0.06, ease: "power3.inOut" }, 0.06);
      });
    }
    const resize = new ResizeObserver(() => {
      if (width === surface.clientWidth && height === surface.clientHeight) return;
      timeline?.progress(1);
      width = surface.clientWidth;
      height = surface.clientHeight;
      settle();
    });
    resize.observe(surface);
    return () => {
      resize.disconnect();
      timeline?.kill();
    };
  }, [active, engineReady]);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let accumulated = 0;
    let lastWheel = 0;
    const wheel = (event: WheelEvent) => {
      if (window.matchMedia("(width < 900px), (pointer: coarse)").matches)
        return;
      const stage = document.querySelector<HTMLElement>(".experience");
      if (
        stage?.dataset.scene !== "work" ||
        (element.closest(".selected-work")?.getBoundingClientRect().top ?? 0) < -1
      ) return;
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      const direction = delta > 0 ? 1 : -1;
      if (
        (current.current === 0 && direction < 0) ||
        (current.current === projects.length - 1 && direction > 0)
      )
        return;
      event.preventDefault();
      if (locked.current) return;
      const now = performance.now();
      if (now - lastWheel > 150) accumulated = 0;
      lastWheel = now;
      accumulated += delta;
      if (Math.abs(accumulated) > 65) {
        select(current.current + (accumulated > 0 ? 1 : -1));
        accumulated = 0;
      }
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", wheel);
      if (lockTimer.current) clearTimeout(lockTimer.current);
      locked.current = false;
    };
  }, [select]);
  const keyDown = (event: React.KeyboardEvent) => {
    if ((event.target as HTMLElement).matches("input,textarea,select")) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      select(active + 1);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      select(active - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      select(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      select(projects.length - 1);
    }
  };
  return (
    <div
      className="project-stack"
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Project layouts"
      tabIndex={0}
      onKeyDown={keyDown}
      onPointerDown={(e) => {
        suppressClick.current = false;
        if ((e.target as Element).closest("button")) return;
        drag.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        const dy = e.clientY - drag.current.y;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
          // Finish horizontal drags even when the pointer leaves the cropped deck.
          e.currentTarget.setPointerCapture(e.pointerId);
        }
      }}
      onPointerUp={(e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        const dy = e.clientY - drag.current.y;
        drag.current = null;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
          suppressClick.current = true;
          select(active + (dx < 0 ? 1 : -1));
        }
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          e.preventDefault();
          e.stopPropagation();
          suppressClick.current = false;
        }
      }}
    >
      <div className="project-stack-cards">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            active={i === active}
            position={i - active}
          />
        ))}
      </div>
      <div className="stack-controls flex items-center justify-center max-[360px]:left-0 max-[360px]:w-full max-[360px]:transform-none max-[360px]:gap-2 [@media(min-width:900px)_and_(min-height:600px)]:top-[calc(100%-10px-var(--safe-bottom))]">
        <ProjectPagination
          projects={projects}
          active={active}
          onSelect={select}
        />
        <div className="stack-arrows flex gap-[15px] max-[900px]:gap-2 max-[360px]:static min-[900px]:max-[1023px]:left-[calc(100%+4px)] [@media(any-pointer:coarse)]:opacity-100 [@media(any-pointer:coarse)]:gap-4">
          <button
            className="tap-target"
            onClick={() => select(active - 1)}
            disabled={active === 0}
            aria-label="Previous project"
          >
            ←
          </button>
          <button
            className="tap-target"
            onClick={() => select(active + 1)}
            disabled={active === projects.length - 1}
            aria-label="Next project"
          >
            →
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Project {active + 1} of {projects.length}: {projects[active].title},{" "}
        {projects[active].category}. {projects[active].placeholder ? "Independent design study." : ""}
      </p>
    </div>
  );
}
