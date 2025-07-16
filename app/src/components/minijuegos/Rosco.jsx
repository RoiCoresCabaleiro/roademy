// src/components/minijuegos/Rosco.jsx
import PropTypes from "prop-types";
import { useMemo, useState, useEffect, useRef } from "react";

const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export default function Rosco({ lettersStatus, current, score, time }) {
  const total = ALPHABET.length;
  const containerRef = useRef(null);

  const [containerSize, setContainerSize] = useState(0);
  const [radius, setRadius] = useState(0);
  const [ballSize, setBallSize] = useState(40); //px

  useEffect(() => {
    const updateSizes = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.parentElement.offsetWidth;
      const maxFromHeight  = window.innerHeight * 0.45;
      const size = Math.min(availableWidth, maxFromHeight);
      setContainerSize(size);

      const maxBall = 40;
      const r = size / 2 - maxBall / 2;
      setRadius(r > 0 ? r : 0);

      const circumference = 2 * Math.PI * Math.max(r, 0);
      const dynamicSize = (circumference / total) * 0.9;
      setBallSize(Math.min(maxBall, dynamicSize));
    };

    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, [total]);

  const letters = useMemo(() => {
    return ALPHABET.map((letter, i) => {
      const status = lettersStatus[i];
      const bg =
        status === "pending" ? "bg-gray-200" :
        status === "correct" ? "bg-green-400" :
        "bg-red-400";
      const ring = i === current ? "ring-2 ring-purple-500" : "";

      const angle = (360 / total) * i - 90;
      const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: `${ballSize}px`,
        height: `${ballSize}px`,
        margin: `-${ballSize / 2}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9999px",
        transform: `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`,
      };

      return { letter, style, bg, ring, key: i };
    });
  }, [lettersStatus, current, total, radius, ballSize]);

  return (
    <div className="space-y-4">
      {/* Puntuación y tiempo */}
      <div className="flex justify-between text-xl font-medium">
        <span>Puntos: {score}</span>
        <span>⏱️: {time}s</span>
      </div>

      {/* Contenedor responsivo */}
      <div
        ref={containerRef}
        className="relative mx-auto" // w-full max-w-md aspect-square
        style={{
          width:  `${containerSize}px`,
          height: `${containerSize}px`
        }}
      >
        {letters.map(({ letter, style, bg, ring, key }) => (
          <div key={key} className={`${bg} ${ring}`} style={style}>
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
}

Rosco.propTypes = {
  lettersStatus: PropTypes.arrayOf(PropTypes.oneOf(["pending", "correct"]))
    .isRequired,
  current: PropTypes.number.isRequired,
  score: PropTypes.number.isRequired,
  time: PropTypes.number.isRequired,
};
