import PropTypes from "prop-types";

export default function QuestionPanel({
  hint,
  question,
  options,
  correct,
  onAnswer,
  disabled,
  didFail,
}) {
  return (
    <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100 space-y-2 md:space-y-4">
      {/* Pista */}
      <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
        <p className="text-sm italic text-purple-700 font-medium">{hint}</p>
      </div>

      {/* Pregunta */}
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-800 leading-relaxed">
          {question}
        </p>
      </div>

      {/* Opciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((text, i) => {
          // Finalización por tiempo o por completar todas las preguntas
          if (!didFail) {
            return (
              <button
                key={i}
                type="button"
                onClick={() => !disabled && onAnswer(i)}
                className="group relative px-6 py-4 text-white font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={disabled}
              >
                <span className="relative z-10">{text}</span>
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            );
          }

          // Finalización por respuesta incorrecta
          const isCorrect = i === correct;
          const bgClass = isCorrect
            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-200"
            : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-200";

          return (
            <button
              key={i}
              type="button"
              disabled
              className={`px-6 py-4 rounded-xl font-semibold shadow-lg ${bgClass} cursor-not-allowed`}
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
  disabled: PropTypes.bool,
  didFail: PropTypes.bool,
};
