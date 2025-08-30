import { useState, useEffect, useMemo } from "react";
import Rosco from "./Rosco";
import QuestionPanel from "./QuestionPanel";
import preguntasData from "../../data/pasapalabra.json";

const TOTAL_TIME = 120; // 2 minutos
const PUNTOS_POR_ACIERTO = 20;

export default function Juego1({ onComplete }) {
  const preguntasArr = useMemo(() => {
    return preguntasData.map(({ letter, questions }) => {
      const idx = Math.floor(Math.random() * questions.length);
      const q = questions[idx];
      return {
        letter,
        hint: q.hint,
        text: q.text,
        options: q.options,
        correct: q.correct,
      };
    });
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lettersStatus, setLettersStatus] = useState(() =>
    Array(preguntasArr.length).fill("pending")
  );
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [disabled, setDisabled] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [didFail, setDidFail] = useState(false);

  // Temporizador
  useEffect(() => {
    if (!hasCompleted) {
      if (timeLeft <= 0) {
        setTimeLeft(0);
        setHasCompleted(true);
        setDisabled(true);
        onComplete(score);
        return;
      }
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, onComplete, score, hasCompleted]);

  if (currentIndex >= preguntasArr.length && !hasCompleted) {
    setHasCompleted(true);
    setDisabled(true);
    onComplete(score);
    return null;
  }

  const handleAnswer = (chosenIndex) => {
    if (disabled || hasCompleted) return;
    const correcta = preguntaActual.correct;

    // Respuesta incorrecta
    if (chosenIndex !== correcta) {
      setDidFail(true);
      setLettersStatus((ss) => {
        const copia = [...ss];
        copia[currentIndex] = "wrong";
        return copia;
      });
      setDisabled(true);
      setHasCompleted(true);
      onComplete(score);
      return;
    }

    // Respuesta correcta
    setScore((s) => s + PUNTOS_POR_ACIERTO);
    setLettersStatus((ss) => {
      const copia = [...ss];
      copia[currentIndex] = "correct";
      return copia;
    });

    // Ultima pregunta?
    if (currentIndex + 1 === preguntasArr.length) {
      setDisabled(true);
      setHasCompleted(true);
      onComplete(score + PUNTOS_POR_ACIERTO + timeLeft);
      setScore((s) => s + timeLeft);
    } else {
      setCurrentIndex((idx) => idx + 1);
    }
  };

  const preguntaActual = preguntasArr[currentIndex];

  return (
    <div className="space-y-2 md:space-y-6">
      <Rosco
        lettersStatus={lettersStatus}
        current={currentIndex}
        score={score}
        time={timeLeft}
      />
      <QuestionPanel
        question={preguntaActual.text}
        hint={preguntaActual.hint}
        options={preguntaActual.options}
        correct={preguntaActual.correct}
        onAnswer={handleAnswer}
        disabled={disabled}
        didFail={didFail}
      />
    </div>
  );
}
