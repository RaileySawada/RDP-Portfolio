import { enforceRateLimit, firebaseRequest, jsonResponse, sanitizePortfolioData } from "./_security.js";

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const rateLimit = await enforceRateLimit(event, {
      namespace: "portfolio",
      max: 120,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    const portfolio = await firebaseRequest("/portfolio", { method: "GET" });

    if (!portfolio || typeof portfolio !== "object") {
      return jsonResponse(404, { error: "Portfolio data was not found." });
    }

    return jsonResponse(200, sanitizePortfolioData(portfolio));
  } catch {
    return jsonResponse(500, { error: "Portfolio service is unavailable." });
  }
}
