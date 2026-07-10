import { fallbackPortfolio, type PortfolioData } from "../data/portfolio";

function hasPortfolioShape(value: unknown): value is PortfolioData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Partial<PortfolioData>;
  return Boolean(data.profile && Array.isArray(data.projects) && Array.isArray(data.stackGroups) && Array.isArray(data.certifications) && Array.isArray(data.timeline));
}

export function normalizePortfolioData(data: PortfolioData): PortfolioData {
  const hasSavedSkillGroups = Array.isArray(data.skillGroups);
  const legacySoftSkills = hasSavedSkillGroups ? undefined : data.stackGroups.find((group) => group.category.toLowerCase().includes("skill"));
  const skillGroups = hasSavedSkillGroups ? data.skillGroups : legacySoftSkills ? [legacySoftSkills] : fallbackPortfolio.skillGroups;
  const stackGroups = hasSavedSkillGroups
    ? data.stackGroups
    : data.stackGroups.filter((group) => !group.category.toLowerCase().includes("skill"));
  const normalizedStackGroups = normalizeStackGroups(stackGroups);

  return {
    ...fallbackPortfolio,
    ...data,
    profile: {
      ...fallbackPortfolio.profile,
      ...data.profile,
      socials: Array.isArray(data.profile.socials) ? data.profile.socials : fallbackPortfolio.profile.socials,
    },
    home: {
      projectTitles: data.home?.projectTitles ?? fallbackPortfolio.home?.projectTitles ?? [],
      certificationNames: data.home?.certificationNames ?? fallbackPortfolio.home?.certificationNames ?? [],
      stackItems: data.home?.stackItems ?? fallbackPortfolio.home?.stackItems ?? [],
    },
    projects: data.projects,
    stackGroups: normalizedStackGroups,
    skillGroups,
    certifications: data.certifications,
    timeline: data.timeline,
  };
}

function normalizeStackGroups(groups: PortfolioData["stackGroups"]): PortfolioData["stackGroups"] {
  return groups
    .map((group) => {
      const seenItems = new Set<string>();
      const items = group.items.reduce<string[]>((cleanItems, item) => {
        const trimmedItem = item.trim();
        const itemKey = trimmedItem.toLowerCase();

        if (!trimmedItem || seenItems.has(itemKey)) {
          return cleanItems;
        }

        seenItems.add(itemKey);
        return [...cleanItems, trimmedItem];
      }, []);

      return {
        category: group.category.trim(),
        items,
      };
    })
    .filter((group) => group.items.length > 0);
}

export async function getPortfolioData(): Promise<PortfolioData> {
  try {
    const response = await fetch("/.netlify/functions/portfolio", { cache: "no-store" });

    if (!response.ok) {
      return fallbackPortfolio;
    }

    const data: unknown = await response.json();
    return hasPortfolioShape(data) ? normalizePortfolioData(data) : fallbackPortfolio;
  } catch {
    return fallbackPortfolio;
  }
}

export function subscribePortfolioData(onChange: (portfolio: PortfolioData) => void): () => void {
  void getPortfolioData().then(onChange);
  return () => undefined;
}
