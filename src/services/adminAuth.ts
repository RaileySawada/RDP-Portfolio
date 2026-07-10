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
