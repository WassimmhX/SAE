export default function StatCard({ label, value, note, accent }) {
  return (
    <article className="card stat-card" style={{ '--accent': accent }}>
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={{ color: accent }}>{value}</p>
      {note ? <p className="stat-note">{note}</p> : null}
    </article>
  );
}
