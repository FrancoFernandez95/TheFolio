import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function register(payload) {
    const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    setUser(data.user);
  }

  async function login(payload) {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    setUser(data.user);
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, setUser, loading, register, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
