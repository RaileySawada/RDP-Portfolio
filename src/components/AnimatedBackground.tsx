export default function AnimatedBackground() {
  return (
    <div className="site-backdrop" aria-hidden="true">
      <div className="backdrop-grid" />
      <div className="light-field light-field-a" />
      <div className="light-field light-field-b" />
      <div className="light-field light-field-c" />
      <div className="backdrop-vignette" />
    </div>
  );
}
