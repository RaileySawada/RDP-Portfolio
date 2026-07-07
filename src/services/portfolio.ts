import { fallbackPortfolio, type PortfolioData } from "../data/portfolio";

const stackCategoryOrder = [
  "Languages",
  "Frontend Frameworks",
  "Markup & Styling",
  "Backend & APIs",
  "Databases",
  "Cloud & Storage",
  "Developer Tools",
  "Data & Decision Systems",
  "Other Tools",
];

const stackCategoryByItem: Record<string, string> = {
  javascript: "Languages",
  typescript: "Languages",
  php: "Languages",
  bash: "Languages",
  "c++": "Languages",
  java: "Languages",
  react: "Frontend Frameworks",
  "next.js": "Frontend Frameworks",
  vue: "Frontend Frameworks",
  html: "Markup & Styling",
  css: "Markup & Styling",
  "tailwind css": "Markup & Styling",
  "node.js": "Backend & APIs",
  "rest apis": "Backend & APIs",
  xml: "Backend & APIs",
  mysql: "Databases",
  postgresql: "Databases",
  firestore: "Databases",
  firebase: "Cloud & Storage",
  cloudinary: "Cloud & Storage",
  netlify: "Cloud & Storage",
  git: "Developer Tools",
  dss: "Data & Decision Systems",
  "data analytics": "Data & Decision Systems",
  analytics: "Data & Decision Systems",
  "ai support": "Data & Decision Systems",
};

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
  const normalizedStackGroups = normalizeStackGroups(stackGroups.length ? stackGroups : fallbackPortfolio.stackGroups);

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

function normalizeStackGroups(groups: PortfolioData["stackGroups"]): PortfolioData["stackGroups"] {
  const groupedItems = new Map<string, string[]>();
  const seenItems = new Set<string>();

  stackCategoryOrder.forEach((category) => groupedItems.set(category, []));

  groups.forEach((group) => {
    group.items.forEach((item) => {
      const trimmedItem = item.trim();
      const itemKey = trimmedItem.toLowerCase();

      if (!trimmedItem || seenItems.has(itemKey)) {
        return;
      }

      seenItems.add(itemKey);
      const category = stackCategoryByItem[itemKey] || group.category || "Other Tools";
      const normalizedCategory = stackCategoryOrder.includes(category) ? category : "Other Tools";
      groupedItems.set(normalizedCategory, [...(groupedItems.get(normalizedCategory) || []), trimmedItem]);
    });
  });

  return stackCategoryOrder
    .map((category) => ({
      category,
      items: groupedItems.get(category) || [],
    }))
    .filter((group) => group.items.length > 0);
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

export function subscribePortfolioData(onChange: (portfolio: PortfolioData) => void): () => void {
  const databaseUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL?.replace(/\/$/, "");

  if (!databaseUrl || typeof EventSource === "undefined") {
    void getPortfolioData().then(onChange);
    return () => undefined;
  }

  const source = new EventSource(`${databaseUrl}/portfolio.json`);
  const handlePortfolioEvent = (event: MessageEvent<string>) => {
    try {
      const payload = JSON.parse(event.data) as { data?: unknown };

      if (hasPortfolioShape(payload.data)) {
        onChange(normalizePortfolioData(payload.data));
      }
    } catch {
      // Keep the current portfolio if Firebase sends a malformed stream event.
    }
  };

  source.addEventListener("put", handlePortfolioEvent);
  source.addEventListener("patch", handlePortfolioEvent);
  source.onerror = () => {
    void getPortfolioData().then(onChange);
  };

  return () => source.close();
}
