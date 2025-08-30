import { useMemo, useState } from "react";
import { TrophyIcon } from "@heroicons/react/24/outline";
import señalesData from "../../data/senales.json";

const PUNTOS = 100;
const FEEDBACK_MS = 2000;

export default function Juego3({ onComplete }) {
  // 5 señales aleatorias
  const slides = useMemo(() => {
    const shuffled = [...señalesData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, []);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selected, setSelected] = useState(null);

  const { image, name: correctName } = slides[idx];

  // Generar 3 opciones: correcta + 2 al azar, barajadas
  const opciones = useMemo(() => {
    const otras = señalesData
      .map((s) => s.name)
      .filter((n) => n !== correctName)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    return [correctName, ...otras].sort(() => Math.random() - 0.5);
  }, [correctName]);

  const avanzar = (nuevoScore) => {
    if (idx + 1 === slides.length) {
      onComplete(nuevoScore);
    } else {
      setIdx((i) => i + 1);
      setDisabled(false);
      setFeedback(null);
      setSelected(null);
    }
  };

  const handleAnswer = (opt) => {
    if (disabled) return;
    setDisabled(true);
    setSelected(opt);

    const acierto = opt === correctName;
    if (acierto) {
      const nuevo = score + PUNTOS;
      setScore(nuevo);
      setFeedback("¡Acertaste!");
      setTimeout(() => avanzar(nuevo), FEEDBACK_MS);
    } else {
      setFeedback("¡Fallaste!");
      setTimeout(() => avanzar(score), FEEDBACK_MS);
    }
  };

  return (
    <div className="space-y-6">
      {/* Puntuacion */}
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
          ¿Qué señal de tráfico es esta?
        </h2>
      </div>

      {/* Imagenes */}
      <div className="text-center">
        <div className="relative inline-block">
          <img
            src={image || "/placeholder.svg"}
            alt={correctName}
            className="mx-auto w-full h-auto max-h-[400px] object-contain rounded-xl shadow-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl pointer-events-none"></div>

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
      </div>

      {/* Opciones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {opciones.map((opt) => {
          let buttonClass =
            "group relative px-6 py-4 rounded-xl font-semibold text-white shadow-lg transform transition-all duration-200 w-full";

          if (!disabled) {
            buttonClass +=
              " bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:scale-105 hover:shadow-xl";
          } else if (feedback === "¡Acertaste!") {
            buttonClass +=
              opt === selected
                ? " bg-gradient-to-r from-green-500 to-green-600 scale-105"
                : " bg-gray-300 text-gray-600 cursor-not-allowed";
          } else {
            buttonClass +=
              opt === correctName
                ? " bg-gradient-to-r from-green-500 to-green-600 scale-105"
                : " bg-gradient-to-r from-red-500 to-red-600";
          }

          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={disabled}
              className={buttonClass}
            >
              <span className="relative z-10">{opt}</span>
              {!disabled && (
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
