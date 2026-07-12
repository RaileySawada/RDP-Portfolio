import { useEffect, useState } from "react";
import { fallbackStats, recordVisit, type VisitorStats } from "../services/visitors";

export function useVisitorStats() {
  const [stats, setStats] = useState<VisitorStats>(fallbackStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void recordVisit().then((nextStats) => {
      if (mounted) {
        setStats(nextStats);
        setIsLoading(false);
      }
    });

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }

      void recordVisit("heartbeat").then((nextStats) => {
        if (mounted) {
          setStats(nextStats);
        }
      });
    }, 15_000);

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        void recordVisit("heartbeat").then((nextStats) => {
          if (mounted) setStats(nextStats);
        });
      }
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      mounted = false;
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  return { ...stats, isLoading };
}
