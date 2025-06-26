import { useLocation, useNavigate, useParams } from 'react-router-dom';

export default function LevelCompletePage() {
  const { nivelId } = useParams();
  const navigate    = useNavigate();
  const { state }   = useLocation();
  const { attemptEstrellas, bestEstrellas, mejorado } = state;

  // Mensajes motivacionales según estrellas
  const mensajes = [
    '¡Genial! Sigue así.',
    '¡Muy bien! Puedes mejorar aún más.',
    '¡Estupendo! ¡Has sacado 3 estrellas!'
  ];
  const msg = mensajes[Math.min(attemptEstrellas - 1, mensajes.length - 1)];

  const nextNivel = Number(nivelId) + 1;

  return (
    <div className="pb-16 p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Nivel {nivelId} completado</h1>
      <p className="text-lg mb-2">Estrellas: {attemptEstrellas} / {bestEstrellas}</p>
      {mejorado && <p className="text-green-600 mb-2">¡Has superado tu mejor marca!</p>}
      <p className="italic mb-6">{msg}</p>

      <div className="space-x-2">
        <button onClick={() => navigate('/roadmap')} className="px-4 py-2 border rounded">
          RoadMap
        </button>
        <button onClick={() => navigate(`/levels/${nivelId}`)} className="px-4 py-2 bg-blue-500 text-white rounded">
          Repetir
        </button>
        <button onClick={() => navigate(`/levels/${nextNivel}`)} className="px-4 py-2 bg-green-500 text-white rounded">
          Siguiente
        </button>
      </div>
    </div>
  );
}
