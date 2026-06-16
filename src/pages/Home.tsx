import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import HeroWord from "../components/HeroWord";
import Reveal from "../components/Reveal";
import { profile, skillGroups, stats, type SkillLevel } from "../lib/content";

const levelClass: Record<SkillLevel, string> = {
  Expert: "level-expert",
  Advanced: "level-advanced",
  Intermediate: "level-intermediate",
  Novice: "level-novice",
};

const heroConfigLines = [
  {
    key: "mode",
    value: "portfolio-build",
  },
  {
    key: "theme",
    value: ["near-black", "indigo", "glass"],
  },
  {
    key: "motion",
    value: "typed-hero-loop",
  },
  {
    key: "stack",
    value: ["React", "TypeScript", "Laravel"],
  },
  {
    key: "links",
    value: ["GitHub", "LinkedIn", "Resume"],
  },
  {
    key: "ship",
    value: true,
  },
];

export default function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-grid">
            <Reveal>
              <div className="hero-eyebrow">
                <Sparkles size={14} />
                {profile.role}
              </div>

              <h1 className="hero-headline">
                Building systems
                <br />
                that <HeroWord />
              </h1>

              <p className="hero-sub">
                I craft web applications, CLI tools, and AI-powered platforms
                from database schema to polished UI. Based in the{" "}
                {profile.location}, shipping globally.
              </p>

              <div className="hero-actions">
                <Link className="btn btn-primary" to="/projects">
                  View my work
                  <ArrowRight size={17} />
                </Link>
                <Link className="btn btn-ghost" to="/contact">
                  Get in touch
                  <Mail size={17} />
                </Link>
              </div>
            </Reveal>

            <Reveal className="hero-cli-card terminal" delay={100}>
              <div className="terminal-bar">
                <span className="dot dot-r" />
                <span className="dot dot-y" />
                <span className="dot dot-g" />
                <span className="terminal-title">~/rdp-portfolio - zsh</span>
              </div>

              <div className="terminal-body hero-terminal-body">
                <span className="t-line">
                  <span className="t-prompt">&gt; </span>
                  <span className="t-cmd">npm run inspect:brand</span>
                </span>

                <span className="t-line">&nbsp;</span>

                <span className="t-line">
                  <span className="t-com">{"{"}</span>
                </span>

                {heroConfigLines.map((line) => (
                  <span className="t-line hero-json-line" key={line.key}>
                    <span className="t-key">"{line.key}"</span>
                    <span className="t-com">: </span>

                    {Array.isArray(line.value) ? (
                      <span className="hero-json-array">
                        [
                        {(line.value as string[]).map((item, index) => (
                          <span className="t-str" key={item}>
                            "{item}"
                            {index < (line.value as string[]).length - 1
                              ? ", "
                              : ""}
                          </span>
                        ))}
                        ]
                      </span>
                    ) : typeof line.value === "boolean" ? (
                      <span className="t-val">{String(line.value)}</span>
                    ) : (
                      <span className="t-str">"{line.value}"</span>
                    )}

                    <span className="t-com">,</span>
                  </span>
                ))}

                <span className="t-line">
                  <span className="t-com">{"}"}</span>
                </span>

                <span className="t-line">&nbsp;</span>

                <span className="t-line hero-terminal-note">
                  <span className="t-prompt">&gt; </span>
                  <span className="t-cmd">brand check passed</span>
                  <span className="t-val"> ✓</span>
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal className="hero-stats" delay={160}>
            {stats.map((stat) => (
              <div className="stat-item" key={stat.label}>
                <div className="stat-num">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section-shell section-alt">
        <Reveal>
          <div className="section-label">// 01 - expertise</div>
          <h2 className="section-title">
            My stack <span>& proficiency</span>
          </h2>
        </Reveal>

        <div className="skill-groups">
          {skillGroups.map((group, groupIndex) => (
            <Reveal
              key={group.label}
              className="skill-group"
              delay={groupIndex * 80}
            >
              <div className="skill-group-label">{group.label}</div>
              <div className="skill-pills">
                {group.skills.map((skill) => (
                  <div className="pill" key={skill.name}>
                    {skill.name}
                    <span className={`pill-level ${levelClass[skill.level]}`}>
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
