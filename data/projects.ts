export type Project = {
  slug: string;
  title: string;
  index: string;
  category: string;
  year: number | null;
  thumbnail: string;
  media: { src: string; alt: string; width: number; height: number }[];
  description: string;
  services: string[];
  tools: string[];
  placeholder: boolean;
};
const entries = [
  ["nova", "NOVA", "Visual identity"],
  ["mono-studio", "MONO STUDIO", "Editorial design"],
  ["atelier-19", "ATELIER 19", "Art direction"],
  ["object", "OBJECT", "Digital experience"],
  ["forma", "FORMA", "Brand identity"],
] as const;
export const projects: Project[] = entries.map(
  ([slug, title, category], i) => ({
    slug,
    title,
    index: String(i + 1).padStart(2, "0"),
    category,
    year: null,
    thumbnail: `/projects/${slug}.svg`,
    media: [
      {
        src: `/projects/${slug}.svg`,
        alt: `Monochrome ${title} design study; independent concept`,
        width: 1200,
        height: 900,
      },
    ],
    description:
      "An independent layout study exploring monochrome composition and visual hierarchy. This concept is not commissioned client work.",
    services: [],
    tools: [],
    placeholder: true,
  }),
);
