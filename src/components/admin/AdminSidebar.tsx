import { profile } from "../../data/portfolio";
import { BarChartIcon, EditIcon, ExternalLinkIcon, LogOutIcon } from "../ui/Icons";

type AdminView = "analytics" | "content" | "account";

type AdminSidebarProps = {
  activeView: AdminView;
  onSelectView: (view: AdminView) => void;
  onLogout: () => void;
};

const adminNav = [
  { label: "Analytics", view: "analytics" as const, icon: BarChartIcon },
  { label: "Content", view: "content" as const, icon: EditIcon },
];

export function AdminSidebar({ activeView, onSelectView, onLogout }: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <div>
        <p className="metadata text-neutral-500 dark:text-neutral-500">Railey</p>
        <h2>Admin</h2>
      </div>

      <nav className="admin-sidebar-nav">
        {adminNav.map((item) => {
          const ItemIcon = item.icon;
          return (
            <button
              className={item.view === activeView ? "is-active" : ""}
              type="button"
              key={item.view}
              onClick={() => onSelectView(item.view)}
            >
              <ItemIcon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="admin-sidebar-foot">
        <a href="/" className="admin-sidebar-link">
          <ExternalLinkIcon />
          <span>View site</span>
        </a>
        <div className={`admin-sidebar-profile ${activeView === "account" ? "is-active" : ""}`}>
          <button className="admin-sidebar-profile-main" type="button" onClick={() => onSelectView("account")}>
            {profile.imageUrl ? (
              <img src={profile.imageUrl} alt={profile.name} />
            ) : (
              <span>{profile.initials.slice(0, 2)}</span>
            )}
            <span>
              <strong>System Admin</strong>
              <small>Admin</small>
            </span>
          </button>
          <button className="admin-sidebar-logout-button" type="button" aria-label="Sign out" onClick={onLogout}>
            <LogOutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}

export type { AdminView };
