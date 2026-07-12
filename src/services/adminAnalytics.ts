import { type AdminSession } from "./adminAuth";

export type ViewerPoint = {
  label: string;
  viewers: number;
  returning: number;
};

export type ViewerSlice = {
  label: string;
  value: number;
};

export type AdminActivityEvent = {
  actor: string;
  event: string;
  target: string;
  ipAddress: string;
  userAgent: string;
  time: number;
};

export type AdminVisitorDevice = {
  id: string;
  browser: string;
  platform: string;
  screen: string;
  language: string;
  timezone: string;
  network: string;
  location: string;
  ipAddress: string;
  firstSeen: number;
  lastSeen: number;
  isActive: boolean;
};

export type AdminProfile = {
  name: string;
  email: string;
  role: string;
};

export type AdminAnalytics = {
  adminProfile: AdminProfile;
  totalViewers: number;
  activeViewers: number;
  todayViewers: number;
  averageDailyViewers: number;
  viewerSeries: ViewerPoint[];
  browserSlices: ViewerSlice[];
  networkSlices: ViewerSlice[];
  activityEvents: AdminActivityEvent[];
  visitorDevices: AdminVisitorDevice[];
  lastUpdatedAt: number;
};

export const fallbackAnalytics: AdminAnalytics = {
  adminProfile: {
    name: "Admin",
    email: "",
    role: "Admin",
  },
  totalViewers: 0,
  activeViewers: 0,
  todayViewers: 0,
  averageDailyViewers: 0,
  viewerSeries: [],
  browserSlices: [],
  networkSlices: [],
  activityEvents: [],
  visitorDevices: [],
  lastUpdatedAt: 0,
};

export async function fetchAdminAnalytics(session: AdminSession): Promise<AdminAnalytics> {
  try {
    const response = await fetch("/.netlify/functions/admin-analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(session),
    });

    if (response.ok) {
      const data = (await response.json()) as Partial<AdminAnalytics>;

      return {
        ...fallbackAnalytics,
        ...data,
        viewerSeries: Array.isArray(data.viewerSeries) ? data.viewerSeries : [],
        browserSlices: Array.isArray(data.browserSlices) ? data.browserSlices : [],
        networkSlices: Array.isArray(data.networkSlices) ? data.networkSlices : [],
        activityEvents: Array.isArray(data.activityEvents) ? data.activityEvents : [],
        visitorDevices: Array.isArray(data.visitorDevices) ? data.visitorDevices : [],
      };
    }
  } catch {
    return fallbackAnalytics;
  }

  return fallbackAnalytics;
}

export function subscribeAdminAnalytics(session: AdminSession, onChange: (analytics: AdminAnalytics) => void) {
  let isActive = true;
  let hasDeliveredLiveData = false;

  const refresh = () => {
    void fetchAdminAnalytics(session).then((analytics) => {
      const isLiveData = analytics.lastUpdatedAt > 0;
      if (!isActive || (!isLiveData && hasDeliveredLiveData)) return;
      hasDeliveredLiveData = isLiveData;
      onChange(analytics);
    });
  };
  const refreshWhenVisible = () => {
    if (document.visibilityState === "visible") refresh();
  };

  refresh();
  const intervalId = window.setInterval(refreshWhenVisible, 5_000);
  document.addEventListener("visibilitychange", refreshWhenVisible);

  return () => {
    isActive = false;
    window.clearInterval(intervalId);
    document.removeEventListener("visibilitychange", refreshWhenVisible);
  };
}
