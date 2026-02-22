import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { clearAuthToken, setAuthToken } from '../lib/auth';

const AuthContext = createContext(null);

// TODO: remove once real auth backend is wired up
const DEV_BYPASS = true;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(DEV_BYPASS ? 'dev-bypass' : null);
  const [user, setUser] = useState(DEV_BYPASS ? { id: 0, email: 'scarson@southeastenterprise.com', username: 'scarson', full_name: 'Samuel Carson' } : null);

  const login = async (usernameOrEmail, password) => {
    const result = await api.login(usernameOrEmail, password);
    setAuthToken(result.access_token);
    setToken(result.access_token);
    const me = await api.me();
    setUser(me);
    return me;
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, ready: true, isAuthenticated: Boolean(token), login, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
