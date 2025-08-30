import { Lock, Play } from "lucide-react"
import GamepadIcon from "./icons/GamepadIcon"
import Button from "./ui/Button"

export default function MinijuegoCard({ juego, expandido, onToggle, onAccion, position = "center" }) {
  const { nombre, desbloqueado } = juego

  const handleClick = () => {
    if (desbloqueado) onToggle()
  }

  const handleJugar = (e) => {
    e.stopPropagation()
    onAccion(juego.id)
  }

  return (
    <div
      className={`
        relative transition-all duration-300 rounded-xl border-2 shadow-soft
        ${expandido ? "w-64 p-4" : "w-32 p-3"}
        ${
          desbloqueado
            ? "border-purple-500 bg-purple-100 cursor-pointer"
            : "border-neutral-300 bg-neutral-100 opacity-60 scale-80"
        }
        ${
          expandido
            ? position === "right"
              ? "transform -translate-x-32 md:-translate-x-16"
              : position === "left"
                ? "md:-translate-x-16"
                : ""
            : ""
        }
      `}
      onClick={handleClick}
    >
      {/* Icono de minijuego */}
      <div className="flex flex-col items-center gap-2">
        {desbloqueado ? (
          <GamepadIcon className="w-6 h-6 text-purple-600" />
        ) : (
          <Lock className="w-6 h-6 text-neutral-400" />
        )}

        <span
          className={`text-center text-sm font-medium ${
            expandido ? "text-base" : ""
          } ${desbloqueado ? "text-neutral-900" : "text-neutral-500"}`}
        >
          {nombre}
        </span>
      </div>

      {/* Contenido expandido */}
      {expandido && desbloqueado && (
        <div className="w-full mt-4">
          <Button onClick={handleJugar} className="w-full flex items-center justify-center gap-2 bg-indigo-600">
            <Play className="w-4 h-4" />
            Jugar
          </Button>
        </div>
      )}
    </div>
  )
}
