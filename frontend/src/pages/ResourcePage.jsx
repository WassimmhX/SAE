import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal.jsx';
import StatCard from '../components/StatCard.jsx';
import { apiRequest } from '../config/api.js';

const PAGE_SIZE = 12;

function emptyRecord(resource) {
  return Object.fromEntries(resource.fields.map((field) => [field.name, '']));
}

function rowKey(resource, row) {
  return resource.primaryKey.map((key) => row[key]).join('::');
}

function matchesSearch(resource, row, search) {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return resource.searchable.some((column) => String(row[column] ?? '').toLowerCase().includes(q));
}

function formatValue(column, value) {
  if (value === null || value === undefined || value === '') return <span className="cell-muted">—</span>;
  if (column === 'resultat_final') {
    const cls = value === 'Distinction' ? 'success' : value === 'Fail' ? 'danger' : value === 'Pass' ? 'warning' : '';
    return <span className={`badge ${cls}`}>{value}</span>;
  }
  if (column === 'est_conserve') return value === 1 || value === '1' ? <span className="badge success">Oui</span> : <span className="badge danger">Non</span>;
  if (column === 'note') {
    const numeric = Number(value);
    const cls = numeric >= 70 ? 'success' : numeric < 40 ? 'danger' : 'warning';
    return <span className={`badge ${cls}`}>{numeric.toFixed(2)}</span>;
  }
  if (column === 'nb_clics') return Number(value).toLocaleString('fr-FR');
  return String(value);
}

function ResourceStats({ resource, rows }) {
  const common = [
    { label: 'Total', value: rows.length.toLocaleString('fr-FR'), accent: resource.accent, note: resource.singular + (rows.length > 1 ? 's' : '') },
  ];

  if (resource.key === 'etudiants') {
    const pass = rows.filter((row) => row.resultat_final === 'Pass').length;
    const distinction = rows.filter((row) => row.resultat_final === 'Distinction').length;
    const fail = rows.filter((row) => row.resultat_final === 'Fail').length;
    common.push(
      { label: 'Pass', value: pass, accent: '#059669', note: 'Réussites' },
      { label: 'Distinction', value: distinction, accent: '#7c3aed', note: 'Très bons résultats' },
      { label: 'Fail', value: fail, accent: '#dc2626', note: 'À suivre' },
    );
  } else if (resource.key === 'modules') {
    const durations = rows.map((row) => Number(row.duree)).filter((n) => !Number.isNaN(n));
    const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    common.push(
      { label: 'Sessions', value: new Set(rows.map((row) => row.code_session)).size, accent: '#2563eb', note: 'Codes sessions uniques' },
      { label: 'Durée moy.', value: `${avg}j`, accent: '#059669', note: 'Moyenne des modules' },
      { label: 'Modules', value: new Set(rows.map((row) => row.code_module)).size, accent: '#d97706', note: 'Codes modules uniques' },
    );
  } else if (resource.key === 'evaluations') {
    const types = new Set(rows.map((row) => row.type_evaluation).filter(Boolean)).size;
    const weights = rows.map((row) => Number(row.poids)).filter((n) => !Number.isNaN(n));
    const avg = weights.length ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : '0';
    common.push(
      { label: 'Types', value: types, accent: '#2563eb', note: 'Types différents' },
      { label: 'Poids moy.', value: avg, accent: '#059669', note: 'Sur les évaluations' },
      { label: 'Modules', value: new Set(rows.map((row) => row.code_module)).size, accent: '#db2777', note: 'Modules concernés' },
    );
  } else if (resource.key === 'inscriptions') {
    const active = rows.filter((row) => row.date_desinscription === null || row.date_desinscription === '').length;
    common.push(
      { label: 'Actives', value: active, accent: '#059669', note: 'Sans désinscription' },
      { label: 'Désinscrites', value: rows.length - active, accent: '#dc2626', note: 'Avec date de sortie' },
      { label: 'Étudiants', value: new Set(rows.map((row) => row.id_etudiant)).size, accent: '#2563eb', note: 'Étudiants uniques' },
    );
  } else if (resource.key === 'resultats') {
    const notes = rows.map((row) => Number(row.note)).filter((n) => !Number.isNaN(n));
    const avg = notes.length ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1) : '—';
    const max = notes.length ? Math.max(...notes).toFixed(1) : '—';
    common.push(
      { label: 'Moyenne', value: avg, accent: '#2563eb', note: 'Note moyenne' },
      { label: 'Max', value: max, accent: '#059669', note: 'Meilleure note' },
      { label: 'Conservés', value: rows.filter((row) => row.est_conserve === 1 || row.est_conserve === '1').length, accent: '#db2777', note: 'Résultats retenus' },
    );
  } else if (resource.key === 'interactions') {
    const clicks = rows.reduce((sum, row) => sum + (Number(row.nb_clics) || 0), 0);
    const avg = rows.length ? Math.round(clicks / rows.length) : 0;
    common.push(
      { label: 'Clics', value: clicks.toLocaleString('fr-FR'), accent: '#ea580c', note: 'Total' },
      { label: 'Moyenne', value: avg, accent: '#2563eb', note: 'Clics par interaction' },
      { label: 'Ressources', value: new Set(rows.map((row) => row.id_ressource)).size, accent: '#4f46e5', note: 'Ressources uniques' },
    );
  } else {
    common.push(
      { label: 'Modules', value: new Set(rows.map((row) => row.code_module)).size, accent: '#2563eb', note: 'Modules couverts' },
      { label: 'Types', value: new Set(rows.map((row) => row.type_activite).filter(Boolean)).size, accent: '#4f46e5', note: 'Types différents' },
      { label: 'Sessions', value: new Set(rows.map((row) => row.code_session)).size, accent: '#059669', note: 'Sessions uniques' },
    );
  }

  return (
    <div className="grid cards" style={{ marginBottom: 18 }}>
      {common.map((stat) => <StatCard key={stat.label} {...stat} />)}
    </div>
  );
}

