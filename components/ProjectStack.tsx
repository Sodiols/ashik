"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import type { gsap as GSAP } from "gsap";
import { projects } from "@/data/projects";
import {
  duration,
  ease,
  railQuery,
  reducedMotionQuery,
  stageQuery,
} from "@/animations/config";
import {
  exitFor,
  planeFor,
  swipeDirection,
  visiblePlanes,
  type DeckMode,
} from "@/lib/deck";
import { Arrow } from "./Arrow";
import { ProjectCard } from "./ProjectCard";
import { ProjectPagination } from "./ProjectPagination";

type Mode = DeckMode | "rail";
const last = projects.length - 1;
const clampIndex = (index: number) => Math.max(0, Math.min(last, index));
const readMode = (): Mode =>
  matchMedia(railQuery).matches
    ? "rail"
    : matchMedia(stageQuery).matches
      ? "stage"
      : "compact";
const position = (rank: number, mode: DeckMode) => {
  const { xPercent, yPercent } = planeFor(rank, mode);
  return { xPercent, yPercent };
};

export function ProjectStack() {
  const [active, setActive] = useState(0);
  const [engineReady, setEngineReady] = useState(false);
  const [modeVersion, setModeVersion] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const mode = useRef<Mode>("stage");
  const engine = useRef<typeof GSAP | null>(null);
  // Index of the latest request, ahead of React rendering it.
  const current = useRef(0);
  const previous = useRef(0);
  const busyUntil = useRef(0);
  const railTarget = useRef<number | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const router = useRouter();
  const prefetchActive = () => router.prefetch(`/work/${projects[current.current].slug}`);

  // Layout mode: phone rail, compact deck or spatial stage deck.
  useLayoutEffect(() => {
    mode.current = readMode();
    const queries = [matchMedia(railQuery), matchMedia(stageQuery)];
    const update = () => {
      const next = readMode();
      if (next === mode.current) return;
      mode.current = next;
      setModeVersion((version) => version + 1);
    };
    queries.forEach((query) => query.addEventListener("change", update));
    return () =>
      queries.forEach((query) => query.removeEventListener("change", update));
  }, []);

  // GSAP is only needed for deck transitions; fetch it as the deck approaches.
  useEffect(() => {
    const element = root.current;
    if (!element || matchMedia(reducedMotionQuery).matches) return;
    let disposed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        import("gsap")
          .then(({ gsap }) => {
            if (disposed) return;
            gsap.ticker.lagSmoothing(0);
            engine.current = gsap;
            setEngineReady(true);
          })
          .catch(() => {
            /* CSS keeps the deck usable without the transition engine. */
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

  const select = useCallback((requested: number) => {
    const index = clampIndex(requested);
    if (index === current.current) return;
    const list = track.current;
    if (mode.current === "rail" && list) {
      const card = list.children[index] as HTMLElement | undefined;
      railTarget.current = index;
      list.scrollTo({
        left: card?.offsetLeft ?? 0,
        behavior: matchMedia(reducedMotionQuery).matches ? "instant" : "smooth",
      });
    } else {
      if (performance.now() < busyUntil.current) return;
      if (engine.current && !matchMedia(reducedMotionQuery).matches)
        busyUntil.current = performance.now() + duration.panel * 1000;
    }
    current.current = index;
    setActive(index);
  }, []);

  // Deck planes. GSAP owns card transforms once loaded; CSS before that.
  useLayoutEffect(() => {
    const list = track.current;
    if (!list) return;
    const cards = Array.from(list.children) as HTMLElement[];
    const from = previous.current;
    previous.current = active;
    const gsap = engine.current;
    const deck = mode.current;
    if (deck === "rail") {
      gsap?.set(cards, { clearProps: "transform,opacity,visibility,zIndex" });
      const card = cards[active];
      if (card && Math.abs(list.scrollLeft - card.offsetLeft) > 2 && railTarget.current === null)
        list.scrollLeft = card.offsetLeft;
      return;
    }
    if (!gsap) return;
    // GSAP folds the CSS fallback translate into x/y; ownership uses percentages only.
    gsap.set(cards, { x: 0, y: 0 });
    const settle = () =>
      cards.forEach((card, i) => gsap.set(card, planeFor(i - active, deck)));
    if (from === active || matchMedia(reducedMotionQuery).matches) {
      settle();
      return;
    }
    const forward = active > from;
    const exit = exitFor(deck);
    const timeline = gsap.timeline({
      defaults: { duration: duration.panel, ease: ease.inOut },
      onComplete: settle,
    });
    if (forward) {
      // The old front plane leaves to the right, above the advancing deck.
      gsap.set(cards[from], { autoAlpha: 1, zIndex: 20 });
      timeline.to(cards[from], exit, 0);
    } else {
      // Reverse path: the previous plane returns from the right.
      gsap.set(cards[active], { ...exit, autoAlpha: 1, zIndex: 20 });
      timeline.to(cards[active], position(0, deck), 0);
    }
    cards.forEach((card, i) => {
      if (i === (forward ? from : active)) return;
      const rank = i - active;
      const oldRank = i - from;
      const wasVisible = oldRank >= 0 && oldRank < visiblePlanes;
      if (rank < 0 || rank >= visiblePlanes) {
        if (wasVisible)
          timeline.to(card, { ...position(visiblePlanes, deck), autoAlpha: 0 }, 0);
        else gsap.set(card, { autoAlpha: 0, zIndex: 10 - rank });
        return;
      }
      gsap.set(card, { zIndex: 10 - rank });
      if (!wasVisible) {
        // A new rear plane fades in as the departing front clears the deck.
        gsap.set(card, { ...position(visiblePlanes, deck), autoAlpha: 0 });
        timeline.to(
          card,
          { ...position(rank, deck), autoAlpha: 1, duration: duration.panel * 0.45, ease: ease.out },
          duration.panel * 0.55,
        );
        return;
      }
      gsap.set(card, { autoAlpha: 1 });
      timeline.to(card, { ...position(rank, deck), duration: duration.panel - 0.06 }, 0.06);
    });
    return () => {
      timeline.kill();
    };
  }, [active, engineReady, modeVersion]);

  // Rail: native scroll-snap drives the active card.
  useEffect(() => {
    const list = track.current;
    if (!list) return;
    let frame = 0;
    let step = 0;
    const measure = () => {
      const [first, second] = list.children as unknown as HTMLElement[];
      step = second && first ? second.offsetLeft - first.offsetLeft : list.clientWidth;
    };
    const sync = () => {
      frame = 0;
      if (mode.current !== "rail" || !step) return;
      const index = clampIndex(Math.round(list.scrollLeft / step));
      if (railTarget.current !== null) {
        if (index !== railTarget.current) return;
        railTarget.current = null;
      }
      if (index === current.current) return;
      current.current = index;
      setActive(index);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    const release = () => {
      railTarget.current = null;
    };
    const resize = new ResizeObserver(measure);
    resize.observe(list);
    list.addEventListener("scroll", onScroll, { passive: true });
    list.addEventListener("touchstart", release, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      list.removeEventListener("scroll", onScroll);
      list.removeEventListener("touchstart", release);
    };
  }, []);

  // Desktop wheel: owned only while the pinned Work scene is showing, and
  // released immediately at the first and last project.
  useEffect(() => {
    const element = root.current;
    const stage = element?.closest<HTMLElement>(".experience");
    if (!element || !stage) return;
    let accumulated = 0;
    let lastWheel = 0;
    const wheel = (event: WheelEvent) => {
      if (mode.current !== "stage" || stage.dataset.scene !== "work") return;
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const direction = Math.sign(delta);
      if (
        !direction ||
        (current.current === 0 && direction < 0) ||
        (current.current === last && direction > 0)
      )
        return;
      event.preventDefault();
      if (performance.now() < busyUntil.current) return;
      const now = performance.now();
      if (now - lastWheel > 150) accumulated = 0;
      lastWheel = now;
      accumulated += delta;
      if (Math.abs(accumulated) > 65) {
        accumulated = 0;
        select(current.current + direction);
      }
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [select]);

  const keyDown = (event: KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowRight: current.current + 1,
      ArrowDown: current.current + 1,
      ArrowLeft: current.current - 1,
      ArrowUp: current.current - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    select(keys[event.key]);
  };

  // Deck swipe and mouse drag. Vertical movement stays with the page
  // (touch-action: pan-y); the rail scrolls natively instead.
  const pointerDown = (event: PointerEvent) => {
    suppressClick.current = false;
    drag.current = null;
    if (mode.current === "rail" || (event.target as Element).closest("button")) return;
    drag.current = { x: event.clientX, y: event.clientY };
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    // Finish horizontal drags even when the pointer leaves the cropped deck.
    if (swipeDirection(dx, dy) && !event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerUp = (event: PointerEvent) => {
    if (!drag.current) return;
    const direction = swipeDirection(
      event.clientX - drag.current.x,
      event.clientY - drag.current.y,
    );
    drag.current = null;
    if (!direction) return;
    suppressClick.current = true;
    select(current.current + direction);
  };

  const project = projects[active];
  return (
    <div
      ref={root}
      className="project-stack relative mt-12 w-full outline-offset-[18px] [--deck-h:calc(var(--wu)*32)] sm:mt-[calc(var(--deck-flow-h)*0.22+2.5rem)] sm:h-(--deck-flow-h) sm:touch-pan-y sm:[--deck-flow-h:clamp(300px,65vw,520px)] sm:short:[--deck-flow-h:clamp(220px,min(60vw,66svh),420px)] stage:absolute stage:top-[clamp(calc(var(--header-h)+var(--deck-h)*0.34+1rem),41.7%,calc(100%-var(--deck-h)-4.5rem))] stage:left-[48.8%] stage:mt-0 stage:h-(--deck-h) stage:w-[max(calc(var(--wu)*70),60vw)]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Project layouts"
      tabIndex={0}
      onKeyDown={keyDown}
      onPointerEnter={prefetchActive}
      onFocus={prefetchActive}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onClickCapture={(event) => {
        if (!suppressClick.current) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClick.current = false;
      }}
    >
      <div
        ref={track}
        className="project-stack-cards relative h-full max-sm:-mr-(--gutter) max-sm:flex max-sm:h-auto max-sm:snap-x max-sm:snap-mandatory max-sm:gap-3 max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:pr-(--gutter) max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden"
      >
        {projects.map((item, i) => (
          <ProjectCard
            key={item.slug}
            project={item}
            index={i}
            total={projects.length}
            rank={i - active}
          />
        ))}
      </div>
      <div className="stack-controls relative z-30 mt-6 flex items-center justify-center gap-2 xs:gap-4 stage:absolute stage:top-[calc(100%+0.25rem)] stage:left-0 stage:mt-0 stage:w-[calc(51.2vw-var(--gutter))] stage:justify-start stage:gap-0">
        <ProjectPagination projects={projects} active={active} onSelect={select} />
        <div className="flex gap-2 xs:gap-3 stage:ml-auto stage:gap-[15px]">
          <button
            className="tap-target flex size-9 items-center justify-center rounded-full border border-line text-[20px] transition-colors duration-200 hover:not-disabled:bg-ink hover:not-disabled:text-white disabled:opacity-25 coarse:size-10"
            type="button"
            onClick={() => select(current.current - 1)}
            disabled={active === 0}
            aria-label="Previous project"
          >
            <Arrow direction="left" />
          </button>
          <button
            className="tap-target flex size-9 items-center justify-center rounded-full border border-line text-[20px] transition-colors duration-200 hover:not-disabled:bg-ink hover:not-disabled:text-white disabled:opacity-25 coarse:size-10"
            type="button"
            onClick={() => select(current.current + 1)}
            disabled={active === last}
            aria-label="Next project"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Project {active + 1} of {projects.length}: {project.title}, {project.category}.
        {project.placeholder ? " Independent design study." : ""}
      </p>
    </div>
  );
}
