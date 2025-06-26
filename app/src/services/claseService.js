// app/src/services/claseService.js

import { api } from './api';

export const claseService = {
  // Crear una nueva clase
  crearClase: nombre => api.post('/clases', { nombre }),

  // Listar todas las clases del tutor
  listarClases: () => api.get('/clases'),

  // Ver detalles de una clase concreta
  verClase: id => api.get(`/clases/${id}`),

  // Actualizar el nombre de una clase
  actualizarClase: (id, nombre) => api.put(`/clases/${id}`, { nombre }),

  // Expulsar a un estudiante de la clase
  eliminarEstudiante: (idClase, userId) => api.delete(`/clases/${idClase}/estudiantes/${userId}`),

  // Eliminar una clase
  eliminarClase: id => api.delete(`/clases/${id}`)
};
