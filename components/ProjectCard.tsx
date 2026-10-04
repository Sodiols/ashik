import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import type { CSSProperties } from "react";
export function ProjectCard({
  project,
  active,
  position,
}: {
  project: Project;
  active: boolean;
  position: number;
}) {
  return (
    <article
      className="project-card"
      data-position={position}
      aria-hidden={!active}
      inert={!active}
      style={{ "--rank": position } as CSSProperties}
    >
      <div className="project-card-surface">
      <div className="project-card-heading flex items-center justify-between">
        <h3>{project.title}</h3>
        <span className="project-heading-rule" aria-hidden="true" />
        <span className="project-category">{project.category}</span>
      </div>
      <Link
        className="project-art-link"
        href={`/work/${project.slug}`}
        draggable={false}
        aria-label={`View layout — ${project.title}, design study`}
      >
        <Image
          src={project.thumbnail}
          alt={project.media[0].alt}
          width={1200}
          height={900}
          draggable={false}
          unoptimized
        />
        <span className="view-project">
          <span className="sr-only">VIEW LAYOUT</span>
          <span aria-hidden="true">→</span>
        </span>
      </Link>
      <div className="project-card-footer flex items-center justify-between">
        <span>{project.placeholder ? "DESIGN STUDY" : project.category.toUpperCase()}</span>
        <span>{project.year ?? "INDEPENDENT CONCEPT"}</span>
      </div>
      </div>
    </article>
  );
}
