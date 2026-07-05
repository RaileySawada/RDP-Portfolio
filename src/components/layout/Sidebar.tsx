import { useEffect } from "react";
import { Link, NavLink } from "react-router";
import type { Profile } from "../../data/portfolio";
import type { ThemePreference } from "../../hooks/useTheme";
import {
  CloseIcon,
  GridIcon,
  LayersIcon,
  MailIcon,
  SealIcon,
  UserIcon,
} from "../ui/Icons";
import { ThemeToggle } from "./ThemeToggle";

export type NavItem = {
  label: string;
  path: string;
};

const navIcons: Record<
  string,
  (props: { className?: string }) => React.JSX.Element
> = {
  "/projects": GridIcon,
  "/stack": LayersIcon,
  "/certifications": SealIcon,
  "/about": UserIcon,
};

type SidebarProps = {
  navItems: NavItem[];
  profile: Profile;
  isOpen: boolean;
  selectedTheme: ThemePreference;
  activeViewers: number;
  plusCount: number;
  onClose: () => void;
  onSelectTheme: (theme: ThemePreference, originElement: HTMLElement) => void;
};

export function Sidebar({
  navItems,
  profile,
  isOpen,
  selectedTheme,
  activeViewers,
  plusCount,
  onClose,
  onSelectTheme,
}: SidebarProps) {
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

  return (
    <>
      <button
        className={`fixed inset-0 z-30 bg-neutral-950/45 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-4/5 max-w-80 flex-col border-r border-neutral-200 bg-white/95 px-5 py-5 shadow-2xl shadow-neutral-950/10 backdrop-blur-xl transition-transform duration-300 dark:border-neutral-800 dark:bg-neutral-950/95 lg:w-72 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Primary navigation"
      >
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
            to="/"
            onClick={onClose}
          >
            <span className="block max-w-40 font-display text-base font-bold leading-tight text-neutral-950 dark:text-white pl-2 pt-2">
              {profile.name}
            </span>
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-950 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900 dark:focus-visible:outline-white lg:hidden"
            type="button"
            aria-label="Close menu"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <p className="metadata mt-10 mb-3 px-3 text-neutral-400 dark:text-neutral-600">
          Navigate
        </p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const ItemIcon = navIcons[item.path];
            return (
              <NavLink
                className={({ isActive }) =>
                  `nav-link flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white ${
                    isActive
                      ? "bg-neutral-100 text-neutral-950 dark:bg-neutral-900 dark:text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white"
                  }`
                }
                to={item.path}
                key={item.path}
                onClick={onClose}
              >
                {ItemIcon ? <ItemIcon className="h-4 w-4 shrink-0" /> : null}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <ViewerCount activeViewers={activeViewers} plusCount={plusCount} />
          <ThemeToggle
            selectedTheme={selectedTheme}
            onSelectTheme={onSelectTheme}
          />
          <div className="mt-6">
            <p className="max-w-48 text-sm leading-6 text-neutral-500 dark:text-neutral-500">
              Open to web projects.
            </p>
            <a
              className="mt-3 inline-flex max-w-full items-center gap-2 truncate font-mono text-sm text-neutral-950 transition hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300"
              href={`mailto:${profile.email}`}
            >
              <MailIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{profile.email}</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

function ViewerCount({
  activeViewers,
  plusCount,
}: {
  activeViewers: number;
  plusCount: number;
}) {
  const visibleViewers = ["viewer-one", "viewer-two", "viewer-three"].slice(
    0,
    Math.min(Math.max(activeViewers, 1), 3),
  );
  const viewerStyles = [
    "bg-white text-neutral-950 dark:bg-neutral-800 dark:text-white",
    "bg-neutral-100 text-neutral-950 dark:bg-neutral-900 dark:text-white",
    "bg-neutral-200 text-neutral-950 dark:bg-neutral-800 dark:text-white",
  ];

  return (
    <div>
      <div className="flex items-center">
        {visibleViewers.map((viewer, index) => (
          <span
            className={`viewer-avatar ${index > 0 ? "-ml-2" : ""} ${viewerStyles[index]}`}
            key={viewer}
          >
            <ViewerAvatar variant={index} />
          </span>
        ))}
        {plusCount > 0 ? (
          <span className="viewer-plus -ml-1">+{plusCount}</span>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-neutral-400">
        <span className="font-mono text-sm font-semibold text-neutral-950 dark:text-white">
          {activeViewers}
        </span>{" "}
        {activeViewers === 1 ? "person" : "people"} viewing now
      </p>
    </div>
  );
}

function ViewerAvatar({ variant }: { variant: number }) {
  const hairPaths = [
    "M5.7 11.9c.4-4.3 3.2-6.5 6.6-6.5 3.7 0 6 2.8 6.1 6.4-1.4-.8-2.9-2.1-3.8-3.5-2.1 2.1-5.2 3.2-8.9 3.6Z",
    "M5.8 12c.4-4.2 3.1-6.5 6.2-6.5 3.5 0 5.9 2.4 6.4 6-2.4-.8-4.3-.5-6.4.2-2.1.7-4.1.9-6.2.3Z",
    "M5.9 11.8c.6-4 3-6.2 6.2-6.2 3.4 0 5.7 2.4 6 6.4-1.6-1.6-3.6-2.4-5.8-2.4-2.5 0-4.6.7-6.4 2.2Z",
  ];
  const nosePaths = [
    "M12.2 13.3l-.5 1.8 1 .1",
    "M11.8 13.2l.5 1.9-.9.1",
    "M12 13.2v2",
  ];
  const mouthPaths = [
    "M9.8 16.6c1.3.9 3.1.9 4.4 0",
    "M10 16.7c1 .6 3 .6 4 0",
    "M10.1 16.5c1.2.8 2.6.8 3.8 0",
  ];

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path className="viewer-avatar-shirt" d="M7.2 21c.9-2.6 2.5-3.9 4.8-3.9s3.9 1.3 4.8 3.9" />
      <path className="viewer-avatar-neck" d="M10.2 18.1h3.6v2.1h-3.6z" />
      <path className="viewer-avatar-ear" d="M5.5 12.5c-.8.1-1.1 1.7-.1 2.2M18.5 12.5c.8.1 1.1 1.7.1 2.2" />
      <circle className="viewer-avatar-face" cx="12" cy="12.6" r="6.6" />
      <path className="viewer-avatar-hair" d={hairPaths[variant]} />
      <path className="viewer-avatar-brow" d="M8.5 11.7h1.8M13.7 11.7h1.8" />
      <circle className="viewer-avatar-eye" cx="9.4" cy="13" r="0.72" />
      <circle className="viewer-avatar-eye" cx="14.6" cy="13" r="0.72" />
      <path className="viewer-avatar-nose" d={nosePaths[variant]} />
      <path className="viewer-avatar-mouth" d={mouthPaths[variant]} />
    </svg>
  );
}
