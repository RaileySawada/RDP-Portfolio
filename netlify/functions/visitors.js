import { enforceRateLimit, firebaseRequest, firebaseTransaction, getHeader, getIpAddress, jsonResponse, parseJsonBody, sanitizeText } from "./_security.js";

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
  const store = await firebaseRequest("/visitorStats", { method: "GET" });
  return store && typeof store === "object" ? store : {};
}

function sanitizeClient(client) {
  const network = client?.network && typeof client.network === "object" ? client.network : {};
  const downlink = Number(network.downlink);
  const rtt = Number(network.rtt);

  return {
    browser: sanitizeText(client?.browser, 80),
    language: sanitizeText(client?.language, 40),
    platform: sanitizeText(client?.platform, 80),
    screen: sanitizeText(client?.screen, 40),
    timezone: sanitizeText(client?.timezone, 80),
    network: {
      effectiveType: sanitizeText(network.effectiveType, 20),
      downlink: Number.isFinite(downlink) ? Math.max(downlink, 0) : null,
      rtt: Number.isFinite(rtt) ? Math.max(rtt, 0) : null,
      saveData: Boolean(network.saveData),
    },
  };
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
  const nextStore = await firebaseTransaction("/visitorStats", (current) => {
    const store = current && typeof current === "object" ? current : {};
    const sessions = store.sessions && typeof store.sessions === "object" ? { ...store.sessions } : {};
    const previousSession = sessions[sessionId];

    sessions[sessionId] = {
      firstSeen: previousSession?.firstSeen || now,
      lastSeen: now,
      client: client && typeof client === "object" ? sanitizeClient(client) : previousSession?.client || null,
      request,
    };

    return {
      total: Math.max(Number(store.total || 0), getTotalSessionCount(sessions)),
      updatedAt: now,
      sessions,
    };
  });
  const sessions = nextStore?.sessions || {};
  const visitors = Math.max(Number(nextStore?.total || 0), getTotalSessionCount(sessions));
  const activeViewers = getActiveSessionCount(sessions, now);
  const plusCount = Math.max(activeViewers - 3, 0);

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

    const parsedBody = parseJsonBody(event, 32_000);

    if (!parsedBody.ok) {
      return jsonResponse(400, { error: parsedBody.error });
    }

    const payload = parsedBody.value;
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
    return jsonResponse(503, { ...fallbackStats, error: "Visitor service is unavailable." });
  }
}
