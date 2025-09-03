const { Tema, Nivel, PreguntaSolucion, Minijuego } = require("./models");
const temario = require("./data/temario.json");

async function seedData() {
  console.log("— Sembrando temario en la base de datos…");

  // 1) Sembrar Temas
  const temas = temario.map((t) => ({
    id: t.temaId,
    titulo: t.titulo,
    orden: t.orden,
    estrellasNecesarias: t.estrellasNecesarias,
  }));
  await Tema.bulkCreate(temas, { validate: true });

  // 2) Sembrar Niveles
  const niveles = temario.flatMap((t) =>
    t.niveles.map((n) => ({
      id: n.nivelId,
      temaId: t.temaId,
      orden: n.orden,
      tipo: n.tipo,
      puntuacionMinima: n.puntuacionMinima || null,
    }))
  );
  await Nivel.bulkCreate(niveles, { validate: true });

  // 3) Sembrar soluciones de preguntas
  const soluciones = temario.flatMap((t) =>
    t.niveles.flatMap((n) =>
      n.preguntas.map((p) => ({
        preguntaId: p.preguntaId,
        nivelId: n.nivelId,
        respuestaCorrecta: p.respuestaCorrecta,
      }))
    )
  );
  await PreguntaSolucion.bulkCreate(soluciones, { validate: true });

  // 4) Sembrar Minijuegos
  const minijuegos = [
    { nombre: "Pasapalabra Vial", nivelDesbloqueo: 104 },
    { nombre: "Conductas Correctas", nivelDesbloqueo: 205 },
    { nombre: "Señales Misteriosas", nivelDesbloqueo: 305 },
  ];
  await Minijuego.bulkCreate(minijuegos, { validate: true });

  console.log("✅ Seed completado");
}

module.exports = { seedData };
