// app/src/pages/MinigamesPage.jsx

import { useApi } from '../hooks/useApi';
import { minijuegoService } from "../services/minijuegoService";
import ErrorMessage from "../components/ErrorMessage";

export default function MinigamesPage() {
  const {
    data,
    loading,
    error,
    reload,
  } = useApi(minijuegoService.getMinijuegos);
  const minijuegos = data?.minijuegos || [];

  if (loading) return <p className="p-4 text-center">Cargando minijuegos...</p>;
  if (error) return <ErrorMessage retry={reload} />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Juegos</h1>

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
            <h2 className="text-lg font-semibold mb-2">{juego.nombre}</h2>

            {juego.desbloqueado ? (
              <>
                {juego.puntuacion !== undefined ? (
                  <p className="text-sm mb-2">
                    Puntuación máxima:{" "}
                    <span className="font-semibold">{juego.puntuacion}</span>
                  </p>
                ) : (
                  <p className="text-sm mb-2 italic">¡Sin intentos aún!</p>
                )}

                <button
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  onClick={() => alert("TODO: lanzar minijuego")}
                >
                  Iniciar minijuego
                </button>
              </>
            ) : (
              <p className="text-sm italic">
                Bloqueado: completa el nivel {juego.nivelDesbloqueo} para acceder
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
