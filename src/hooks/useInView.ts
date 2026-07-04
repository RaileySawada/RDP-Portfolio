import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether an element has scrolled into the viewport at least once.
 * Used to trigger one-shot reveal animations (fade/scale/slide-in) instead
 * of re-triggering every time the element crosses the viewport edge.
 */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || isInView) {
      return;
    }

    // Respect users who've asked for less motion: reveal immediately, no animation delay.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px", ...options },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isInView, options]);

  return { ref, isInView };
}
