// src/services/api.js
import axios from 'axios';
import { doLogout } from '../utils/session';

// Crear instancia de Axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // '/api'
  withCredentials: true, // Permite enviar cookies (como refreshToken)
  headers: { 'Content-Type': 'application/json' }
});

// 1) Interceptor de request: añade Authorization si hay token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2) Interceptor de response: al 401, intenta refresh y repite la petición
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    // Si 401 y no hemos reintentado antes...
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // Llamada al endpoint de refresh (usa cookie)
        const { data } = await api.post('/auth/refresh');
        // Guarda nuevo accessToken
        localStorage.setItem('accessToken', data.accessToken);
        // Actualiza header y repite petición original
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si refresh falla, limpiamos sesión y redirigimos al login
        doLogout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
