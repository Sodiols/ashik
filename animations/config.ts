// Motion tokens. CSS mirrors fast/ui/panel as --motion-* custom properties.

/**
 * The spatial desktop stage: wide, tall enough and landscape. Keep in sync with
 * the `stage` / `flow` custom variants in styles/globals.css.
 */
export const stageQuery =
  "(min-width: 900px) and (min-height: 600px) and (min-aspect-ratio: 6/5)";

/** Phones use a native scroll-snap rail instead of the layered deck. */
export const railQuery = "(max-width: 599.98px)";

export const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

/** Seconds, for GSAP. */
export const duration = {
  /** Micro hover feedback. */
  fast: 0.2,
  /** UI state changes. */
  ui: 0.28,
  /** One project plane transition. */
  panel: 0.68,
  /** Programmatic section navigation. */
  scene: 1,
} as const;

export const ease = {
  out: "power3.out",
  in: "power1.in",
  inOut: "power3.inOut",
  soft: "power2.inOut",
  linear: "none",
} as const;

export const lens = {
  /** Horizontal magnification; vertical adds a restrained optical stretch. */
  scale: 1.16,
  stretch: 0.03,
  /** Per-frame pointer interpolation at 60 fps. */
  follow: 0.14,
} as const;

/** Scroll-scrub smoothing for the hero → work stage, in seconds. */
export const stageScrub = 0.55;
