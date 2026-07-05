import { useMemo, useState } from "react";
import type { PortfolioData } from "../data/portfolio";
import { ProjectCard } from "../components/portfolio/ProjectCard";
import { Section } from "../components/ui/Section";

type ProjectsPageProps = {
  portfolio: PortfolioData;
};

export function ProjectsPage({ portfolio }: ProjectsPageProps) {
  const { projects } = portfolio;
  const [projectFilter, setProjectFilter] = useState("All");
  const projectFilters = useMemo(() => ["All", ...Array.from(new Set(projects.flatMap((project) => project.tech)))], [projects]);
  const filteredProjects = projectFilter === "All" ? projects : projects.filter((project) => project.tech.includes(projectFilter));

  return (
    <Section id="projects" title="Projects">
      <div className="scrollbar-thin edge-fade-x flex gap-2 overflow-x-auto pb-2">
        {projectFilters.map((filter) => (
          <button
            className={`filter-chip ${filter === projectFilter ? "is-active" : ""}`}
            type="button"
            key={filter}
            onClick={() => setProjectFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {filteredProjects.map((project, index) => (
          <ProjectCard project={project} key={project.title} index={index} />
        ))}
      </div>
    </Section>
  );
}
