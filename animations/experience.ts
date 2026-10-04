import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SectionId } from "@/data/site";
import { desktopStageQuery, motion } from "./config";
import { createSectionMotion } from "./sections";
gsap.registerPlugin(ScrollTrigger);

export function createExperienceMotion(
  element: HTMLElement,
  setActive: (section: SectionId) => void,
) {
  const stage = element.querySelector<HTMLElement>(".experience")!;
  const hero = element.querySelector<HTMLElement>(".hero")!;
  const work = element.querySelector<HTMLElement>(".selected-work")!;
  const media = gsap.matchMedia();
  media.add(
    `${desktopStageQuery} and (prefers-reduced-motion: no-preference)`,
    () => {
      stage.dataset.enhanced = "true";
      stage.dataset.scene = "home";
      work.inert = true;
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${innerHeight}`,
          scrub: 0.55,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const isWork = self.progress > 0.72;
            stage.dataset.scene = self.progress > 0.98 ? "work" : "home";
            hero.inert = isWork;
            work.inert = !isWork;
            setActive(isWork ? "work" : "home");
          },
        },
      });
      gsap.set(work, { visibility: "visible" });
      timeline
        .to(
          ".hero-lettering",
          {
            scale: 1.8,
            yPercent: -105,
            xPercent: -10,
            duration: 0.72,
            ease: "power2.inOut",
          },
          0,
        )
        .to(
          ".hero-visual",
          { xPercent: -18, duration: 0.72, ease: "power2.inOut" },
          0,
        )
        .to(
          ".hero-designer",
          { xPercent: 12, duration: 0.72, ease: "power2.inOut" },
          0,
        )
        .to(
          ".hero-bottom, .hero-side-note",
          { y: -180, opacity: 0, duration: 0.6 },
          0,
        )
        .fromTo(
          ".work-intro",
          { y: () => innerHeight * 0.78 },
          { y: 0, duration: 0.8, ease: "power2.out" },
          0.2,
        )
        .fromTo(
          ".project-stack",
          { xPercent: 16, y: () => innerHeight * 0.83 },
          { xPercent: 0, y: 0, duration: 0.75, ease: "power2.out" },
          0.25,
        )
        .fromTo(
          ".work-bottom",
          { y: () => innerHeight * 0.3, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          0.5,
        )
        .fromTo(
          ".work-atmosphere",
          { scale: 1.35, xPercent: 8, opacity: 0 },
          { scale: 1, xPercent: 0, opacity: 1, duration: 0.8, ease: "none" },
          0.2,
        )
        .to(
          ".atmosphere-light",
          {
            scale: 1.6,
            rotation: -16,
            xPercent: -18,
            yPercent: 15,
            duration: 1,
            ease: "none",
          },
          0,
        )
        .to(
          ".atmosphere-shadow",
          { scale: 1.25, xPercent: 20, duration: 1, ease: "none" },
          0,
        );
      return () => {
        delete stage.dataset.enhanced;
        delete stage.dataset.scene;
        hero.inert = false;
        work.inert = false;
      };
    },
    element,
  );
  media.add({
    desktop: desktopStageQuery,
    mobile: "(width < 900px), (height < 600px)",
    motion: "(prefers-reduced-motion: no-preference)",
  }, (context) => {
    if (!context.conditions?.motion) return;
    return createSectionMotion(element, !!context.conditions.desktop);
  }, element);
  return {
    scroll(y: number, onComplete: () => void) {
      const proxy = { y: scrollY };
      return gsap.to(proxy, {
        y,
        duration: motion.section,
        ease: motion.ease,
        onUpdate: () => window.scrollTo(0, proxy.y),
        onComplete,
      });
    },
    refresh() {
      ScrollTrigger.refresh();
    },
    dispose() {
      media.revert();
    },
  };
}
