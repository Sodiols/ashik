import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { getSiteUrl } from "@/data/site";
import { Arrow } from "@/components/Arrow";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

type Props = { params: Promise<{ slug: string }> };

// Every project is known at build time; unknown slugs get the static 404.
export const dynamicParams = false;

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
      <Header />
      <main
        id="main"
        tabIndex={-1}
        className="min-h-svh px-(--gutter) pt-[calc(var(--header-offset)+3rem)] pb-16 md:pt-[calc(var(--header-offset)+3rem)] md:pb-20"
      >
        <div className="micro mb-11 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 text-muted md:mb-16">
          <Link className="text-link tap-target shrink-0 gap-3 whitespace-nowrap" href="/#work">
            <Arrow direction="left" className="text-[15px]" /> BACK TO WORK
          </Link>
          <span>{project.placeholder ? "INDEPENDENT DESIGN STUDY" : project.index}</span>
        </div>
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <h1 className="min-w-0 text-[clamp(52px,17vw,96px)] leading-[0.9] font-normal tracking-[-0.075em] [overflow-wrap:anywhere] sm:max-w-[78%] sm:text-[clamp(58px,11vw,220px)]">
            {project.title}
          </h1>
          <p className="shrink-0 text-ui leading-[1.6] text-muted sm:text-right sm:text-[12px]">
            {project.category}
            <br />
            {project.year ?? "Independent concept"}
          </p>
        </div>
        {project.media.map((media, i) => (
          <Image
            className="h-auto max-h-[85svh] w-full bg-surface object-contain"
            key={media.src}
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            sizes="(min-width: 1800px) 1800px, 100vw"
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
          />
        ))}
        <div className="grid gap-6 border-b border-line pt-12 pb-14 md:grid-cols-2 md:gap-12 md:pb-[90px]">
          <h2 className="text-[clamp(23px,3vw,28px)] font-normal tracking-tight">
            {project.placeholder ? "About the study" : "About the project"}
          </h2>
          <div className="max-w-[440px] space-y-4 text-[14px] leading-[1.7] text-muted md:text-[16px]">
            <p>{project.description}</p>
            {project.services.length > 0 && <p>Services: {project.services.join(", ")}</p>}
            {project.tools.length > 0 && <p>Tools: {project.tools.join(", ")}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-9">
          <span className="micro text-muted">
            NEXT {next.placeholder ? "LAYOUT" : "PROJECT"}
          </span>
          <Link
            className="text-link tap-target gap-4 text-[clamp(28px,4vw,64px)] tracking-display"
            href={`/work/${next.slug}`}
          >
            {next.title} <Arrow direction="up-right" className="text-[0.6em]" />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
