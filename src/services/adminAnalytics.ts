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
      return (await response.json()) as AdminAnalytics;
    }
  } catch {
    return fallbackAnalytics;
  }

  return fallbackAnalytics;
}
