import { useCallback, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type StartViewTransition = (updateCallback: () => void) => {
  ready: Promise<void>;
};

const storageKey = "portfolio-theme";
const mediaQuery = "(prefers-color-scheme: dark)";
const transitionDuration = 420;

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia(mediaQuery).matches ? "dark" : "light";
}

function getInitialPreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(storageKey);

  if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
    return storedTheme;
  }

  return "system";
}

function resolveTheme(preference: ThemePreference, systemTheme: ResolvedTheme): ResolvedTheme {
  return preference === "system" ? systemTheme : preference;
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getTransitionOrigin(element?: HTMLElement) {
  if (!element) {
    return { x: window.innerWidth, y: 0 };
  }

  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function getEndRadius(x: number, y: number) {
  return Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
}

function supportsViewTransition(documentElement: Document): documentElement is Document & { startViewTransition: StartViewTransition } {
  return "startViewTransition" in documentElement;
}

export function useTheme() {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(getInitialPreference);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const resolvedTheme = useMemo(() => resolveTheme(themePreference, systemTheme), [themePreference, systemTheme]);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (themePreference !== "system") {
      return undefined;
    }

    const query = window.matchMedia(mediaQuery);
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    setSystemTheme(query.matches ? "dark" : "light");
    query.addEventListener("change", handleSystemThemeChange);

    return () => query.removeEventListener("change", handleSystemThemeChange);
  }, [themePreference]);

  const setThemePreference = useCallback(
    (nextPreference: ThemePreference, originElement?: HTMLElement) => {
      const nextResolvedTheme = resolveTheme(nextPreference, getSystemTheme());
      const shouldAnimateThemeChange = nextResolvedTheme !== resolvedTheme;

      window.localStorage.setItem(storageKey, nextPreference);

      const commitTheme = () => {
        flushSync(() => {
          setSystemTheme(getSystemTheme());
          setThemePreferenceState(nextPreference);
        });
        applyTheme(nextResolvedTheme);
      };

      if (!shouldAnimateThemeChange || prefersReducedMotion() || !supportsViewTransition(document)) {
        commitTheme();
        return;
      }

      const { x, y } = getTransitionOrigin(originElement);
      const endRadius = getEndRadius(x, y);
      const transition = document.startViewTransition(commitTheme);

      void transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
          },
          {
            duration: transitionDuration,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });
    },
    [resolvedTheme],
  );

  return {
    theme: resolvedTheme,
    resolvedTheme,
    themePreference,
    setThemePreference,
  };
}
