import { site } from "@/data/site";

export function AvailabilityIndicator() {
  return (
    <span
      className="availability-indicator wordmark safe-header inline-flex items-center"
      role="img"
      aria-label="Available for work"
    >
      {/* Match the wordmark's text width outside its color-inverting layer. */}
      <span className="invisible" aria-hidden="true">{site.name.toUpperCase()}</span>
      <span className="brand-dot" aria-hidden="true" />
    </span>
  );
}
