export type VisitorStats = {
  visitors: number;
  activeViewers: number;
  plusCount: number;
};

type NetworkInformation = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};

type VisitorClientInfo = {
  browser: string;
  language: string;
  platform: string;
  screen: string;
  timezone: string;
  network: {
    effectiveType: string;
    downlink: number | null;
    rtt: number | null;
    saveData: boolean;
  };
};

const fallbackStats: VisitorStats = {
  visitors: 0,
  activeViewers: 1,
  plusCount: 0,
};

const sessionKey = "portfolio-visitor-session";
const activeWindowMs = 90000;

function getSessionId() {
  const existingSession = window.sessionStorage.getItem(sessionKey);

  if (existingSession) {
    return existingSession;
  }

  const nextSession = crypto.randomUUID();
  window.sessionStorage.setItem(sessionKey, nextSession);
  return nextSession;
}

function getDatabaseUrl() {
  return import.meta.env.VITE_FIREBASE_DATABASE_URL?.replace(/\/$/, "") || "";
}

function getBrowserName(userAgent: string) {
  if (userAgent.includes("Edg/")) {
    return "Microsoft Edge";
  }
  if (userAgent.includes("Chrome/") && !userAgent.includes("Chromium")) {
    return "Chrome";
  }
  if (userAgent.includes("Firefox/")) {
    return "Firefox";
  }
  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    return "Safari";
  }
  return "Unknown";
}

function getClientInfo(): VisitorClientInfo {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;

  return {
    browser: getBrowserName(navigator.userAgent),
    language: navigator.language,
    platform: navigator.platform,
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    network: {
      effectiveType: connection?.effectiveType || "unknown",
      downlink: typeof connection?.downlink === "number" ? connection.downlink : null,
      rtt: typeof connection?.rtt === "number" ? connection.rtt : null,
      saveData: Boolean(connection?.saveData),
    },
  };
}

function getActiveSessionCount(sessions: Record<string, { lastSeen?: number }> | undefined, now: number) {
  if (!sessions) {
    return 1;
  }

  const activeViewers = Object.values(sessions).filter((session) => {
    return typeof session.lastSeen === "number" && now - session.lastSeen <= activeWindowMs;
  }).length;

  return Math.max(activeViewers, 1);
}

function getTotalSessionCount(sessions: Record<string, { lastSeen?: number }> | undefined) {
  return sessions ? Object.keys(sessions).length : 1;
}

async function recordFirebaseVisit(): Promise<VisitorStats> {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return fallbackStats;
  }

  const now = Date.now();
  const sessionId = getSessionId();
  const response = await fetch(`${databaseUrl}/visitorStats.json`);
  const store = response.ok ? await response.json() : {};
  const sessions = (store?.sessions || {}) as Record<string, { firstSeen?: number; lastSeen?: number; client?: VisitorClientInfo }>;
  const previousSession = sessions[sessionId];

  sessions[sessionId] = {
    firstSeen: previousSession?.firstSeen || now,
    lastSeen: now,
    client: getClientInfo(),
  };

  const visitors = Math.max(Number(store?.total || 0), getTotalSessionCount(sessions));

  await fetch(`${databaseUrl}/visitorStats.json`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      total: visitors,
      updatedAt: now,
      sessions,
    }),
  });

  const activeViewers = getActiveSessionCount(sessions, now);

  return {
    visitors,
    activeViewers,
    plusCount: Math.max(activeViewers - 3, 0),
  };
}

export async function recordVisit(kind: "visit" | "heartbeat" = "visit"): Promise<VisitorStats> {
  try {
    const response = await fetch("/.netlify/functions/visitors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind,
        sessionId: getSessionId(),
        client: getClientInfo(),
      }),
    });

    if (!response.ok) {
      return recordFirebaseVisit();
    }

    return (await response.json()) as VisitorStats;
  } catch {
    try {
      return await recordFirebaseVisit();
    } catch {
      return fallbackStats;
    }
  }
}

export { fallbackStats };
