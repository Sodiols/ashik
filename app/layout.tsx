import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { getSiteUrl, site } from "@/data/site";
import "@/styles/globals.css";
const sans = localFont({
  src: "../public/fonts/instrument-sans.woff2",
  variable: "--font-sans",
  weight: "400 600",
  display: "swap",
});
const serif = localFont({
  src: "../public/fonts/instrument-serif-italic.woff2",
  variable: "--font-serif",
  weight: "400",
  style: "italic",
  display: "swap",
});
const origin = getSiteUrl();
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export const metadata: Metadata = {
  metadataBase: new URL(origin ?? "http://localhost:3100"),
  ...(origin
    ? { metadataBase: new URL(origin), alternates: { canonical: "/" } }
    : {}),
  title: {
    default: "Ashik Rabbani — Independent Designer",
    template: "%s — Ashik Rabbani",
  },
  description: site.description,
  openGraph: {
    title: "Ashik Rabbani — Independent Designer",
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
              alt: "Ashik Rabbani — Visual Designer",
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "Ashik Rabbani — Independent Designer",
    description: site.description,
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="[--safe-start:env(safe-area-inset-left)] [--safe-end:env(safe-area-inset-right)] [--safe-top:env(safe-area-inset-top)] [--safe-bottom:env(safe-area-inset-bottom)]">
      <body className={`${sans.variable} ${serif.variable} [text-size-adjust:100%] [-webkit-text-size-adjust:100%]`}>{children}</body>
    </html>
  );
}
