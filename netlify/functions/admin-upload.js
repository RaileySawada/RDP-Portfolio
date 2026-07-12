import crypto from "node:crypto";
import { enforceRateLimit, firebaseRequest, hashValue, jsonResponse, parseJsonBody } from "./_security.js";

function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  };
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

function signUpload(folder, timestamp, apiSecret) {
  return crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest("hex");
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const rateLimit = await enforceRateLimit(event, {
      namespace: "admin-upload",
      max: 20,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    const parsedBody = parseJsonBody(event, 11_200_000);

    if (!parsedBody.ok) {
      return jsonResponse(400, { error: parsedBody.error });
    }

    const payload = parsedBody.value;
    const isSessionValid = await validateSession(payload);

    if (!isSessionValid) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    const file = String(payload.file || "");
    const isResume = payload.fileType === "resume";
    const folder = String(payload.folder || "portfolio/admin").replace(/[^a-zA-Z0-9_/-]/g, "").slice(0, 120) || "portfolio/admin";
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

    const validFile = isResume
      ? /^data:application\/pdf;base64,/i.test(file) && file.length <= 11_100_000
      : /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(file) && file.length <= 5_650_000;

    if (!validFile) {
      return jsonResponse(400, { error: isResume ? "Upload a PDF resume under 8MB." : "Upload a PNG, JPEG, WebP, or GIF image under 4MB." });
    }

    if (!cloudName || !apiKey || !apiSecret) {
      return jsonResponse(500, { error: "Cloudinary is not configured." });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("timestamp", String(timestamp));
    formData.append("api_key", apiKey);
    formData.append("signature", signUpload(folder, timestamp, apiSecret));

    const resourceType = isResume ? "raw" : "image";
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: "POST",
      body: formData,
    });
    const responseText = await response.text();
    let data;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      return jsonResponse(502, { error: "Cloudinary returned an invalid response." });
    }

    if (!response.ok) {
      return jsonResponse(response.status, { error: data?.error?.message || "Cloudinary upload failed." });
    }

    return jsonResponse(200, {
      ok: true,
      url: data.secure_url,
      publicId: data.public_id,
    });
  } catch {
    return jsonResponse(500, { error: "Upload service is unavailable." });
  }
}
