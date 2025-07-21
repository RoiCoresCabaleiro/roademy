// src/components/minijuegos/Juego2.jsx

import { useMemo, useState } from "react";
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
    <div className="p-4 max-w-xl mx-auto space-y-4">
      {/* Puntuación */}
      <p className="text-center text-xl font-semibold">Puntos: {score}</p>

      {/* Enunciado */}
      <h2 className="text-lg font-semibold text-center">{headerText}</h2>

      {/* Contenido */}
      {slide.type === 1 ? (
        <div className="space-y-4 text-center">
          <img
            src={slide.image}
            alt=""
            className="mx-auto w-full h-auto max-h-[370px] object-contain"
          />
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleType1(true)}
              disabled={disabled}
              className={`px-4 py-2 rounded ${
                disabled
                  ? "opacity-50  bg-green-600 text-white"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              Correcta
            </button>
            <button
              onClick={() => handleType1(false)}
              disabled={disabled}
              className={`px-4 py-2 rounded ${
                disabled
                  ? "opacity-50 bg-red-600 text-white"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              Incorrecta
            </button>
          </div>
        </div>
      ) : (
        <div className="relative mx-auto max-w-lg">
          <img
            src={slide.image}
            alt=""
            className="mx-auto w-full h-auto max-h-[370px] object-contain"
            onClick={(e) => {
              if (disabled) return;
              const { left, top, width, height } =
                e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - left) / width) * 100;
              const y = ((e.clientY - top) / height) * 100;
              handleType2(x, y);
            }}
          />
          {/* DEBUG: región clicable 
          <div
            className="absolute border-2 border-red-500 pointer-events-none"
            style={{
              left: `${slide.region.x}%`,
              top: `${slide.region.y}%`,
              width: `${slide.region.w}%`,
              height: `${slide.region.h}%`,
            }}
          />
          */}
        </div>
      )}

      {/* Feedback */}
      {feedback == "¡Acertaste!" ? (
        <div className="text-center text-2xl text-green-600 font-bold animate-pulse">
          {feedback}
        </div>
      ) : (
        <div className="text-center text-2xl text-red-600 font-bold animate-pulse">
          {feedback}
        </div>
      )}
    </div>
  );
}
