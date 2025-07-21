// src/components/minijuegos/Juego3.jsx

import { useMemo, useState } from "react";
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
    <div className="p-4 max-w-xl mx-auto space-y-4">
      {/* Puntuación */}
      <p className="text-center text-xl font-semibold">Puntos: {score}</p>

      {/* Imagen */}
      <div className="text-center">
        <img
          src={image}
          alt={correctName}
          className="mx-auto w-full h-auto max-h-[370px] object-contain"
        />
      </div>

      {/* Opciones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {opciones.map((opt) => {
          let base = "px-4 py-2 rounded text-white w-full";
          if (!disabled) {
            base += " bg-purple-600 hover:bg-purple-700";
          } else if (feedback === "¡Acertaste!") {
            // acierto: solo la seleccionada en verde
            base +=
              opt === selected
                ? " bg-green-600"
                : " bg-gray-200 text-gray-600 cursor-default";
          } else {
            // fallo: correcta verde, todas las demás rojas
            base += opt === correctName ? " bg-green-600" : " bg-red-600";
          }

          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={disabled}
              className={base}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`
            text-center text-2xl font-bold animate-pulse
            ${feedback === "¡Acertaste!" ? "text-green-600" : "text-red-600"}
          `}
        >
          {feedback}
        </div>
      )}
    </div>
  );
}
