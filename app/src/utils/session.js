// src/utils/session.js

export function doLogout() {
  // Limpia el token de acceso del localStorage
  localStorage.removeItem('accessToken');
  // Redirige al login de forma imperativa
  window.location.href = '/login';
}