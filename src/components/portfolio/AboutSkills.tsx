import type { PortfolioData } from "../../data/portfolio";

type AboutSkillsProps = {
  portfolio: PortfolioData;
};

export function AboutSkills({ portfolio }: AboutSkillsProps) {
  const skills = portfolio.stackGroups.find((group) => group.category === "Soft Skills")?.items || [];

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
