import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finsight_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('finsight_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem('finsight_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('finsight_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired:', err.message);
          localStorage.removeItem('finsight_token');
          localStorage.removeItem('finsight_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('finsight_token', newToken);
      localStorage.setItem('finsight_user', JSON.stringify(newUser));
      return { success: true };
    }
    return { success: false, message: res.data.message || 'Login failed' };
  };

  const register = async (name, email, password, monthlyIncome) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      monthlyIncome: Number(monthlyIncome) || 0,
    });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('finsight_token', newToken);
      localStorage.setItem('finsight_user', JSON.stringify(newUser));
      return { success: true };
    }
    return { success: false, message: res.data.message || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('finsight_token');
    localStorage.removeItem('finsight_user');
    setUser(null);
    setToken(null);
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('finsight_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
