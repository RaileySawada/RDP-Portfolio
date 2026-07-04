const activeWindowMs = 90000;
const fallbackStats = {
  visitors: 0,
  activeViewers: 1,
  plusCount: 0,
};

function getDatabaseUrl() {
  return (process.env.FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL || "").replace(/\/$/, "");
}

function sanitizeSessionId(sessionId) {
  return String(sessionId || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 80);
}

function getHeader(headers, name) {
  const match = Object.entries(headers || {}).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return match?.[1] || "";
}

function getIpAddress(event) {
  const forwardedFor = getHeader(event.headers, "x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return getHeader(event.headers, "client-ip") || getHeader(event.headers, "x-nf-client-connection-ip") || "unknown";
}

function getRequestInfo(event) {
  return {
    ip: getIpAddress(event),
    userAgent: getHeader(event.headers, "user-agent"),
    country: getHeader(event.headers, "x-country"),
    city: getHeader(event.headers, "x-nf-geo-city"),
    region: getHeader(event.headers, "x-nf-geo-subdivision"),
  };
}

async function firebaseRequest(path, init) {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return null;
  }

  const response = await fetch(`${databaseUrl}${path}.json`, init);

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function getVisitorStore() {
  const store = await firebaseRequest("/visitorStats", { method: "GET" });
  return store && typeof store === "object" ? store : {};
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

  await firebaseRequest("/visitorStats", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(nextStore),
  });

  return {
    visitors,
    activeViewers,
    plusCount,
  };
}

export async function handler(event) {
  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    if (event.httpMethod === "GET") {
      const now = Date.now();
      const store = await getVisitorStore();
      const activeViewers = getActiveSessionCount(store.sessions, now);

      return {
        statusCode: 200,
        headers: {
          "cache-control": "no-store",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          visitors: Number(store.total || 0),
          activeViewers,
          plusCount: Math.max(activeViewers - 3, 0),
        }),
      };
    }

    const payload = event.body ? JSON.parse(event.body) : {};
    const sessionId = sanitizeSessionId(payload.sessionId);

    if (!sessionId) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "Missing sessionId" }),
      };
    }

    const stats = await writeStats({
      sessionId,
      client: payload.client,
      request: getRequestInfo(event),
    });

    return {
      statusCode: 200,
      headers: {
        "cache-control": "no-store",
        "content-type": "application/json",
      },
      body: JSON.stringify(stats),
    };
  } catch {
    return {
      statusCode: 200,
      headers: {
        "cache-control": "no-store",
        "content-type": "application/json",
      },
      body: JSON.stringify(fallbackStats),
    };
  }
}
