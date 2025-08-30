// src/components/minijuegos/CompletionModal.jsx

import { useNavigate } from "react-router-dom";
import {
  TrophyIcon,
  ArrowPathIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

export default function CompletionModal({
  open,
  onClose,
  puntuacion,
  mejorPuntuacion,
  mejorado,
}) {
  const navigate = useNavigate();

  return (
    <div
      className={`
        fixed inset-0 bg-black/50 flex items-center justify-center z-50
        transition-opacity duration-500
        ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icono de trofeo */}
        <div className="mb-6">
          <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          ¡Juego terminado!
        </h2>

        {/* Puntuaciones */}
        <div className="space-y-4 mb-8">
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium mb-1">
              Tu puntuación
            </p>
            <p className="text-2xl font-bold text-purple-700">{puntuacion}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium mb-1">
              Mejor puntuación
            </p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-xl font-bold text-gray-700">
                {mejorPuntuacion}
              </p>
              {mejorado && puntuacion > 0 && (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  ¡Nuevo récord!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              window.location.reload();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Jugar de nuevo
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/minigames");
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <ListBulletIcon className="w-4 h-4" />
            Lista de juegos
          </button>
        </div>
      </div>
    </div>
  );
}
