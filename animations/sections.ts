import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { duration, ease } from "./config";

export type SceneNodes = {
  stage: HTMLElement;
  about: HTMLElement;
  contact: HTMLElement;
};

// Reveals use opacity, never visibility, so content stays focusable and
// reachable by keyboard and assistive technology before it animates in.
const all = <T extends Element = HTMLElement>(root: ParentNode, selector: string) =>
  Array.from(root.querySelectorAll<T>(selector));

/**
 * About and Contact reveals. One scrubbed timeline per scene part; the caller's
 * gsap.matchMedia context reverts every tween and trigger together.
 */
export function createSectionMotion({ stage, about, contact }: SceneNodes, spatial: boolean) {
  const rise = spatial ? 1 : 0.6;
  const scrub = { scrub: true, invalidateOnRefresh: true } as const;

  // Work's atmosphere dissolves into About's white canvas.
  gsap.fromTo(stage, { "--background-exit": 0 }, {
    "--background-exit": 1,
    ease: ease.linear,
    scrollTrigger: { trigger: about, start: "top bottom", end: "top 25%", ...scrub },
  });

  // About: title, characters and metadata arrive as one gesture.
  gsap.timeline({ scrollTrigger: { trigger: about, start: "top 94%", end: "top 18%", ...scrub } })
    .fromTo(all(about, ".title-word"), {
      yPercent: 90 * rise,
      xPercent: (index: number) => (spatial ? (index ? 12 : -8) : 0),
    }, { yPercent: 0, xPercent: 0, duration: 0.8, stagger: 0.12, ease: ease.out }, 0)
    .fromTo(all(about, ".title-character"), { yPercent: 60 }, {
      yPercent: 0, duration: 0.65, stagger: 0.025, ease: ease.out,
    }, 0.05)
    .fromTo(all(about, ".section-topline > span"), { y: 12, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.4, stagger: 0.06,
    }, 0.1);

  const copy = about.querySelector<HTMLElement>(".about-copy");
  if (copy)
    gsap.fromTo(all(copy, ".copy-line > span, .about-description"), { y: 24 * rise, opacity: 0 }, {
      y: 0, opacity: 1, stagger: 0.07, duration: 0.65, ease: ease.out,
      scrollTrigger: { trigger: copy, start: "top 94%", end: "top 72%", ...scrub },
    });

  // Slow parallax of the passing light and the watermark.
  gsap.timeline({ defaults: { ease: ease.linear }, scrollTrigger: { trigger: about, start: "top bottom", end: "bottom top", ...scrub } })
    .fromTo(about.querySelector(".about-light"), { xPercent: spatial ? -8 : -3 }, { xPercent: spatial ? 8 : 3 }, 0)
    .fromTo(about.querySelector(".discipline-watermark"), { y: spatial ? 40 : 12 }, { y: spatial ? -40 : -12 }, 0);

  // Disciplines draw their rules and settle in sequence.
  const list = about.querySelector<HTMLElement>(".discipline-list");
  if (list)
    gsap.fromTo(all(list, "li"), { y: 28 * rise, opacity: 0, "--rule-progress": 0 }, {
      y: 0, opacity: 1, "--rule-progress": 1, duration: 0.4, stagger: 0.2, ease: ease.out,
      scrollTrigger: { trigger: list, start: "top 94%", end: "bottom 72%", ...scrub },
    });

  // Contact: headline, invitation and the connection ring. On the spatial
  // layout, “experiences” lifts toward the arriving headline.
  const contactEntry = gsap.timeline({ scrollTrigger: { trigger: contact, start: "top 94%", end: "top 14%", ...scrub } })
    .fromTo(all(contact, ".contact-intro .title-word"), {
      yPercent: 90 * rise,
      xPercent: (index: number) => (spatial ? (index === 1 ? 10 : -6) : 0),
    }, { yPercent: 0, xPercent: 0, duration: 0.8, stagger: 0.1, ease: ease.out }, 0)
    .fromTo(all(contact, ".section-topline > span, .contact-invitation"), { y: 18, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: ease.out,
    }, 0.3);
  const arrow = contact.querySelector(".contact-arrow");
  if (arrow)
    contactEntry
      .fromTo(arrow, { rotation: -40, scale: 0.75 }, { rotation: 0, scale: 1, duration: 0.6, ease: ease.out }, 0.24)
      .fromTo(arrow.querySelector(".connection-stroke"), { strokeDasharray: 1, strokeDashoffset: 1 }, {
        strokeDashoffset: 0, autoRound: false, duration: 0.65, ease: ease.soft,
      }, 0.25);
  const resolution = about.querySelector(".discipline-resolution");
  if (spatial && resolution)
    contactEntry.fromTo(resolution, { xPercent: 0, y: 0, scale: 1 }, {
      xPercent: -8, y: -70, scale: 1.16, transformOrigin: "left center", ease: ease.in,
      duration: 0.75, immediateRender: false,
    }, 0.075);

  // Form rows enter once by time and settle permanently on first interaction.
  const content = contact.querySelector<HTMLElement>(".contact-content");
  if (!content) return () => {};
  let editing = false;
  const formEntry = gsap.timeline({ paused: true }).fromTo(
    all(content, ".form-field, .form-submit-row"),
    { y: 24 * rise, opacity: 0 },
    { y: 0, opacity: 1, duration: duration.panel, stagger: 0.08, ease: ease.out },
  );
  const settle = () => formEntry.progress(1).pause();
  const finish = () => {
    editing = true;
    settle();
  };
  const trigger = ScrollTrigger.create({
    trigger: content,
    start: "top 94%",
    onEnter: () => {
      if (!editing) formEntry.play();
    },
    onLeaveBack: () => {
      if (!editing) formEntry.reverse();
    },
    onRefresh: (self) => {
      if (self.progress > 0 || content.contains(document.activeElement)) settle();
    },
  });
  if (trigger.progress > 0 || content.contains(document.activeElement)) settle();
  content.addEventListener("focusin", finish);
  return () => content.removeEventListener("focusin", finish);
}
