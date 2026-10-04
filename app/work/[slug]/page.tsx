import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { getSiteUrl } from "@/data/site";
import { Footer } from "@/components/Footer";
import { AvailabilityIndicator } from "@/components/AvailabilityIndicator";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  if (!p) return {};
  return {
    title: `${p.title}${p.placeholder ? " — Layout preview" : ""}`,
    description: p.description,
    robots: p.placeholder ? { index: false, follow: true } : undefined,
    ...(getSiteUrl() ? { alternates: { canonical: `/work/${slug}` } } : {}),
    openGraph: {
      title: `${p.title} — Ashik Rabbani`,
      description: p.description,
    },
  };
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return (
    <>
      <header className="header safe-header flex items-center justify-between">
        <Link className="wordmark tap-target inline-flex items-center" href="/">
          ASHIK RABBANI
          <span className="brand-dot" aria-hidden="true" />
        </Link>
        <nav className="flex" aria-label="Main navigation">
          <Link className="tap-target" href="/#work">Work</Link>
          <Link className="tap-target" href="/#about">About</Link>
          <Link className="tap-target" href="/#contact">Contact</Link>
        </nav>
      </header>
      <AvailabilityIndicator />
      <main className="case-study pt-[calc(145px+var(--safe-top))] max-[600px]:pt-[calc(120px+var(--safe-top))]">
        <div className="case-top micro max-[600px]:flex-wrap max-[600px]:gap-4">
          <Link className="text-link tap-target max-[600px]:shrink-0 max-[600px]:whitespace-nowrap" href="/#work">
            <span aria-hidden="true">←</span> BACK TO WORK
          </Link>
          <span>
            {project.placeholder
              ? "INDEPENDENT DESIGN STUDY"
              : project.index}
          </span>
        </div>
        <div className="case-heading flex items-end justify-between gap-8 max-[600px]:block">
          <h1>{project.title}</h1>
          <p>
            {project.category}
            <br />
            {project.year ?? "Independent concept"}
          </p>
        </div>
        {project.media.map((media, i) => (
          <Image
            className="case-visual"
            key={media.src}
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            priority={i === 0}
            unoptimized={media.src.endsWith(".svg")}
          />
        ))}
        <div className="case-description">
          <h2>
            {project.placeholder
              ? "About the study"
              : "About the project"}
          </h2>
          <div>
            <p>{project.description}</p>
            {project.services.length > 0 && (
              <p>Services: {project.services.join(", ")}</p>
            )}
            {project.tools.length > 0 && (
              <p>Tools: {project.tools.join(", ")}</p>
            )}
          </div>
        </div>
        <div className="next-project">
          <span className="micro">
            NEXT {next.placeholder ? "LAYOUT" : "PROJECT"}
          </span>
          <Link className="tap-target" href={`/work/${next.slug}`}>
            {next.title} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
