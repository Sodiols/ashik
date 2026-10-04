import type { Project } from "@/data/projects";

export function ProjectPagination({
  projects,
  active,
  onSelect,
}: {
  projects: Project[];
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex" role="group" aria-label="Choose a project">
      {projects.map((project, i) => (
        <button
          className="group flex h-11 w-[clamp(30px,3vw,50px)] touch-manipulation items-center justify-center text-muted aria-pressed:text-ink"
          key={project.slug}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`${project.index} — Show ${project.title}`}
          aria-pressed={active === i}
        >
          <span
            className="size-[clamp(9px,1vw,16px)] rounded-full border border-current transition-colors duration-200 group-aria-pressed:bg-current"
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}
