import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import HeroWord from "../components/HeroWord";
import Reveal from "../components/Reveal";
import {
  isAvailable,
  profile,
  skillGroups,
  stats,
  type SkillLevel,
} from "../lib/content";

const levelBar: Record<SkillLevel, number> = {
  Expert: 100,
  Advanced: 78,
  Intermediate: 55,
  Novice: 28,
};

const levelClass: Record<SkillLevel, string> = {
  Expert: "level-expert",
  Advanced: "level-advanced",
  Intermediate: "level-intermediate",
  Novice: "level-novice",
};

const terminalLines = [
  { key: "name", value: `"${profile.name}"`, type: "str" },
  { key: "role", value: `"${profile.role}"`, type: "str" },
  { key: "location", value: `"${profile.location}"`, type: "str" },
  { key: "hobbies", value: `["Coding", "Research"]`, type: "arr" },
  { key: "available", value: String(isAvailable), type: "bool" },
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
                <span className="terminal-title">~/rdp-portfolio — zsh</span>
              </div>

              <div className="terminal-body hero-terminal-body">
                <span className="t-line">
                  <span className="t-prompt">&gt; </span>
                  <span className="t-cmd">cat developer.json</span>
                </span>

                <span className="t-line">&nbsp;</span>

                <span className="t-line">
                  <span className="t-com">{"{"}</span>
                </span>

                {terminalLines.map((line) => (
                  <span className="t-line hero-json-line" key={line.key}>
                    <span className="t-key">"{line.key}"</span>
                    <span className="t-com">: </span>
                    {line.type === "bool" ? (
                      <span className="t-val">{line.value}</span>
                    ) : line.type === "arr" ? (
                      <span className="t-str">{line.value}</span>
                    ) : (
                      <span className="t-str">{line.value}</span>
                    )}
                    <span className="t-com">,</span>
                  </span>
                ))}

                <span className="t-line">
                  <span className="t-com">{"}"}</span>
                </span>

                <span className="t-line">&nbsp;</span>

                <span className="t-line">
                  <span className="t-prompt">&gt; </span>
                  <span className="t-cmd hero-terminal-cursor">
                    <span className="cursor" aria-hidden="true" />
                  </span>
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

        <div className="skill-groups-grid">
          {skillGroups.map((group, groupIndex) => (
            <Reveal
              key={group.label}
              className="skill-group-card"
              delay={groupIndex * 80}
            >
              <div className="skill-group-label">{group.label}</div>
              <div className="skill-rows">
                {group.skills.map((skill) => (
                  <div className="skill-row" key={skill.name}>
                    <div className="skill-row-meta">
                      <span className="skill-name">{skill.name}</span>
                      <span
                        className={`skill-level-tag ${levelClass[skill.level]}`}
                      >
                        {skill.level}
                      </span>
                    </div>
                    <div className="skill-track">
                      <div
                        className={`skill-fill ${levelClass[skill.level]}`}
                        style={{ width: `${levelBar[skill.level]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="skill-legend" delay={240}>
          {(
            ["Expert", "Advanced", "Intermediate", "Novice"] as SkillLevel[]
          ).map((level) => (
            <div className="legend-item" key={level}>
              <div className={`legend-dot ${levelClass[level]}`} />
              <span>{level}</span>
            </div>
          ))}
        </Reveal>
      </section>
    </>
  );
}
