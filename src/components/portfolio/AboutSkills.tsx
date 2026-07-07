import type { PortfolioData } from "../../data/portfolio";
import { SparkIcon } from "../ui/Icons";

type AboutSkillsProps = {
  portfolio: PortfolioData;
};

export function AboutSkills({ portfolio }: AboutSkillsProps) {
  const groups = (
    portfolio.skillGroups?.length ? portfolio.skillGroups : portfolio.stackGroups.filter((group) => group.category.toLowerCase().includes("skill"))
  )
    .map((group) => ({ category: group.category, items: group.items.filter(Boolean) }))
    .filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="skills-panel" aria-label="Skills">
      <span className="skills-decor-dot skills-decor-dot-a" aria-hidden="true" />
      <span className="skills-decor-dot skills-decor-dot-b" aria-hidden="true" />
      <div className="skills-panel-head">
        <span className="skills-panel-icon" aria-hidden="true">
          <SparkIcon className="h-4 w-4" />
        </span>
        <h3>Skills</h3>
      </div>
      <div className="skills-panel-groups">
        {groups.map((group) => (
          <div className="skills-panel-group" key={group.category}>
            {groups.length > 1 ? <p className="skills-panel-group-label">{group.category}</p> : null}
            <div className="skills-panel-pills">
              {group.items.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
