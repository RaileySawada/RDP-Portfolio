import type { PortfolioData } from "../data/portfolio";
import { StackRows } from "../components/portfolio/StackRows";
import { Section } from "../components/ui/Section";

type StackPageProps = {
  portfolio: PortfolioData;
};

export function StackPage({ portfolio }: StackPageProps) {
  return (
    <Section id="stack" title="Stack">
      <StackRows portfolio={portfolio} />
    </Section>
  );
}
