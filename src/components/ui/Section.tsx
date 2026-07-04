import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function Section({ id, title, eyebrow, action, children }: SectionProps) {
  return (
    <section className="section-shell" id={id}>
      <div className="section-rule" aria-hidden="true" />
      <div className="section-heading">
        <div>
          {eyebrow ? <p className="metadata text-neutral-500 dark:text-neutral-500">{eyebrow}</p> : null}
          <h2 className="font-display text-3xl font-semibold text-neutral-950 dark:text-white">{title}</h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
