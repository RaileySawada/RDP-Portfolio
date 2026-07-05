type AdminLoginResult =
  | {
      ok: true;
      session: {
        id: string;
        token: string;
        expiresAt: number;
      };
    }
  | {
      ok: false;
      error: string;
      remainingAttempts?: number;
      lockedUntil?: number;
    };

export const adminSessionKey = "rdp-admin-session";
export type AdminSession = {
  id: string;
  token: string;
  expiresAt: number;
};

export async function loginAdmin(email: string, password: string): Promise<AdminLoginResult> {
  try {
    const response = await fetch("/.netlify/functions/admin-login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json()) as AdminLoginResult;

    if (!response.ok && data && !data.ok) {
      return data;
    }

    return data;
  } catch {
    if (import.meta.env.DEV) {
      return loginAdminInDevelopment(email, password);
    }

    return {
      ok: false,
      error: "Login service is unavailable.",
    };
  }
}

export function getStoredAdminSession(): AdminSession | null {
  try {
    const storedSession = localStorage.getItem(adminSessionKey);

    if (!storedSession) {
      return null;
    }

    const session = JSON.parse(storedSession) as AdminSession;

    if (!session.id || !session.token || session.expiresAt <= Date.now()) {
      localStorage.removeItem(adminSessionKey);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(adminSessionKey);
    return null;
  }
}

export function storeAdminSession(session: AdminSession) {
  localStorage.setItem(adminSessionKey, JSON.stringify(session));
}

export function clearAdminSession() {
  localStorage.removeItem(adminSessionKey);
}

function getDatabaseUrl() {
  return import.meta.env.VITE_FIREBASE_DATABASE_URL?.replace(/\/$/, "") || "";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function bytesToBase64Url(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256(value: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyPbkdf2(password: string, storedHash: string) {
  const [algorithm, iterationsValue, salt, hash] = storedHash.split("$");
  const iterations = Number(iterationsValue);

  if (algorithm !== "pbkdf2_sha256" || !Number.isFinite(iterations) || !salt || !hash) {
    return false;
  }

  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: new TextEncoder().encode(salt),
      iterations,
    },
    keyMaterial,
    256,
  );

  return bytesToBase64Url(new Uint8Array(derivedBits)) === hash;
}

async function firebaseGet<T>(path: string): Promise<T | null> {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return null;
  }

  const response = await fetch(`${databaseUrl}${path}.json`);
  return response.ok ? ((await response.json()) as T) : null;
}

async function firebasePut(path: string, value: unknown) {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return;
  }

  await fetch(`${databaseUrl}${path}.json`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(value),
  });
}

async function loginAdminInDevelopment(email: string, password: string): Promise<AdminLoginResult> {
  const maxAttempts = 5;
  const lockMs = 15 * 60 * 1000;
  const now = Date.now();
  const normalizedEmail = normalizeEmail(email);
  const attemptKey = await sha256(`${normalizedEmail}:local-dev`);
  const [credentials, attempts] = await Promise.all([
    firebaseGet<{ email?: string; passwordHash?: string }>("/adminAuth/credentials"),
    firebaseGet<{ failures?: number; lockedUntil?: number }>("/adminAuth/loginAttempts/" + attemptKey),
  ]);
  const lockedUntil = Number(attempts?.lockedUntil || 0);

  if (lockedUntil > now) {
    return {
      ok: false,
      error: "Too many attempts. Try again later.",
      remainingAttempts: 0,
      lockedUntil,
    };
  }

  const isValid =
    normalizeEmail(credentials?.email || "") === normalizedEmail &&
    Boolean(credentials?.passwordHash) &&
    (await verifyPbkdf2(password, credentials?.passwordHash || ""));

  if (!isValid) {
    const failures = Number(attempts?.failures || 0) + 1;
    const nextLockedUntil = failures >= maxAttempts ? now + lockMs : 0;

    await firebasePut("/adminAuth/loginAttempts/" + attemptKey, {
      email: normalizedEmail,
      failures,
      windowStartedAt: now,
      lastAttemptAt: now,
      lockedUntil: nextLockedUntil,
      request: { ip: "local-dev" },
    });

    return {
      ok: false,
      error: nextLockedUntil ? "Too many attempts. Try again later." : "Invalid email or password.",
      remainingAttempts: Math.max(maxAttempts - failures, 0),
      lockedUntil: nextLockedUntil,
    };
  }

  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const session = {
    id: crypto.randomUUID(),
    token: bytesToBase64Url(tokenBytes),
    expiresAt: now + 8 * 60 * 60 * 1000,
  };

  await Promise.all([
    firebasePut("/adminAuth/sessions/" + session.id, {
      email: normalizedEmail,
      tokenHash: await sha256(session.token),
      createdAt: now,
      expiresAt: session.expiresAt,
      request: { ip: "local-dev" },
    }),
    firebasePut("/adminAuth/loginAttempts/" + attemptKey, {
      email: normalizedEmail,
      failures: 0,
      windowStartedAt: now,
      lastAttemptAt: now,
      lastSuccessAt: now,
      lockedUntil: 0,
      request: { ip: "local-dev" },
    }),
  ]);

  return { ok: true, session };
}
