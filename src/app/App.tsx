import { useCallback, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { ScrollToTop } from "../components/common/ScrollToTop";
import { Sidebar, type NavItem } from "../components/layout/Sidebar";
import { MenuIcon } from "../components/ui/Icons";
import { usePortfolioData } from "../hooks/usePortfolioData";
import { useTheme } from "../hooks/useTheme";
import { useVisitorStats } from "../hooks/useVisitorStats";
import { AboutPage } from "../pages/AboutPage";
import { CertificationsPage } from "../pages/CertificationsPage";
import { DashboardRoute } from "../pages/DashboardRoute";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { StackPage } from "../pages/StackPage";

const navItems: NavItem[] = [
  { label: "Projects", path: "/projects" },
  { label: "Stack", path: "/stack" },
  { label: "Certifications", path: "/certifications" },
  { label: "About", path: "/about" },
];

export default function App() {
  return (
    <BrowserRouter>
      <PortfolioApp />
    </BrowserRouter>
  );
}

function PortfolioApp() {
  const location = useLocation();
  const { themePreference, setThemePreference } = useTheme();
  const visitorStats = useVisitorStats();
  const { portfolio, isLoading: isPortfolioLoading } = usePortfolioData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const isAdminRoute =
    location.pathname === "/rdp-login" ||
    location.pathname === "/dashboard-login" ||
    location.pathname.startsWith("/rdp-admin");

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 transition-colors duration-200 dark:bg-neutral-950 dark:text-neutral-100">
      <ScrollToTop />
      {!isAdminRoute && portfolio ? (
        <button
          className="fixed left-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 bg-white/90 text-neutral-800 shadow-sm backdrop-blur transition hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-950 dark:border-neutral-800 dark:bg-neutral-950/90 dark:text-neutral-100 dark:hover:bg-neutral-900 dark:focus-visible:outline-white lg:hidden"
          type="button"
          aria-label="Open navigation"
          onClick={() => setSidebarOpen(true)}
        >
          <MenuIcon />
        </button>
      ) : null}

      {!isAdminRoute && portfolio ? (
        <Sidebar
          navItems={navItems}
          profile={portfolio.profile}
          isOpen={sidebarOpen}
          selectedTheme={themePreference}
          activeViewers={visitorStats.activeViewers}
          plusCount={visitorStats.plusCount}
          onClose={closeSidebar}
          onSelectTheme={setThemePreference}
        />
      ) : null}

      <main className={isAdminRoute ? "" : "lg:ml-72"}>
        <Routes>
          <Route
            path="/"
            element={
              portfolio ? <HomePage portfolio={portfolio} /> : <PortfolioDataState isLoading={isPortfolioLoading} />
            }
          />
          <Route path="/projects" element={portfolio ? <ProjectsPage portfolio={portfolio} /> : <PortfolioDataState isLoading={isPortfolioLoading} />} />
          <Route path="/stack" element={portfolio ? <StackPage portfolio={portfolio} /> : <PortfolioDataState isLoading={isPortfolioLoading} />} />
          <Route path="/certifications" element={portfolio ? <CertificationsPage portfolio={portfolio} /> : <PortfolioDataState isLoading={isPortfolioLoading} />} />
          <Route path="/about" element={portfolio ? <AboutPage portfolio={portfolio} /> : <PortfolioDataState isLoading={isPortfolioLoading} />} />
          <Route path="/rdp-login" element={<DashboardRoute selectedTheme={themePreference} onSelectTheme={setThemePreference} />} />
          <Route path="/rdp-admin" element={<DashboardRoute selectedTheme={themePreference} onSelectTheme={setThemePreference} />} />
          <Route path="/rdp-admin/:view" element={<DashboardRoute selectedTheme={themePreference} onSelectTheme={setThemePreference} />} />
          <Route path="/rdp-admin/:view/:section" element={<DashboardRoute selectedTheme={themePreference} onSelectTheme={setThemePreference} />} />
          <Route path="/dashboard-login" element={<DashboardRoute selectedTheme={themePreference} onSelectTheme={setThemePreference} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

function PortfolioDataState({ isLoading }: { isLoading: boolean }) {
  return (
    <section className="flex min-h-screen items-center justify-center px-6 text-center" aria-live="polite">
      <p className="font-mono text-sm font-semibold uppercase text-neutral-500 dark:text-neutral-400">
        {isLoading ? "Loading..." : "No Data Found"}
      </p>
    </section>
  );
}
