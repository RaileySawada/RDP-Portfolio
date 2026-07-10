import { useEffect, useState } from "react";
import type { PortfolioData } from "../data/portfolio";
import { subscribePortfolioData } from "../services/portfolio";

export function usePortfolioData() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return subscribePortfolioData((data) => {
      setPortfolio(data);
      setIsLoading(false);
    });
  }, []);

  return { portfolio, isLoading };
}
