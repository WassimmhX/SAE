export function Bars({ title, items, labelKey, accent }) {
  const max = Math.max(...items.map((item) => Number(item.total) || 0), 0);
  return (
    <section className="card insight-card">
      <p className="stat-label">{title}</p>
      <div className="bars">
        {items.length === 0 ? <p className="cell-muted">Aucune donnée pour le moment.</p> : items.map((item, index) => {
          const value = Number(item.total) || 0;
          const label = item[labelKey] || 'Non renseigné';
          return (
            <div className="bar-row" key={`${label}-${index}`}>
              <span title={label}>{label}</span>
              <div className="bar"><span style={{ width: `${max ? (value / max) * 100 : 0}%`, '--accent': accent }} /></div>
              <strong>{value.toLocaleString('fr-FR')}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}