import type { RefObject } from "react";

export function ContactSuccess({ focusRef, onReset }: { focusRef: RefObject<HTMLDivElement | null>; onReset: () => void }) {
  return (
    <div className="contact-success" ref={focusRef} tabIndex={-1} role="status">
      <h2 id="contact-heading" aria-label="Message received.">
        <span className="title-line" aria-hidden="true"><span className="title-word">MESSAGE</span></span>
        <span className="title-line title-line-serif" aria-hidden="true"><em className="title-word">received.</em></span>
      </h2>
      <div className="success-bottom flex items-end justify-between gap-8 max-[600px]:flex-col max-[600px]:items-start">
        <p>Thank you for reaching out.<br />Ashik will get back to you soon.</p>
        <div className="success-actions flex flex-wrap items-center gap-x-8 gap-y-5">
          <a className="text-link tap-target" href="#work">Back to Work <span aria-hidden="true">↗</span></a>
          <a className="text-link tap-target" href="#home">Return Home <span aria-hidden="true">↗</span></a>
          <button className="text-link tap-target" type="button" onClick={onReset}>Send another message <span aria-hidden="true">↗</span></button>
        </div>
      </div>
    </div>
  );
}
