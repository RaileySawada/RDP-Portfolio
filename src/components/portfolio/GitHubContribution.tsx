import { useCallback, useRef, useState } from "react";
import { GitHubCalendar, type Activity } from "react-github-calendar";
import type { PortfolioData } from "../../data/portfolio";
import { ArrowIcon } from "../ui/Icons";
import { Section } from "../ui/Section";
import { WindowBar } from "../ui/WindowBar";
import { Reveal } from "./Reveal";

type GitHubContributionProps = {
  portfolio: PortfolioData;
  isDark: boolean;
};

type ContributionStats = {
  total: number;
  currentStreak: number;
  longestStreak: number;
};

function computeStats(days: Activity[]): ContributionStats {
  let total = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  for (const day of days) {
    total += day.count;
    runningStreak = day.count > 0 ? runningStreak + 1 : 0;
    longestStreak = Math.max(longestStreak, runningStreak);
  }

  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].count <= 0) {
      break;
    }
    currentStreak += 1;
  }

  return { total, currentStreak, longestStreak };
}

export function GitHubContribution({ portfolio, isDark }: GitHubContributionProps) {
  const { profile } = portfolio;
  const [stats, setStats] = useState<ContributionStats | null>(null);
  const statsKeyRef = useRef("");

  const handleTransformData = useCallback((data: Activity[]) => {
    const nextStats = computeStats(data);
    const nextStatsKey = `${nextStats.total}:${nextStats.currentStreak}:${nextStats.longestStreak}`;

    if (statsKeyRef.current !== nextStatsKey) {
      statsKeyRef.current = nextStatsKey;
      window.setTimeout(() => setStats(nextStats), 0);
    }

    return data;
  }, []);

  return (
    <Section
      id="github"
      title="GitHub Contribution"
      action={
        <a className="section-action" href={`https://github.com/${profile.githubUser}`}>
          @{profile.githubUser}
          <ArrowIcon />
        </a>
      }
    >
      <Reveal as="article" className="github-panel" delay={120}>
        <WindowBar label={`gh:~/${profile.githubUser}`} />

        {stats ? (
          <div className="github-stats">
            <div className="github-stat">
              <p className="github-stat-label">Contributions</p>
              <p className="github-stat-value">{stats.total.toLocaleString()}</p>
            </div>
            <div className="github-stat">
              <p className="github-stat-label">Current Streak</p>
              <p className="github-stat-value">{stats.currentStreak}d</p>
            </div>
            <div className="github-stat">
              <p className="github-stat-label">Longest Streak</p>
              <p className="github-stat-value">{stats.longestStreak}d</p>
            </div>
          </div>
        ) : null}

        <div className="github-panel-body">
          <div className="github-calendar-wrap">
            <GitHubCalendar
              username={profile.githubUser}
              year="last"
              blockSize={6}
              blockMargin={7}
              blockRadius={6}
              colorScheme={isDark ? "dark" : "light"}
              fontSize={12}
              showColorLegend={false}
              showMonthLabels={false}
              transformData={handleTransformData}
              labels={{
                totalCount: "{{count}} contributions in the last year",
                weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                legend: { less: "", more: "" },
              }}
              theme={{
                light: ["#f3f3f3", "#d8d8d8", "#8c8c8c", "#3f3f3f", "#0a0a0a"],
                dark: ["#101010", "#2f2f2f", "#6f6f6f", "#bebebe", "#ffffff"],
              }}
            />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
