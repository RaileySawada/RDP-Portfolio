import { enforceRateLimit, firebaseRequest, getHeader, getIpAddress, jsonResponse, sanitizeText } from "./_security.js";

const activeWindowMs = 90000;
const fallbackStats = {
  visitors: 0,
  activeViewers: 1,
  plusCount: 0,
};

function sanitizeSessionId(sessionId) {
  return String(sessionId || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 80);
}

function getRequestInfo(event) {
  return {
    ip: getIpAddress(event),
    userAgent: sanitizeText(getHeader(event.headers, "user-agent"), 300),
    country: sanitizeText(getHeader(event.headers, "x-country"), 80),
    city: sanitizeText(getHeader(event.headers, "x-nf-geo-city"), 80),
    region: sanitizeText(getHeader(event.headers, "x-nf-geo-subdivision"), 80),
  };
}

async function getVisitorStore() {
  try {
    const store = await firebaseRequest("/visitorStats", { method: "GET" });
    return store && typeof store === "object" ? store : {};
  } catch {
    return {};
  }
}

function getActiveSessionCount(sessions, now) {
  if (!sessions || typeof sessions !== "object") {
    return 1;
  }

  const activeCount = Object.values(sessions).filter((session) => {
    return session && typeof session.lastSeen === "number" && now - session.lastSeen <= activeWindowMs;
  }).length;

  return Math.max(activeCount, 1);
}

function getTotalSessionCount(sessions) {
  if (!sessions || typeof sessions !== "object") {
    return 1;
  }

  return Object.keys(sessions).length;
}

async function writeStats({ sessionId, client, request }) {
  const now = Date.now();
  const store = await getVisitorStore();
  const sessions = store.sessions && typeof store.sessions === "object" ? store.sessions : {};
  const previousSession = sessions[sessionId];

  sessions[sessionId] = {
    firstSeen: previousSession?.firstSeen || now,
    lastSeen: now,
    client: client && typeof client === "object" ? client : previousSession?.client || null,
    request,
  };

  const visitors = Math.max(Number(store.total || 0), getTotalSessionCount(sessions));
  const activeViewers = getActiveSessionCount(sessions, now);
  const plusCount = Math.max(activeViewers - 3, 0);
  const nextStore = {
    total: visitors,
    updatedAt: now,
    sessions,
  };

  try {
    await firebaseRequest("/visitorStats", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(nextStore),
    });
  } catch {
    return fallbackStats;
  }

  return {
    visitors,
    activeViewers,
    plusCount,
  };
}

export async function handler(event) {
  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const rateLimit = await enforceRateLimit(event, {
      namespace: "visitors",
      max: 120,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    if (event.httpMethod === "GET") {
      const now = Date.now();
      const store = await getVisitorStore();
      const activeViewers = getActiveSessionCount(store.sessions, now);

      return jsonResponse(200, {
        visitors: Number(store.total || 0),
        activeViewers,
        plusCount: Math.max(activeViewers - 3, 0),
      });
    }

    const payload = event.body ? JSON.parse(event.body) : {};
    const sessionId = sanitizeSessionId(payload.sessionId);

    if (!sessionId) {
      return jsonResponse(400, { error: "Missing sessionId" });
    }

    const stats = await writeStats({
      sessionId,
      client: payload.client,
      request: getRequestInfo(event),
    });

    return jsonResponse(200, stats);
  } catch {
    return jsonResponse(200, fallbackStats);
  }
}
