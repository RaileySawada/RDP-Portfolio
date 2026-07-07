import type { PortfolioData } from "../data/portfolio";
import type { AdminSession } from "./adminAuth";

type SavePortfolioResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
    };
type SavePortfolioResponse = Partial<{
  ok: boolean;
  error: string;
}>;

function getDatabaseUrl() {
  return import.meta.env.VITE_FIREBASE_DATABASE_URL?.replace(/\/$/, "") || "";
}

export async function savePortfolioData(session: AdminSession, portfolio: PortfolioData): Promise<SavePortfolioResult> {
  try {
    const response = await fetch("/.netlify/functions/admin-portfolio", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session, portfolio }),
    });
    const data = (await response.json()) as SavePortfolioResponse;

    if (!response.ok) {
      return {
        ok: false,
        error: typeof data.error === "string" ? data.error : "Could not save portfolio data.",
      };
    }

    return data.ok ? { ok: true } : { ok: false, error: "Could not save portfolio data." };
  } catch {
    if (import.meta.env.DEV) {
      return savePortfolioDataInDevelopment(portfolio);
    }

    return {
      ok: false,
      error: "Portfolio service is unavailable.",
    };
  }
}

async function savePortfolioDataInDevelopment(portfolio: PortfolioData): Promise<SavePortfolioResult> {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return {
      ok: false,
      error: "Missing Firebase database URL.",
    };
  }

  const response = await fetch(`${databaseUrl}/portfolio.json`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(portfolio),
  });

  if (!response.ok) {
    return {
      ok: false,
      error: "Could not save portfolio data.",
    };
  }

  return { ok: true };
}
