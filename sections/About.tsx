import { site } from "@/data/site";
import { Arrow } from "@/components/Arrow";
import { SectionHeading } from "@/components/SectionHeading";

export function About() {
  return (
    <section
      id="about"
      className="about defer-render relative isolate [--render-estimate:clamp(1050px,800px+50vw,2000px)] overflow-clip bg-white px-(--gutter) pt-[calc(var(--header-offset)+1.25rem)] pb-10"
      aria-labelledby="about-heading"
      tabIndex={-1}
    >
      <div className="about-light" aria-hidden="true" />
      <div className="section-topline flex justify-between gap-6 border-t border-line pt-5 text-muted">
        <span className="micro">A LITTLE ABOUT ME</span>
        <span className="micro">{site.location.toUpperCase()}</span>
      </div>
      <div className="relative mx-auto max-w-[1800px] pt-14 pb-16 sm:pt-16 lg:px-[3vw] lg:pt-[clamp(60px,6vw,120px)] lg:pb-[85px]">
        <SectionHeading
          id="about-heading"
          first="ABOUT"
          second="Ashik."
          className="about-title text-[26vw] leading-[0.84] font-normal tracking-[-0.075em] sm:text-[20.8vw] md:text-[min(20.8vw,40svh,460px)]"
        />
        <div className="about-copy mt-12 max-w-[400px] min-w-0 sm:mt-11 lg:absolute lg:bottom-[calc(85px+1.25rem)] lg:left-[3vw] lg:mt-0 lg:w-[calc((100%-6vw)*0.29-2rem)]">
          <p className="text-[clamp(21px,5.5vw,28px)] leading-[1.35] tracking-tight sm:text-[24px] lg:text-lead">
            <span className="copy-line">
              <span>I’m Ashik Rabbani,</span>
            </span>
            <span className="copy-line">
              <span>an independent designer</span>
            </span>
            <span className="copy-line">
              <span>based in Bangladesh.</span>
            </span>
          </p>
          <p className="about-description mt-5 max-w-[310px] text-body text-muted lg:max-w-[270px]">
            My focus is on visual identity, editorial design and digital
            experiences.
          </p>
        </div>
      </div>
      <div className="discipline-list relative mx-auto mb-9 max-w-[1800px] sm:mb-14 lg:px-[3vw]">
        <span
          className="discipline-watermark pointer-events-none absolute top-[8%] left-0 -z-10 text-[21vw] leading-none tracking-[-0.08em] whitespace-nowrap text-surface sm:top-[2%] sm:left-[7%] sm:text-[clamp(80px,20vw,400px)]"
          aria-hidden="true"
        >
          RABBANI
        </span>
        <span className="micro mb-6 block text-muted sm:mb-7">AREAS OF FOCUS</span>
        <ul>
          {site.disciplines.map((discipline) => (
            <li
              key={discipline}
              className="flex items-center justify-between gap-3 py-[22px] text-[clamp(28px,6vw,36px)] leading-[1.08] tracking-display sm:gap-5 sm:py-6 sm:text-[clamp(28px,5.5vw,48px)] md:pt-[22px] md:pb-[26px] md:text-[clamp(28px,4.2vw,72px)]"
            >
              <span className="discipline-name min-w-0">
                {discipline === "Digital experiences" ? (
                  <>
                    Digital <span className="discipline-resolution">experiences</span>
                  </>
                ) : (
                  discipline
                )}
              </span>
              <Arrow direction="up-right" className="discipline-arrow text-[0.62em] text-muted" />
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between gap-6 border-t border-line pt-5">
        <span className="micro max-w-[55%] leading-[1.6] text-muted sm:max-w-none">
          OPEN TO CONVERSATION
        </span>
        <a className="text-link tap-target shrink-0" href="#contact">
          Let’s talk <Arrow direction="up-right" />
        </a>
      </div>
    </section>
  );
}
