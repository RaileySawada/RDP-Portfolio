import type { PortfolioData } from "../../data/portfolio";

type AboutSkillsProps = {
  portfolio: PortfolioData;
};

export function AboutSkills({ portfolio }: AboutSkillsProps) {
  const skills = (portfolio.skillGroups?.length ? portfolio.skillGroups : portfolio.stackGroups.filter((group) => group.category.toLowerCase().includes("skill")))
    .flatMap((group) => group.items)
    .filter(Boolean);

  if (skills.length === 0) {
    return null;
  }

  return (
    <section className="skills-panel" aria-label="Skills">
      <h3>Skills</h3>
      <div>
        {skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    </section>
  );
}
