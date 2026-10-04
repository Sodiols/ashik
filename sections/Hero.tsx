import { Arrow } from "@/components/Arrow";

/** The lettering pair; also rendered inside the optical lens. */
export function HeroType() {
  return (
    <div className="hero-type">
      <span className="hero-visual">Visual</span>
      <span className="hero-designer">Designer</span>
    </div>
  );
}

/** Soft monochrome surfaces behind the hero. Gradients only, no blur filters. */
export function Atmosphere({ drift = false }: { drift?: boolean }) {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className={drift ? "atmosphere-drift" : "absolute inset-0"}>
        <div className="atmosphere-shadow" />
        <div className="atmosphere-light" />
      </div>
      <div className="atmosphere-fine" />
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="home"
      className="hero hero-frame relative isolate h-svh min-h-[380px] overflow-hidden portrait:max-h-[1100px]"
      aria-labelledby="hero-heading"
      tabIndex={-1}
    >
      <h1 id="hero-heading" className="sr-only">
        Ashik Rabbani — Visual Designer
      </h1>
      <div className="hero-lettering absolute inset-0 z-[2]" aria-hidden="true">
        <HeroType />
      </div>
      <div className="hero-bottom absolute inset-x-(--gutter) bottom-[max(8%,calc(var(--safe-bottom)+1.5rem))] z-[3] flex items-end gap-4 xs:gap-6 md:gap-[7vw] short:bottom-[max(1.25rem,var(--safe-bottom))]">
        <p className="micro leading-[1.55]">
          INDEPENDENT DESIGNER
          <br />
          BASED IN BANGLADESH
        </p>
        <p className="micro hidden leading-[1.55] lg:block">
          VISUAL DESIGN / BRAND IDENTITY
          <br />
          EDITORIAL / DIGITAL EXPERIENCES
        </p>
        <a
          className="hero-work-link tap-target ml-auto flex shrink-0 items-center gap-4 text-[9px] tracking-[0.04em] xs:text-[10px] sm:gap-12"
          href="#work"
        >
          <span className="max-xs:sr-only">EXPLORE WORK</span>
          <Arrow direction="down" className="text-[28px] sm:text-[36px]" />
        </a>
      </div>
      <span
        className="hero-side-note micro absolute right-(--gutter) z-[2] text-nano text-muted short:hidden"
        aria-hidden="true"
      >
        FORM, WITH INTENTION.
      </span>
    </section>
  );
}
