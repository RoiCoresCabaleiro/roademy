// app/src/pages/MinigamesPage.jsx

import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { minijuegoService } from "../services/minijuegoService";
import ErrorMessage from "../components/ErrorMessage";
import { formatNivelId } from "../utils/formatters";

export default function MinigamesPage() {
  const navigate = useNavigate();

  const { data, loading, error, reload } = useApi(
    minijuegoService.getMinijuegos
  );
  const minijuegos = data?.minijuegos || [];

  if (loading) return <p className="p-4 text-center">Cargando minijuegos...</p>;
  if (error) return <ErrorMessage retry={reload} />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">Juegos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {minijuegos.map((juego) => (
          <div
            key={juego.id}
            className={`border rounded-md p-4 shadow-sm transition duration-200 ${
              juego.desbloqueado
                ? "bg-white hover:shadow-md"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {juego.desbloqueado ? (
              <div className="flex items-center justify-between">
                {/* Izquierda: nombre + puntuación */}
                <div>
                  <h2 className="text-lg font-semibold">{juego.nombre}</h2>
                  {juego.puntuacion !== undefined ? (
                    <p className="text-sm text-gray-700">
                      Máxima:{" "}
                      <span className="font-semibold">{juego.puntuacion}</span>
                    </p>
                  ) : (
                    <p className="text-sm italic text-gray-500">
                      ¡Sin intentos aún!
                    </p>
                  )}
                </div>

                {/* Derecha: botón */}
                <button
                  className="px-4 py-4 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                  onClick={() => navigate(`/minigames/${juego.id}`)}
                >
                  Jugar
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-2">{juego.nombre}</h2>
                <p className="text-sm italic">
                  Bloqueado: completa el nivel{" "}
                  {formatNivelId(juego.nivelDesbloqueo)} para acceder
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