function RecordForm({ resource, mode, value, onChange, onCancel, onSubmit, saving }) {
  const isEdit = mode === 'edit';
  const fields = resource.fields.filter((field) => !(mode === 'create' && field.auto));

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        {fields.map((field) => {
          const isPk = resource.primaryKey.includes(field.name);
          const readOnly = isEdit && (isPk || field.auto);
          const fieldValue = value[field.name] ?? '';
          return (
            <div className="field" key={field.name}>
              <label htmlFor={field.name}>{field.label}{field.required ? ' *' : ''}</label>
              {field.type === 'select' ? (() => {
                const options = field.options || [];
                const mergedOptions = fieldValue !== '' && !options.includes(String(fieldValue))
                  ? [...options, String(fieldValue)]
                  : options;
                return (
                  <select
                    id={field.name}
                    value={fieldValue}
                    required={field.required}
                    disabled={readOnly}
                    onChange={(event) => onChange({ ...value, [field.name]: event.target.value })}
                  >
                    {mergedOptions.map((option) => <option key={option} value={option}>{option === '' ? '—' : option}</option>)}
                  </select>
                );
              })() : (
                <input
                  id={field.name}
                  type={field.type || 'text'}
                  step={field.step}
                  value={fieldValue}
                  required={field.required}
                  readOnly={readOnly}
                  onChange={(event) => onChange({ ...value, [field.name]: event.target.value })}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="form-actions">
        <button className="btn ghost" type="button" onClick={onCancel}>Annuler</button>
        <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
      </div>
    </form>
  );
}

export default function ResourcePage({ resource }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyRecord(resource));

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(resource.endpoint);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRows([]);
    setSearch('');
    setPage(1);
    setForm(emptyRecord(resource));
    setModal(null);
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource.key]);

  const filtered = useMemo(() => rows.filter((row) => matchesSearch(resource, row, search)), [rows, search, resource]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, resource.key]);

  const openCreate = () => {
    setSuccess('');
    setError('');
    setForm(emptyRecord(resource));
    setModal({ type: 'form', mode: 'create' });
  };

  const openEdit = (row) => {
    setSuccess('');
    setError('');
    setForm({ ...emptyRecord(resource), ...row });
    setModal({ type: 'form', mode: 'edit' });
  };

  const openDelete = (row) => {
    setSuccess('');
    setError('');
    setModal({ type: 'delete', row });
  };

  const closeModal = () => {
    if (!saving) setModal(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...form };
      if (modal.mode === 'create') {
        resource.fields.filter((field) => field.auto && payload[field.name] === '').forEach((field) => delete payload[field.name]);
      }
      await apiRequest(resource.endpoint, {
        method: modal.mode === 'edit' ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setModal(null);
      setSuccess(modal.mode === 'edit' ? 'Modification enregistrée.' : 'Création enregistrée.');
      await loadRows();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = Object.fromEntries(resource.primaryKey.map((key) => [key, modal.row[key]]));
      await apiRequest(resource.endpoint, { method: 'DELETE', body: JSON.stringify(payload) });
      setModal(null);
      setSuccess('Suppression effectuée.');
      await loadRows();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <div className="eyebrow" style={{ color: resource.accent }}>{resource.icon} Gestion</div>
          <h1 className="page-title">{resource.title}</h1>
          <p className="page-subtitle">{resource.description}</p>
        </div>
        <button className="btn primary" style={{ '--accent': resource.accent, background: resource.accent }} onClick={openCreate}>
          + Nouveau {resource.singular}
        </button>
      </header>

      {error ? <div className="error-box">{error}</div> : null}
      {success ? <div className="success-box">{success}</div> : null}

      <ResourceStats resource={resource} rows={rows} />

      <section className="card table-card">
        <div className="toolbar" style={{ padding: 16, paddingBottom: 0 }}>
          <label className="search" aria-label="Recherche">
            <span>🔎</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher dans cette table…" />
          </label>
          <div className="actions">
            <button className="btn ghost" type="button" onClick={loadRows}>Rafraîchir</button>
          </div>
        </div>

        {loading ? <div className="loading">Chargement des données…</div> : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {resource.tableColumns.map((column) => <th key={column}>{resource.fields.find((field) => field.name === column)?.label || column}</th>)}
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={rowKey(resource, row)}>
                      {resource.tableColumns.map((column) => <td key={column}>{formatValue(column, row[column])}</td>)}
                      <td>
                        <div className="row-actions">
                          <button className="btn ghost" type="button" onClick={() => openEdit(row)}>Modifier</button>
                          <button className="btn danger" type="button" onClick={() => openDelete(row)}>Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 ? <div className="empty">Aucune donnée trouvée.</div> : null}
            <div className="pagination">
              <span>{filtered.length.toLocaleString('fr-FR')} résultat{filtered.length > 1 ? 's' : ''} · page {safePage}/{pageCount}</span>
              <div className="pagination-controls">
                <button className="btn ghost" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Précédent</button>
                <button className="btn ghost" disabled={safePage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>Suivant</button>
              </div>
            </div>
          </>
        )}
      </section>

      {modal?.type === 'form' ? (
        <Modal title={modal.mode === 'edit' ? `Modifier ${resource.singular}` : `Nouveau ${resource.singular}`} onClose={closeModal}>
          <RecordForm
            resource={resource}
            mode={modal.mode}
            value={form}
            onChange={setForm}
            onCancel={closeModal}
            onSubmit={handleSubmit}
            saving={saving}
          />
        </Modal>
      ) : null}

      {modal?.type === 'delete' ? (
        <Modal title={`Supprimer ${resource.singular}`} onClose={closeModal}>
          <div className="delete-body">
            Cette action supprimera définitivement cet élément. Si d’autres tables dépendent de cette ligne, MySQL peut refuser la suppression pour protéger l’intégrité des données.
          </div>
          <div className="form-actions">
            <button className="btn ghost" type="button" onClick={closeModal}>Annuler</button>
            <button className="btn danger" type="button" disabled={saving} onClick={handleDelete}>{saving ? 'Suppression…' : 'Supprimer'}</button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
