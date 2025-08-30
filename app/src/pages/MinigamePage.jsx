import { Suspense, lazy, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { minijuegoService } from "../services/minijuegoService";
import ErrorMessage from "../components/ErrorMessage";
import CompletionModal from "../components/minijuegos/CompletionModal";
import GamepadIcon from "../components/icons/GamepadIcon";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const juegosMeta = {
  1: { name: "Pasapalabra Vial" },
  2: { name: "Conductas Correctas" },
  3: { name: "Señales Misteriosas" },
  // …
};

const juegosMap = [
  null, // id = 0 (no existe)
  lazy(() => import("../components/minijuegos/Juego1")), // id = "1"
  lazy(() => import("../components/minijuegos/Juego2")), // id = "2"
  lazy(() => import("../components/minijuegos/Juego3")), // id = "3"
  // …
];

export default function MinigamePage() {
  const { minijuegoId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const idx = Number(minijuegoId);
  const JuegoComponent = juegosMap[idx];

  if (!JuegoComponent) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <ErrorMessage error={`Minijuego "${minijuegoId}" no encontrado.`} />
      </div>
    );
  }

  // Callback que recibe la puntuación final
  const handleComplete = async (score) => {
    try {
      const res = await minijuegoService.completeMinijuego(minijuegoId, score);
      setResult(res.data);
      setTimeout(() => setShowModal(true), 1000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="p-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/minigames")}
            className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-purple-200 rounded-lg mb-4 transition-colors duration-200 font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver a minijuegos
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <GamepadIcon className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                {juegosMeta[minijuegoId]?.name ?? `Minijuego ${minijuegoId}`}
              </h1>
            </div>
          </div>
        </div>

        {/* Contenedor del juego */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <GamepadIcon className="w-12 h-12 text-purple-300 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-600">Cargando juego...</p>
                </div>
              </div>
            }
          >
            <JuegoComponent onComplete={handleComplete} />
          </Suspense>
        </div>

        {/* Modal de completado */}
        {result && (
          <CompletionModal
            open={showModal}
            onClose={() => setShowModal(false)}
            puntuacion={result.puntuacion}
            mejorPuntuacion={result.mejorPuntuacion}
            mejorado={result.mejorado}
          />
        )}
      </div>
    </div>
  );
}
