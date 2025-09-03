const { Minijuego } = require("../models");
const progresoService = require("./progresoService");

// Devuelve información básica de los minijuegos partiendo del estado de los niveles de un usuario.
function getMinijuegosBasicosDesdeEstado(nivelesEstado) {
  const completados = new Set(
    nivelesEstado.filter((n) => n.completado).map((n) => n.nivelId)
  );

  return Minijuego.findAll({ order: [["id", "ASC"]] }).then((juegos) =>
    juegos.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      nivelDesbloqueo: j.nivelDesbloqueo,
      desbloqueado: completados.has(j.nivelDesbloqueo),
    }))
  );
}

// Wrapper para obtener la informacion básica de los minijuegos partiendo del id de un usuario
async function getMinijuegosBasicos(usuarioId) {
  const nivelesEstado = await progresoService.getNivelesEstado(usuarioId);
  return getMinijuegosBasicosDesdeEstado(nivelesEstado);
}

module.exports = {
  getMinijuegosBasicos,
  getMinijuegosBasicosDesdeEstado,
};
