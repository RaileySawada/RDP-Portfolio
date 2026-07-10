import crypto from "node:crypto";
import { enforceRateLimit, firebaseRequest, getHeader, getIpAddress, hashValue, jsonResponse } from "./_security.js";

const rateLimitWindowMs = 15 * 60 * 1000;
const lockMs = 15 * 60 * 1000;
const maxAttempts = 5;
const sessionTtlMs = 8 * 60 * 60 * 1000;

function getRequestInfo(event) {
  return {
    ip: getIpAddress(event),
    userAgent: getHeader(event.headers, "user-agent"),
    country: getHeader(event.headers, "x-country"),
    city: getHeader(event.headers, "x-nf-geo-city"),
    region: getHeader(event.headers, "x-nf-geo-subdivision"),
  };
}

function createToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidPayload(payload) {
  return typeof payload?.email === "string" && typeof payload?.password === "string";
}

function pbkdf2(password, salt, iterations) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, 32, "sha256", (error, key) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(key);
    });
  });
}

async function verifyPassword(password, storedHash) {
  const [algorithm, iterationsValue, salt, hash] = String(storedHash || "").split("$");
  const iterations = Number(iterationsValue);

  if (algorithm !== "pbkdf2_sha256" || !Number.isFinite(iterations) || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "base64url");
  const actual = await pbkdf2(password, salt, iterations);

  if (expected.length !== actual.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, actual);
}

function getAttemptState(attempts, now) {
  if (!attempts || typeof attempts !== "object") {
    return { failures: 0, windowStartedAt: now, lockedUntil: 0 };
  }

  const windowStartedAt = Number(attempts.windowStartedAt || 0);

  if (!windowStartedAt || now - windowStartedAt > rateLimitWindowMs) {
    return { failures: 0, windowStartedAt: now, lockedUntil: Number(attempts.lockedUntil || 0) };
  }

  return {
    failures: Number(attempts.failures || 0),
    windowStartedAt,
    lockedUntil: Number(attempts.lockedUntil || 0),
  };
}

async function writeAttempt(attemptKey, data) {
  await firebaseRequest(`/adminAuth/loginAttempts/${attemptKey}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function writeAuditEvent({ actor, event, target, request, time }) {
  const id = createToken();

  await firebaseRequest(`/adminAuth/auditEvents/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      actor,
      event,
      target,
      ipAddress: request.ip,
      userAgent: request.userAgent,
      time,
    }),
  });
}

async function writeSession({ email, request, now }) {
  const id = createToken();
  const token = createToken();
  const expiresAt = now + sessionTtlMs;

  await firebaseRequest(`/adminAuth/sessions/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email,
      tokenHash: hashValue(token),
      createdAt: now,
      expiresAt,
      request,
    }),
  });

  return { id, token, expiresAt };
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed" });
  }

  try {
    const rateLimit = await enforceRateLimit(event, {
      namespace: "admin-login",
      max: 15,
      windowMs: rateLimitWindowMs,
    });

    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    const payload = event.body ? JSON.parse(event.body) : {};

    if (!isValidPayload(payload)) {
      return jsonResponse(400, { ok: false, error: "Email and password are required." });
    }

    const email = normalizeEmail(payload.email);
    const request = getRequestInfo(event);
    const attemptKey = hashValue(`${email}:${request.ip}`);
    const now = Date.now();
    const [credentials, previousAttempts] = await Promise.all([
      firebaseRequest("/adminAuth/credentials", { method: "GET" }),
      firebaseRequest(`/adminAuth/loginAttempts/${attemptKey}`, { method: "GET" }),
    ]);
    const attemptState = getAttemptState(previousAttempts, now);

    if (attemptState.lockedUntil > now) {
      await writeAuditEvent({
        actor: email || "unknown",
        event: "admin.login.rate_limited",
        target: "adminAuth/loginAttempts",
        request,
        time: now,
      });

      return jsonResponse(429, {
        ok: false,
        error: "Too many attempts. Try again later.",
        lockedUntil: attemptState.lockedUntil,
      });
    }

    const isKnownEmail = normalizeEmail(credentials?.email) === email;
    const isPasswordValid = isKnownEmail && (await verifyPassword(payload.password, credentials?.passwordHash));

    if (!isPasswordValid) {
      const failures = attemptState.failures + 1;
      const lockedUntil = failures >= maxAttempts ? now + lockMs : 0;

      await writeAttempt(attemptKey, {
        email,
        failures,
        windowStartedAt: attemptState.windowStartedAt,
        lastAttemptAt: now,
        lockedUntil,
        request,
      });
      await writeAuditEvent({
        actor: email || "unknown",
        event: lockedUntil ? "admin.login.locked" : "admin.login.failed",
        target: "adminAuth/credentials",
        request,
        time: now,
      });

      return jsonResponse(lockedUntil ? 429 : 401, {
        ok: false,
        error: lockedUntil ? "Too many attempts. Try again later." : "Invalid email or password.",
        remainingAttempts: Math.max(maxAttempts - failures, 0),
        lockedUntil,
      });
    }

    const session = await writeSession({ email, request, now });
    await writeAuditEvent({
      actor: email,
      event: "admin.login.success",
      target: "adminAuth/sessions",
      request,
      time: now,
    });

    await writeAttempt(attemptKey, {
      email,
      failures: 0,
      windowStartedAt: now,
      lastAttemptAt: now,
      lastSuccessAt: now,
      lockedUntil: 0,
      request,
    });

    return jsonResponse(200, { ok: true, session });
  } catch {
    return jsonResponse(500, {
      ok: false,
      error: "Login service is unavailable.",
    });
  }
}
