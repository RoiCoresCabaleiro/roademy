// src/services/usuarioService.js

import { api } from './api';

export const usuarioService = {
  // Perfil básico
  getProfile: () => api.get('/usuarios/me'),

  // Datos del dashboard (estudiante)
  getDashboard: (limitLogs = 5) => api.get('/usuarios/me/dashboard', { params: { limitLogs } }),

  // Datos del dashboard (tutor)
  getTutorDashboard: () => api.get('/usuarios/me/dashboard-tutor'),

  // Actualiza el perfil del usuario
  updateProfile: data => api.put('/usuarios/me', data),

  // Unirse a una clase con código (estudiante)
  joinClass: codigoClase => api.post('/usuarios/me/unirse-clase', { codigoClase }),

  // Abandonar clase (estudiante)
  leaveClass: () => api.delete('/usuarios/me/clase'),

  // Darse de baja del sistema completamente
  deleteAccount: contraseña => api.delete('/usuarios/me', { data: { contraseña } })
};
