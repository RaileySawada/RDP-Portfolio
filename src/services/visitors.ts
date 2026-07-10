export type VisitorStats = {
  visitors: number;
  activeViewers: number;
  plusCount: number;
};

type NetworkInformation = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};

type VisitorClientInfo = {
  browser: string;
  language: string;
  platform: string;
  screen: string;
  timezone: string;
  network: {
    effectiveType: string;
    downlink: number | null;
    rtt: number | null;
    saveData: boolean;
  };
};

const fallbackStats: VisitorStats = {
  visitors: 0,
  activeViewers: 1,
  plusCount: 0,
};

const sessionKey = "portfolio-visitor-session";

function getSessionId() {
  const existingSession = window.sessionStorage.getItem(sessionKey);

  if (existingSession) {
    return existingSession;
  }

  const nextSession = crypto.randomUUID();
  window.sessionStorage.setItem(sessionKey, nextSession);
  return nextSession;
}

function getBrowserName(userAgent: string) {
  if (userAgent.includes("Edg/")) {
    return "Microsoft Edge";
  }
  if (userAgent.includes("Chrome/") && !userAgent.includes("Chromium")) {
    return "Chrome";
  }
  if (userAgent.includes("Firefox/")) {
    return "Firefox";
  }
  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    return "Safari";
  }
  return "Unknown";
}

function getClientInfo(): VisitorClientInfo {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;

  return {
    browser: getBrowserName(navigator.userAgent),
    language: navigator.language,
    platform: navigator.platform,
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    network: {
      effectiveType: connection?.effectiveType || "unknown",
      downlink: typeof connection?.downlink === "number" ? connection.downlink : null,
      rtt: typeof connection?.rtt === "number" ? connection.rtt : null,
      saveData: Boolean(connection?.saveData),
    },
  };
}

export async function recordVisit(kind: "visit" | "heartbeat" = "visit"): Promise<VisitorStats> {
  try {
    const response = await fetch("/.netlify/functions/visitors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind,
        sessionId: getSessionId(),
        client: getClientInfo(),
      }),
    });

    if (!response.ok) {
      return fallbackStats;
    }

    return (await response.json()) as VisitorStats;
  } catch {
    return fallbackStats;
  }
}

export { fallbackStats };
