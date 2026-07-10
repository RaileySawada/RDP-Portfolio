import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { AdminDashboard } from "../components/admin/AdminDashboard";
import type { ThemePreference } from "../hooks/useTheme";
import { getStoredAdminSession, loginAdmin, storeAdminSession, type AdminSession } from "../services/adminAuth";

const maxLoginAttempts = 5;

type DashboardRouteProps = {
  selectedTheme: ThemePreference;
  onSelectTheme: (theme: ThemePreference, originElement: HTMLElement) => void;
};

export function DashboardRoute({ selectedTheme, onSelectTheme }: DashboardRouteProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(maxLoginAttempts);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [session, setSession] = useState<AdminSession | null>(() => getStoredAdminSession());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoginPath = location.pathname === "/rdp-login" || location.pathname === "/dashboard-login";
  const isAdminPath = location.pathname.startsWith("/rdp-admin");

  useEffect(() => {
    if (session && (isLoginPath || location.pathname === "/rdp-admin")) {
      navigate("/rdp-admin/analytics", { replace: true });
    }
  }, [isLoginPath, location.pathname, navigate, session]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const result = await loginAdmin(email, password);

      if (result.ok) {
        storeAdminSession(result.session);
        setSession(result.session);
        navigate("/rdp-admin/analytics", { replace: true });
        setMessage("Signed in. Admin session is ready.");
        setAttemptsLeft(maxLoginAttempts);
        setLockedUntil(null);
        setPassword("");
        return;
      }

      if (result.lockedUntil && result.lockedUntil > Date.now()) {
        setAttemptsLeft(0);
        setLockedUntil(result.lockedUntil);
        setMessage(`Too many attempts. Try again at ${new Date(result.lockedUntil).toLocaleTimeString()}.`);
        return;
      }

      setLockedUntil(null);
      setAttemptsLeft(typeof result.remainingAttempts === "number" ? result.remainingAttempts : attemptsLeft);
      setMessage(
        typeof result.remainingAttempts === "number"
          ? `${result.error} ${result.remainingAttempts} attempts left.`
          : result.error,
      );
    } catch {
      setMessage("Login service is unavailable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session) {
    return <AdminDashboard session={session} selectedTheme={selectedTheme} onSelectTheme={onSelectTheme} onLogout={() => setSession(null)} />;
  }

  if (isAdminPath) {
    return <Navigate to="/rdp-login" replace />;
  }

  return (
    <section className="section-shell flex min-h-screen items-center pb-20" aria-label="Admin login">
      <div className="admin-login-panel mx-auto w-full max-w-md">
        <p className="metadata text-neutral-500 dark:text-neutral-500">Railey</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-neutral-950 dark:text-white">
          Sign in
        </h1>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>Email</span>
            <input
              autoComplete="email"
              inputMode="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="admin-field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <div className="admin-attempts" aria-label={`${attemptsLeft} of ${maxLoginAttempts} login attempts left`}>
            <div>
              <span>Attempts left</span>
              {lockedUntil && lockedUntil > Date.now() ? (
                <p>Locked until {new Date(lockedUntil).toLocaleTimeString()}</p>
              ) : (
                <p>{attemptsLeft} of {maxLoginAttempts}</p>
              )}
            </div>
            <div className="admin-attempt-dots" aria-hidden="true">
              {Array.from({ length: maxLoginAttempts }, (_, index) => (
                <i className={index < attemptsLeft ? "is-live" : ""} key={index} />
              ))}
            </div>
          </div>

          <button className="button-primary admin-submit-button justify-center" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="admin-spinner" aria-hidden="true" /> : null}
            <span>{isSubmitting ? "Signing in..." : "Sign in"}</span>
          </button>
        </form>

        {message ? (
          <p className="mt-5 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
