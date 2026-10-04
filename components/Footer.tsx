import { site } from "@/data/site";
export function Footer({ isHome = false }: { isHome?: boolean }) {
  return (
    <footer className="footer flex flex-wrap items-center gap-[30px] pb-[max(32px,var(--safe-bottom))] max-[600px]:justify-between max-[600px]:gap-5">
      <a
        className="wordmark tap-target inline-flex items-center"
        href={isHome ? "#home" : "/"}
      >
        ASHIK RABBANI
      </a>
      <div className="footer-links flex gap-6">
        {site.socials.map((s) => (
          <a
            className="tap-target"
            key={s.label}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {s.label}
          </a>
        ))}
        {site.email && <a className="tap-target" href={`mailto:${site.email}`}>Email</a>}
      </div>
      <span className="micro">© {new Date().getFullYear()} ASHIK RABBANI</span>
      <a className="footer-top micro tap-target" href={isHome ? "#home" : "/#home"}>
        BACK TO TOP <span aria-hidden="true">↑</span>
      </a>
    </footer>
  );
}
