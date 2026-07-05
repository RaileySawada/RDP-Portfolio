import { Link } from "react-router";
import type { PortfolioData } from "../data/portfolio";
import { GitHubContribution } from "../components/portfolio/GitHubContribution";
import { Hero } from "../components/portfolio/Hero";
import { ProjectCard } from "../components/portfolio/ProjectCard";
import { CertificateCard } from "../components/portfolio/CertificateCard";
import { Reveal } from "../components/portfolio/Reveal";
import { ArrowIcon } from "../components/ui/Icons";
import { Section } from "../components/ui/Section";

type HomePageProps = {
  portfolio: PortfolioData;
  isDark: boolean;
};

export function HomePage({ portfolio, isDark }: HomePageProps) {
  return (
    <>
      <Hero portfolio={portfolio} />
      <OverviewProjects portfolio={portfolio} />
      <OverviewStack portfolio={portfolio} />
      <OverviewCertifications portfolio={portfolio} />
      <Reveal>
        <GitHubContribution portfolio={portfolio} isDark={isDark} />
      </Reveal>
    </>
  );
}

function OverviewProjects({ portfolio }: { portfolio: PortfolioData }) {
  const { projects } = portfolio;
  const featuredProjects = getFeaturedItems(projects, portfolio.home?.projectTitles || [], (project) => project.title, 3);

  return (
    <Section
      id="projects"
      title="Projects"
      action={
        <Link className="section-action" to="/projects">
          View all
          <ArrowIcon />
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {featuredProjects.map((project, index) => (
          <Reveal delay={index * 80} key={project.title}>
            <ProjectCard project={project} index={index} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function OverviewStack({ portfolio }: { portfolio: PortfolioData }) {
  const stackItems = getFeaturedStrings(portfolio.stackGroups.flatMap((group) => group.items), portfolio.home?.stackItems || [], 24);

  return (
    <Section
      id="stack"
      title="Stack"
      action={
        <Link className="section-action" to="/stack">
          View all
          <ArrowIcon />
        </Link>
      }
    >
      <Reveal as="article" className="stack-cloud" delay={80}>
        {stackItems.map((item, index) => (
          <span className="stack-pill" style={{ transitionDelay: `${160 + index * 28}ms` }} key={item}>
            {item}
          </span>
        ))}
      </Reveal>
    </Section>
  );
}

function OverviewCertifications({ portfolio }: { portfolio: PortfolioData }) {
  const { certifications, profile } = portfolio;
  const featuredCertifications = getFeaturedItems(
    certifications,
    portfolio.home?.certificationNames || [],
    (certification) => certification.name,
    3,
  );

  return (
    <Section
      id="certifications"
      title="Certifications"
      action={
        <Link className="section-action" to="/certifications">
          View all
          <ArrowIcon />
        </Link>
      }
    >
      <div className="certificate-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredCertifications.map((certification, index) => (
          <CertificateCard certification={certification} recipientName={profile.name} key={certification.name} index={index} />
        ))}
      </div>
    </Section>
  );
}

function getFeaturedItems<T>(items: T[], selectedKeys: string[], getKey: (item: T) => string, fallbackCount: number) {
  const selected = selectedKeys
    .map((key) => items.find((item) => getKey(item) === key))
    .filter((item): item is T => Boolean(item));

  return selected.length ? selected : items.slice(0, fallbackCount);
}

function getFeaturedStrings(items: string[], selectedItems: string[], fallbackCount: number) {
  const uniqueItems = Array.from(new Set(items));
  const selected = selectedItems.filter((item) => uniqueItems.includes(item));
  return selected.length ? selected : uniqueItems.slice(0, fallbackCount);
}
