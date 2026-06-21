import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../config/api.js';
import { resources } from '../config/resources.js';

function countLabel(resource, count) {
  if (count == null) return '—';
  if (resource.key === 'interactions') return Number(count).toLocaleString('fr-FR');
  return count;
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
    </>
  );
}
