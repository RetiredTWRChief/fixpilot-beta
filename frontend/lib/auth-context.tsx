import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

type User = { id: string; name: string; email: string; role: string } | null;
type AuthContextType = {
  user: User; loading: boolean; token: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  authHeaders: () => Record<string, string>;
};

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true, token: null,
  login: async () => null, register: async () => null, logout: async () => {},
  authHeaders: () => ({}),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const stored = await AsyncStorage.getItem('fixpilot_token');
      if (stored) {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${stored}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setToken(stored);
        } else {
          await AsyncStorage.removeItem('fixpilot_token');
          await AsyncStorage.removeItem('fixpilot_refresh');
        }
      }
    } catch (e) {}
    setLoading(false);
  };

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.detail;
        if (typeof detail === 'string') return detail;
        if (Array.isArray(detail)) return detail.map((e: any) => e.msg || JSON.stringify(e)).join(' ');
        return 'Login failed';
      }
      await AsyncStorage.setItem('fixpilot_token', data.access_token);
      await AsyncStorage.setItem('fixpilot_refresh', data.refresh_token);
      setToken(data.access_token);
      setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
      return null;
    } catch (e) {
      return 'Connection error. Please try again.';
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.detail;
        if (typeof detail === 'string') return detail;
        if (Array.isArray(detail)) return detail.map((e: any) => e.msg || JSON.stringify(e)).join(' ');
        return 'Registration failed';
      }
      await AsyncStorage.setItem('fixpilot_token', data.access_token);
      await AsyncStorage.setItem('fixpilot_refresh', data.refresh_token);
      setToken(data.access_token);
      setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
      return null;
    } catch (e) {
      return 'Connection error. Please try again.';
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('fixpilot_token');
    await AsyncStorage.removeItem('fixpilot_refresh');
    setToken(null);
    setUser(null);
  }, []);

  const authHeaders = useCallback(() => {
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
