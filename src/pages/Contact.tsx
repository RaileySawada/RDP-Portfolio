import {
  ArrowRight,
  Clock,
  GitBranch,
  Mail,
  MapPin,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Reveal from "../components/Reveal";
import { isAvailable, profile } from "../lib/content";

type ContactMethod = {
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
};

const contactMethods: ContactMethod[] = [
  {
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    icon: Mail,
  },
  {
    label: "GitHub",
    value: "github.com/RaileySawada",
    href: profile.links.github,
    icon: GitBranch,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/railey-dela-peña",
    href: profile.links.linkedin,
    icon: Users,
  },
];

type TerminalEntry = {
  command?: string;
  lines: string[];
};

const initialEntries: TerminalEntry[] = [
  {
    lines: [
      "Resume preview mounted.",
      'Type "help" to show commands.',
    ],
  },
];

export default function Contact() {
  const [entries, setEntries] = useState<TerminalEntry[]>(initialEntries);
  const [input, setInput] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ block: "end" });
  }, [entries, input]);

  const openResume = () => {
    window.open(profile.resumeUrl, "_blank", "noopener,noreferrer");
  };

  const downloadResume = () => {
    const anchor = document.createElement("a");
    anchor.href = profile.resumeUrl;
    anchor.download = "RaileyDelaPena.pdf";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };

  const runCommand = (rawCommand: string) => {
    const command = rawCommand.trim().toLowerCase();

    if (!command) return;

    if (command === "clear") {
      setEntries([]);
      return;
    }

    let lines: string[];

    switch (command) {
      case "help":
        lines = [
          "help      show available commands",
          "view      open resume PDF",
          "download  download resume PDF",
          "email     start an email",
          "github    open GitHub profile",
          "linkedin  open LinkedIn profile",
          "clear     clear terminal output",
        ];
        break;
      case "view":
        openResume();
        lines = ["Opening resume PDF..."];
        break;
      case "download":
        downloadResume();
        lines = ["Downloading resume PDF..."];
        break;
      case "email":
        window.location.href = `mailto:${profile.email}`;
        lines = ["Opening mail client..."];
        break;
      case "github":
        window.open(profile.links.github, "_blank", "noopener,noreferrer");
        lines = ["Opening GitHub profile..."];
        break;
      case "linkedin":
        window.open(profile.links.linkedin, "_blank", "noopener,noreferrer");
        lines = ["Opening LinkedIn profile..."];
        break;
      default:
        lines = [`Command not found: ${rawCommand}`, 'Type "help" for options.'];
    }

    setEntries((currentEntries) => [
      ...currentEntries,
      { command: rawCommand, lines },
    ]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runCommand(input);
    setInput("");
  };

  return (
    <section className="page-section contact-page">
      <div className="contact-hero-grid">
        <Reveal className="contact-hero-copy">
          <div className="section-label">// 04 - contact</div>
          <h1 className="section-title">
            Let's build
            <br />
            <span>something great</span>
          </h1>
          <p>
            Open to selected freelance builds, AI-assisted workflows, and
            thoughtful React or Laravel interfaces. Reach me directly below, or
            use the terminal to inspect my resume.
          </p>
        </Reveal>

        <Reveal className="terminal contact-terminal" delay={120}>
          <div className="terminal-bar">
            <span className="dot dot-r" />
            <span className="dot dot-y" />
            <span className="dot dot-g" />
            <span className="terminal-title">
              ~/{profile.shortName.toLowerCase()}/resume — zsh
            </span>
          </div>

          <div
            className="contact-terminal-body"
            onClick={() => commandInputRef.current?.focus()}
          >
            <button
              className="terminal-resume-preview"
              type="button"
              onClick={openResume}
              aria-label="Open resume PDF"
            >
              <img
                src="/resume/resume-preview.avif"
                alt="Resume preview of Railey Dela Peña"
              />
            </button>

            <div className="terminal-session" aria-live="polite">
              {entries.map((entry, entryIndex) => (
                <div className="terminal-entry" key={`${entry.command}-${entryIndex}`}>
                  {entry.command ? (
                    <span className="t-line">
                      <span className="t-prompt">&gt; </span>
                      <span className="t-cmd">{entry.command}</span>
                    </span>
                  ) : null}
                  {entry.lines.map((line) => (
                    <span className="t-line" key={`${entryIndex}-${line}`}>
                      <span className="t-com">{line}</span>
                    </span>
                  ))}
                </div>
              ))}

              <form className="terminal-input-row" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="contact-terminal-command">
                  Terminal command
                </label>
                <span className="t-prompt">&gt;</span>
                <span className="terminal-input-shell" aria-hidden="true">
                  {input || <span className="terminal-placeholder">help</span>}
                  <span className="terminal-cursor" />
                </span>
                <input
                  ref={commandInputRef}
                  id="contact-terminal-command"
                  autoComplete="off"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  aria-label="Terminal command"
                />
              </form>
              <div ref={terminalEndRef} />
            </div>
          </div>
        </Reveal>
      </div>

      <div className="contact-grid">
        <Reveal className="contact-panel">
          <div className="panel-icon">
            <Clock size={19} />
          </div>
          <h2>Availability</h2>
          <p>
            {isAvailable
              ? "Available for selected freelance builds, AI-assisted workflows, Laravel/PHP systems, and React interfaces."
              : "Currently focused on existing commitments, but still reachable for future-fit projects and thoughtful collaborations."}
          </p>
          <div className="availability-list">
            <span>
              <MapPin size={15} />
              {profile.location}, {profile.timezone}
            </span>
            <span>
              <ArrowRight size={15} />
              Remote-friendly
            </span>
          </div>
        </Reveal>

        <div className="contact-methods">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            const opensNewTab =
              method.href.startsWith("http") ||
              method.href.includes("/resume/");

            return (
              <Reveal
                className="contact-method"
                delay={index * 80}
                key={method.label}
              >
                <a
                  href={method.href}
                  target={opensNewTab ? "_blank" : undefined}
                  rel={opensNewTab ? "noreferrer" : undefined}
                >
                  <div className="method-icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <span>{method.label}</span>
                    <strong>{method.value}</strong>
                  </div>
                  <ArrowRight size={17} />
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
