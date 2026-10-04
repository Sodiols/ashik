export function HeroType() {
  return (
    <div className="hero-type">
      <span className="hero-visual">Visual</span>
      <span className="hero-designer">Designer</span>
    </div>
  );
}
export function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-heading">
      <h1 id="hero-heading" className="sr-only">
        Ashik Rabbani — Visual Designer
      </h1>
      <div className="hero-lettering" aria-hidden="true">
        <HeroType />
      </div>
      <div className="hero-bottom max-[360px]:gap-3">
        <p className="micro">
          INDEPENDENT DESIGNER
          <br />
          BASED IN BANGLADESH
        </p>
        <p className="micro disciplines">
          VISUAL DESIGN / BRAND IDENTITY
          <br />
          EDITORIAL / DIGITAL EXPERIENCES
        </p>
        <a className="hero-work-link tap-target max-[360px]:gap-3 max-[360px]:whitespace-nowrap" href="#work">
          <span>EXPLORE WORK</span>
          <span className="down-arrow" aria-hidden="true">
            ↓
          </span>
        </a>
      </div>
      <span className="hero-side-note micro" aria-hidden="true">
        FORM, WITH INTENTION.
      </span>
    </section>
  );
}
