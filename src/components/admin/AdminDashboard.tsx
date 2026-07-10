import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { Profile } from "../../data/portfolio";
import { useCountUp } from "../../hooks/useCountUp";
import type { ThemePreference } from "../../hooks/useTheme";
import { clearAdminSession, type AdminSession } from "../../services/adminAuth";
import { fetchAdminAnalytics, fallbackAnalytics, type AdminAnalytics } from "../../services/adminAnalytics";
import { MenuIcon } from "../ui/Icons";
import { DataState } from "../ui/DataState";
import { AdminActivityTable } from "./AdminActivityTable";
import { AdminContentEditor } from "./AdminContentEditor";
import { AdminVisitorDevices } from "./AdminVisitorDevices";
import { AdminSidebar, type AdminView } from "./AdminSidebar";
import { ViewerDonutChart } from "./ViewerDonutChart";
import { ViewerLineChart } from "./ViewerLineChart";

type AdminDashboardProps = {
  portfolioProfile: Profile | null;
  session: AdminSession;
  selectedTheme: ThemePreference;
  onSelectTheme: (theme: ThemePreference, originElement: HTMLElement) => void;
  onLogout: () => void;
};

function isAdminView(view: string | undefined): view is AdminView {
  return view === "analytics" || view === "devices" || view === "content" || view === "account";
}

