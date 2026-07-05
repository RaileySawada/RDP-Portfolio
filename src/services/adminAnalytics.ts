import { type AdminSession } from "./adminAuth";

export type ViewerPoint = {
  label: string;
  viewers: number;
  returning: number;
};

export type ViewerSlice = {
  label: string;
  value: number;
};

export type AdminActivityEvent = {
  actor: string;
  event: string;
  target: string;
  ipAddress: string;
  userAgent: string;
  time: number;
};

export type AdminAnalytics = {
  totalViewers: number;
  activeViewers: number;
  todayViewers: number;
  averageDailyViewers: number;
  viewerSeries: ViewerPoint[];
  browserSlices: ViewerSlice[];
  networkSlices: ViewerSlice[];
  activityEvents: AdminActivityEvent[];
  lastUpdatedAt: number;
};

type VisitorSession = {
  firstSeen?: number;
  lastSeen?: number;
  client?: {
    browser?: string;
    network?: {
      effectiveType?: string;
    };
  };
};

type VisitorStore = {
  total?: number;
  updatedAt?: number;
  sessions?: Record<string, VisitorSession>;
};

type AdminAuthStore = {
  auditEvents?: Record<string, Partial<AdminActivityEvent>>;
  sessions?: Record<string, { email?: string; createdAt?: number; request?: { ip?: string; userAgent?: string } }>;
  loginAttempts?: Record<string, { email?: string; lastAttemptAt?: number; lockedUntil?: number; request?: { ip?: string; userAgent?: string } }>;
};

const activeWindowMs = 90000;
const dayMs = 24 * 60 * 60 * 1000;

export const fallbackAnalytics: AdminAnalytics = {
  totalViewers: 0,
  activeViewers: 0,
  todayViewers: 0,
  averageDailyViewers: 0,
  viewerSeries: [],
  browserSlices: [],
  networkSlices: [],
  activityEvents: [],
  lastUpdatedAt: 0,
};

function getDatabaseUrl() {
  return import.meta.env.VITE_FIREBASE_DATABASE_URL?.replace(/\/$/, "") || "";
}

function getDayKey(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getShortLabel(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(timestamp));
}

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) || 0) + 1);
}

function toSlices(map: Map<string, number>): ViewerSlice[] {
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function buildActivityEvents(adminAuthStore: AdminAuthStore): AdminActivityEvent[] {
  const todayStart = startOfToday();
  const auditEvents = Object.values(adminAuthStore.auditEvents || {}).map((event) => ({
    actor: event.actor || "System Admin",
    event: event.event || "admin.activity",
    target: event.target || "admin",
    ipAddress: event.ipAddress || "unknown",
    userAgent: event.userAgent || "unknown",
    time: Number(event.time || 0),
  }));
  const sessionEvents = Object.values(adminAuthStore.sessions || {}).map((session) => ({
    actor: session.email || "System Admin",
    event: "admin.login.session_created",
    target: "adminAuth/sessions",
    ipAddress: session.request?.ip || "unknown",
    userAgent: session.request?.userAgent || "unknown",
    time: Number(session.createdAt || 0),
  }));
  const attemptEvents = Object.values(adminAuthStore.loginAttempts || {}).map((attempt) => ({
    actor: attempt.email || "System Admin",
    event: Number(attempt.lockedUntil || 0) > Date.now() ? "admin.login.locked" : "admin.login.attempt",
    target: "adminAuth/loginAttempts",
    ipAddress: attempt.request?.ip || "unknown",
    userAgent: attempt.request?.userAgent || "unknown",
    time: Number(attempt.lastAttemptAt || 0),
  }));

  return [...auditEvents, ...sessionEvents, ...attemptEvents]
    .filter((event) => event.time >= todayStart)
    .sort((a, b) => b.time - a.time)
    .slice(0, 30);
}

function buildAnalytics(store: VisitorStore, adminAuthStore: AdminAuthStore = {}): AdminAnalytics {
  const now = Date.now();
  const sessions = Object.values(store.sessions || {});
  const totalViewers = Math.max(Number(store.total || 0), sessions.length);
  const activeViewers = Math.max(
    sessions.filter((session) => typeof session.lastSeen === "number" && now - session.lastSeen <= activeWindowMs).length,
    sessions.length > 0 ? 1 : 0,
  );
  const todayKey = getDayKey(now);
  const browserMap = new Map<string, number>();
  const networkMap = new Map<string, number>();
  const newViewersByDay = new Map<string, number>();
  const returningByDay = new Map<string, number>();

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
  const todayViewers = newViewersByDay.get(todayKey) || 0;
  const averageDailyViewers = Math.round(
    viewerSeries.reduce((total, point) => total + point.viewers, 0) / Math.max(viewerSeries.length, 1),
  );

  return {
    totalViewers,
    activeViewers,
    todayViewers,
    averageDailyViewers,
    viewerSeries,
    browserSlices: toSlices(browserMap),
    networkSlices: toSlices(networkMap),
    activityEvents: buildActivityEvents(adminAuthStore),
    lastUpdatedAt: Number(store.updatedAt || now),
  };
}

async function fetchFirebaseAnalytics(): Promise<AdminAnalytics> {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return fallbackAnalytics;
  }

  const [visitorResponse, adminAuthResponse] = await Promise.all([
    fetch(`${databaseUrl}/visitorStats.json`),
    fetch(`${databaseUrl}/adminAuth.json`),
  ]);

  if (!visitorResponse.ok) {
    return fallbackAnalytics;
  }

  const store = (await visitorResponse.json()) as VisitorStore;
  const adminAuthStore = adminAuthResponse.ok ? ((await adminAuthResponse.json()) as AdminAuthStore) : {};
  return buildAnalytics(store || {}, adminAuthStore || {});
}

export async function fetchAdminAnalytics(session: AdminSession): Promise<AdminAnalytics> {
  try {
    const response = await fetch("/.netlify/functions/admin-analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(session),
    });

    if (response.ok) {
      return (await response.json()) as AdminAnalytics;
    }
  } catch {
    return fetchFirebaseAnalytics();
  }

  return fetchFirebaseAnalytics();
}
