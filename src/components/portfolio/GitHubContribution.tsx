import { useCallback, useMemo, useRef, useState } from "react";
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

type ContributionWeek = (Activity | null)[];

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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ContributionStats | null>(null);
  const statsKeyRef = useRef("");

  const handleTransformData = useCallback((data: Activity[]) => {
    const nextStats = computeStats(data);
    const nextStatsKey = `${nextStats.total}:${nextStats.currentStreak}:${nextStats.longestStreak}`;

    if (statsKeyRef.current !== nextStatsKey) {
      statsKeyRef.current = nextStatsKey;
      window.setTimeout(() => {
        setActivities(data);
        setStats(nextStats);
      }, 0);
    }

    return data;
  }, []);

  const weeks = useMemo(() => buildContributionWeeks(activities), [activities]);

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
              <p className="github-stat-label">Last Year</p>
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
            <ContributionDotGrid weeks={weeks} />
            <div className="github-calendar-loader" aria-hidden="true">
              <GitHubCalendar
                username={profile.githubUser}
                year="last"
                blockSize={4}
                blockMargin={2}
                blockRadius={4}
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
                  light: ["#f5f5f5", "#d4d4d4", "#a3a3a3", "#525252", "#0a0a0a"],
                  dark: ["#090909", "#525252", "#a3a3a3", "#e5e5e5", "#ffffff"],
                }}
              />
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function buildContributionWeeks(days: Activity[]): ContributionWeek[] {
  if (days.length === 0) {
    return [];
  }

  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const firstDate = new Date(`${sortedDays[0].date}T00:00:00`);
  const weeks: ContributionWeek[] = [];
  let currentWeek: ContributionWeek = Array.from({ length: firstDate.getDay() }, () => null);

  for (const day of sortedDays) {
    currentWeek.push(day);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

function ContributionDotGrid({ weeks }: { weeks: ContributionWeek[] }) {
  if (weeks.length === 0) {
    return <div className="github-dot-grid is-loading" aria-hidden="true" />;
  }

  return (
    <div className="github-dot-grid" aria-label="GitHub contributions in the last year">
      {weeks.map((week, weekIndex) => (
        <div className="github-dot-week" key={`week-${weekIndex}`}>
          {week.map((day, dayIndex) => (
            <span
              className="github-dot"
              data-level={day?.level ?? 0}
              title={day ? `${day.count} contributions on ${day.date}` : undefined}
              key={day?.date ?? `empty-${weekIndex}-${dayIndex}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
