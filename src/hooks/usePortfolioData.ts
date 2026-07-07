import { useEffect, useState } from "react";
import { fallbackPortfolio, type PortfolioData } from "../data/portfolio";
import { subscribePortfolioData } from "../services/portfolio";

export function usePortfolioData() {
  const [portfolio, setPortfolio] = useState<PortfolioData>(fallbackPortfolio);

  useEffect(() => {
    return subscribePortfolioData(setPortfolio);
  }, []);

  return portfolio;
}
