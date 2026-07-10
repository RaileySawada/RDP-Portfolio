import crypto from "node:crypto";

const defaultRateLimitWindowMs = 60 * 1000;
const defaultRateLimitMax = 60;
const textMaxLength = 2000;
const urlMaxLength = 500;

export function getDatabaseUrl() {
  return (process.env.FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL || "").replace(/\/$/, "");
}

export function jsonResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

export function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function getHeader(headers, name) {
  const match = Object.entries(headers || {}).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return match?.[1] || "";
}

export function getIpAddress(event) {
  const forwardedFor = getHeader(event.headers, "x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return getHeader(event.headers, "client-ip") || getHeader(event.headers, "x-nf-client-connection-ip") || "unknown";
}

export async function firebaseRequest(path, init) {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error("Missing Firebase database URL");
  }

  const response = await fetch(`${databaseUrl}${path}.json`, init);

  if (!response.ok) {
    throw new Error(`Firebase request failed: ${response.status}`);
  }

  return response.json();
}

export async function enforceRateLimit(event, options = {}) {
  const windowMs = Number(options.windowMs || defaultRateLimitWindowMs);
  const max = Number(options.max || defaultRateLimitMax);
  const namespace = String(options.namespace || "general").replace(/[^a-zA-Z0-9_-]/g, "");
  const now = Date.now();
  const windowStartedAt = Math.floor(now / windowMs) * windowMs;
  const clientKey = hashValue(`${namespace}:${getIpAddress(event)}:${windowStartedAt}`);
  const path = `/security/rateLimits/${namespace}/${clientKey}`;

  try {
    const current = await firebaseRequest(path, { method: "GET" });
    const count = Number(current?.count || 0) + 1;
    const resetAt = windowStartedAt + windowMs;

    await firebaseRequest(path, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        count,
        resetAt,
        lastSeenAt: now,
      }),
    });

    if (count > max) {
      return {
        allowed: false,
        response: jsonResponse(
          429,
          {
            error: "Too many requests. Try again later.",
            resetAt,
          },
          {
            "retry-after": String(Math.max(Math.ceil((resetAt - now) / 1000), 1)),
          },
        ),
      };
    }
  } catch {
    return { allowed: true };
  }

  return { allowed: true };
}

export function sanitizeText(value, maxLength = textMaxLength) {
  return Array.from(String(value || ""))
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join("")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeUrl(value, options = {}) {
  const raw = sanitizeText(value, urlMaxLength);

  if (!raw) {
    return "";
  }

  if (options.allowRelative && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }

  try {
    const url = new URL(raw);
    const allowedProtocols = options.allowedProtocols || ["https:", "http:", "mailto:", "tel:"];

    return allowedProtocols.includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function sanitizeTextList(values, maxLength = 80) {
  return Array.isArray(values) ? values.map((value) => sanitizeText(value, maxLength)).filter(Boolean).slice(0, 40) : [];
}

function sanitizeSocials(values) {
  return Array.isArray(values)
    ? values
        .map((social) => ({
          label: sanitizeText(social?.label, 40),
          href: sanitizeUrl(social?.href),
        }))
        .filter((social) => social.label && social.href)
        .slice(0, 20)
    : [];
}

function sanitizeGroups(values) {
  return Array.isArray(values)
    ? values
        .map((group) => ({
          category: sanitizeText(group?.category, 80),
          items: sanitizeTextList(group?.items, 80),
        }))
        .filter((group) => group.category && group.items.length)
        .slice(0, 30)
    : [];
}

export function sanitizePortfolioData(portfolio) {
  const profile = portfolio?.profile || {};
  const home = portfolio?.home || {};

  return {
    profile: {
      name: sanitizeText(profile.name, 100),
      initials: sanitizeText(profile.initials, 10),
      title: sanitizeText(profile.title, 120),
      location: sanitizeText(profile.location, 120),
      phone: sanitizeText(profile.phone, 40),
      email: sanitizeText(profile.email, 120),
      summary: sanitizeText(profile.summary),
      bio: sanitizeText(profile.bio),
      goals: sanitizeText(profile.goals),
      githubUser: sanitizeText(profile.githubUser, 39).replace(/[^a-zA-Z0-9-]/g, ""),
      imageUrl: sanitizeUrl(profile.imageUrl),
      socials: sanitizeSocials(profile.socials),
    },
    home: {
      projectTitles: sanitizeTextList(home.projectTitles, 160),
      certificationNames: sanitizeTextList(home.certificationNames, 160),
      stackItems: sanitizeTextList(home.stackItems, 80),
    },
    projects: Array.isArray(portfolio?.projects)
      ? portfolio.projects
          .map((project) => ({
            title: sanitizeText(project?.title, 160),
            description: sanitizeText(project?.description),
            tech: sanitizeTextList(project?.tech, 80),
            status: sanitizeText(project?.status, 80),
            github: sanitizeUrl(project?.github),
            demo: sanitizeUrl(project?.demo),
            imageUrl: sanitizeUrl(project?.imageUrl),
            icon: sanitizeText(project?.icon, 40),
          }))
          .filter((project) => project.title)
          .slice(0, 60)
      : [],
    stackGroups: sanitizeGroups(portfolio?.stackGroups),
    skillGroups: sanitizeGroups(portfolio?.skillGroups),
    certifications: Array.isArray(portfolio?.certifications)
      ? portfolio.certifications
          .map((certification) => ({
            name: sanitizeText(certification?.name, 160),
            issuer: sanitizeText(certification?.issuer, 160),
            date: sanitizeText(certification?.date, 40),
            credential: sanitizeUrl(certification?.credential),
            imageUrl: sanitizeUrl(certification?.imageUrl),
            details: sanitizeText(certification?.details),
          }))
          .filter((certification) => certification.name)
          .slice(0, 80)
      : [],
    timeline: Array.isArray(portfolio?.timeline)
      ? portfolio.timeline
          .map((item) => ({
            period: sanitizeText(item?.period, 80),
            title: sanitizeText(item?.title, 160),
            detail: sanitizeText(item?.detail),
          }))
          .filter((item) => item.title)
          .slice(0, 40)
      : [],
  };
}
