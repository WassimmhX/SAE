import StatCard from './StatCard.jsx';


export function Stats({ resource, rows }) {
  const common = [
    { label: 'Total', value: rows.length.toLocaleString('fr-FR'), accent: resource.accent, note: resource.singular + (rows.length > 1 ? 's' : '') },
  ];

  if (resource.key === 'etudiants') {
    const pass = rows.filter((row) => row.resultat_final === 'Pass').length;
    const withdraw = rows.filter((row) => row.resultat_final === 'Withdrawn').length;
    const fail = rows.filter((row) => row.resultat_final === 'Fail').length;
    common.push(
      { label: 'Pass', value: pass, accent: '#059669', note: 'Réussites' },
      { label: 'withdraw', value: withdraw, accent: '#7c3aed', note: 'Abandons' },
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