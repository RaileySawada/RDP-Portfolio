import { useInView } from "../../hooks/useInView";
import type { PortfolioData } from "../../data/portfolio";
import type { CSSProperties } from "react";
import { ArrowIcon, SealIcon } from "../ui/Icons";

type CertificateCardProps = {
  certification: PortfolioData["certifications"][number];
  recipientName: string;
  index?: number;
};

export function CertificateCard({
  certification,
  recipientName,
  index = 0,
}: CertificateCardProps) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <div
      className={`certificate-card flex flex-col ${isInView ? "is-visible" : ""}`}
      style={{ "--certificate-delay": `${index * 90}ms` } as CSSProperties}
      ref={ref}
    >
      <span
        aria-hidden="true"
        className="certificate-corner certificate-corner-tl"
      />
      <span
        aria-hidden="true"
        className="certificate-corner certificate-corner-tr"
      />
      <span
        aria-hidden="true"
        className="certificate-corner certificate-corner-bl"
      />
      <span
        aria-hidden="true"
        className="certificate-corner certificate-corner-br"
      />

      <div aria-hidden="true" className="certificate-seal">
        <SealIcon />
      </div>

      <p className="metadata text-center text-neutral-500 dark:text-neutral-500">
        Certificate of Completion
      </p>
      <h3 className="mt-3 text-center font-display text-lg font-semibold leading-snug text-balance text-neutral-950 dark:text-white">
        {certification.name}
      </h3>

      <div aria-hidden="true" className="certificate-divider" />

      <p className="text-center text-xs text-neutral-500 dark:text-neutral-500">
        Presented to
      </p>
      <p className="mt-1 text-center font-display text-sm font-semibold text-neutral-800 dark:text-neutral-100">
        {recipientName}
      </p>

      <div className="mt-5 mb-6 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-500">
        <span className="truncate">{certification.issuer}</span>
        <span className="font-mono">{certification.date}</span>
      </div>

      <a
        className="certificate-verify mt-auto"
        href={certification.credential}
        aria-label={`Verify ${certification.name} credential`}
      >
        Verify credential
        <ArrowIcon className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
