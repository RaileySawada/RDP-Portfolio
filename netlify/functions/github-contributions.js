import { enforceRateLimit } from "./_security.js";

const githubBaseUrl = "https://github.com";
const githubGraphqlUrl = "https://api.github.com/graphql";
const fallbackApiBaseUrl = "https://github-contributions-api.jogruber.de/v4";
const contributionLevelMap = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

function jsonResponse(statusCode, body, cacheControl = "public, max-age=1800") {
  return {
    statusCode,
    headers: {
      "cache-control": cacheControl,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function sanitizeUsername(value) {
  return String(value || "")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .slice(0, 39);
}

function getAttribute(markup, name) {
  const pattern = new RegExp(`${name}=["']([^"']*)["']`, "i");
  const match = markup.match(pattern);
  return match?.[1] || "";
}

function parseCountFromLabel(label) {
  if (!label || /^no contributions/i.test(label)) {
    return 0;
  }

  const match = label.match(/([\d,]+)\s+contributions?/i);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function parseGitHubContributionHtml(html) {
  const totalMatch = html.match(/([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i);
  const total = totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : undefined;
  const contributions = [];
  const cellPattern = /<(?:td|rect)\b[^>]*data-date=["'][^"']+["'][^>]*>/gi;
  const cells = html.match(cellPattern) || [];

  for (const cell of cells) {
    const date = getAttribute(cell, "data-date");
    const level = Number(getAttribute(cell, "data-level") || 0);
    const dataCount = getAttribute(cell, "data-count");
    const label = getAttribute(cell, "aria-label") || getAttribute(cell, "data-tooltip");
    const count = dataCount ? Number(dataCount.replace(/,/g, "")) : parseCountFromLabel(label);

    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      contributions.push({
        date,
        count: Number.isFinite(count) ? count : 0,
        level: level >= 0 && level <= 4 ? level : 0,
      });
    }
  }

  return {
    total: typeof total === "number" ? { lastYear: total } : undefined,
    contributions,
  };
}

function getLastYearRange() {
  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 1);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function flattenGraphqlContributionDays(weeks) {
  return weeks.flatMap((week) => {
    return (week.contributionDays || []).map((day) => ({
      date: day.date,
      count: Number(day.contributionCount || 0),
      level: contributionLevelMap[day.contributionLevel] ?? 0,
    }));
  });
}

async function fetchGraphqlContributions(username) {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("Missing GitHub token");
  }

  const range = getLastYearRange();
  const response = await fetch(githubGraphqlUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "user-agent": "RDP-Portfolio GitHub contributions",
    },
    body: JSON.stringify({
      query: `
        query PortfolioContributions($login: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                    contributionLevel
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        login: username,
        from: range.from,
        to: range.to,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL failed: ${response.status}`);
  }

  const payload = await response.json();
  const calendar = payload?.data?.user?.contributionsCollection?.contributionCalendar;

  if (!calendar || !Array.isArray(calendar.weeks)) {
    throw new Error("GitHub GraphQL response did not include contribution calendar");
  }

  return {
    total: {
      lastYear: Number(calendar.totalContributions || 0),
    },
    contributions: flattenGraphqlContributionDays(calendar.weeks),
  };
}

async function fetchGitHubContributions(username) {
  const response = await fetch(`${githubBaseUrl}/users/${username}/contributions`, {
    headers: {
      accept: "text/html",
      "user-agent": "RDP-Portfolio GitHub contributions",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub contribution page failed: ${response.status}`);
  }

  const parsed = parseGitHubContributionHtml(await response.text());

  if (parsed.contributions.length === 0) {
    throw new Error("GitHub contribution page did not include contribution cells");
  }

  return parsed;
}

async function fetchFallbackContributions(username) {
  const response = await fetch(`${fallbackApiBaseUrl}/${username}?y=last`);

  if (!response.ok) {
    throw new Error(`Fallback contribution API failed: ${response.status}`);
  }

  return response.json();
}

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method not allowed" }, "no-store");
  }

  const rateLimit = await enforceRateLimit(event, {
    namespace: "github-contributions",
    max: 90,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const username = sanitizeUsername(event.queryStringParameters?.user);

  if (!username) {
    return jsonResponse(400, { error: "Missing GitHub username" }, "no-store");
  }

  try {
    return jsonResponse(200, await fetchGraphqlContributions(username));
  } catch {
    try {
      return jsonResponse(200, await fetchGitHubContributions(username));
    } catch {
      try {
        return jsonResponse(200, await fetchFallbackContributions(username));
      } catch {
        return jsonResponse(502, { error: "GitHub contributions are unavailable." }, "no-store");
      }
    }
  }
}
