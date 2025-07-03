export default function TemaBanner({ titulo, desbloqueado, estrellas, estrellasNec, estrellasTot, completados, total }) {
  const temaAcabado = desbloqueado && completados >= total && estrellas >= estrellasTot;
  return (
    <div className="sticky top-0 bg-white p-4 border-b z-10">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-bold">{titulo}</h2>
        {(desbloqueado && !temaAcabado) ? (
          <p className={completados < total ? 'text-sm text-red-500' : 'text-sm text-green-500'}>
            📖 {completados}/{total}
          </p>
        ) : (
          <p className="text-sm">✅</p>
        )}
      </div>
      {(desbloqueado && !temaAcabado) && (
        <div className="relative w-full bg-gray-200 rounded-full h-4 mt-2 overflow-hidden">
            {(estrellas < estrellasTot) ? (
              <>
                <div
                  className="bg-blue-500 h-4"
                  style={{ width: `${ (estrellas / estrellasTot) * 100 }%` }}
                />
                <div
                  className={estrellas < estrellasNec ? "absolute top-0 h-4 w-2 bg-red-500" : "absolute top-0 h-4 w-2 bg-green-500"}
                  style={{ left: `${ (estrellasNec / estrellasTot) * 100 }%` }}
                />
              </>
            ) : (
              <div
                className="bg-yellow-500 h-4"
              />
            )}
              
        </div>
      )}
    </div>
  );
}
