export default function LevelCard({ nivel, nivelActual, temaOrden, nivelOrden, onClick }) {
  const { tipo, completado, estrellas } = nivel;
  const displayOrder = `${temaOrden}.${nivelOrden}`;

  // Estilo base para la tarjeta de nivel
  let base = 'w-20 h-20 m-2 flex items-center justify-center rounded-lg cursor-pointer';

  // Estilo de nivel actual
  if (nivel.nivelId === nivelActual) {
    base += ' border-4 border-black';
  }

  // Estilo de no completado
  if (!completado && !(nivel.nivelId === nivelActual)) base += ' opacity-50 scale-90';

  // Estilo de leccion completada segun estrellas
  if (completado && tipo === 'leccion') {
    const color = estrellas === 3 ? 'border-green-500' : estrellas === 2 ? 'border-orange-500' : 'border-red-500';
    base += ` border-4 ${color}`;
  }

  // Estilo de quiz completado
  if (completado && tipo === 'quiz') {
    base += ' border-4 border-green-500';
  }

  return (
    <div className={base} onClick={() => onClick(nivel.nivelId)}>
      <span className="text-sm font-medium">
        {tipo === 'leccion' ? 'L' : 'Q'} {displayOrder}
      </span>
    </div>
  );
}