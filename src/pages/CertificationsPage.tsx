import type { PortfolioData } from "../data/portfolio";
import { CertificateCard } from "../components/portfolio/CertificateCard";
import { Section } from "../components/ui/Section";

type CertificationsPageProps = {
  portfolio: PortfolioData;
};

export function CertificationsPage({ portfolio }: CertificationsPageProps) {
  const { certifications, profile } = portfolio;

  return (
    <Section id="certifications" title="Certifications">
      <div className="certificate-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((certification, index) => (
          <CertificateCard certification={certification} recipientName={profile.name} key={certification.name} index={index} />
        ))}
      </div>
    </Section>
  );
}
