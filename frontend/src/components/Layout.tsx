import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <span className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          VAT Registration Portal
        </span>
        {user && (
          <>
            <span className="navbar-user">{user.displayName ?? user.email}</span>
            <button className="navbar-btn" onClick={handleLogout}>
              Sign out
            </button>
          </>
        )}
      </nav>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
