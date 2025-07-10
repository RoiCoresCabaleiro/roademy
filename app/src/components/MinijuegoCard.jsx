export default function MinijuegoCard({ juego, expandido, onToggle, onAccion }) {
  const base = `mb-4 mt-2 py-2 px-2 inline-flex flex-col items-center justify-center gap-2 rounded-lg border-2 transition-all duration-300 ${
    expandido ? "scale-[1.1]" : ""
  } ${
    juego.desbloqueado
      ? "cursor-pointer bg-purple-100 border-purple-500 text-black"
      : "bg-gray-200 text-gray-500 border-gray-400"
  }`;

  return (
    <div
      className={base}
      onClick={() => {
        if (juego.desbloqueado) onToggle();
      }}
    >
      <span className="text-center text-sm font-medium mt-2">
        {juego.nombre}
      </span>

      <div
        className={`w-full transition-all duration-300 overflow-hidden ${
          expandido && juego.desbloqueado
            ? "max-h-20 opacity-100 scale-100"
            : "max-h-0 opacity-0 scale-95"
        }`}
      >
        <button
          className="w-full bg-purple-600 text-white text-sm rounded px-2 py-2 hover:bg-purple-700"
          onClick={(e) => {
            e.stopPropagation();
            onAccion(juego.id);
          }}
        >
          Jugar
        </button>
      </div>
    </div>
  );
}
