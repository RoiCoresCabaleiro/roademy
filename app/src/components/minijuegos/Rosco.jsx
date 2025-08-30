import PropTypes from "prop-types";
import { useMemo, useState, useEffect, useRef } from "react";
import { TrophyIcon, ClockIcon } from "@heroicons/react/24/outline";

const ALPHABET = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export default function Rosco({ lettersStatus, current, score, time }) {
  const total = ALPHABET.length;
  const containerRef = useRef(null);

  const [containerSize, setContainerSize] = useState(0);
  const [radius, setRadius] = useState(0);
  const [ballSize, setBallSize] = useState(40);

  useEffect(() => {
    const updateSizes = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.parentElement.offsetWidth;
      const maxFromHeight = window.innerHeight * 0.45;
      const size = Math.min(availableWidth, maxFromHeight);
      setContainerSize(size);

      const maxBall = 45;
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
      const isCurrent = i === current;

      let bg, textColor, shadow, ring;

      if (status === "pending") {
        bg = isCurrent
          ? "bg-gradient-to-br from-purple-500 to-purple-600"
          : "bg-gradient-to-br from-gray-300 to-gray-400";
        textColor = isCurrent ? "text-white" : "text-gray-700";
        shadow = isCurrent ? "shadow-lg shadow-purple-300" : "shadow-md";
        ring = isCurrent ? "ring-4 ring-purple-300 ring-opacity-50" : "";
      } else if (status === "correct") {
        bg = "bg-gradient-to-br from-green-500 to-green-600";
        textColor = "text-white";
        shadow = "shadow-lg shadow-green-300";
        ring = "";
      } else {
        bg = "bg-gradient-to-br from-red-500 to-red-600";
        textColor = "text-white";
        shadow = "shadow-lg shadow-red-300";
        ring = "";
      }

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
        transition: "all 0.3s ease",
      };

      return { letter, style, bg, textColor, shadow, ring, key: i };
    });
  }, [lettersStatus, current, total, radius, ballSize]);

  return (
    <div className="space-y-2 md:space-y-6">
      {/* Puntos y Tiempo */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg">
              <TrophyIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Puntos</p>
              <p className="text-xl font-bold text-gray-800">{score}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                time <= 30
                  ? "bg-gradient-to-br from-red-400 to-red-500"
                  : "bg-gradient-to-br from-blue-400 to-blue-500"
              }`}
            >
              <ClockIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Tiempo</p>
              <p
                className={`text-xl font-bold ${
                  time <= 30 ? "text-red-600" : "text-gray-800"
                }`}
              >
                {time}s
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rosco */}
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="relative"
          style={{
            width: `${containerSize}px`,
            height: `${containerSize}px`,
          }}
        >
          {letters.map(
            ({ letter, style, bg, textColor, shadow, ring, key }) => (
              <div
                key={key}
                className={`${bg} ${textColor} ${shadow} ${ring} font-bold text-lg border-2 border-white/50`}
                style={style}
              >
                {letter}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

Rosco.propTypes = {
  lettersStatus: PropTypes.arrayOf(
    PropTypes.oneOf(["pending", "correct", "wrong"])
  ).isRequired,
  current: PropTypes.number.isRequired,
  score: PropTypes.number.isRequired,
  time: PropTypes.number.isRequired,
};
