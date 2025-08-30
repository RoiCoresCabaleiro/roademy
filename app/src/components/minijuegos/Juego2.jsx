import { useMemo, useState } from "react";
import { TrophyIcon } from "@heroicons/react/24/outline";
import conductasData from "../../data/conductas.json";

const PUNTOS_POR_ACIERTO = 100;
const FEEDBACK_DURACION_MS = 2000;

export default function Juego2({ onComplete }) {
  // 5 diapositivas aleatorias
  const slides = useMemo(() => {
    const shuffled = [...conductasData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, []);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const slide = slides[idx];

  const headerText =
    slide.type === 1
      ? "Indica si la situación de la imagen es correcta o incorrecta"
      : "Haz click sobre la situación incorrecta";

  const avanzar = (nuevoScore) => {
    if (idx + 1 === slides.length) {
      onComplete(nuevoScore);
    } else {
      setIdx((i) => i + 1);
      setDisabled(false);
      setFeedback(null);
    }
  };

  const handleRespuesta = (esCorrecta) => {
    if (disabled) return;
    setDisabled(true);

    if (esCorrecta) {
      const nuevo = score + PUNTOS_POR_ACIERTO;
      setScore(nuevo);
      setFeedback("¡Acertaste!");
      setTimeout(() => avanzar(nuevo), FEEDBACK_DURACION_MS);
    } else {
      setFeedback("¡Fallaste!");
      setTimeout(() => avanzar(score), FEEDBACK_DURACION_MS);
    }
  };

  const handleType1 = (answer) => {
    handleRespuesta(answer === slide.isCorrect);
  };

  const handleType2 = (clickX, clickY) => {
    if (disabled) return;
    const { x, y, w, h } = slide.region;
    const hit =
      clickX >= x && clickX <= x + w && clickY >= y && clickY <= y + h;
    handleRespuesta(hit);
  };

  return (
    <div className="space-y-6">
      {/* Puntuación */}
      <div className="flex justify-center">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100 w-fit">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg">
              <TrophyIcon className="h-5 w-5 text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Puntuación</p>
              <p className="text-2xl font-bold text-gray-800">{score}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {headerText}
        </h2>
      </div>

      {/* Imágenes de 2 tipos */}
      {slide.type === 1 ? (
        <div className="space-y-6 text-center">
          <div className="relative inline-block">
            <img
              src={slide.image || "/placeholder.svg"}
              alt=""
              className="w-full h-auto max-h-[400px] object-cover rounded-xl shadow-lg"
            />

            {/* Feedback superpuesto */}
            {feedback && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`px-6 py-3 rounded-xl text-2xl font-bold shadow-lg transform animate-pulse ${
                    feedback === "¡Acertaste!"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  }`}
                >
                  {feedback}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleType1(true)}
              disabled={disabled}
              className={`group relative px-8 py-4 rounded-xl font-semibold text-white shadow-lg transform transition-all duration-200 ${
                disabled
                  ? "opacity-50 bg-gradient-to-r from-green-500 to-green-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 hover:shadow-xl"
              }`}
            >
              <span className="relative z-10">✓ Correcta</span>
              {!disabled && (
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              )}
            </button>
            <button
              onClick={() => handleType1(false)}
              disabled={disabled}
              className={`group relative px-8 py-4 rounded-xl font-semibold text-white shadow-lg transform transition-all duration-200 ${
                disabled
                  ? "opacity-50 bg-gradient-to-r from-red-500 to-red-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-105 hover:shadow-xl"
              }`}
            >
              <span className="relative z-10">✗ Incorrecta</span>
              {!disabled && (
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="relative inline-block mx-auto max-w-lg">
            <img
              src={slide.image || "/placeholder.svg"}
              alt=""
              className={`w-full h-auto max-h-[400px] object-cover rounded-xl shadow-lg transition-all duration-200 ${
                disabled ? "opacity-75" : "hover:shadow-xl cursor-crosshair"
              }`}
              onClick={(e) => {
                if (disabled) return;
                const { left, top, width, height } =
                  e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - left) / width) * 100;
                const y = ((e.clientY - top) / height) * 100;
                handleType2(x, y);
              }}
            />

            {/* Feedback superpuesto */}
            {feedback && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`px-6 py-3 rounded-xl text-2xl font-bold shadow-lg transform animate-pulse ${
                    feedback === "¡Acertaste!"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  }`}
                >
                  {feedback}
                </div>
              </div>
            )}

            {!disabled && (
              <div className="absolute inset-0 bg-purple-500/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center justify-center">
                <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-purple-700">
                  Haz click en la situación incorrecta
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
