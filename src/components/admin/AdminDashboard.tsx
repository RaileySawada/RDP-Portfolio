import { useEffect, useState } from "react";
import { profile } from "../../data/portfolio";
import { clearAdminSession, type AdminSession } from "../../services/adminAuth";
import { fetchAdminAnalytics, fallbackAnalytics, type AdminAnalytics } from "../../services/adminAnalytics";
import { AdminActivityTable } from "./AdminActivityTable";
import { AdminSidebar, type AdminView } from "./AdminSidebar";
import { ViewerDonutChart } from "./ViewerDonutChart";
import { ViewerLineChart } from "./ViewerLineChart";

type AdminDashboardProps = {
  session: AdminSession;
  onLogout: () => void;
};

export function AdminDashboard({ session, onLogout }: AdminDashboardProps) {
  const [analytics, setAnalytics] = useState<AdminAnalytics>(fallbackAnalytics);
  const [activeView, setActiveView] = useState<AdminView>("analytics");
  const [isLoading, setIsLoading] = useState(true);

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

  const handleLogout = () => {
    clearAdminSession();
    onLogout();
  };

  return (
    <section className="admin-dashboard min-h-screen">
      <AdminSidebar activeView={activeView} onSelectView={setActiveView} onLogout={handleLogout} />
      <div className="admin-dashboard-main">
        {activeView === "analytics" ? (
          <AdminAnalyticsView analytics={analytics} isLoading={isLoading} />
        ) : activeView === "content" ? (
          <AdminContentView />
        ) : (
          <AdminAccountView />
        )}
      </div>
    </section>
  );
}

function AdminAnalyticsView({ analytics, isLoading }: { analytics: AdminAnalytics; isLoading: boolean }) {
  return (
    <div className="admin-analytics mx-auto max-w-6xl">
      <header className="admin-dashboard-header">
        <div>
          <p className="metadata text-neutral-500 dark:text-neutral-500">Viewers</p>
          <h1>Viewer Analytics</h1>
        </div>
        <span>{isLoading ? "Syncing" : "Live"}</span>
      </header>

      <div className="admin-overview-panel">
        <div className="admin-overview-main">
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

function AdminContentView() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="admin-dashboard-header">
        <div>
          <p className="metadata text-neutral-500 dark:text-neutral-500">Portfolio</p>
          <h1>Content Editor</h1>
        </div>
      </header>
      <div className="admin-content-placeholder">
        <p className="metadata text-neutral-500 dark:text-neutral-500">Next</p>
        <h2>Edit portfolio pages</h2>
        <p>Use this area for profile, projects, stack, certifications, and about content editing.</p>
      </div>
    </div>
  );
}

function AdminAccountView() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="admin-dashboard-header">
        <div>
          <p className="metadata text-neutral-500 dark:text-neutral-500">Account</p>
          <h1>System Admin</h1>
        </div>
      </header>
      <div className="admin-account-panel">
        <div className="admin-account-image">
          {profile.imageUrl ? (
            <img src={profile.imageUrl} alt={profile.name} />
          ) : (
            <span>{profile.initials}</span>
          )}
        </div>
        <div>
          <p className="metadata text-neutral-500 dark:text-neutral-500">Signed in as</p>
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
          <p>Role: Admin</p>
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
