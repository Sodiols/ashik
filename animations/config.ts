export type MotionConfig = {
  section: number;
  panel: number;
  ease: string;
  lensScale: number;
  lensInterpolation: number;
};
// Short landscape viewports use the same scrollable composition as narrow ones.
export const desktopStageQuery = "(min-width: 900px) and (min-height: 600px)";
export const motion: MotionConfig = {
  section: 1.2,
  panel: 0.78,
  ease: "power3.inOut",
  lensScale: 1.16,
  lensInterpolation: 0.14,
};
