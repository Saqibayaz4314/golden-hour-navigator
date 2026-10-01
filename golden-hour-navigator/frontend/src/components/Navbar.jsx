import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LayoutDashboard, Building2, Stethoscope, LogOut, Cross } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="nav-brand">
        <div className="nav-brand-icon">
          <Cross size={16} strokeWidth={2.5} />
        </div>
        <span>GoldenHour</span>
      </Link>

      {/* Links */}
      <div className="nav-links">
        <Link
          to="/"
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
        >
          <Activity size={15} />
          <span>Emergency</span>
        </Link>

        <Link
          to="/hospitals"
          className={`nav-link ${isActive('/hospitals') ? 'active' : ''}`}
        >
          <Building2 size={15} />
          <span>Hospitals</span>
        </Link>

        <Link
          to="/doctors"
          className={`nav-link ${isActive('/doctors') ? 'active' : ''}`}
        >
          <Stethoscope size={15} />
          <span>Doctors</span>
        </Link>

        {user ? (
          <>
            <Link
              to="/hospital/dashboard"
              className={`nav-link ${isActive('/hospital/dashboard') ? 'active' : ''}`}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </Link>

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: 'var(--border-default)', margin: '0 0.25rem' }} />

            <button
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <div style={{ width: 1, height: 20, background: 'var(--border-default)', margin: '0 0.25rem' }} />
            <Link to="/login" className="btn btn-outline btn-sm">
              Hospital Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
