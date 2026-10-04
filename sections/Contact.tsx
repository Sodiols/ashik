"use client";

import { useLayoutEffect, useState } from "react";
import { ContactForm } from "@/components/ContactForm";
import { ContactPrompt } from "@/components/ContactPrompt";
export function Contact() {
  const [complete, setComplete] = useState(false);
  useLayoutEffect(() => { window.dispatchEvent(new Event("portfolio:layout")); }, [complete]);
  return (
    <section
      id="contact"
      className="contact section-padding"
      aria-labelledby="contact-heading"
      data-complete={complete}
    >
      <div className="contact-light" aria-hidden="true" />
      <div className="section-topline flex justify-between">
        <span className="micro">{complete ? "THANK YOU FOR REACHING OUT" : "HAVE SOMETHING IN MIND?"}</span>
        <span className="micro">{complete ? "MESSAGE RECEIVED" : "LET’S TALK"}</span>
      </div>
      <div className="contact-composition">
        {!complete && <div className="contact-intro min-w-0">
          <h2 id="contact-heading" aria-label="Let’s create together.">
            <span className="title-line contact-line-first" aria-hidden="true"><span className="title-word">LET’S</span></span>
            <span className="title-line contact-line-create" aria-hidden="true"><em className="title-word">create</em></span>
            <span className="title-line contact-line-together" aria-hidden="true"><span className="title-word">TOGETHER.</span></span>
          </h2>
          <div className="contact-invitation flex items-center gap-6 sm:gap-8">
            <ContactPrompt />
            <p className="contact-caption micro min-w-0">FROM AN IDEA<br />TO SOMETHING CONSIDERED.</p>
          </div>
        </div>}
        <div className="contact-content min-w-0"><ContactForm onComplete={setComplete} /></div>
      </div>
    </section>
  );
}
