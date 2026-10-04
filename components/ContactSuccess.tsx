import type { RefObject } from "react";
import { Arrow } from "./Arrow";

export function ContactSuccess({
  focusRef,
  onReset,
}: {
  focusRef: RefObject<HTMLDivElement | null>;
  onReset: () => void;
}) {
  return (
    <div className="contact-success outline-none" ref={focusRef} tabIndex={-1} role="status">
      <h2
        id="contact-heading"
        aria-label="Message received."
        className="success-title text-[17vw] leading-[0.87] font-normal tracking-[-0.072em] md:text-[15vw] lg:text-[clamp(65px,13vw,250px)]"
      >
        <span className="title-line" aria-hidden="true">
          <span className="title-word">MESSAGE</span>
        </span>
        <span className="title-line title-line-serif" aria-hidden="true">
          <em className="title-word">received.</em>
        </span>
      </h2>
      <div className="mt-10 flex flex-col items-start gap-8 sm:mt-14 md:flex-row md:items-end md:justify-between">
        <p className="text-[15px] leading-[1.65] text-muted">
          Thank you for reaching out.
          <br />
          Ashik will get back to you soon.
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5 text-ui">
          <a className="text-link tap-target" href="#work">
            Back to Work <Arrow direction="up-right" className="text-[15px]" />
          </a>
          <a className="text-link tap-target" href="#home">
            Return Home <Arrow direction="up-right" className="text-[15px]" />
          </a>
          <button className="text-link tap-target" type="button" onClick={onReset}>
            Send another message <Arrow direction="up-right" className="text-[15px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
