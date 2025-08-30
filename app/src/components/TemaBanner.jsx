import { Star, Lock, CheckCircle, BookOpen } from "lucide-react"

export default function TemaBanner({
  titulo,
  desbloqueado,
  estrellas,
  estrellasNec,
  estrellasTot,
  completados,
  total,
}) {
  const temaCompleto = completados >= total && estrellas >= estrellasTot
  const progresoEstrellas = estrellasTot > 0 ? (estrellas / estrellasTot) * 100 : 0
  const umbralAlcanzado = estrellas >= estrellasNec

  if (!desbloqueado) {
    return (
      <div className="w-full flex justify-center bg-primary-50 px-0 md:px-4">
        <div className="w-full max-w-4xl mx-auto bg-neutral-100 border-b border-neutral-200 shadow-soft md:rounded-lg">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-200 rounded-lg">
                <Lock className="w-5 h-5 text-neutral-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-neutral-500">{titulo}</h2>
                <p className="text-sm text-neutral-400">Tema bloqueado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center bg-primary-50 px-0 md:px-4">
      <div className="w-full max-w-4xl mx-auto bg-white border-b border-neutral-200 shadow-soft md:rounded-lg">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${temaCompleto ? "bg-success-100" : "bg-primary-100"}`}>
              {temaCompleto ? (
                <BookOpen className="w-5 h-5 text-success-600" />
              ) : (
                <BookOpen className="w-5 h-5 text-primary-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-neutral-900">{titulo}</h2>
              <div className="flex items-center gap-4 text-sm">
                <span
                  className={`flex items-center gap-1 ${completados === total ? "text-success-600" : "text-neutral-600"}`}
                >
                  <BookOpen className="w-4 h-4" />
                  {completados}/{total} niveles
                </span>
                <span
                  className={`flex items-center gap-1 ${umbralAlcanzado ? "text-success-600" : "text-neutral-600"}`}
                >
                  <Star className="w-4 h-4" />
                  {estrellas}/{estrellasNec} estrellas
                </span>
              </div>
            </div>
            {temaCompleto && (
              <div className="text-success-600">
                <CheckCircle className="w-6 h-6" />
              </div>
            )}
          </div>

          {!temaCompleto && (
            <div className="space-y-2 mt-3">
              {/* Progreso de estrellas */}
              <div>
                <div className="flex justify-between text-xs text-neutral-600 mb-1">
                  <span>Estrellas totales</span>
                  <span>
                    {estrellas}/{estrellasTot}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2 relative">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      umbralAlcanzado ? "bg-success-500" : "bg-primary-500"
                    }`}
                    style={{ width: `${progresoEstrellas}%` }}
                  />
                  {/* Marcador del umbral necesario */}
                  <div
                    className="absolute top-0 h-2 w-1 bg-neutral-700 rounded-full"
                    style={{ left: `${(estrellasNec / estrellasTot) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
