import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import type { AuthUser } from '../api/client';

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('vat_token'),
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('vat_user');
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((tok: string, u: AuthUser) => {
    localStorage.setItem('vat_token', tok);
    localStorage.setItem('vat_user', JSON.stringify(u));
    setToken(tok);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vat_token');
    localStorage.removeItem('vat_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
