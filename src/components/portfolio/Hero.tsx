import { Link } from "react-router";
import type { PortfolioData } from "../../data/portfolio";
import { ArrowIcon, SocialIcon } from "../ui/Icons";
import { Metric } from "./Metric";

type HeroProps = {
  portfolio: PortfolioData;
};

export function Hero({ portfolio }: HeroProps) {
  const { certifications, profile, projects, stackGroups } = portfolio;
  const stackCount = stackGroups.reduce((total, group) => total + group.items.length, 0);
  const publicSocials = profile.socials.filter((social) => social.label.toLowerCase() !== "resume");

  return (
    <section className="section-shell hero-section flex items-center pt-24 pb-16 lg:pt-20">
      <div className="hero-grid grid w-full gap-10 xl:grid-cols-[0.82fr_1.18fr] xl:items-center">
        <div className="profile-portrait mx-auto w-full max-w-80">
          {profile.imageUrl ? (
            <img src={profile.imageUrl} alt={profile.name} />
          ) : (
            <div className="profile-portrait-fallback">
              <span className="font-display text-7xl font-bold">{profile.initials}</span>
            </div>
          )}
        </div>

        <div className="hero-copy max-w-3xl">
          <p className="metadata text-neutral-600 dark:text-neutral-400">{profile.location}</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-neutral-950 dark:text-white sm:text-5xl lg:text-6xl">
            {profile.name}
          </h1>
          <p className="mt-3 text-lg font-medium text-neutral-700 dark:text-neutral-300">{profile.title}</p>
          <p className="mt-4 inline-flex w-fit max-w-full items-center gap-2 whitespace-nowrap rounded-full border border-neutral-200 bg-white/70 px-3 py-2 text-sm font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950/70 dark:text-neutral-300">
            <i className="h-2 w-2 shrink-0 rounded-full bg-green-500 shadow-[0_0_0_4px_rgb(34_197_94_/_0.12)]" aria-hidden="true" />
            <span>Available for opportunities</span>
          </p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-400">{profile.summary}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="button-primary" to="/projects">
              View Projects
              <ArrowIcon />
            </Link>
            <Link className="button-secondary" to="/about">
              About Me
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {publicSocials.map((social) => (
              <a className="social-link" href={social.href} key={social.label} aria-label={social.label}>
                <SocialIcon label={social.label} />
                <span>{social.label}</span>
              </a>
            ))}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <Metric label="Stacks" value={String(stackCount)} />
            <Metric label="Projects" value={String(projects.length)} />
            <Metric label="Certifications" value={String(certifications.length)} />
          </div>
        </div>
      </div>
    </section>
  );
}
