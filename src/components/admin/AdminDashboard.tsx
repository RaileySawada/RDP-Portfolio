import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { profile } from "../../data/portfolio";
import type { ThemePreference } from "../../hooks/useTheme";
import { clearAdminSession, type AdminSession } from "../../services/adminAuth";
import { fetchAdminAnalytics, fallbackAnalytics, type AdminAnalytics } from "../../services/adminAnalytics";
import { MenuIcon } from "../ui/Icons";
import { AdminActivityTable } from "./AdminActivityTable";
import { AdminContentEditor } from "./AdminContentEditor";
import { AdminSidebar, type AdminView } from "./AdminSidebar";
import { ViewerDonutChart } from "./ViewerDonutChart";
import { ViewerLineChart } from "./ViewerLineChart";

type AdminDashboardProps = {
  session: AdminSession;
  selectedTheme: ThemePreference;
  onSelectTheme: (theme: ThemePreference, originElement: HTMLElement) => void;
  onLogout: () => void;
};

function isAdminView(view: string | undefined): view is AdminView {
  return view === "analytics" || view === "content" || view === "account";
}

export function AdminDashboard({ session, selectedTheme, onSelectTheme, onLogout }: AdminDashboardProps) {
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
        ) : activeView === "content" ? (
          <AdminContentEditor session={session} />
        ) : (
          <AdminAccountView adminProfile={analytics.adminProfile} />
        )}
      </div>
    </section>
  );
}

function AdminAnalyticsView({ analytics, isLoading }: { analytics: AdminAnalytics; isLoading: boolean }) {
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
          <i aria-hidden="true" />
          {isLoading ? "Syncing" : "Live"}
        </span>
      </header>

      <div className="admin-overview-panel">
        <div className="admin-overview-main">
          <span className="admin-overview-mask" aria-hidden="true" />
          <p>Total viewers</p>
          <strong>{analytics.totalViewers.toLocaleString()}</strong>
          <span>Updated {analytics.lastUpdatedAt ? new Date(analytics.lastUpdatedAt).toLocaleTimeString() : "just now"}</span>
        </div>
        <div className="admin-metrics">
          <AdminMetric label="Active now" value={analytics.activeViewers.toLocaleString()} />
          <AdminMetric label="Today" value={analytics.todayViewers.toLocaleString()} />
          <AdminMetric label="Daily avg" value={analytics.averageDailyViewers.toLocaleString()} />
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <article className="admin-chart-panel admin-chart-panel-wide">
          <div className="admin-panel-heading">
            <div>
              <p className="metadata text-neutral-500 dark:text-neutral-500">Last 14 Days</p>
              <h2>Viewer Graph</h2>
            </div>
            <span>New vs returning</span>
          </div>
          <ViewerLineChart data={analytics.viewerSeries} />
          <AdminActivityTable events={analytics.activityEvents} />
        </article>

        <article className="admin-chart-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="metadata text-neutral-500 dark:text-neutral-500">Viewers</p>
              <h2>Browser Share</h2>
            </div>
          </div>
          <ViewerDonutChart slices={analytics.browserSlices} />
        </article>

        <article className="admin-chart-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="metadata text-neutral-500 dark:text-neutral-500">Network</p>
              <h2>Connection Types</h2>
            </div>
          </div>
          <ViewerDonutChart slices={analytics.networkSlices} />
        </article>
      </div>
    </div>
  );
}

function AdminAccountView({ adminProfile }: { adminProfile: AdminAnalytics["adminProfile"] }) {
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
          {profile.imageUrl ? (
            <img src={profile.imageUrl} alt={profile.name} />
          ) : (
            <span>{profile.initials}</span>
          )}
        </div>
        <div>
          <p className="metadata text-neutral-500 dark:text-neutral-500">Signed in as</p>
          <h2>{adminProfile.name}</h2>
          <p>{adminProfile.email || profile.email}</p>
          <p>Role: {adminProfile.role}</p>
        </div>
      </div>
    </div>
  );
}

function AdminMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="admin-metric">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
