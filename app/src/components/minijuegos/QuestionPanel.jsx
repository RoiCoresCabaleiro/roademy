// src/components/minijuegos/QuestionPanel.jsx
import PropTypes from "prop-types";

export default function QuestionPanel({ hint, question, options, correct, onAnswer, disabled, didFail }) {
  return (
    <div className="bg-white p-4 rounded shadow space-y-4">
      <p className="text-sm italic text-gray-600">{hint}</p>
      <p className="text-lg">{question}</p>
      <div className="flex flex-col sm:flex-row gap-4">
        {options.map((text, i) => {
          // Finalización por tiempo o por completar todas las preguntas
          if (!didFail) {
            return (
              <button
                key={i}
                type="button"
                onClick={() => !disabled && onAnswer(i)}
                className="flex-1 px-4 py-2  text-white font-semibold rounded bg-purple-600 hover:bg-purple-700"
                disabled={disabled}
              >
                {text}
              </button>
            );
          }
          // Finalización por respuesta incorrecta
          const isCorrect = i === correct;
          const bgClass = isCorrect
            ? "bg-green-400 text-white"
            : "bg-red-400 text-white";
          return (
            <button
              key={i}
              type="button"
              disabled
              className={`flex-1 px-4 py-2 rounded ${bgClass}`}
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

QuestionPanel.propTypes = {
  hint: PropTypes.string.isRequired,
  question: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  correct: PropTypes.number.isRequired,
  onAnswer: PropTypes.func.isRequired,
  disabled:  PropTypes.bool,
};