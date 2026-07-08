import { useRef, type ReactNode } from "react";
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
};

export function HomePage({ portfolio }: HomePageProps) {
  return (
    <div className="home-page">
      <Hero portfolio={portfolio} />
      <OverviewProjects portfolio={portfolio} />
      <OverviewStack portfolio={portfolio} />
      <OverviewCertifications portfolio={portfolio} />
      <Reveal>
        <GitHubContribution portfolio={portfolio} />
      </Reveal>
    </div>
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
      <HomeCarousel label="Featured projects">
        {featuredProjects.map((project, index) => (
          <div className="home-carousel-item home-carousel-item-project" key={project.title}>
            <ProjectCard project={project} index={index} hideDescriptionOnMobile />
          </div>
        ))}
      </HomeCarousel>
    </Section>
  );
}

function OverviewStack({ portfolio }: { portfolio: PortfolioData }) {
  const allStackItems = Array.from(new Set(portfolio.stackGroups.flatMap((group) => group.items)));
  const stackItems = getFeaturedStrings(allStackItems, portfolio.home?.stackItems || [], 12);
  const hasMoreStackItems = stackItems.length < allStackItems.length;

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
      <Reveal as="article" className="stack-cloud stack-cloud-home" delay={80}>
        {stackItems.map((item, index) => (
          <span className="stack-pill" style={{ transitionDelay: `${160 + index * 28}ms` }} key={item}>
            {item}
          </span>
        ))}
        {hasMoreStackItems ? (
          <Link className="stack-pill stack-more-pill" style={{ transitionDelay: `${160 + stackItems.length * 28}ms` }} to="/stack">
            + more
          </Link>
        ) : null}
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
      <HomeCarousel label="Featured certifications">
        {featuredCertifications.map((certification, index) => (
          <div className="home-carousel-item home-carousel-item-certificate" key={certification.name}>
            <CertificateCard certification={certification} recipientName={profile.name} index={index} />
          </div>
        ))}
      </HomeCarousel>
    </Section>
  );
}

function HomeCarousel({ label, children }: { label: string; children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: -1 | 1) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.scrollBy({
      left: direction * Math.max(track.clientWidth * 0.82, 280),
      behavior: "smooth",
    });
  };

  return (
    <div className="home-carousel" aria-label={label}>
      <div className="home-carousel-track" ref={trackRef}>
        {children}
      </div>
      <button className="home-carousel-button home-carousel-button-prev" type="button" aria-label={`Previous ${label.toLowerCase()}`} onClick={() => scrollCarousel(-1)}>
        <CarouselChevron direction="left" />
      </button>
      <button className="home-carousel-button home-carousel-button-next" type="button" aria-label={`Next ${label.toLowerCase()}`} onClick={() => scrollCarousel(1)}>
        <CarouselChevron direction="right" />
      </button>
    </div>
  );
}

function CarouselChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
  return (selected.length ? selected : uniqueItems).slice(0, fallbackCount);
}
