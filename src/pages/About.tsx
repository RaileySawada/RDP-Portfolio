import { Award, Code2, GraduationCap, Sparkles, Terminal } from "lucide-react";
import Reveal from "../components/Reveal";
import {
  achievements,
  certifications,
  education,
  experience,
  languages,
  profile,
  resumeHighlights,
} from "../lib/content";

const principles = [
  {
    title: "Systems thinking",
    description:
      "I like understanding the full path from database decisions to the final click in the interface.",
  },
  {
    title: "Product polish",
    description:
      "Good software should feel calm, clear, and intentional even when the logic underneath is complex.",
  },
  {
    title: "Useful AI",
    description:
      "I use AI where it improves decisions, automation, and productivity instead of treating it as decoration.",
  },
];

export default function About() {
  return (
    <section className="page-section about-page">
      <div className="about-grid">
        <Reveal className="about-copy">
          <div className="section-label">// 02 - about</div>
          <h1 className="section-title">
            Code is craft,
            <br />
            <span>not output</span>
          </h1>
          <p>
            I'm a full-stack developer who cares deeply about the{" "}
            <strong>quality of the experience</strong>, not just whether it
            works. From CLI tooling to AI-integrated platforms, I build things
            that are both functional and considered.
          </p>
          <p>
            My work spans institutional systems, developer tooling, and
            productivity tools, often touching AI for decision support, document
            intelligence, or form automation.
          </p>
          <p>
            Outside of shipping code, I'm interested in{" "}
            <strong>
              design systems, developer experience, and the intersection of good
              UI with systems thinking.
            </strong>
          </p>
        </Reveal>

        <Reveal className="terminal" delay={120}>
          <div className="terminal-bar">
            <span className="dot dot-r" />
            <span className="dot dot-y" />
            <span className="dot dot-g" />
            <span className="terminal-title">
              ~/{profile.shortName.toLowerCase()} - zsh
            </span>
          </div>
          <div className="terminal-body">
            <span className="t-line">
              <span className="t-prompt">&gt; </span>
              <span className="t-cmd">cat developer.json</span>
            </span>
            <span className="t-line">
              <span className="t-com">{"{"}</span>
            </span>
            <span className="t-line">
              {"  "}
              <span className="t-key">"name"</span>:{" "}
              <span className="t-str">"{profile.name}"</span>,
            </span>
            <span className="t-line">
              {"  "}
              <span className="t-key">"role"</span>:{" "}
              <span className="t-str">"{profile.role}"</span>,
            </span>
            <span className="t-line">
              {"  "}
              <span className="t-key">"location"</span>:{" "}
              <span className="t-str">"{profile.location}"</span>,
            </span>
            <span className="t-line">
              {"  "}
              <span className="t-key">"focus"</span>: [
            </span>
            <span className="t-line">
              {"    "}
              <span className="t-str">"AI-integrated systems"</span>,
            </span>
            <span className="t-line">
              {"    "}
              <span className="t-str">"premium UI/UX"</span>,
            </span>
            <span className="t-line">
              {"    "}
              <span className="t-str">"developer tooling"</span>
            </span>
            <span className="t-line">{"  "}],</span>
            <span className="t-line">
              {"  "}
              <span className="t-key">"available"</span>:{" "}
              <span className="t-val">true</span>
            </span>
            <span className="t-line">
              <span className="t-com">{"}"}</span>
            </span>
            <span className="t-line">&nbsp;</span>
            <span className="t-line">
              <span className="t-prompt">&gt; </span>
              <span className="t-cmd">_</span>
            </span>
          </div>
        </Reveal>
      </div>

      <div className="resume-overview">
        <Reveal className="resume-card resume-profile" delay={40}>
          <div className="resume-card-icon">
            <Code2 size={18} />
          </div>
          <h2>Objectives</h2>
          <p>
            To secure a position where I can use my programming skills, develop
            my knowledge, and contribute to an organization through hard work,
            adaptability, and continuous learning.
          </p>
          <ul className="resume-highlight-list">
            {resumeHighlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="resume-card" delay={100}>
          <div className="resume-card-icon">
            <GraduationCap size={18} />
          </div>
          <h2>Education</h2>
          {education.map((item) => (
            <div className="timeline-item" key={item.title}>
              <div className="timeline-head">
                <strong>{item.title}</strong>
                <span>{item.period}</span>
              </div>
              <em>{item.organization}</em>
              <ul>
                {item.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>

      <Reveal className="section-subhead" delay={40}>
        <div className="section-label">// resume-backed details</div>
        <h2 className="section-title">
          Experience, credentials <span>& achievements</span>
        </h2>
      </Reveal>

      <div className="resume-detail-grid">
        <Reveal className="resume-card experience-card" delay={80}>
          <h2>Experience</h2>
          {experience.map((item) => (
            <div className="timeline-item" key={`${item.title}-${item.period}`}>
              <div className="timeline-head">
                <strong>{item.title}</strong>
                <span>{item.period}</span>
              </div>
              <em>{item.organization}</em>
              <ul>
                {item.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>

        <div className="credential-column">
          <Reveal className="resume-card" delay={130}>
            <div className="resume-card-icon">
              <Award size={18} />
            </div>
            <h2>Certifications</h2>
            <div className="credential-list">
              {certifications.map((certification) => (
                <div className="credential-item" key={certification.title}>
                  <strong>{certification.title}</strong>
                  <span>
                    {certification.issuer} · {certification.date}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="resume-card" delay={180}>
            <h2>Awards</h2>
            <div className="credential-list">
              {achievements.map((achievement) => (
                <div className="credential-item" key={achievement.title}>
                  <strong>{achievement.title}</strong>
                  <span>
                    {achievement.issuer} · {achievement.date}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="resume-card" delay={220}>
            <h2>Languages</h2>
            <div className="language-list">
              {languages.map((language) => (
                <div key={language.language}>
                  <strong>{language.language}</strong>
                  <span>{language.level}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <div className="principle-grid">
        {principles.map((principle, index) => {
          const Icon = index === 0 ? Code2 : index === 1 ? Sparkles : Terminal;

          return (
            <Reveal
              className="principle-card"
              delay={index * 80}
              key={principle.title}
            >
              <div className="principle-icon">
                <Icon size={19} />
              </div>
              <h2>{principle.title}</h2>
              <p>{principle.description}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
