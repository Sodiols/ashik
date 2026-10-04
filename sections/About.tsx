import { site } from "@/data/site";
import { SectionHeading } from "@/components/SectionHeading";
export function About() {
  return (
    <section
      id="about"
      className="about section-padding"
      aria-labelledby="about-heading"
    >
      <div className="about-light" aria-hidden="true" />
      <div className="section-topline flex justify-between">
        <span className="micro">A LITTLE ABOUT ME</span>
        <span className="micro">{site.location.toUpperCase()}</span>
      </div>
      <div className="about-composition">
        <div className="about-title-flight min-w-0">
          <SectionHeading id="about-heading" first="ABOUT" second="Ashik." />
        </div>
        <div className="about-copy min-w-0">
          <p className="about-lead">
            <span className="copy-line"><span>I’m Ashik Rabbani,</span></span>
            <span className="copy-line"><span>an independent designer</span></span>
            <span className="copy-line"><span>based in Bangladesh.</span></span>
          </p>
          <p className="about-description">
            My focus is on visual identity, editorial design and digital
            experiences.
          </p>
        </div>
      </div>
      <div className="discipline-list">
        <span className="discipline-watermark" aria-hidden="true">RABBANI</span>
        <span className="micro">AREAS OF FOCUS</span>
        <ul>
          {site.disciplines.map((discipline) => (
            <li key={discipline}>
              <span className="discipline-name">
                {discipline === "Digital experiences"
                  ? <>Digital <span className="discipline-resolution">experiences</span></>
                  : discipline}
              </span>
              <span className="discipline-arrow" aria-hidden="true">↗</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="about-bottom flex items-center justify-between">
        <span className="micro">OPEN TO CONVERSATION</span>
        <a className="text-link tap-target" href="#contact">
          Let’s talk <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
