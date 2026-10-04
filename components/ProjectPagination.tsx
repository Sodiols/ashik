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
    <div
      className="project-pagination flex"
      aria-label="Choose a project"
    >
      {projects.map((project, i) => (
        <button
          className="touch-manipulation"
          key={project.slug}
          onClick={() => onSelect(i)}
          aria-label={`${project.index} — Show ${project.title}`}
          aria-pressed={active === i}
        >
          <span className="sr-only">{project.index}</span>
          <span className="pagination-dot" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
