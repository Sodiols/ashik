export type SectionId = "home" | "work" | "about" | "contact";
export type NavigationItem = { label: string; href: `#${SectionId}` };
export const navigation: NavigationItem[] = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];
export const site = {
  name: "Ashik Rabbani",
  role: "Independent Designer",
  location: "Bangladesh",
  description:
    "Ashik Rabbani is an independent designer based in Bangladesh, focused on visual design, brand identity, editorial design and digital experiences.",
  email: "",
  socials: [] as { label: string; url: string }[],
  disciplines: [
    "Visual design",
    "Brand identity",
    "Editorial design",
    "Digital experiences",
  ],
};
export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.hostname === "localhost"
      ? url.origin
      : undefined;
  } catch {
    return undefined;
  }
}
