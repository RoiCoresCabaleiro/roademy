export default function LevelCard({ nivel, temaOrden, nivelOrden, onClick }) {
  const { tipo, completado, bestEstrellas } = nivel;   ////////////////////////////////////////// bestNota
  const displayOrder = `${temaOrden}.${nivelOrden}`;

  // Estilo base para la tarjeta de nivel
  let base = 'w-20 h-20 m-2 flex items-center justify-center rounded-lg cursor-pointer';

  // Estilo de no completado
  if (!completado) base += ' opacity-50 scale-90';

  // Estilo de leccion completada segun estrellas
  if (completado && tipo === 'leccion') {
    const estrellas = bestEstrellas;
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