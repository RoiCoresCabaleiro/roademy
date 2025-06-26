// src/services/authService.js

import { api } from './api';

export const authService = {
  // Renueva el token usando la cookie de refreshToken
  refresh: () => api.post('/auth/refresh'),

  // Logout: revoca tokens y destruye sesión en backend
  logout: () => api.post('/auth/logout'),

  // Login con email/usuario
  login: ({ identifier, contraseña }) => api.post('/usuarios/login', { identifier, contraseña }),

  // Registro de estudiante o tutor
  register: ({ nombre, email, contraseña, rol, codigoClase }) => api.post('/usuarios/register', { nombre, email, contraseña, rol, codigoClase })
};
