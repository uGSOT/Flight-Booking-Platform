/** Temporary page scaffold for routes not yet built out. */
export default function Placeholder({ title, note }) {
  return (
    <div className="container page" style={{ paddingBlock: "var(--space-12)" }}>
      <h1 style={{ fontSize: "var(--fs-h1)", marginBottom: "var(--space-3)" }}>{title}</h1>
      <p style={{ color: "var(--color-text-secondary)", maxWidth: 560 }}>
        {note || "This screen is scaffolded and will be built out in an upcoming milestone."}
      </p>
    </div>
  );
}
