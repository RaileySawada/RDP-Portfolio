import { enforceRateLimit, firebaseRequest, hashValue, jsonResponse, sanitizePortfolioData } from "./_security.js";

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
    const rateLimit = await enforceRateLimit(event, {
      namespace: "admin-portfolio",
      max: 30,
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

    if (!hasPortfolioShape(payload.portfolio)) {
      return jsonResponse(400, { error: "Invalid portfolio payload." });
    }

    const sanitizedPortfolio = sanitizePortfolioData(payload.portfolio);

    await firebaseRequest("/portfolio", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(sanitizedPortfolio),
    });

    return jsonResponse(200, { ok: true });
  } catch {
    return jsonResponse(500, { error: "Portfolio service is unavailable." });
  }
}
