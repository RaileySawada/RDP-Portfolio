import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import { projects } from "../lib/content";

export default function Projects() {
  return (
    <section className="page-section projects-page">
      <Reveal className="page-heading">
        <div className="section-label">// 03 - work</div>
        <h1 className="section-title">
          Selected <span>projects</span>
        </h1>
        <p>
          A focused set of systems and tools across AI workflows, institutional
          platforms, developer tooling, and polished productivity products.
        </p>
      </Reveal>

      <div className="project-grid">
        {projects.map((project, index) => {
          const Icon = project.icon;

          return (
            <Reveal
              className="project-card"
              delay={index * 70}
              key={project.name}
            >
              <div className="project-card-top">
                <div className="project-icon">
                  <Icon size={20} />
                </div>

                {project.link ? (
                  <a
                    className="project-link"
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={project.linkLabel ?? `Open ${project.name}`}
                    title={project.linkLabel ?? `Open ${project.name}`}
                  >
                    <ExternalLink size={17} />
                  </a>
                ) : null}
              </div>

              <h2 className="project-name">{project.name}</h2>

              <p className="project-desc">{project.description}</p>

              <div className="project-stack">
                {project.stack.map((tech) => (
                  <span className="stack-tag" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="work-cta">
        <div>
          <span className="section-label">// availability</span>
          <h2>Have a system worth building?</h2>
          <p>
            I can help shape the UI, data flow, and implementation details from
            idea to shipped product.
          </p>
        </div>

        <Link className="btn btn-primary" to="/contact">
          Start a conversation
          <ArrowRight size={17} />
        </Link>
      </Reveal>
    </section>
  );
}
