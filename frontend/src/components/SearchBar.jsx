export function SearchBar({ value, onChange, placeholder, loadRows }) {
    return (
        <div className="toolbar" style={{ padding: 16, paddingBottom: 0 }}>
          <label className="search" aria-label="Recherche">
            <span>🔎</span>
            <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
          </label>
          <div className="actions">
            <button className="btn ghost" type="button" onClick={loadRows}>Rafraîchir</button>
          </div>
        </div>
    );
}