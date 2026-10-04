import { ContactPrompt } from "@/components/ContactPrompt";
import { ContactScene } from "@/components/ContactScene";

function ContactIntro() {
  return (
    <>
      <h2
        id="contact-heading"
        aria-label="Let’s create together."
        className="contact-title text-[23vw] leading-[0.87] font-normal tracking-[-0.072em] sm:text-[17vw] lg:text-[clamp(70px,11.2vw,220px)]"
      >
        <span className="title-line" aria-hidden="true">
          <span className="title-word">LET’S</span>
        </span>
        <span className="title-line contact-line-create" aria-hidden="true">
          <em className="title-word">create</em>
        </span>
        <span className="title-line contact-line-together" aria-hidden="true">
          <span className="title-word">TOGETHER.</span>
        </span>
      </h2>
      <div className="contact-invitation mt-10 flex items-center gap-6 sm:mt-12 sm:gap-8 lg:mt-[60px] lg:max-w-[580px]">
        <ContactPrompt />
        <p className="micro min-w-0 leading-[1.65] text-muted">
          FROM AN IDEA
          <br />
          TO SOMETHING CONSIDERED.
        </p>
      </div>
    </>
  );
}

export function Contact() {
  return (
    <section
      id="contact"
      className="contact defer-render relative isolate [--render-estimate:clamp(1200px,900px+50vw,1650px)] lg:[--render-estimate:calc(100svh+170px)] min-h-svh overflow-clip bg-white px-(--gutter) pt-[calc(var(--header-offset)+1.25rem)] pb-10"
      aria-labelledby="contact-heading"
      tabIndex={-1}
    >
      <div className="contact-light" aria-hidden="true" />
      <ContactScene intro={<ContactIntro />} />
    </section>
  );
}
