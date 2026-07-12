import { firebaseRequest, jsonResponse } from "./_security.js";

const maximumResumeBytes = 4 * 1024 * 1024;

function getResumeUrl(portfolio) {
  const resumeLink = Array.isArray(portfolio?.profile?.socials)
    ? portfolio.profile.socials.find((social) => String(social?.label || "").toLowerCase() === "resume")
    : null;

  return String(resumeLink?.href || "");
}

function isAllowedCloudinaryUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && url.pathname.includes("/image/upload/");
  } catch {
    return false;
  }
}

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const portfolio = await firebaseRequest("/portfolio", { method: "GET" });
    const resumeUrl = getResumeUrl(portfolio);

    if (!isAllowedCloudinaryUrl(resumeUrl)) {
      return jsonResponse(404, { error: "Resume was not found." });
    }

    const response = await fetch(resumeUrl, { signal: AbortSignal.timeout(10_000) });

    if (!response.ok) {
      return jsonResponse(502, { error: "Resume could not be downloaded." });
    }

    const file = Buffer.from(await response.arrayBuffer());

    if (file.length === 0 || file.length > maximumResumeBytes) {
      return jsonResponse(502, { error: "Resume file is unavailable or too large." });
    }

    return {
      statusCode: 200,
      headers: {
        "cache-control": "no-store",
        "content-disposition": 'attachment; filename="RaileyDelaPena.pdf"',
        "content-length": String(file.length),
        "content-type": "application/pdf",
        "x-content-type-options": "nosniff",
      },
      body: file.toString("base64"),
      isBase64Encoded: true,
    };
  } catch {
    return jsonResponse(500, { error: "Resume download service is unavailable." });
  }
}