export function AdminDashboard({ portfolioProfile, session, selectedTheme, onSelectTheme, onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const { view } = useParams();
  const [analytics, setAnalytics] = useState<AdminAnalytics>(fallbackAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeView: AdminView = isAdminView(view) ? view : "analytics";

  useEffect(() => {
    let isMounted = true;

    fetchAdminAnalytics(session)
      .then((nextAnalytics) => {
        if (isMounted) {
          setAnalytics(nextAnalytics);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    if (!isAdminView(view)) {
      navigate("/rdp-admin/analytics", { replace: true });
    }
  }, [navigate, view]);

  const handleSelectView = (nextView: AdminView) => {
    navigate(nextView === "content" ? "/rdp-admin/content/home" : `/rdp-admin/${nextView}`);
  };

  const handleLogout = () => {
    clearAdminSession();
    onLogout();
    navigate("/rdp-login", { replace: true });
  };

  return (
    <section className="admin-dashboard min-h-screen">
      <button
        className="admin-menu-button"
        type="button"
        aria-label="Open admin navigation"
        onClick={() => setSidebarOpen(true)}
      >
        <MenuIcon />
      </button>
      <AdminSidebar
        activeView={activeView}
        adminProfile={analytics.adminProfile}
        portfolioProfile={portfolioProfile}
        isOpen={sidebarOpen}
        selectedTheme={selectedTheme}
        onClose={() => setSidebarOpen(false)}
        onSelectTheme={onSelectTheme}
        onSelectView={handleSelectView}
        onLogout={handleLogout}
      />
      <div className="admin-dashboard-main">
        {activeView === "analytics" ? (
          <AdminAnalyticsView analytics={analytics} isLoading={isLoading} />
        ) : activeView === "devices" ? (
          <AdminVisitorDevices devices={analytics.visitorDevices} isLoading={isLoading} />
        ) : activeView === "content" ? (
          <AdminContentEditor session={session} />
        ) : (
          <AdminAccountView adminProfile={analytics.adminProfile} portfolioProfile={portfolioProfile} />
        )}
      </div>
    </section>
  );
}

function AdminAnalyticsView({ analytics, isLoading }: { analytics: AdminAnalytics; isLoading: boolean }) {
  const animatedTotalViewers = useCountUp(analytics.totalViewers, !isLoading);
  const animatedActiveViewers = useCountUp(analytics.activeViewers, !isLoading);
  const animatedTodayViewers = useCountUp(analytics.todayViewers, !isLoading);
  const animatedDailyAverage = useCountUp(analytics.averageDailyViewers, !isLoading);

  return (
    <div className="admin-analytics mx-auto max-w-6xl">
      <span className="admin-decor-dot admin-decor-dot-a" aria-hidden="true" />
      <span className="admin-decor-dot admin-decor-dot-b" aria-hidden="true" />
      <header className="admin-dashboard-header">
        <div>
          <p className="metadata text-neutral-500 dark:text-neutral-500">Viewers</p>
          <h1>Viewer Analytics</h1>
        </div>
        <span className={`admin-status-pill ${isLoading ? "" : "is-live"}`}>
          {isLoading ? <span className="admin-status-spinner" aria-hidden="true" /> : <i aria-hidden="true" />}
          {isLoading ? "Syncing" : "Live"}
        </span>
      </header>

      <div className="admin-overview-panel">
        <div className="admin-overview-main">
          <span className="admin-overview-mask" aria-hidden="true" />
          <p>Total viewers</p>
          <strong>{animatedTotalViewers.toLocaleString()}</strong>
          <span>{isLoading ? "Waiting for live data" : `Updated ${analytics.lastUpdatedAt ? new Date(analytics.lastUpdatedAt).toLocaleTimeString() : "just now"}`}</span>
        </div>
        <div className="admin-metrics">
          <AdminMetric label="Active now" value={animatedActiveViewers} />
          <AdminMetric label="Today" value={animatedTodayViewers} />
          <AdminMetric label="Daily avg" value={animatedDailyAverage} />
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <article className="admin-chart-panel admin-chart-panel-wide">
          <div className="admin-panel-heading">
            <div>
              <p className="metadata text-neutral-500 dark:text-neutral-500">Last 14 Days</p>
              <h2>Viewer Graph</h2>
            </div>
            <span>New vs cumulative</span>
          </div>
          {isLoading ? (
            <DataState type="loading" label="Loading viewer activity" />
          ) : (
            <>
              <ViewerLineChart data={analytics.viewerSeries} totalViewers={analytics.totalViewers} />
              <AdminActivityTable events={analytics.activityEvents} />
            </>
          )}
        </article>

        <article className="admin-chart-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="metadata text-neutral-500 dark:text-neutral-500">Viewers</p>
              <h2>Browser Share</h2>
            </div>
          </div>
          {isLoading ? <DataState type="loading" label="Loading browser data" /> : <ViewerDonutChart slices={analytics.browserSlices} />}
        </article>

        <article className="admin-chart-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="metadata text-neutral-500 dark:text-neutral-500">Network</p>
              <h2>Connection Types</h2>
            </div>
          </div>
          {isLoading ? <DataState type="loading" label="Loading network data" /> : <ViewerDonutChart slices={analytics.networkSlices} />}
        </article>
      </div>
    </div>
  );
}

function AdminAccountView({ adminProfile, portfolioProfile }: { adminProfile: AdminAnalytics["adminProfile"]; portfolioProfile: Profile | null }) {
  const initials = portfolioProfile?.initials || adminProfile.name.slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="admin-dashboard-header">
        <div>
          <p className="metadata text-neutral-500 dark:text-neutral-500">Account</p>
          <h1>{adminProfile.name}</h1>
        </div>
      </header>
      <div className="admin-account-panel">
        <span className="admin-decor-dot admin-decor-dot-c" aria-hidden="true" />
        <div className="admin-account-image">
          {portfolioProfile?.imageUrl ? (
            <img src={portfolioProfile.imageUrl} alt={portfolioProfile.name || adminProfile.name} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div>
          <p className="metadata text-neutral-500 dark:text-neutral-500">Signed in as</p>
          <h2>{adminProfile.name}</h2>
          <p>{adminProfile.email || portfolioProfile?.email}</p>
          <p>Role: {adminProfile.role}</p>
        </div>
      </div>
    </div>
  );
}

function AdminMetric({ label, value }: { label: string; value: number }) {
  return (
    <article className="admin-metric">
      <p>{label}</p>
      <strong>{value.toLocaleString()}</strong>
    </article>
  );
}
