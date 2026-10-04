import Link from "next/link";
import { navigation, site } from "@/data/site";

// Server component. On the homepage, ExperienceController marks the current
// section with aria-current; elsewhere links return to homepage sections.
export function Header({ home = false }: { home?: boolean }) {
  const prefix = home ? "" : "/";
  const linkClass =
    "tap-target relative text-[10px] leading-loose uppercase sm:text-ui";
  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[100] -translate-y-[180%] bg-ink p-3 text-ui text-white focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="header pointer-events-none fixed inset-x-0 top-0 z-40 flex h-(--header-offset) items-center justify-between gap-4 px-(--gutter) pt-(--safe-top) text-white mix-blend-difference">
        <div className="flex items-center gap-2 sm:gap-3">
          {home ? (
            <a
              className="tap-target pointer-events-auto text-[10px] font-semibold tracking-tight whitespace-nowrap sm:text-[12px]"
              href="#home"
              aria-label={`${site.name}, home`}
            >
              {site.name.toUpperCase()}
            </a>
          ) : (
            <Link
              className="tap-target pointer-events-auto text-[10px] font-semibold tracking-tight whitespace-nowrap sm:text-[12px]"
              href="/"
              aria-label={`${site.name}, home`}
            >
              {site.name.toUpperCase()}
            </Link>
          )}
          <span
            className="size-1 rounded-full bg-current sm:size-[5px]"
            role="img"
            aria-label="Available for work"
          />
        </div>
        <nav
          className="pointer-events-auto flex gap-3 xs:gap-4 sm:gap-[30px] md:gap-[clamp(32px,5.2vw,100px)]"
          aria-label="Main navigation"
        >
          {navigation.map((item) =>
            home ? (
              <a className={linkClass} key={item.href} href={item.href}>
                {item.label}
              </a>
            ) : (
              <Link
                className={linkClass}
                key={item.href}
                href={`${prefix}${item.href}`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </header>
    </>
  );
}
