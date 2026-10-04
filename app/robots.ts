import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/data/site";
import { projects } from "@/data/projects";
export default function robots(): MetadataRoute.Robots {
  const origin = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: projects
        .filter((p) => p.placeholder)
        .map((p) => `/work/${p.slug}`),
    },
    ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}),
  };
}
