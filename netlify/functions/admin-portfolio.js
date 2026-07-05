import crypto from "node:crypto";

function getDatabaseUrl() {
  return (process.env.FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL || "").replace(/\/$/, "");
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function firebaseRequest(path, init) {
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

async function validateSession(payload) {
  const id = String(payload?.session?.id || "").replace(/[^a-zA-Z0-9_-]/g, "");
  const token = String(payload?.session?.token || "");

  if (!id || !token) {
    return false;
  }

  const session = await firebaseRequest(`/adminAuth/sessions/${id}`, { method: "GET" });

  if (!session || session.expiresAt <= Date.now()) {
    return false;
  }

  return session.tokenHash === hashValue(token);
}

function hasPortfolioShape(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      value.profile &&
      Array.isArray(value.projects) &&
      Array.isArray(value.stackGroups) &&
      Array.isArray(value.certifications) &&
      Array.isArray(value.timeline),
  );
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const isSessionValid = await validateSession(payload);

    if (!isSessionValid) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    if (!hasPortfolioShape(payload.portfolio)) {
      return jsonResponse(400, { error: "Invalid portfolio payload." });
    }

    await firebaseRequest("/portfolio", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload.portfolio),
    });

    return jsonResponse(200, { ok: true });
  } catch {
    return jsonResponse(500, { error: "Portfolio service is unavailable." });
  }
}
