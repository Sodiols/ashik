// Text arrows (← → ↗ ↓ ↑) are missing from Instrument Sans, so browsers drew
// them from different system fonts on each platform. This keeps one drawing.
const paths = {
  right: "M4 12h15M13 6l6 6-6 6",
  left: "M20 12H5M11 6l-6 6 6 6",
  down: "M12 4v15M6 13l6 6 6-6",
  up: "M12 20V5M6 11l6-6 6 6",
  "up-right": "M6.5 17.5 17.5 6.5M8.5 6.5h9v9",
} as const;

export function Arrow({
  direction,
  className = "",
}: {
  direction: keyof typeof paths;
  className?: string;
}) {
  return (
    <svg
      className={`size-[1em] shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[direction]} />
    </svg>
  );
}
