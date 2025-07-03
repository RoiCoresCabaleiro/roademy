// src/pages/LevelCompletePage.jsx

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatNivelId } from "../utils/formatters";
import ErrorMessage from "../components/ErrorMessage";

export default function LevelCompletePage() {
  const { nivelId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    navigate("/roadmap");
    return null;
  }

  const {
    attemptCompletado,
    completado,
    attemptEstrellas,
    bestEstrellas,
    attemptNota,
    bestNota,
    notaMinima,
    mejorado,
    intentos,
    nivelSiguienteId,
    nuevoTema,
    temaSiguienteDesbloqueado,
  } = state;

  const isLeccion = typeof attemptEstrellas !== "undefined";
  const score = isLeccion ? attemptEstrellas : attemptNota;
  const bestScore = isLeccion ? bestEstrellas : bestNota;
  const maxScore = isLeccion ? 3 : 100;

  // Mensajes motivacionales para lecciones (0–3 estrellas)
  const mensajesLeccion = [
    "No te desanimes, ¡inténtalo de nuevo!",
    "Buen trabajo, pero aún puedes mejorar más.",
    "¡Muy bien!",
    "¡Perfecto!",
  ];
  // Mensajes motivacionales para quizzes ([0,20),[20,40),[40,60),[60,80),[80,100],100)
  const mensajesQuiz = [
    "No te rindas, ¡sigue practicando!",
    "Buen comienzo, pero puedes mejorar.",
    "Vas por buen camino.",
    "¡Bien hecho!",
    "¡Excelente!",
    "¡Estupendo, puntuacion perfecta!",
  ];

  let msg = "";
  if (isLeccion) {
    const idx = Math.min(Math.max(score, 0), 3);
    msg = mensajesLeccion[idx];
  } else {
    const idx = score === 100 ? 5 : Math.floor(score / 20);
    msg = mensajesQuiz[idx];
  }

  // Estados de navegación
  const hasNext = typeof nivelSiguienteId !== "undefined";
  const isEndCourse = completado && !hasNext;

  // Determinar disponibilidad del siguiente
  let nextAvailable = false;
  let nextLocked = false;
  if (hasNext) {
    if (nuevoTema) {
      // era último del tema
      if (temaSiguienteDesbloqueado) nextAvailable = true;
      else nextLocked = true;
    } else {
      // siguiente en mismo tema → siempre accesible
      nextAvailable = true;
    }
  }

  const handleNext = () => {
    if (nextAvailable) {
      navigate(`/levels/${nivelSiguienteId}`);
    }
  };

  return (
    <div className="pb-16 p-4 flex flex-col items-center">
      <h1
        className={`text-2xl font-bold mb-4 ${
          attemptCompletado ? "text-black" : "text-red-600"
        }`}
      >
        {attemptCompletado
          ? `Nivel ${formatNivelId(nivelId)} completado`
          : `Nivel ${formatNivelId(nivelId)} no superado`}
      </h1>

      {/* Puntuaciones */}
      <div className="mb-4 text-lg">
        {isLeccion
          ? `Estrellas: ${score} / ${maxScore}`
          : `Puntuación: ${score} / ${maxScore}`}
      </div>
      {!attemptCompletado && (
        <div className="mb-4 text-sm text-red-700">
          Necesario para superar el nivel:{" "}{isLeccion ? `1 estrella` : `${notaMinima} / ${maxScore}`}
        </div>
      )}
      {intentos > 1 && (
        <div className="mb-4 text-sm text-gray-700">
          Mejor puntuación:{" "}{isLeccion ? `${bestScore} / ${maxScore} estrellas` : `${bestScore} / ${maxScore}`}
        </div>
      )}
      {/* Mejora histórica */}
      {mejorado && (
        <div className="text-green-600 mb-4">¡Has superado tu mejor marca!</div>
      )}

      {/* Mensaje motivacional */}
      <p className="italic mb-6 text-center max-w-md">{msg}</p>

      {/* Controles */}
      <div className="flex space-x-4 mb-2">
        <button
          onClick={() => navigate("/roadmap")}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Roadmap
        </button>
        <button
          onClick={() => navigate(`/levels/${nivelId}`)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Repetir
        </button>
        {nextAvailable && (
          <button
            onClick={handleNext}
            className={!nuevoTema ? "px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" : "px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"}
          >
            Siguiente: {formatNivelId(nivelSiguienteId)}
          </button>
        )}
        {nextLocked && (
          <button
            disabled
            className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
          >
            Siguiente: {formatNivelId(nivelSiguienteId)}
          </button>
        )}
      </div>

      {/* Mensaje si tema bloqueado */}
      {nextLocked && (
        <p className="text-center text-sm text-gray-600 max-w-sm">
          Necesitas conseguir más estrellas en las lecciones de este tema para
          desbloquear el siguiente.
        </p>
      )}

      {/* Fin del curso */}
      {isEndCourse && (
        <p className="text-center text-sm text-gray-600 max-w-sm">
          Ultimo nivel del curso.
        </p>
      )}
    </div>
  );
}
