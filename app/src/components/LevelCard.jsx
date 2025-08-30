import { Star, Play, RotateCcw, BookOpen, Lock } from "lucide-react"
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline"
import Button from "./ui/Button"

export default function LevelCard({
  nivel,
  nivelActual,
  temaOrden,
  nivelOrden,
  expandido,
  onToggle,
  onAccion,
  position = "center",
}) {
  const { tipo, completado, estrellas, nota, enCurso, nivelId } = nivel
  const displayOrder = `${temaOrden}.${nivelOrden}`
  const esActual = nivelId === nivelActual
  const esLeccion = tipo === "leccion"
  const esQuiz = tipo === "quiz"

  // Determinar si el nivel es accesible
  const esAccesible = esActual || completado

  // Determinar el estado visual
  const getEstadoVisual = () => {
    if (esActual) return "actual"
    if (completado) return "completado"
    if (!esAccesible) return "bloqueado"
    return "disponible"
  }

  const estadoVisual = getEstadoVisual()

  // Estilos según el estado
  const getEstilos = () => {
    const base = "relative transition-all duration-300 rounded-xl border-2 shadow-soft"

    switch (estadoVisual) {
      case "actual":
        return `${base} border-blue-400 bg-blue-50 scale-120`
      case "completado":
        if (esLeccion) {
          if (estrellas === 3) {
            return `${base} border-success-400 bg-success-100 cursor-pointer`
          } else if (estrellas === 2) {
            return `${base} border-amber-400 bg-amber-100 cursor-pointer`
          } else {
            return `${base} border-error-400 bg-error-100 cursor-pointer`
          }
        } else {
          return `${base} border-success-400 bg-success-100 cursor-pointer`
        }
      case "bloqueado":
        return `${base} border-neutral-300 bg-neutral-100 opacity-60 scale-80`
      default:
        return `${base} border-neutral-300 bg-white cursor-pointer`
    }
  }

  // Icono según el tipo y estado
  const getIcono = () => {
    if (estadoVisual === "bloqueado") return <Lock className="w-5 h-5 text-neutral-400" />
    if (esLeccion) return <BookOpen className="w-5 h-5" />
    if (esQuiz) return <ClipboardDocumentCheckIcon className="w-5 h-5" />
    return null
  }

  // Texto del botón de acción
  const getTextoAccion = () => {
    if (enCurso) return "Continuar"
    if (completado) return "Repetir"
    return "Iniciar"
  }

  // Icono del botón de acción
  const getIconoAccion = () => {
    if (enCurso || !completado) return <Play className="w-4 h-4" />
    return <RotateCcw className="w-4 h-4" />
  }

  const handleClick = () => {
    if (esAccesible) onToggle()
  }

  const handleAccion = (e) => {
    e.stopPropagation()
    onAccion(nivelId)
  }

  return (
    <div
      className={`${getEstilos()} ${
        expandido ? "w-64 p-4" : "w-20 h-20 p-2"
      } flex flex-col items-center justify-center gap-2 ${
        expandido
          ? position === "right"
            ? "transform -translate-x-44 md:-translate-x-22"
            : position === "left"
              ? "md:-translate-x-22"
              : ""
          : ""
      } ${expandido ? "transform-gpu transition-all duration-300" : ""}`}
      onClick={handleClick}
    >
      {/* Contenido principal */}
      <div className="flex flex-col items-center gap-1">
        {getIcono()}
        <span className={`font-bold text-sm ${expandido ? "text-base" : ""}`}>
          {esLeccion && expandido ? "Lección" : esQuiz && expandido ? "Cuestionario" : ""} {displayOrder}
        </span>
      </div>

      {/* Indicadores de progreso */}
      {completado && !expandido && (
        <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2">
          {esLeccion ? (
            <div className="flex gap-0.5 bg-white px-1 rounded">
              {[1, 2, 3].map((i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i <= estrellas ? "text-yellow-400 fill-current" : "text-neutral-400"}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-xs font-bold text-success-600 bg-success-100 px-1 rounded">{nota}%</div>
          )}
        </div>
      )}

      {/* Contenido expandido */}
      {expandido && (
        <div className="w-full space-y-3 mt-2">
          {/* Información detallada */}
          <div className="text-center">
            {completado &&
              (esLeccion ? (
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm text-neutral-600">Estrellas:</span>
                  <div className="flex gap-0.5 bg-white px-1 rounded">
                    {[1, 2, 3].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i <= estrellas ? "text-yellow-400 fill-current" : "text-neutral-400"}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-neutral-600">
                  Mejor nota: <span className="font-bold text-success-600">{nota}%</span>
                </div>
              ))}
            {enCurso && (
              <div className={`text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded ${completado && "mt-2"}`}>
                En progreso
              </div>
            )}
          </div>

          {/* Botón de acción */}
          {esAccesible && (
            <Button
              onClick={handleAccion}
              className="w-full flex items-center justify-center gap-2"
              variant="primary"
            >
              {getIconoAccion()}
              {getTextoAccion()}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
