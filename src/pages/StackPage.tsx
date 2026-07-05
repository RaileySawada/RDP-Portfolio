import { useMemo } from "react";
import type { PortfolioData } from "../data/portfolio";
import { Metric } from "../components/portfolio/Metric";
import { StackRows } from "../components/portfolio/StackRows";
import { Section } from "../components/ui/Section";

type StackPageProps = {
  portfolio: PortfolioData;
};

export function StackPage({ portfolio }: StackPageProps) {
  const stats = useMemo(() => {
    const groups = portfolio.stackGroups.filter((group) => group.items.filter(Boolean).length > 0);
    const uniqueItems = new Set(groups.flatMap((group) => group.items.filter(Boolean)));

    return {
      categories: groups.length,
      tools: uniqueItems.size,
      core: (portfolio.home?.stackItems || []).length,
    };
  }, [portfolio.stackGroups, portfolio.home?.stackItems]);

  return (
    <Section id="stack" title="Stack" eyebrow="What I build with">
      <div className="stack-overview-grid">
        <Metric label="Categories" value={stats.categories.toString()} />
        <Metric label="Technologies" value={stats.tools.toString()} />
        <Metric label="Core stack" value={stats.core.toString()} />
      </div>
      <StackRows portfolio={portfolio} />
    </Section>
  );
}
