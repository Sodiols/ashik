import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { getSiteUrl, site } from "@/data/site";
import "@/styles/globals.css";

// Both families render the first viewport, so both stay preloaded.
const instrumentSans = localFont({
  src: "../public/fonts/instrument-sans.woff2",
  variable: "--font-instrument-sans",
  weight: "400 600",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});
const instrumentSerif = localFont({
  src: "../public/fonts/instrument-serif-italic.woff2",
  variable: "--font-instrument-serif",
  weight: "400",
  style: "italic",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
});

const origin = getSiteUrl();
const title = `${site.name} — ${site.role}`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(origin ?? "http://localhost:3100"),
  ...(origin ? { alternates: { canonical: "/" } } : {}),
  title: { default: title, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: {
    title,
    description: site.description,
    type: "website",
    locale: "en_US",
    siteName: site.name,
    ...(origin
      ? {
          url: origin,
          images: [
            {
              url: "/opengraph-image",
              width: 1200,
              height: 630,
              alt: `${site.name} — Visual Designer`,
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${instrumentSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
