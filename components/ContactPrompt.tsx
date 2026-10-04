"use client";
import { reducedMotionQuery } from "@/animations/config";
import { Arrow } from "./Arrow";

export function ContactPrompt() {
  function startMessage() {
    const target = document.getElementById("name");
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      block: "center",
      behavior: matchMedia(reducedMotionQuery).matches ? "instant" : "smooth",
    });
  }

  return (
    <button
      className="contact-arrow tap-target relative flex size-16 shrink-0 items-center justify-center rounded-full text-[38px] leading-none sm:size-[clamp(72px,6.8vw,110px)] sm:text-[clamp(42px,4.5vw,72px)]"
      type="button"
      aria-label="Start your message"
      onClick={startMessage}
    >
      <svg className="contact-arrow-ring" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <circle className="connection-stroke" cx="60" cy="60" r="57" pathLength="1" />
        <circle className="connection-dot" cx="60" cy="3" r="3" />
      </svg>
      <span className="relative block size-[1em] overflow-clip" aria-hidden="true">
        <span className="contact-arrow-glyph block">
          <Arrow direction="up-right" />
        </span>
        <span className="contact-arrow-glyph contact-arrow-echo">
          <Arrow direction="up-right" />
        </span>
      </span>
    </button>
  );
}
