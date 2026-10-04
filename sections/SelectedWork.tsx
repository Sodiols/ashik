import { ProjectStack } from "@/components/ProjectStack";
export function SelectedWork() {
  return (
    <section id="work" className="selected-work" aria-labelledby="work-heading">
      <div className="work-atmosphere" aria-hidden="true" />
      <div className="work-intro">
        <h2 id="work-heading" className="sr-only">Selected work</h2>
        <p className="work-statement">
          <span>I’m Ashik Rabbani,</span>
          <span>I create <em>considered</em></span>
          <span>visual identities and</span>
          <span>digital experiences</span>
          <span>with purpose and clarity.</span>
        </p>
        <p className="work-disciplines micro">
          VISUAL DESIGN / BRAND IDENTITY /
          <br />EDITORIAL / DIGITAL EXPERIENCES
        </p>
      </div>
      <ProjectStack />
      <div className="work-bottom">
        <a className="work-return" href="#home" aria-label="BACK TO INTRO" title="Back to intro">
          <span className="work-return-line" aria-hidden="true" />
          <span className="sr-only">Back to intro</span>
        </a>
      </div>
    </section>
  );
}
