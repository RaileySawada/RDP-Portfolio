import crypto from "node:crypto";

const defaultRateLimitWindowMs = 60 * 1000;
const defaultRateLimitMax = 60;
const firebaseTimeoutMs = 10_000;
const textMaxLength = 2000;
const urlMaxLength = 500;
const firebaseSignInUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword";
const firebaseRefreshUrl = "https://securetoken.googleapis.com/v1/token";

let firebaseAuth = null;
let firebaseAuthPromise = null;

export function getDatabaseUrl() {
  return (process.env.FIREBASE_DATABASE_URL || "").replace(/\/$/, "");
}

export function parseJsonBody(event, maxBytes = 1_000_000) {
  const body = event.body || "";

  if (Buffer.byteLength(body, "utf8") > maxBytes) {
    return { ok: false, error: "Request body is too large." };
  }

  if (!body) {
    return { ok: true, value: {} };
  }

  try {
    return { ok: true, value: JSON.parse(body) };
  } catch {
    return { ok: false, error: "Request body must be valid JSON." };
  }
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

function getFirebaseAuthConfig() {
  return {
    apiKey: process.env.FIREBASE_API_KEY || "",
    email: process.env.FIREBASE_SERVICE_EMAIL || "",
    password: process.env.FIREBASE_SERVICE_PASSWORD || "",
  };
}

async function readAuthResponse(response, message) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`${message}: ${response.status}`);
  }

  return payload;
}

function cacheFirebaseAuth(payload) {
  const idToken = payload?.idToken || payload?.access_token;
  const refreshToken = payload?.refreshToken || payload?.refresh_token;
  const expiresIn = Number(payload?.expiresIn || payload?.expires_in || 3600);

  if (!idToken || !refreshToken) {
    throw new Error("Firebase authentication response was incomplete");
  }

  firebaseAuth = {
    idToken,
    refreshToken,
    expiresAt: Date.now() + Math.max(expiresIn - 60, 60) * 1000,
  };

  return idToken;
}

async function signInFirebaseServiceUser(config) {
  const response = await fetch(`${firebaseSignInUrl}?key=${encodeURIComponent(config.apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: config.email,
      password: config.password,
      returnSecureToken: true,
    }),
    signal: AbortSignal.timeout(firebaseTimeoutMs),
  });
  const payload = await readAuthResponse(response, "Firebase service-user sign-in failed");
  return cacheFirebaseAuth(payload);
}

async function refreshFirebaseServiceUser(config) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: firebaseAuth.refreshToken,
  });
  const response = await fetch(`${firebaseRefreshUrl}?key=${encodeURIComponent(config.apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(firebaseTimeoutMs),
  });
  const payload = await readAuthResponse(response, "Firebase service-user token refresh failed");
  return cacheFirebaseAuth(payload);
}

async function getFirebaseIdToken() {
  const config = getFirebaseAuthConfig();

  if (!config.apiKey || !config.email || !config.password) {
    throw new Error("Missing Firebase service-user configuration");
  }

  if (firebaseAuth?.idToken && firebaseAuth.expiresAt > Date.now()) {
    return firebaseAuth.idToken;
  }

  if (firebaseAuthPromise) {
    return firebaseAuthPromise;
  }

  firebaseAuthPromise = (async () => {
    if (firebaseAuth?.refreshToken) {
      try {
        return await refreshFirebaseServiceUser(config);
      } catch {
        firebaseAuth = null;
      }
    }

    return signInFirebaseServiceUser(config);
  })();

  try {
    return await firebaseAuthPromise;
  } finally {
    firebaseAuthPromise = null;
  }
}

async function getFirebaseRequestUrl(path) {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error("Missing Firebase database URL");
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error("Invalid Firebase database URL");
  }

  if (parsedUrl.protocol !== "https:") {
    throw new Error("Firebase database URL must use HTTPS");
  }

  const idToken = await getFirebaseIdToken();
  return `${databaseUrl}${path}.json?auth=${encodeURIComponent(idToken)}`;
}

async function firebaseFetch(path, init = {}) {
  return fetch(await getFirebaseRequestUrl(path), {
    ...init,
    signal: init.signal || AbortSignal.timeout(firebaseTimeoutMs),
  });
}

async function parseFirebaseResponse(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function firebaseRequest(path, init = {}) {
  const response = await firebaseFetch(path, init);

  if (!response.ok) {
    throw new Error(`Firebase request failed: ${response.status}`);
  }

  return parseFirebaseResponse(response);
}

export async function firebaseTransaction(path, update, maxAttempts = 4) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const readResponse = await firebaseFetch(path, {
      method: "GET",
      headers: { "x-firebase-etag": "true" },
    });

    if (!readResponse.ok) {
      throw new Error(`Firebase transaction read failed: ${readResponse.status}`);
    }

    const current = await parseFirebaseResponse(readResponse);
    const next = update(current);
    const etag = readResponse.headers.get("etag");

    if (!etag) {
      throw new Error("Firebase transaction did not return an ETag");
    }

    const writeResponse = await firebaseFetch(path, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "if-match": etag,
      },
      body: JSON.stringify(next),
    });

    if (writeResponse.status === 412) {
      continue;
    }

    if (!writeResponse.ok) {
      throw new Error(`Firebase transaction write failed: ${writeResponse.status}`);
    }

    return parseFirebaseResponse(writeResponse);
  }

  throw new Error("Firebase transaction conflict limit reached");
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
    const resetAt = windowStartedAt + windowMs;
    const current = await firebaseTransaction(path, (previous) => ({
      count: Math.max(Number(previous?.count || 0), 0) + 1,
      resetAt,
      lastSeenAt: now,
    }));
    const count = Number(current?.count || 0);

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
