// src/components/minijuegos/CompletionModal.jsx

export default function CompletionModal({
  open,
  onClose,
  puntuacion,
  mejorPuntuacion,
  mejorado
}) {
  return (
    <div
      className={`
        fixed inset-0 bg-black/50 flex items-center justify-center z-50
        transition-opacity duration-500
        ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full text-center"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">¡Juego terminado!</h2>

        <p className="text-xl mb-2">
          Tu puntuación: <span className="font-semibold">{puntuacion}</span>
        </p>
        <p className="text-lg mb-4">
          Mejor puntuación: <span className="font-semibold">{mejorPuntuacion}</span>
          {(mejorado && puntuacion > 0) && (
            <span className="ml-2 text-green-600 font-semibold">
              ¡Nuevo récord!
            </span>
          )}
        </p>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              window.location.reload();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Jugar de nuevo
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              window.location.href = '/minigames';
            }}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Lista de minijuegos
          </button>
        </div>
      </div>
    </div>
  );
}