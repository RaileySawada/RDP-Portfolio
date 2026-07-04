type WindowBarProps = {
  label: string;
};

export function WindowBar({ label }: WindowBarProps) {
  return (
    <div className="window-bar">
      <span className="window-bar-dot" aria-hidden="true" />
      <span className="window-bar-dot" aria-hidden="true" />
      <span className="window-bar-dot" aria-hidden="true" />
      <span className="window-bar-label">{label}</span>
    </div>
  );
}
