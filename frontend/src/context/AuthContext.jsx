import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchMe } from '../api/auth';

const AuthContext = createContext(null);

const TOKEN_KEY = 'flaghouse_token';
const USER_KEY = 'flaghouse_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [authLoading, setAuthLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  const loginSession = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, authToken);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    const data = await fetchMe(token);
    setUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  }, [token]);

  useEffect(() => {
    if (!token) {
      setAuthLoading(false);
      return;
    }

    fetchMe(token)
      .then((data) => {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginSession,
        refreshUser,
        logout,
        isLoggedIn: !!user && !!token,
        isAdmin: user?.role === 'admin',
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
