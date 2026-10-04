import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/data/site";
import { projects } from "@/data/projects";
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteUrl();
  if (!origin) return [];
  return [
    { url: origin, changeFrequency: "monthly", priority: 1 },
    ...projects
      .filter((p) => !p.placeholder)
      .map((p) => ({
        url: `${origin}/work/${p.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
