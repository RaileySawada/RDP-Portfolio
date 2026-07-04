import { fallbackPortfolio, type PortfolioData } from "../data/portfolio";

function hasPortfolioShape(value: unknown): value is PortfolioData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Partial<PortfolioData>;
  return Boolean(data.profile && Array.isArray(data.projects) && Array.isArray(data.stackGroups) && Array.isArray(data.certifications) && Array.isArray(data.timeline));
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const databaseUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;

  if (!databaseUrl) {
    return fallbackPortfolio;
  }

  try {
    const response = await fetch(`${databaseUrl.replace(/\/$/, "")}/portfolio.json`);

    if (!response.ok) {
      return fallbackPortfolio;
    }

    const data: unknown = await response.json();
    return hasPortfolioShape(data) ? data : fallbackPortfolio;
  } catch {
    return fallbackPortfolio;
  }
}
