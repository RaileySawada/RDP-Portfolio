import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Activity } from "react-github-calendar";
import type { PortfolioData } from "../../data/portfolio";
import { ArrowIcon } from "../ui/Icons";
import { Section } from "../ui/Section";
import { WindowBar } from "../ui/WindowBar";
import { Reveal } from "./Reveal";

type GitHubContributionProps = {
  portfolio: PortfolioData;
};

type ContributionStats = {
  total: number;
  currentStreak: number;
  longestStreak: number;
};

type ContributionWeek = (Activity | null)[];

type GitHubContributionApiResponse = {
  total?: {
    lastYear?: number;
  };
  contributions?: Activity[];
};

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const weekdayLabels = [
  { label: "Mon", row: 2 },
  { label: "Wed", row: 4 },
  { label: "Fri", row: 6 },
];
const legendLevels = [0, 1, 2, 3, 4];

async function fetchContributionData(githubUser: string, signal: AbortSignal) {
  const localResponse = await fetch(`/.netlify/functions/github-contributions?user=${encodeURIComponent(githubUser)}`, {
    signal,
  });
  const localContentType = localResponse.headers.get("content-type") || "";

  if (localResponse.ok && localContentType.includes("application/json")) {
    return (await localResponse.json()) as GitHubContributionApiResponse;
  }

  const fallbackResponse = await fetch(`https://github-contributions-api.jogruber.de/v4/${githubUser}?y=last`, {
    signal,
  });

  if (!fallbackResponse.ok) {
    throw new Error("GitHub contributions are unavailable.");
  }

  return (await fallbackResponse.json()) as GitHubContributionApiResponse;
}

function computeStats(days: Activity[], totalOverride?: number): ContributionStats {
  let total = totalOverride ?? 0;
  let longestStreak = 0;
  let runningStreak = 0;

  for (const day of days) {
    if (totalOverride === undefined) {
      total += day.count;
    }

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

export function GitHubContribution({ portfolio }: GitHubContributionProps) {
  const { profile } = portfolio;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ContributionStats | null>(null);
  const calendarWrapRef = useRef<HTMLDivElement>(null);

  const weeks = useMemo(() => buildContributionWeeks(activities), [activities]);

  useEffect(() => {
    const calendarWrap = calendarWrapRef.current;

    if (!calendarWrap || weeks.length === 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      calendarWrap.scrollLeft = calendarWrap.scrollWidth;
    });
  }, [weeks.length]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGitHubContributions() {
      try {
        const data = await fetchContributionData(profile.githubUser, controller.signal);

        if (!Array.isArray(data.contributions)) {
          return;
        }

        const totalLastYear = typeof data.total?.lastYear === "number" ? data.total.lastYear : undefined;
        setActivities(data.contributions);
        setStats(computeStats(data.contributions, totalLastYear));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn("Unable to load GitHub contribution stats.", error);
        }
      }
    }

    loadGitHubContributions();

    return () => controller.abort();
  }, [profile.githubUser]);

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
          <div className="github-calendar-wrap" ref={calendarWrapRef}>
            <ContributionDotGrid weeks={weeks} />
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

  const months = buildMonthLabels(weeks);
  const weekCount = weeks.length;

  return (
    <div className="github-calendar-content" style={{ "--github-week-count": weekCount } as CSSProperties}>
      <div className="github-month-labels" aria-hidden="true">
        {months.map((month) => (
          <span style={{ gridColumn: `${month.weekIndex + 1} / span 4` }} key={`${month.label}-${month.weekIndex}`}>
            {month.label}
          </span>
        ))}
      </div>

      <div className="github-weekday-labels" aria-hidden="true">
        {weekdayLabels.map((day) => (
          <span style={{ gridRow: day.row }} key={day.label}>
            {day.label}
          </span>
        ))}
      </div>

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

      <div className="github-calendar-legend" aria-hidden="true">
        <span>Less</span>
        {legendLevels.map((level) => (
          <span className="github-legend-dot" data-level={level} key={level} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function buildMonthLabels(weeks: ContributionWeek[]) {
  const labels: Array<{ label: string; weekIndex: number }> = [];
  let previousMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.find((day): day is Activity => Boolean(day));

    if (!firstDay) {
      return;
    }

    const month = new Date(`${firstDay.date}T00:00:00`).getMonth();

    if (month !== previousMonth) {
      labels.push({ label: monthLabels[month] || "", weekIndex });
      previousMonth = month;
    }
  });

  return labels;
}
