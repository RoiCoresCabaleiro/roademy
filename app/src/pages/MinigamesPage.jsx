import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { minijuegoService } from "../services/minijuegoService";
import ErrorMessage from "../components/ErrorMessage";
import { LoadingScreen } from "../components/Spinner";
import { formatNivelId } from "../utils/formatters";
import {
  PlayIcon,
  LockClosedIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

export default function MinigamesPage() {
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useApi(
    minijuegoService.getMinijuegos
  );
  const minijuegos = data?.minijuegos || [];

  if (isLoading) return <LoadingScreen message="Cargando minijuegos..." />;
  if (error) return <ErrorMessage retry={refetch} />;

  return (
    <div className="min-h-full bg-purple-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Juegos</h1>
          </div>
          <p className="text-gray-900">
            Pon a prueba tus conocimientos con estos divertidos minijuegos
          </p>
        </div>

        {/* Grid de minijuegos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {minijuegos.map((juego) => (
            <div
              key={juego.id}
              className={`
                border-transparent border rounded-xl p-4 shadow-sm transition-all duration-200
                ${
                  juego.desbloqueado
                    ? "bg-white hover:shadow-lg hover:-translate-y-1"
                    : "bg-gray-50 border-gray-200"
                }
              `}
            >
              {juego.desbloqueado ? (
                <div className="space-y-4">
                  {/* Header del juego */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {juego.nombre}
                        </h2>
                      </div>

                      {/* Puntuación */}
                      <div className="flex items-center gap-2 text-sm">
                        {juego.puntuacion !== undefined ? (
                          <>
                            <TrophyIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                            <span className="text-gray-700">
                              Puntuación máxima:{" "}
                              <span className="font-semibold text-purple-700">
                                {juego.puntuacion}
                              </span>
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-500 italic">
                              ¡Sin intentos aún!
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botón de jugar */}
                  <button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    onClick={() => navigate(`/minigames/${juego.id}`)}
                  >
                    <PlayIcon className="w-4 h-4 flex-shrink-0" />
                    Jugar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Header del juego bloqueado */}
                  <div className="flex items-start gap-3">
                    <LockClosedIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-500 mb-2">
                        {juego.nombre}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Completa el nivel{" "}
                        <span className="font-medium">
                          {formatNivelId(juego.nivelDesbloqueo)}
                        </span>{" "}
                        para acceder
                      </p>
                    </div>
                  </div>

                  {/* Botón deshabilitado */}
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 font-medium py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <LockClosedIcon className="w-4 h-4 flex-shrink-0" />
                    Bloqueado
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
