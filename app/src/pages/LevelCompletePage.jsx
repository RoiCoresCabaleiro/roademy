import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatNivelId } from "../utils/formatters";
import {
  TrophyIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  LockClosedIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

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

  // Mensajes motivacionales para lecciones (0–3 estrellas)
  const mensajesLeccion = [
    "No te desanimes, ¡inténtalo de nuevo!",
    "Buen trabajo, pero aún puedes mejorar más.",
    "¡Muy bien!",
    "¡Perfecto!",
  ];
  // Mensajes motivacionales para quizzes ([0,20),[20,40),[40,60),[60,80),[80,100),100)
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

  // Determinar disponibilidad del siguiente nivel
  let nextAvailable = false;
  let nextLocked = false;
  if (hasNext) {
    if (nuevoTema) {
      // último del tema
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

  // Determinar si es primer intento (no mostrar tarjeta de mejor puntuación)
  const isFirstAttempt = intentos === 1;

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            {attemptCompletado ? (
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircleIcon className="w-16 h-16 text-green-600" />
              </div>
            ) : (
              <div className="p-4 bg-red-100 rounded-full">
                <XCircleIcon className="w-16 h-16 text-red-600" />
              </div>
            )}
          </div>

          <h1
            className={`text-3xl font-bold mb-2 ${
              attemptCompletado ? "text-green-700" : "text-red-600"
            }`}
          >
            {attemptCompletado
              ? `¡Nivel ${formatNivelId(nivelId)} completado!`
              : `Nivel ${formatNivelId(nivelId)} no superado`}
          </h1>

          <p className="text-xl text-gray-600 italic max-w-md mx-auto leading-relaxed">
            {msg}
          </p>
        </div>

        {/* Tarjetas de puntuación */}
        <div
          className={`mb-8 ${
            isFirstAttempt
              ? "flex justify-center"
              : "grid grid-cols-1 md:grid-cols-2 gap-6"
          }`}
        >
          {/* Puntuación actual */}
          <div
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 ${
              isFirstAttempt ? "max-w-md" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {isLeccion ? (
                <StarIcon className="w-8 h-8 text-yellow-500" />
              ) : (
                <TrophyIcon className="w-8 h-8 text-blue-500" />
              )}
              <h3 className="text-lg font-semibold text-gray-800">
                Tu Resultado
              </h3>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {score}
                {isLeccion && (
                  <span className="text-lg text-gray-600 ml-1">
                    {score === 1 ? "estrella" : "estrellas"}
                  </span>
                )}
              </div>
              {!attemptCompletado && (
                <div className="text-sm text-red-600 bg-red-50 rounded-lg p-2 mb-3">
                  Necesario: {isLeccion ? "1 estrella" : `${notaMinima} puntos`}
                </div>
              )}
              <div className="text-sm text-gray-600">
                {intentos === 1 ? "Primer intento" : `Intento ${intentos}`}
              </div>
            </div>
          </div>

          {/* Mejor puntuación - solo si no es primer intento */}
          {!isFirstAttempt && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrophyIcon className="w-8 h-8 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Mejor Puntuación
                </h3>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {bestScore}
                  {isLeccion && (
                    <span className="text-lg text-gray-600 ml-1">
                      {bestScore === 1 ? "estrella" : "estrellas"}
                    </span>
                  )}
                </div>
                {mejorado && (
                  <div className="flex items-center justify-center gap-1 bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-medium mt-3">
                    <SparklesIcon className="w-4 h-4" />
                    ¡Nuevo récord!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Roadmap */}
            <button
              onClick={() => navigate("/roadmap")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <MapIcon className="w-5 h-5" />
              Roadmap
            </button>

            {/* Reintentar */}
            <button
              onClick={() => navigate(`/levels/${nivelId}`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Reintentar
            </button>

            {/* Siguiente nivel */}
            {nextAvailable && (
              <button
                onClick={handleNext}
                className={`flex items-center justify-center gap-2 px-6 py-3 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 ${
                  nuevoTema
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                }`}
              >
                Siguiente: {formatNivelId(nivelSiguienteId)}
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            )}

            {/* Siguiente bloqueado */}
            {nextLocked && (
              <button
                disabled
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 font-medium rounded-xl cursor-not-allowed"
              >
                <LockClosedIcon className="w-5 h-5" />
                Siguiente: {formatNivelId(nivelSiguienteId)}
              </button>
            )}
          </div>

          {/* Mensajes informativos */}
          {nextLocked && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-amber-800 text-sm leading-relaxed">
                <strong>Tema bloqueado:</strong> Necesitas conseguir más
                estrellas en las lecciones de este tema para desbloquear el
                siguiente.
              </p>
            </div>
          )}

          {isEndCourse && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrophyIcon className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-green-800">
                  ¡Felicidades!
                </span>
              </div>
              <p className="text-green-700 text-sm">
                Has completado el último nivel del curso. ¡Excelente trabajo!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
