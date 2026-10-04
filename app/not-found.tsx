import Link from "next/link";
import { Arrow } from "@/components/Arrow";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="main"
        tabIndex={-1}
        className="flex min-h-svh flex-col items-start justify-center gap-6 px-(--gutter) pt-(--header-offset) pb-16 sm:items-center"
      >
        <span className="micro text-muted">ASHIK RABBANI / 404</span>
        <h1 className="text-[clamp(60px,18vw,160px)] leading-[0.9] font-normal tracking-[-0.065em] sm:text-[clamp(60px,10vw,160px)]">
          Not <em className="tracking-[-0.05em]">here.</em>
        </h1>
        <Link className="text-link tap-target" href="/">
          Back to the portfolio <Arrow direction="up-right" />
        </Link>
      </main>
      <Footer />
    </>
  );
}
