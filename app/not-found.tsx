import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found flex min-h-svh flex-col items-center justify-center gap-[25px]">
      <span className="micro">ASHIK RABBANI / 404</span>
      <h1>Not here.</h1>
      <Link className="text-link tap-target" href="/">
        Back to the portfolio <span aria-hidden="true">↗</span>
      </Link>
    </main>
  );
}
