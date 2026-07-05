import type { PortfolioData } from "../../data/portfolio";
import { useInView } from "../../hooks/useInView";

type StackRowData = {
  category: string;
  items: string[];
};

type StackRowsProps = {
  portfolio: PortfolioData;
};

export function StackRows({ portfolio }: StackRowsProps) {
  const stackRows = getTechnicalStackRows(portfolio);

  return (
    <div className="stack-rows">
      {stackRows.map((group, index) => (
        <StackRow category={group.category} items={group.items} key={group.category} index={index} />
      ))}
    </div>
  );
}

function getTechnicalStackRows(portfolio: PortfolioData): StackRowData[] {
  return portfolio.stackGroups
    .map((group) => ({
      category: group.category,
      items: group.items.filter(Boolean),
    }))
    .filter((row) => row.items.length > 0);
}

function StackRow({ category, items, index = 0 }: StackRowData & { index?: number }) {
  const { ref, isInView } = useInView<HTMLElement>();

  return (
    <article className={`stack-row home-reveal ${isInView ? "is-visible" : ""}`} style={{ transitionDelay: `${index * 80}ms` }} ref={ref}>
      <h3>{category}</h3>
      <div className="stack-row-items">
        {items.map((item) => (
          <span className="stack-row-item" key={item}>
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}
