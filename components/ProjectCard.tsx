import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Project } from "@/data/projects";
import { visiblePlanes } from "@/lib/deck";
import { Arrow } from "./Arrow";

// Geometry is relative to the card itself (percent of its width/height), so
// the plane reads the same at every deck size. Phones use the rail layout.
export function ProjectCard({
  project,
  index,
  total,
  rank,
}: {
  project: Project;
  index: number;
  total: number;
  rank: number;
}) {
  const active = rank === 0;
  return (
    <article
      className="project-card shrink-0 snap-start rounded-[14px] text-white max-sm:h-[min(clamp(300px,96vw,440px),82svh)] max-sm:w-[calc(100%-3.25rem)] stage:rounded-[clamp(12px,1.7vw,28px)]"
      data-visible={rank >= 0 && rank < visiblePlanes}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}`}
      aria-hidden={!active}
      inert={!active}
      style={{ "--rank": rank } as CSSProperties}
    >
      <div className="project-card-surface absolute inset-0 overflow-hidden rounded-[inherit] bg-ink">
        <div className="pointer-events-none relative z-[2] flex items-center gap-x-5 gap-y-1 px-6 pt-7 whitespace-nowrap max-sm:flex-wrap max-sm:px-5 max-sm:pt-6 stage:gap-x-[2vw] stage:px-[7.5%] stage:pt-[4.4%]">
          <h3 className="text-[clamp(22px,3.6vw,40px)] leading-[1.1] font-normal tracking-[-0.065em] max-sm:text-[clamp(22px,7vw,30px)] stage:text-[clamp(24px,calc(var(--wu)*3),76px)]">
            {project.title}
          </h3>
          <span
            className="h-px min-w-6 flex-1 bg-white/55 max-sm:hidden stage:min-w-[5vw]"
            aria-hidden="true"
          />
          <span className="text-[clamp(22px,3.6vw,40px)] leading-[1.1] tracking-[-0.065em] uppercase max-sm:basis-full max-sm:text-nano max-sm:font-medium max-sm:tracking-micro max-sm:text-white/70 stage:text-[clamp(24px,calc(var(--wu)*3),76px)]">
            {project.category}
          </span>
        </div>
        <Link
          className="project-art-link absolute inset-0 block cursor-grab overflow-hidden active:cursor-grabbing max-sm:cursor-pointer"
          href={`/work/${project.slug}`}
          // Hidden planes must not prefetch; ProjectStack prefetches on intent.
          prefetch={false}
          draggable={false}
          aria-label={`View layout — ${project.title}, design study`}
        >
          <Image
            className="absolute bottom-0 h-[68%] w-full object-cover select-none stage:h-[70%]"
            src={project.thumbnail}
            alt={project.media[0].alt}
            width={project.media[0].width}
            height={project.media[0].height}
            draggable={false}
            unoptimized
          />
          <span className="view-project absolute top-[clamp(64px,22%,110px)] left-6 flex size-[42px] items-center justify-center rounded-full border border-white/70 text-[24px] text-white transition-colors duration-200 max-sm:left-5 stage:top-[22%] stage:left-[7.5%] stage:size-[clamp(42px,calc(var(--wu)*4.8),72px)] stage:text-[clamp(23px,1.9vw,40px)]">
            <span className="sr-only">VIEW LAYOUT</span>
            <Arrow direction="right" />
          </span>
        </Link>
        <div className="pointer-events-none absolute inset-x-6 bottom-2.5 flex justify-between text-nano tracking-micro text-white/65 max-sm:inset-x-5 stage:inset-x-[7.5%] stage:bottom-3">
          <span>
            {project.placeholder
              ? "DESIGN STUDY"
              : project.category.toUpperCase()}
          </span>
          <span>{project.year ?? "INDEPENDENT CONCEPT"}</span>
        </div>
      </div>
    </article>
  );
}
