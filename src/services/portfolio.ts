import { fallbackPortfolio, type PortfolioData } from "../data/portfolio";

function hasPortfolioShape(value: unknown): value is PortfolioData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Partial<PortfolioData>;
  return Boolean(data.profile && Array.isArray(data.projects) && Array.isArray(data.stackGroups) && Array.isArray(data.certifications) && Array.isArray(data.timeline));
}

export function normalizePortfolioData(data: PortfolioData): PortfolioData {
  const legacySoftSkills = data.stackGroups.find((group) => group.category.toLowerCase().includes("skill"));
  const skillGroups = data.skillGroups?.length
    ? data.skillGroups
    : legacySoftSkills
      ? [legacySoftSkills]
      : fallbackPortfolio.skillGroups;
  const stackGroups = data.skillGroups?.length
    ? data.stackGroups
    : data.stackGroups.filter((group) => !group.category.toLowerCase().includes("skill"));
  const normalizedStackGroups = stackGroups.length ? stackGroups : fallbackPortfolio.stackGroups;

  return {
    ...fallbackPortfolio,
    ...data,
    profile: {
      ...fallbackPortfolio.profile,
      ...data.profile,
      socials: data.profile.socials?.length ? data.profile.socials : fallbackPortfolio.profile.socials,
    },
    home: {
      projectTitles: data.home?.projectTitles || fallbackPortfolio.home?.projectTitles || [],
      certificationNames: data.home?.certificationNames || fallbackPortfolio.home?.certificationNames || [],
      stackItems: data.home?.stackItems || fallbackPortfolio.home?.stackItems || [],
    },
    projects: data.projects?.length ? data.projects : fallbackPortfolio.projects,
    stackGroups: normalizedStackGroups,
    skillGroups,
    certifications: data.certifications?.length ? data.certifications : fallbackPortfolio.certifications,
    timeline: data.timeline?.length ? data.timeline : fallbackPortfolio.timeline,
  };
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
    return hasPortfolioShape(data) ? normalizePortfolioData(data) : fallbackPortfolio;
  } catch {
    return fallbackPortfolio;
  }
}
