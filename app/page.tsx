import { ExperienceController } from "@/components/ExperienceController";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { OpticalLens } from "@/components/OpticalLens";
import { About } from "@/sections/About";
import { Contact } from "@/sections/Contact";
import { Atmosphere, Hero, HeroType } from "@/sections/Hero";
import { SelectedWork } from "@/sections/SelectedWork";

// Static markup is server-rendered. Client islands: ExperienceController
// (navigation, motion loading), OpticalLens, ProjectStack, ContactScene.
export default function Home() {
  return (
    <>
      <Header home />
      <main id="main" tabIndex={-1}>
        {/* The spatial stage reserves its scroll length before motion loads,
            so enabling the pinned scene never moves the sections below. */}
        <div className="experience stage:motion-safe:min-h-[230svh]">
          <div className="visual-stage relative">
            <Atmosphere drift />
            <Hero />
            <div className="work-departure">
              <SelectedWork />
            </div>
          </div>
        </div>
        <About />
        <Contact />
      </main>
      <Footer home />
      <OpticalLens>
        <div className="hero-frame relative h-svh w-full bg-white">
          <Atmosphere />
          <HeroType />
        </div>
      </OpticalLens>
      <ExperienceController />
    </>
  );
}
