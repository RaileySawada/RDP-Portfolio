import { useEffect, useRef, useState } from "react";
import type { PortfolioData } from "../../data/portfolio";
import { WindowBar } from "../ui/WindowBar";

type PortfolioCliProps = {
  profile: PortfolioData["profile"];
};

export function PortfolioCli({ profile }: PortfolioCliProps) {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([
    `Welcome, I am ${profile.name}.`,
    "This shell is a quick way to open my resume and profiles.",
    "Run `help` to see available commands.",
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const githubUrl = `https://github.com/${profile.githubUser}`;
  const linkedInUrl =
    profile.socials.find((social) => social.label === "LinkedIn")?.href ||
    "https://www.linkedin.com/";
  const emailUrl = `mailto:${profile.email}`;
  const resumePath = profile.socials.find((social) => social.label.toLowerCase() === "resume")?.href;

  useEffect(() => {
    const node = outputRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [history]);

  const downloadResume = async () => {
    if (!resumePath) {
      return;
    }

    try {
      const response = await fetch(resumePath);

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok || !contentType.includes("application/pdf")) {
        throw new Error("Resume request failed.");
      }

      const file = await response.blob();
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "RaileyDelaPena.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1_000);
      setHistory((currentHistory) => [...currentHistory, "Resume downloaded successfully."]);
    } catch {
      setHistory((currentHistory) => [...currentHistory, "Resume download failed. Please try again."]);
    }
  };

  const runCommand = (rawCommand: string) => {
    const nextCommand = rawCommand.trim().toLowerCase();

    if (!nextCommand) {
      return;
    }

    const actions: Record<string, () => string[]> = {
      help: () => [
        "Available commands:",
        "view\tOpen my resume in a new tab",
        "download\tDownload my resume as a PDF",
        "github\tOpen my GitHub profile",
        "linkedin\tOpen my LinkedIn profile",
        "email\tCompose an email to me",
        "clear\tClear this terminal",
      ],
      view: () => {
        if (!resumePath) {
          return ["Resume is not available yet."];
        }

        window.open(resumePath, "_blank", "noopener,noreferrer");
        return ["Opening resume in a new tab."];
      },
      download: () => {
        if (!resumePath) {
          return ["Resume is not available yet."];
        }

        void downloadResume();
        return ["Preparing resume download: RaileyDelaPeña.pdf"];
      },
      github: () => {
        window.open(githubUrl, "_blank", "noopener,noreferrer");
        return [`Opening GitHub: ${githubUrl}`];
      },
      linkedin: () => {
        window.open(linkedInUrl, "_blank", "noopener,noreferrer");
        return ["Opening LinkedIn profile."];
      },
      email: () => {
        window.location.href = emailUrl;
        return [`Opening mail client for ${profile.email}`];
      },
      clear: () => [],
    };

    setCommandHistory((currentCommands) => [...currentCommands, nextCommand]);
    setHistoryCursor(null);

    if (nextCommand === "clear") {
      setHistory([]);
      setCommand("");
      return;
    }

    const output =
      actions[nextCommand]?.() ||
      [`Command not found: ${nextCommand}`, "Run `help` to list supported commands."];
    setHistory((currentHistory) => [
      ...currentHistory,
      `rdp@Portfolio:~$ ${nextCommand}`,
      ...output,
    ]);
    setCommand("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (commandHistory.length === 0) {
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex =
        historyCursor === null
          ? commandHistory.length - 1
          : Math.max(0, historyCursor - 1);
      setHistoryCursor(nextIndex);
      setCommand(commandHistory[nextIndex]);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyCursor === null) {
        return;
      }
      const nextIndex = historyCursor + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryCursor(null);
        setCommand("");
        return;
      }
      setHistoryCursor(nextIndex);
      setCommand(commandHistory[nextIndex]);
    }
  };

  return (
    <article
      className="cli-panel"
      aria-label="Portfolio command line"
      onClick={() => inputRef.current?.focus()}
    >
      <WindowBar label="rdp@portfolio:~" />
      <div className="cli-screen" ref={outputRef} aria-live="polite">
        <pre
          className="cli-banner"
          aria-label="RDP ASCII banner"
        >{`██████╗ ██████╗ ██████╗
██╔══██╗██╔══██╗██╔══██╗
██████╔╝██║  ██║██████╔╝
██╔══██╗██║  ██║██╔═══╝
██║  ██║██████╔╝██║
╚═╝  ╚═╝╚═════╝ ╚═╝`}</pre>
        <div className="cli-output">
          {history.map((line, index) => (
            <p
              className={line.startsWith("rdp@") ? "cli-command" : line === "Available commands:" ? "cli-help-heading" : line.includes("\t") ? "cli-help-row" : ""}
              key={`${line}-${index}`}
            >
              {line.includes("\t") ? (
                <>
                  <strong>{line.split("\t", 2)[0]}</strong>
                  <span>{line.split("\t", 2)[1]}</span>
                </>
              ) : line}
            </p>
          ))}
        </div>
        <form
          className="cli-input-row"
          onSubmit={(event) => {
            event.preventDefault();
            runCommand(command);
          }}
        >
          <span>rdp@Portfolio:~$</span>
          <input
            ref={inputRef}
            value={command}
            aria-label="CLI command"
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => setCommand(event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </form>
      </div>
    </article>
  );
}
