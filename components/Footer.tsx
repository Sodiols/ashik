import Link from "next/link";
import { site } from "@/data/site";
import { Arrow } from "./Arrow";

export function Footer({ home = false }: { home?: boolean }) {
  const links = [
    ...site.socials,
    ...(site.email ? [{ label: "Email", url: `mailto:${site.email}` }] : []),
  ];
  const wordmark =
    "tap-target text-[10px] font-semibold tracking-tight whitespace-nowrap sm:text-[12px]";
  return (
    <footer className="footer defer-render flex [--render-estimate:80px] flex-wrap items-center gap-x-8 gap-y-4 border-t border-line bg-light px-(--gutter) pt-6 pb-[max(2rem,var(--safe-bottom))]">
      {home ? (
        <a className={wordmark} href="#home">
          {site.name.toUpperCase()}
        </a>
      ) : (
        <Link className={wordmark} href="/">
          {site.name.toUpperCase()}
        </Link>
      )}
      {links.length > 0 && (
        <ul className="order-last flex basis-full gap-6 text-ui sm:order-none sm:ml-auto sm:basis-auto">
          {links.map((link) => (
            <li key={link.label}>
              <a
                className="tap-target"
                href={link.url}
                {...(link.url.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      <span
        className={`micro ml-auto whitespace-nowrap text-muted ${links.length > 0 ? "sm:ml-0" : ""}`}
      >
        © {new Date().getFullYear()} {site.name.toUpperCase()}
      </span>
      <a
        className="micro tap-target hidden items-center gap-5 md:inline-flex"
        href={home ? "#home" : "/#home"}
      >
        BACK TO TOP <Arrow direction="up" className="text-[22px]" />
      </a>
    </footer>
  );
}
