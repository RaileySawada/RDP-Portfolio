import { useEffect, useState } from "react";
import { fallbackPortfolio, type PortfolioData } from "../data/portfolio";
import { getPortfolioData } from "../services/portfolio";

export function usePortfolioData() {
  const [portfolio, setPortfolio] = useState<PortfolioData>(fallbackPortfolio);

  useEffect(() => {
    let mounted = true;

    void getPortfolioData().then((nextPortfolio) => {
      if (mounted) {
        setPortfolio(nextPortfolio);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return portfolio;
}
