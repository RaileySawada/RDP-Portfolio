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
    return {
      ok: false,
      error: "Portfolio service is unavailable.",
    };
  }
}
