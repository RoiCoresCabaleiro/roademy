// src/services/minijuegoService.js

import { api } from "./api";

export const minijuegoService = {
  // Lista de minijuegos del estudiante
  getMinijuegos: () => api.get("/minijuegos"),

  // Enviar resultados de un minijuego al servidor
  completeMinijuego: (minijuegoId, puntuacion) => api.post(`/minijuegos/${minijuegoId}/complete`, { puntuacion }),
};
