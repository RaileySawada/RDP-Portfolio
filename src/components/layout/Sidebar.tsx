import { useEffect } from "react";
import { Link, NavLink } from "react-router";
import { profile } from "../../data/portfolio";
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
  isOpen: boolean;
  selectedTheme: ThemePreference;
  activeViewers: number;
  plusCount: number;
  onClose: () => void;
  onSelectTheme: (theme: ThemePreference, originElement: HTMLElement) => void;
};

export function Sidebar({
  navItems,
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
    "bg-neutral-950 text-white",
    "bg-neutral-200 text-neutral-950",
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
        people viewing now
      </p>
    </div>
  );
}

function ViewerAvatar({ variant }: { variant: number }) {
  const hairPaths = [
    "M5.8 10.3c.5-3.5 3.1-5.1 6-5.1 3.3 0 5.7 1.8 6.4 5.1-1.3-.9-2.6-1.1-4.2-.9-2 .3-3.3 1-5.2.9-1.1-.1-2-.2-3 .0Z",
    "M5.6 11.3c.2-3.8 3.3-5.9 6.8-5.5 2.7.3 4.8 2 5.4 4.8-2-.7-3.8-.6-5.6-.3-2.5.4-4.3.1-6.6 1Z",
    "M6.1 10.8c.7-3.6 3.1-5.2 5.9-5.2s5 1.6 5.9 5.1c-1.1-.7-2-.9-3-.7-1.7.2-2.5 1.1-4.1.9-1.6-.1-2.4-.7-4.7-.1Z",
  ];
  const mouthPaths = [
    "M9.8 15.3c1.4 1 3 1 4.4 0",
    "M10 15.7h4",
    "M10 15.2c1.2.7 2.8.7 4 0",
  ];
  const nosePaths = [
    "M12 12.8v1.5l-.7.4",
    "M12.2 12.8 12 14.4",
    "M11.9 12.9v1.3l.6.3",
  ];

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path className="viewer-avatar-neck" d="M10.1 18.5h3.8v2.2h-3.8z" />
      <circle className="viewer-avatar-face" cx="12" cy="12.4" r="7.1" />
      <path className="viewer-avatar-ear" d="M5.2 12.1c-1 .2-1.3 1.9-.2 2.5M18.8 12.1c1 .2 1.3 1.9.2 2.5" />
      <path className="viewer-avatar-hair" d={hairPaths[variant]} />
      <path className="viewer-avatar-brow" d="M8.7 11.2h1.7M13.6 11.2h1.7" />
      <circle className="viewer-avatar-eye" cx="9.6" cy="12.7" r="0.75" />
      <circle className="viewer-avatar-eye" cx="14.4" cy="12.7" r="0.75" />
      <path className="viewer-avatar-nose" d={nosePaths[variant]} />
      <path className="viewer-avatar-mouth" d={mouthPaths[variant]} />
      <path className="viewer-avatar-shirt" d="M7.4 21c.8-2.4 2.4-3.6 4.6-3.6s3.8 1.2 4.6 3.6" />
    </svg>
  );
}
