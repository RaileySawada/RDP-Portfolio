import {
  ArrowIcon,
  AutomationIcon,
  DocsIcon,
  SystemIcon,
  WebIcon,
} from "../ui/Icons";
import type { Project, ProjectIconKey } from "../../data/portfolio";
import { useInView } from "../../hooks/useInView";

type ProjectCardProps = {
  project: Project;
  index?: number;
};

const projectIcons: Record<ProjectIconKey, typeof SystemIcon> = {
  system: SystemIcon,
  docs: DocsIcon,
  automation: AutomationIcon,
  web: WebIcon,
};

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const { ref, isInView } = useInView<HTMLElement>();
  const ThumbIcon = projectIcons[project.icon ?? "web"];
  const serial = String(index + 1).padStart(2, "0");

  return (
    <article
      className={`card group home-reveal flex h-full flex-col ${isInView ? "is-visible" : ""}`}
      style={{ transitionDelay: `${index * 80}ms` }}
      ref={ref}
    >
      <div className="project-thumb" data-index={serial}>
        {project.imageUrl ? <img src={project.imageUrl} alt="" /> : null}
        {!project.imageUrl ? (
          <span className="project-thumb-icon">
            <ThumbIcon />
          </span>
        ) : null}
        <span>{project.status}</span>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-neutral-950 dark:text-white">
        {project.title}
      </h3>
      <p className="mt-3 min-h-24 text-sm leading-7 text-neutral-600 dark:text-neutral-400">
        {project.description}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.tech.map((tech) => (
          <span className="tech-badge" key={tech}>
            {tech}
          </span>
        ))}
      </div>
      <div className="project-card-links mt-auto flex gap-4 pt-6 text-sm font-semibold">
        {project.github ? (
          <a
            className="text-neutral-700 transition hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
            href={project.github}
          >
            GitHub
          </a>
        ) : null}
        {project.demo && project.demo !== project.github ? (
          <a
            className="inline-flex items-center gap-1 text-neutral-950 transition hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300"
            href={project.demo}
          >
            Open
            <ArrowIcon />
          </a>
        ) : null}
      </div>
    </article>
  );
}
