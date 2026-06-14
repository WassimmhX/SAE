import { NavLink, Outlet } from 'react-router-dom';
import { resources } from '../config/resources.js';

function Navigation({ compact = false }) {
  return (
    <nav className={compact ? 'mobile-nav' : 'nav-group'} aria-label="Navigation principale">
      <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">🏠</span>
        <span>Tableau de bord</span>
      </NavLink>
      {resources.map((resource) => (
        <NavLink key={resource.key} to={resource.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon" style={{ color: resource.accent }}>{resource.icon}</span>
          <span>{resource.title}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge">GC</div>
          <div>
            <h1>Gestion des cours</h1>
            <p>Dashboard pédagogique</p>
          </div>
        </div>
        <Navigation />
      </aside>

      <main className="main">
        <div className="mobile-topbar">
          <div className="brand">
            <div className="brand-badge">GC</div>
            <div>
              <h1>Gestion des cours</h1>
              <p>Dashboard pédagogique</p>
            </div>
          </div>
          <Navigation compact />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
