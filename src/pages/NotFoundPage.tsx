import { Link } from "react-router";
import { ArrowIcon } from "../components/ui/Icons";

export function NotFoundPage() {
  return (
    <section className="section-shell flex min-h-screen flex-col items-center justify-center text-center">
      <p className="metadata text-neutral-500 dark:text-neutral-500">Error 404</p>
      <h1 className="mt-4 font-display text-4xl font-bold text-neutral-950 dark:text-white sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-base leading-7 text-neutral-600 dark:text-neutral-400">
        The page you're looking for doesn't exist, or may have moved.
      </p>
      <Link className="button-primary mt-8" to="/">
        Back to home
        <ArrowIcon />
      </Link>
    </section>
  );
}
