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
  const items = new Set(portfolio.stackGroups.flatMap((group) => group.items));
  const rows = [
    { category: "Frontend", items: ["React", "TypeScript", "JavaScript", "Next.js", "Vue", "HTML", "CSS", "Tailwind CSS"] },
    { category: "Backend", items: ["PHP", "Node.js", "REST APIs", "Bash"] },
    { category: "Database", items: ["MySQL", "PostgreSQL", "Firestore"] },
    { category: "Platforms", items: ["Firebase", "Cloudinary", "Netlify", "Git"] },
  ];

  return rows
    .map((row) => ({
      ...row,
      items: row.items.filter((item) => items.has(item)),
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
