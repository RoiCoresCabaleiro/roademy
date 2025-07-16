// src/pages/MinigamePage.jsx

import { Suspense, lazy, useState } from "react";
import { useParams } from "react-router-dom";
import { minijuegoService } from "../services/minijuegoService";
import ErrorMessage from "../components/ErrorMessage";
import CompletionModal from "../components/minijuegos/CompletionModal";

const juegosMeta = {
  1: { name: 'Pasapalabra' },
  2: { name: 'Conductas Correctas' },
  // …
};

const juegosMap = [
  null,
  lazy(() => import("../components/minijuegos/Juego1")), // id = "1"
  lazy(() => import('../components/minijuegos/Juego2')), // id = "2"
  // …
];

export default function MinigamePage() {
  const { minijuegoId } = useParams();

  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const idx = Number(minijuegoId);
  const JuegoComponent = juegosMap[idx];
  if (!JuegoComponent) {
    return (
      <div className="p-4">
        <ErrorMessage error={`Minijuego “${minijuegoId}” no encontrado.`} />
      </div>
    );
  }

  // Callback que recibe la puntuación final
  const handleComplete = async (score) => {
    try {
      const res = await minijuegoService.completeMinijuego(minijuegoId, score); // res.data: { success, puntuacion, mejorPuntuacion, mejorado }
      setResult(res.data);
      setTimeout(() => setShowModal(true), 1000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">{juegosMeta[minijuegoId]?.name ?? `Minijuego ${minijuegoId}`}</h1>
      <Suspense fallback={<div className="p-4">Cargando juego...</div>}>
        <JuegoComponent onComplete={handleComplete} />
      </Suspense>

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
  );
}
