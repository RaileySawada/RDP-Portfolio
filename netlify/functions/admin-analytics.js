import { enforceRateLimit, firebaseRequest, hashValue, jsonResponse, sanitizeText } from "./_security.js";

const activeWindowMs = 90000;
const dayMs = 24 * 60 * 60 * 1000;

function getDayKey(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getShortLabel(timestamp) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(timestamp));
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function toSlices(map) {
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

async function validateSession(payload) {
  const id = String(payload?.id || "").replace(/[^a-zA-Z0-9_-]/g, "");
  const token = String(payload?.token || "");

  if (!id || !token) {
    return false;
  }

  const session = await firebaseRequest(`/adminAuth/sessions/${id}`, { method: "GET" });

  if (!session || session.expiresAt <= Date.now()) {
    return false;
  }

  return session.tokenHash === hashValue(token);
}

function buildActivityEvents(adminAuthStore) {
  const todayStart = startOfToday();
  const auditEvents = Object.values(adminAuthStore?.auditEvents || {}).map((event) => ({
    actor: event.actor || "System Admin",
    event: event.event || "admin.activity",
    target: event.target || "admin",
    ipAddress: sanitizeText(event.ipAddress || "unknown", 80),
    userAgent: sanitizeText(event.userAgent || "unknown", 300),
    time: Number(event.time || 0),
  }));
  const sessionEvents = Object.values(adminAuthStore?.sessions || {}).map((session) => ({
    actor: session.email || "System Admin",
    event: "admin.login.session_created",
    target: "adminAuth/sessions",
    ipAddress: sanitizeText(session.request?.ip || "unknown", 80),
    userAgent: sanitizeText(session.request?.userAgent || "unknown", 300),
    time: Number(session.createdAt || 0),
  }));
  const attemptEvents = Object.values(adminAuthStore?.loginAttempts || {}).map((attempt) => ({
    actor: attempt.email || "System Admin",
    event: Number(attempt.lockedUntil || 0) > Date.now() ? "admin.login.locked" : "admin.login.attempt",
    target: "adminAuth/loginAttempts",
    ipAddress: sanitizeText(attempt.request?.ip || "unknown", 80),
    userAgent: sanitizeText(attempt.request?.userAgent || "unknown", 300),
    time: Number(attempt.lastAttemptAt || 0),
  }));

  return [...auditEvents, ...sessionEvents, ...attemptEvents]
    .filter((event) => event.time >= todayStart)
    .sort((a, b) => b.time - a.time)
    .slice(0, 30);
}

function buildAnalytics(store, adminAuthStore) {
  const now = Date.now();
  const credentials = adminAuthStore?.credentials || {};
  const sessions = Object.values(store?.sessions || {});
  const totalViewers = Math.max(Number(store?.total || 0), sessions.length);
  const activeViewers = Math.max(
    sessions.filter((session) => typeof session.lastSeen === "number" && now - session.lastSeen <= activeWindowMs).length,
    sessions.length > 0 ? 1 : 0,
  );
  const todayKey = getDayKey(now);
  const browserMap = new Map();
  const networkMap = new Map();
  const newViewersByDay = new Map();
  const returningByDay = new Map();

  sessions.forEach((session) => {
    const firstSeen = Number(session.firstSeen || session.lastSeen || 0);
    const lastSeen = Number(session.lastSeen || session.firstSeen || 0);

    if (!firstSeen) {
      return;
    }

    increment(newViewersByDay, getDayKey(firstSeen));

    if (lastSeen && getDayKey(lastSeen) !== getDayKey(firstSeen)) {
      increment(returningByDay, getDayKey(lastSeen));
    }

    increment(browserMap, session.client?.browser || "Unknown");
    increment(networkMap, session.client?.network?.effectiveType || "Unknown");
  });

  const viewerSeries = Array.from({ length: 14 }, (_, index) => {
    const timestamp = now - (13 - index) * dayMs;
    const key = getDayKey(timestamp);
    return {
      label: getShortLabel(timestamp),
      viewers: newViewersByDay.get(key) || 0,
      returning: returningByDay.get(key) || 0,
    };
  });

  return {
    adminProfile: {
      name: credentials.name || "Admin",
      email: credentials.email || "",
      role: credentials.role || "Admin",
    },
    totalViewers,
    activeViewers,
    todayViewers: newViewersByDay.get(todayKey) || 0,
    averageDailyViewers: Math.round(
      viewerSeries.reduce((total, point) => total + point.viewers, 0) / Math.max(viewerSeries.length, 1),
    ),
    viewerSeries,
    browserSlices: toSlices(browserMap),
    networkSlices: toSlices(networkMap),
    activityEvents: buildActivityEvents(adminAuthStore || {}),
    lastUpdatedAt: Number(store?.updatedAt || now),
  };
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const rateLimit = await enforceRateLimit(event, {
      namespace: "admin-analytics",
      max: 60,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    const payload = event.body ? JSON.parse(event.body) : {};
    const isSessionValid = await validateSession(payload);

    if (!isSessionValid) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    const [store, adminAuthStore] = await Promise.all([
      firebaseRequest("/visitorStats", { method: "GET" }),
      firebaseRequest("/adminAuth", { method: "GET" }),
    ]);
    return jsonResponse(200, buildAnalytics(store || {}, adminAuthStore || {}));
  } catch {
    return jsonResponse(500, { error: "Analytics service is unavailable." });
  }
}
