import type { PortfolioData } from "../../data/portfolio";
import { ArrowIcon } from "../ui/Icons";

type CertificationCardProps = {
  certification: PortfolioData["certifications"][number];
};

export function CertificationCard({ certification }: CertificationCardProps) {
  return (
    <article className="card">
      <p className="metadata text-neutral-500 dark:text-neutral-500">{certification.date}</p>
      <h3 className="mt-3 text-xl font-semibold text-neutral-950 dark:text-white">{certification.name}</h3>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{certification.issuer}</p>
      <a className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-neutral-950 transition hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300" href={certification.credential}>
        Credential
        <ArrowIcon />
      </a>
    </article>
  );
}
