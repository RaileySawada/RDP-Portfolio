import { useNavigate, useParams } from "react-router";
import { profile } from "../../data/portfolio";
import type { ThemePreference } from "../../hooks/useTheme";
import type { AdminProfile } from "../../services/adminAnalytics";
import { BarChartIcon, EditIcon, ExternalLinkIcon, LogOutIcon } from "../ui/Icons";
import { ThemeToggle } from "../layout/ThemeToggle";

type AdminView = "analytics" | "content" | "account";
type ContentSection = "home" | "links" | "projects" | "certifications" | "stack" | "skills";

type AdminSidebarProps = {
  activeView: AdminView;
  adminProfile: AdminProfile;
  selectedTheme: ThemePreference;
  onSelectTheme: (theme: ThemePreference, originElement: HTMLElement) => void;
  onSelectView: (view: AdminView) => void;
  onLogout: () => void;
};

const adminNav = [
  { label: "Analytics", view: "analytics" as const, icon: BarChartIcon },
  { label: "Content", view: "content" as const, icon: EditIcon },
];

const contentNav: { label: string; section: ContentSection }[] = [
  { label: "Home", section: "home" },
  { label: "Links", section: "links" },
  { label: "Projects", section: "projects" },
  { label: "Certifications", section: "certifications" },
  { label: "Stack", section: "stack" },
  { label: "Skills", section: "skills" },
];

export function AdminSidebar({ activeView, adminProfile, selectedTheme, onSelectTheme, onSelectView, onLogout }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { section } = useParams();

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
            <div className="admin-sidebar-nav-group" key={item.view}>
              <button
                className={item.view === activeView ? "is-active" : ""}
                type="button"
                onClick={() => onSelectView(item.view)}
              >
                <ItemIcon />
                <span>{item.label}</span>
              </button>
              {item.view === "content" && activeView === "content" ? (
                <div className="admin-sidebar-subnav">
                  {contentNav.map((contentItem) => (
                    <button
                      className={contentItem.section === section ? "is-active" : ""}
                      type="button"
                      key={contentItem.section}
                      onClick={() => navigate(`/rdp-admin/content/${contentItem.section}`)}
                    >
                      <span>{contentItem.label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="admin-sidebar-foot">
        <ThemeToggle selectedTheme={selectedTheme} onSelectTheme={onSelectTheme} />
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
              <strong>{adminProfile.name}</strong>
              <small>{adminProfile.role}</small>
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
