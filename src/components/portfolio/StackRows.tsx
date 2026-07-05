import type { PortfolioData } from "../../data/portfolio";
import { useInView } from "../../hooks/useInView";
import { AutomationIcon, DocsIcon, GridIcon, LayersIcon, SystemIcon, WebIcon } from "../ui/Icons";

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
    <div className="stack-grid">
      {stackRows.map((group, index) => (
        <StackCard category={group.category} items={group.items} key={group.category} index={index} />
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

function getCategoryIcon(category: string) {
  const key = category.toLowerCase();

  if (key.includes("front") || key.includes("ui") || key.includes("design")) return WebIcon;
  if (key.includes("back") || key.includes("server") || key.includes("api")) return SystemIcon;
  if (key.includes("data") || key.includes("db")) return LayersIcon;
  if (key.includes("auto") || key.includes("script") || key.includes("ci")) return AutomationIcon;
  if (key.includes("doc") || key.includes("content")) return DocsIcon;

  return GridIcon;
}

function StackCard({ category, items, index = 0 }: StackRowData & { index?: number }) {
  const { ref, isInView } = useInView<HTMLElement>();
  const CategoryIcon = getCategoryIcon(category);

  return (
    <article className={`stack-card card home-reveal ${isInView ? "is-visible" : ""}`} style={{ transitionDelay: `${index * 80}ms` }} ref={ref}>
      <div className="stack-card-head">
        <span className="stack-card-icon" aria-hidden="true">
          <CategoryIcon className="h-5 w-5" />
        </span>
        <div>
          <h3>{category}</h3>
          <p>
            {items.length} {items.length === 1 ? "tool" : "tools"}
          </p>
        </div>
      </div>
      <div className="stack-card-items">
        {items.map((item) => (
          <span className="tech-badge" key={item}>
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}
