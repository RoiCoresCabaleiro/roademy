export default function TemaBanner({ titulo, desbloqueado, estrellas, totEstrellas, completados, total }) {
  return (
    <div className="sticky top-0 bg-white p-4 border-b z-10">
      <h2 className="text-lg font-bold">{titulo}</h2>
      {desbloqueado && (
        <p className="text-sm">
          ⭐ {estrellas}/{totEstrellas} &nbsp; | &nbsp;
          📖 {completados}/{total}
        </p>
      )}
    </div>
  );
}
