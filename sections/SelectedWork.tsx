import { ProjectStack } from "@/components/ProjectStack";

export function SelectedWork() {
  return (
    <section
      id="work"
      className="selected-work defer-render-flow relative isolate [--render-estimate:clamp(900px,140vw,1400px)] overflow-hidden bg-white px-(--gutter) pt-[calc(var(--header-offset)+2rem)] pb-16 [--wu:min(1vw,1.6svh)] sm:pt-[calc(var(--header-offset)+3.5rem)] sm:pb-24 stage:h-svh stage:p-0"
      aria-labelledby="work-heading"
      tabIndex={-1}
    >
      <div className="work-atmosphere" aria-hidden="true" />
      <div className="relative z-[2] stage:absolute stage:top-[32%] stage:left-[8.3%] stage:w-[38%]">
        <div className="work-intro">
          <h2 id="work-heading" className="sr-only">
            Selected work
          </h2>
          <p className="work-statement text-[clamp(23px,5.8vw,45px)] leading-[1.42] tracking-display stage:text-[clamp(24px,calc(var(--wu)*3),78px)] stage:leading-[1.43]">
            <span className="block whitespace-nowrap">I’m Ashik Rabbani,</span>
            <span className="block whitespace-nowrap">
              I create <em>considered</em>
            </span>
            <span className="block whitespace-nowrap">visual identities and</span>
            <span className="block whitespace-nowrap">digital experiences</span>
            <span className="block whitespace-nowrap">with purpose and clarity.</span>
          </p>
          <p className="work-disciplines micro mt-8 text-muted stage:mt-[calc(var(--wu)*6.7)]">
            VISUAL DESIGN / BRAND IDENTITY /
            <br />
            EDITORIAL / DIGITAL EXPERIENCES
          </p>
        </div>
      </div>
      <ProjectStack />
      <div className="work-bottom absolute bottom-6 left-(--gutter) z-[2] text-muted stage:bottom-[7%] stage:left-[8.3%]">
        <a
          className="block h-9 w-11 stage:h-[9svh] stage:min-h-13"
          href="#home"
          aria-label="Back to intro"
        >
          <span className="relative block h-full w-px bg-current after:absolute after:bottom-0 after:-left-[3px] after:size-[7px] after:rotate-45 after:border-r after:border-b after:border-current" />
        </a>
      </div>
    </section>
  );
}
