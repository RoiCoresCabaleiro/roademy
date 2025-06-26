// src/utils/errorHandler.js

/**
 * Dado un error Axios o genérico, devuelve el primer mensaje del servidor
 * o un mensaje genérico si no hay payload.
 */
export function extractError(error) {
  const res = error.response;
  if (res?.data?.errors && Array.isArray(res.data.errors) && res.data.errors.length > 0) {
    // Primer mensaje de array de errores
    return res.data.errors[0].message;
  }
  if (res?.data?.message) {
    // Mensaje único
    return res.data.message;
  }
  // Fallback genérico
  return error.message || 'Ha ocurrido un error inesperado';
}
