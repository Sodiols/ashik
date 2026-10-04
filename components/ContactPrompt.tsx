"use client";

export function ContactPrompt() {
  function startMessage() {
    const target = document.getElementById("name");
    if (!target) return;
    target.focus({ preventScroll: true });
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ block: "center", behavior: reduced ? "instant" : "smooth" });
  }

  return (
    <button
      className="contact-arrow tap-target"
      type="button"
      aria-label="Start your message"
      onClick={startMessage}
    >
      <svg className="contact-arrow-ring" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <circle className="connection-stroke" cx="60" cy="60" r="57" pathLength="1" />
        <circle className="connection-dot" cx="60" cy="3" r="3" />
      </svg>
      <span className="contact-arrow-window" aria-hidden="true">
        <span className="contact-arrow-glyph">↗</span>
        <span className="contact-arrow-glyph contact-arrow-echo">↗</span>
      </span>
    </button>
  );
}
