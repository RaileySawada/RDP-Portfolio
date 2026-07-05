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
      void recordVisit("heartbeat").then((nextStats) => {
        if (mounted) {
          setStats(nextStats);
        }
      });
    }, 30000);

    return () => {
      mounted = false;
      window.clearInterval(heartbeat);
    };
  }, []);

  return { ...stats, isLoading };
}
