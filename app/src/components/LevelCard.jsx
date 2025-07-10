export default function LevelCard({ nivel, nivelActual, temaOrden, nivelOrden, expandido, onToggle, onAccion }) {
  const { tipo, completado, estrellas } = nivel;
  const displayOrder = `${temaOrden}.${nivelOrden}`;

  // Estilo base para la tarjeta de nivel
  let base = 'w-20 h-20 m-2 flex items-center justify-center rounded-lg border-2 p-2';

  // Estilo de nivel actual
  if (nivel.nivelId === nivelActual) {
    base += ' border-4 border-black cursor-pointer';
  }

  // Estilo de no completado
  if (!completado && !(nivel.nivelId === nivelActual)) base += ' opacity-50 scale-80';

  // Estilo de leccion completada segun estrellas
  if (completado && tipo === 'leccion') {
    const color = estrellas === 3 ? 'border-green-500' : estrellas === 2 ? 'border-orange-500' : 'border-red-500';
    base += ` cursor-pointer border-4 ${color}`;
  }

  // Estilo de quiz completado
  if (completado && tipo === 'quiz') {
    base += ' cursor-pointer border-4 border-green-500';
  }

  return (
    <div
      className={`${base} flex-col gap-2 transition-all duration-300 ${
        expandido ? 'w-28 h-28' : ''
      }`}
      onClick={() => {
        if (nivel.nivelId === nivelActual || completado) onToggle();
      }}
    >
      <span className="font-medium">
        {tipo === 'leccion' ? 'L' : 'Q'} {displayOrder}
      </span>

      {expandido && (
        <button
          className="w-full bg-blue-600 text-white text-sm rounded px-2 py-2 hover:bg-blue-700"
          onClick={(e) => {
            e.stopPropagation();
            onAccion(nivel.nivelId);
          }}
        >
          {nivel.enCurso ? 'Continuar' : 'Iniciar'}
        </button>
      )}
    </div>
  );
}