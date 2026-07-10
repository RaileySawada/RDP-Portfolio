import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { Profile } from "../../data/portfolio";
import type { ThemePreference } from "../../hooks/useTheme";
import type { AdminProfile } from "../../services/adminAnalytics";
import { BarChartIcon, CloseIcon, EditIcon, ExternalLinkIcon, LogOutIcon, MonitorIcon } from "../ui/Icons";
import { ThemeToggle } from "../layout/ThemeToggle";

type AdminView = "analytics" | "devices" | "content" | "account";
type ContentSection = "home" | "links" | "projects" | "certifications" | "stack" | "skills";

type AdminSidebarProps = {
  activeView: AdminView;
  adminProfile: AdminProfile;
  portfolioProfile: Profile | null;
  isOpen: boolean;
  selectedTheme: ThemePreference;
  onClose: () => void;
  onSelectTheme: (theme: ThemePreference, originElement: HTMLElement) => void;
  onSelectView: (view: AdminView) => void;
  onLogout: () => void;
};

const contentNav: { label: string; section: ContentSection }[] = [
  { label: "Home", section: "home" },
  { label: "Links", section: "links" },
  { label: "Projects", section: "projects" },
  { label: "Certifications", section: "certifications" },
  { label: "Stack", section: "stack" },
  { label: "Skills", section: "skills" },
];

export function AdminSidebar({ activeView, adminProfile, portfolioProfile, isOpen, selectedTheme, onClose, onSelectTheme, onSelectView, onLogout }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { section } = useParams();
  const [contentOpen, setContentOpen] = useState(activeView === "content");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (activeView === "content") {
      setContentOpen(true);
    }
  }, [activeView]);

  const selectView = (nextView: Exclude<AdminView, "content">) => {
    onSelectView(nextView);
    onClose();
  };

  const selectContentSection = (nextSection: ContentSection) => {
    navigate(`/rdp-admin/content/${nextSection}`);
    onClose();
  };

  return (
    <>
      <button
        className={`admin-sidebar-scrim ${isOpen ? "is-open" : ""}`}
        type="button"
        aria-label="Close admin navigation"
        onClick={onClose}
      />

      <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`} aria-label="Admin navigation">
        <div className="admin-sidebar-head">
          <div>
            <p className="metadata text-neutral-500 dark:text-neutral-500">Railey</p>
            <h2>Admin</h2>
          </div>
          <button className="admin-sidebar-close" type="button" aria-label="Close menu" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-nav-group">
            <button className={activeView === "analytics" ? "is-active" : ""} type="button" onClick={() => selectView("analytics")}>
              <BarChartIcon />
              <span>Analytics</span>
            </button>
            <button className={activeView === "devices" ? "is-active" : ""} type="button" onClick={() => selectView("devices")}>
              <MonitorIcon />
              <span>Visitor devices</span>
            </button>
          </div>

          <div className="admin-sidebar-nav-group">
            <button
              className={`admin-sidebar-accordion-trigger ${activeView === "content" || contentOpen ? "is-active" : ""}`}
              type="button"
              aria-expanded={contentOpen}
              aria-controls="admin-content-navigation"
              onClick={() => setContentOpen((current) => !current)}
            >
              <EditIcon />
              <span>Content</span>
              <AdminAccordionChevron isOpen={contentOpen} />
            </button>
            <div className={`admin-sidebar-subnav ${contentOpen ? "is-open" : ""}`} id="admin-content-navigation">
              {contentNav.map((contentItem) => (
                <button
                  className={activeView === "content" && contentItem.section === section ? "is-active" : ""}
                  type="button"
                  key={contentItem.section}
                  onClick={() => selectContentSection(contentItem.section)}
                >
                  <span>{contentItem.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="admin-sidebar-foot">
          <ThemeToggle selectedTheme={selectedTheme} onSelectTheme={onSelectTheme} />
          <a href="/" className="admin-sidebar-link" onClick={onClose}>
            <ExternalLinkIcon />
            <span>View site</span>
          </a>
          <div className={`admin-sidebar-profile ${activeView === "account" ? "is-active" : ""}`}>
            <button className="admin-sidebar-profile-main" type="button" onClick={() => selectView("account")}>
              {portfolioProfile?.imageUrl ? (
                <img src={portfolioProfile.imageUrl} alt={portfolioProfile.name || adminProfile.name} />
              ) : (
                <span>{portfolioProfile?.initials.slice(0, 2) || adminProfile.name.slice(0, 2).toUpperCase()}</span>
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
    </>
  );
}

function AdminAccordionChevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg className={`admin-sidebar-accordion-icon ${isOpen ? "is-open" : ""}`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type { AdminView };
