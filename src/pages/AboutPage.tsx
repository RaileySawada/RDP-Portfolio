import type { PortfolioData } from "../data/portfolio";
import { AboutSkills } from "../components/portfolio/AboutSkills";
import { PortfolioCli } from "../components/portfolio/PortfolioCli";
import { Reveal } from "../components/portfolio/Reveal";
import { Section } from "../components/ui/Section";

type AboutPageProps = {
  portfolio: PortfolioData;
};

export function AboutPage({ portfolio }: AboutPageProps) {
  const { profile, timeline } = portfolio;

  return (
    <Section id="about" title="About">
      <div className="about-grid">
        <Reveal className="about-profile">
          <div className="about-portrait">
            {profile.imageUrl ? <img src={profile.imageUrl} alt={profile.name} /> : <span>{profile.initials}</span>}
          </div>
          <div className="space-y-5 text-base leading-8 text-neutral-600 dark:text-neutral-400">
            <p>{profile.bio}</p>
            <p>{profile.goals}</p>
          </div>
        </Reveal>
        <div className="space-y-4">
          {timeline.map((item, index) => (
            <Reveal as="article" className="timeline-item" delay={index * 80} key={`${item.period}-${item.title}`}>
              <p className="metadata text-neutral-500 dark:text-neutral-500">{item.period}</p>
              <h3 className="mt-1 font-semibold text-neutral-950 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-neutral-600 dark:text-neutral-400">{item.detail}</p>
            </Reveal>
          ))}
        </div>
      </div>
      <Reveal delay={120}>
        <AboutSkills portfolio={portfolio} />
      </Reveal>
      <Reveal delay={180}>
        <PortfolioCli profile={profile} />
      </Reveal>
    </Section>
  );
}
