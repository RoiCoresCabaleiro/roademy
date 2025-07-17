// src/services/progresoService.js

import { api } from "./api";

export const progresoService = {
  // Obtiene la estructura del roadmap con el progreso del usuario
  getRoadmap: () => api.get("/progresos/usuario/roadmap"),

  // Inicia un nivel, cargando respuestas anteriores si las hay
  initNivel: (nivelId) => api.get(`/progresos/${nivelId}/init`),

  // Enviar respuesta de una pregunta al servidor
  answer: (nivelId, payload) => api.post(`/progresos/${nivelId}/answer`, payload),

  // Enviar el resultado de un nivel al servidor
  complete: (nivelId) => api.post(`/progresos/${nivelId}/complete`),
};
