import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SectionId } from "@/data/site";
import { duration, ease, stageQuery, stageScrub } from "./config";
import { createSectionMotion, type SceneNodes } from "./sections";

gsap.registerPlugin(ScrollTrigger);
// Finish on wall-clock time even when frames are slow: lag smoothing would
// otherwise stall a navigation tween on a struggling device.
gsap.ticker.lagSmoothing(0);
// Mobile toolbars resizing the viewport must not rebuild every trigger.
ScrollTrigger.config({ ignoreMobileResize: true });

export type ExperienceNodes = SceneNodes & {
  hero: HTMLElement;
  work: HTMLElement;
};

type Scene = "home" | "work" | "about";

/**
 * The pinned hero → work stage and the departure into About. Only spatial
 * viewports get the pinned stage; the CSS reserves its scroll length up front
 * (min-height 230svh) so enabling it never moves content below.
 */
function createStage(nodes: ExperienceNodes, onSection: (id: SectionId) => void) {
  const { stage, hero, work, about } = nodes;
  const q = gsap.utils.selector(stage);
  let progress = 0;
  let leaving = false;
  let scene: Scene | null = null;
  let workShown: boolean | null = null;
  let reported: SectionId | null = null;
  // Writes to the DOM only when a state actually changes.
  const sync = () => {
    const next: Scene = leaving ? "about" : progress > 0.98 ? "work" : "home";
    if (next !== scene) stage.dataset.scene = scene = next;
    const showWork = progress > 0.72;
    if (showWork !== workShown) {
      workShown = showWork;
      hero.inert = showWork;
      work.inert = !showWork;
    }
    const section: SectionId = showWork ? "work" : "home";
    if (leaving) reported = null;
    else if (section !== reported) onSection((reported = section));
  };

  stage.dataset.enhanced = "";
  gsap.set(work, { visibility: "visible" });
  gsap
    .timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: () => `+=${innerHeight}`,
        scrub: stageScrub,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress = self.progress;
          sync();
        },
      },
    })
    .to(q(".hero-lettering"), { scale: 1.8, yPercent: -105, xPercent: -10, duration: 0.72, ease: ease.soft }, 0)
    .to(q(".hero-visual"), { xPercent: -18, duration: 0.72, ease: ease.soft }, 0)
    .to(q(".hero-designer"), { xPercent: 12, duration: 0.72, ease: ease.soft }, 0)
    .to(q(".hero-bottom, .hero-side-note"), { y: -180, autoAlpha: 0, duration: 0.6, ease: ease.soft }, 0)
    .fromTo(q(".work-intro"), { y: () => innerHeight * 0.78 }, { y: 0, duration: 0.8, ease: ease.out }, 0.2)
    .fromTo(q(".project-stack"), { xPercent: 16, y: () => innerHeight * 0.83 }, { xPercent: 0, y: 0, duration: 0.75, ease: ease.out }, 0.25)
    .fromTo(q(".work-bottom"), { y: () => innerHeight * 0.3, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: ease.soft }, 0.5)
    .fromTo(q(".work-atmosphere"), { scale: 1.35, xPercent: 8, autoAlpha: 0 }, { scale: 1, xPercent: 0, autoAlpha: 1, duration: 0.8, ease: ease.linear }, 0.2)
    .to(q(".atmosphere-light"), { scale: 1.6, rotation: -16, xPercent: -18, yPercent: 15, duration: 1, ease: ease.linear }, 0)
    .to(q(".atmosphere-shadow"), { scale: 1.25, xPercent: 20, duration: 1, ease: ease.linear }, 0);

  // Departure: rear planes leave first (CSS reads --work-exit per rank), the
  // controls fade, the statement drifts left, all on one scrubbed timeline.
  gsap
    .timeline({
      defaults: { ease: ease.linear },
      scrollTrigger: {
        trigger: about,
        start: "top bottom",
        end: "top 25%",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          leaving = self.progress > 0;
          sync();
        },
      },
    })
    .fromTo(q(".project-stack"), { "--work-exit": 0 }, { "--work-exit": 1, duration: 1 }, 0)
    .fromTo(q(".stack-controls"), { y: 0, autoAlpha: 1 }, { y: 22, autoAlpha: 0, duration: 0.4, ease: ease.in }, 0.067)
    .fromTo(q(".work-intro"), { "--intro-exit": 0 }, { "--intro-exit": 1, duration: 0.733 }, 0.133);

  return () => {
    delete stage.dataset.enhanced;
    delete stage.dataset.scene;
    hero.inert = false;
    work.inert = false;
  };
}

export function createExperienceMotion(
  nodes: ExperienceNodes,
  onSection: (id: SectionId) => void,
  onRefresh: () => void,
) {
  // ScrollTrigger refreshes on load and resize re-apply the scroll position,
  // which cancels a native smooth scroll; the caller resumes navigation.
  ScrollTrigger.addEventListener("refresh", onRefresh);
  const media = gsap.matchMedia();
  const restore = () => {
    ScrollTrigger.removeEventListener("refresh", onRefresh);
    media.revert();
    delete nodes.stage.dataset.enhanced;
    delete nodes.stage.dataset.scene;
    nodes.hero.inert = false;
    nodes.work.inert = false;
    gsap.set(nodes.work, { clearProps: "visibility" });
  };
  // All or nothing: a failure must never leave the page half-enhanced.
  try {
    media.add(
      { spatial: stageQuery, motion: "(prefers-reduced-motion: no-preference)" },
      (context) => {
        const { spatial, motion } = context.conditions ?? {};
        if (!motion) return;
        const stage = spatial ? createStage(nodes, onSection) : null;
        const sections = createSectionMotion(nodes, !!spatial);
        // Each trigger measures itself on creation. A global refresh here would
        // restore the scroll position and cancel a smooth scroll in progress.
        // Jump scrubbed tweens to the current position instead of replaying.
        ScrollTrigger.getAll().forEach((trigger) => trigger.animation?.progress(trigger.progress));
        return () => {
          sections();
          stage?.();
        };
      },
    );
  } catch (error) {
    restore();
    throw error;
  }
  return {
    /** Programmatic scroll that follows the scrubbed stage. */
    scroll(y: number, onComplete: () => void) {
      const proxy = { y: scrollY };
      return gsap.to(proxy, {
        y,
        duration: duration.scene,
        ease: ease.inOut,
        onUpdate: () => window.scrollTo(0, proxy.y),
        onComplete,
      });
    },
    get spatial() {
      return nodes.stage.hasAttribute("data-enhanced");
    },
    refresh() {
      ScrollTrigger.refresh();
    },
    dispose: restore,
  };
}
