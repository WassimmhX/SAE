import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../config/api.js';
import { resources } from '../config/resources.js';
import StatCard from '../components/StatCard.jsx';

function countLabel(resource, count) {
  if (count == null) return '—';
  if (resource.key === 'interactions') return Number(count).toLocaleString('fr-FR');
  return count;
}

function Bars({ title, items, labelKey, accent }) {
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

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiRequest('stats.php')
      .then((data) => { if (mounted) setStats(data); })
      .catch((err) => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const quickStats = useMemo(() => [
    { label: 'Étudiants', value: stats?.counts?.etudiants ?? 0, accent: '#7c3aed', note: 'Profils enregistrés' },
    { label: 'Modules', value: stats?.counts?.modules ?? 0, accent: '#2563eb', note: 'Sessions pédagogiques' },
    { label: 'Résultats', value: stats?.counts?.resultats_evaluations ?? 0, accent: '#db2777', note: `Moyenne ${Number(stats?.notes?.moyenne || 0).toFixed(1)}` },
    { label: 'Clics VLE', value: Number(stats?.interactions?.total_clics || 0).toLocaleString('fr-FR'), accent: '#ea580c', note: 'Interactions cumulées' },
  ], [stats]);

  return (
    <>
      <header className="page-header">
        <div>
          <div className="eyebrow">Système de gestion des cours</div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">
            Une interface claire pour consulter, créer, modifier et supprimer les données pédagogiques.
          </p>
        </div>
        <Link className="btn primary" to="/etudiants">Commencer</Link>
      </header>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="grid cards" style={{ marginBottom: 18 }}>
        {quickStats.map((item) => <StatCard key={item.label} {...item} value={loading ? '…' : item.value} />)}
      </div>

      <div className="grid resources" style={{ marginBottom: 18 }}>
        {resources.map((resource) => {
          const countKey = resource.endpoint.replace('.php', '');
          const count = stats?.counts?.[countKey];
          return (
            <Link className="card resource-card" to={resource.path} key={resource.key} style={{ '--accent': resource.accent }}>
              <div className="resource-card-top">
                <span className="resource-icon">{resource.icon}</span>
                <span className="arrow">→</span>
              </div>
              <div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
              </div>
              <div className="resource-count">{loading ? '…' : countLabel(resource, count)}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <Bars title="Résultats finaux" items={stats?.resultats || []} labelKey="resultat_final" accent="#7c3aed" />
        <Bars title="Top régions" items={stats?.regions || []} labelKey="region" accent="#2563eb" />
        <Bars title="Types d’activités" items={stats?.types_activites || []} labelKey="type_activite" accent="#4f46e5" />
      </div>
    </>
  );
}
