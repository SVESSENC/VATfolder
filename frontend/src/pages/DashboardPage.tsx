import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { listApplications, type Application } from '../api/client';
import { useAuth } from '../context/AuthContext';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-DK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listApplications()
      .then(setApps)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="page-wide">
        <div className="flex-between mb-4" style={{ marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>
              Welcome, {user?.displayName ?? user?.email}
            </h1>
            <p className="text-muted" style={{ marginTop: 4 }}>
              Manage your VAT registration applications below.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/applications/new')}
          >
            + New Application
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <span className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && apps.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <p style={{ fontSize: 16 }}>No applications yet.</p>
              <p>Register your company's VAT obligation to get started.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/applications/new')}
              >
                Register a company
              </button>
            </div>
          </div>
        )}

        {!loading && apps.length > 0 && (
          <div className="app-list">
            {apps.map((app) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className="app-card"
              >
                <div className="app-card-info">
                  <div className="app-card-title">
                    {app.organisation?.name ?? app.organisation?.cvr ?? 'Unnamed company'}
                  </div>
                  <div className="app-card-sub">
                    Step: {app.currentStep.replace(/_/g, ' ')} · Created{' '}
                    {formatDate(app.createdAt)}
                  </div>
                </div>
                <div className="app-card-actions">
                  <StatusBadge status={app.status} />
                  {(app.status === 'draft' || app.status === 'validated') && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/applications/${app.id}`);
                      }}
                    >
                      Continue →
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
