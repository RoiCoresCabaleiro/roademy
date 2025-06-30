// src/context/AuthContext.jsx

import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';         // nuestra instancia con interceptors
import { authService } from '../services/authService';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Limpia sesión y redirige
  const logout = useCallback(async () => {
    try {
      await authService.logout(); // Revoca tokens en el backend
    } catch {/**/}
      localStorage.removeItem('accessToken');
      setUser(null);
      navigate('/login', { replace: true });
  }, [navigate]);

  // Al arrancar la app, si hay token, cargamos perfil una sola vez
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/usuarios/me')
      .then(res => setUser(res.data.user))
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, [logout]);

  // Login
  const login = async credentials => {
    const { data } = await authService.login(credentials);
    localStorage.setItem('accessToken', data.accessToken);
    const profile = await api.get('/usuarios/me');
    setUser(profile.data.user);
    navigate(profile.data.user.rol === 'tutor' ? '/tutor/dashboard' : '/dashboard');
  };

  // Register
  const register = async formData => {
    const { data } = await authService.register(formData);
    localStorage.setItem('accessToken', data.accessToken);
    const profile = await api.get('/usuarios/me');
    setUser(profile.data.user);
    navigate(profile.data.user.rol === 'tutor' ? '/tutor/dashboard' : '/dashboard');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
