// src/services/progresoService.js

import { api } from "./api";

export const progresoService = {
  getRoadmap: () => api.get("/progresos/usuario/roadmap"),

  initNivel: (nivelId) => api.get(`/progresos/${nivelId}/init`),

  answer: (nivelId, payload) => api.post(`/progresos/${nivelId}/answer`, payload),

  complete: (nivelId) => api.post(`/progresos/${nivelId}/complete`),
};
