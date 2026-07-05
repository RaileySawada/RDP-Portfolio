import crypto from "node:crypto";

function getDatabaseUrl() {
  return (process.env.FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL || "").replace(/\/$/, "");
}

function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_NAME || process.env.VITE_CLOUDINARY_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARI_API || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_SECRET || "",
  };
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

function signUpload(folder, timestamp, apiSecret) {
  return crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest("hex");
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

    const file = String(payload.file || "");
    const folder = String(payload.folder || "portfolio/admin").replace(/[^a-zA-Z0-9_/-]/g, "");
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

    if (!file.startsWith("data:image/") || file.length > 12_000_000) {
      return jsonResponse(400, { error: "Upload a valid image under 9MB." });
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

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

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
