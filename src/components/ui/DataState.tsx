import { EmptyStateIcon } from "./Icons";

type DataStateProps = {
  type: "loading" | "empty";
  label: string;
  description?: string;
  fullPage?: boolean;
};

export function DataState({ type, label, description, fullPage = false }: DataStateProps) {
  return (
    <section className={`data-state ${fullPage ? "is-full-page" : ""}`} aria-live="polite" aria-busy={type === "loading"}>
      <span className="data-state-icon" aria-hidden="true">
        {type === "loading" ? <span className="data-state-spinner" /> : <EmptyStateIcon />}
      </span>
      <strong>{label}</strong>
      {description ? <p>{description}</p> : null}
    </section>
  );
}
