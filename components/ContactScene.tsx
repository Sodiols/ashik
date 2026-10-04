"use client";
import { useLayoutEffect, useState, type ReactNode } from "react";
import { ContactForm } from "./ContactForm";

// Owns only the enquiry/success state; the intro arrives server-rendered.
export function ContactScene({ intro }: { intro: ReactNode }) {
  const [complete, setComplete] = useState(false);
  useLayoutEffect(() => {
    // Section height changed; scroll-linked motion re-measures once.
    window.dispatchEvent(new Event("portfolio:layout"));
  }, [complete]);
  return (
    <>
      <div className="section-topline flex justify-between gap-6 border-t border-line pt-5 text-muted">
        <span className="micro">
          {complete ? "THANK YOU FOR REACHING OUT" : "HAVE SOMETHING IN MIND?"}
        </span>
        <span className="micro text-right">
          {complete ? "MESSAGE RECEIVED" : "LET’S TALK"}
        </span>
      </div>
      <div className="mx-auto max-w-[1800px] pt-14 pb-9 sm:pt-16 lg:grid lg:grid-cols-12 lg:gap-x-[2vw] lg:px-[3vw] lg:pt-[clamp(70px,6vw,120px)] lg:pb-16">
        {!complete && (
          <div className="contact-intro min-w-0 lg:col-span-7 lg:row-start-1">
            {intro}
          </div>
        )}
        <div
          className={
            complete
              ? "contact-content min-w-0 lg:col-span-12"
              : "contact-content mt-14 w-full min-w-0 sm:ml-auto sm:max-w-[560px] lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-0 lg:max-w-[470px] lg:justify-self-end lg:pt-[clamp(70px,7vw,140px)]"
          }
        >
          <ContactForm onComplete={setComplete} />
        </div>
      </div>
    </>
  );
}
