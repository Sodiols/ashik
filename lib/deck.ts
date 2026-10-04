// Geometry of the layered project deck. Offsets are percentages of the card's
// own size, so planes stay correct through resizes without measuring the DOM.
// styles/effects.css applies the same steps when GSAP is unavailable.

export type DeckMode = "stage" | "compact";

/** Rear planes visible behind the front card. */
export const visiblePlanes = 3;

const steps: Record<DeckMode, { x: number; y: number }> = {
  // Spatial desktop deck: wide diagonal steps that run off the right edge.
  stage: { x: 12, y: -16.2 },
  // Tablet and short landscape: reduced offsets keep more of the front card visible.
  compact: { x: 7, y: -11 },
};

export type Plane = {
  xPercent: number;
  yPercent: number;
  autoAlpha: number;
  zIndex: number;
};

export function planeFor(rank: number, mode: DeckMode): Plane {
  const depth = Math.max(0, Math.min(rank, visiblePlanes));
  return {
    // `+ 0` normalizes -0 for the front plane.
    xPercent: depth * steps[mode].x + 0,
    yPercent: depth * steps[mode].y + 0,
    autoAlpha: rank >= 0 && rank < visiblePlanes ? 1 : 0,
    zIndex: 10 - rank,
  };
}

/** Where the front plane exits to (and returns from) when the deck advances. */
export function exitFor(mode: DeckMode) {
  return { xPercent: 115, yPercent: mode === "stage" ? -10.5 : -7 };
}

/** Horizontal gestures must clearly dominate before the deck claims them. */
export function swipeDirection(dx: number, dy: number, threshold = 48): -1 | 0 | 1 {
  if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.2) return 0;
  return dx < 0 ? 1 : -1;
}
