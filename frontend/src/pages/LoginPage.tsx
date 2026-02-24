import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { devLogin } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await devLogin(email.trim(), displayName.trim() || email.trim());
      login(result.token, result.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">VAT Registration</div>
        <div className="login-sub">
          Sign in to register or manage your company's VAT.
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@company.dk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="displayName">Full name</label>
            <input
              id="displayName"
              type="text"
              placeholder="e.g. Lars Eriksen"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <p className="form-hint">Optional — used for display only.</p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !email}
          >
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: '14px', background: '#f0f4ff', borderRadius: 8, fontSize: 13, color: '#4a5568' }}>
          <strong>Development mode</strong> — authentication is bypassed.
          <br />
          In production, login will redirect to MitID.
        </div>
      </div>
    </div>
  );
}
