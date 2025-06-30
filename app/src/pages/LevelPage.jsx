// src/pages/LevelPage.jsx

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { progresoService } from '../services/progresoService';
import { useApi } from '../hooks/useApi';
import { getNivelData } from '../data/temarioService';
import ErrorMessage from '../components/ErrorMessage';

export default function LevelPage() {
  const { nivelId } = useParams();
  const navigate    = useNavigate();

  // 1) Carga metadata del JSON para este nivel
  const nivelInfo = getNivelData(nivelId);

  // 2) Construye las "diapositivas":
  const slides = nivelInfo
  ? nivelInfo.nivel.tipo === 'leccion'
    ? nivelInfo.nivel.teoria.flatMap((t, i) => [
        { type: 'text', content: t.texto },
        {
          type: 'question',
          preguntaId: nivelInfo.nivel.preguntas[i].preguntaId,
          question: nivelInfo.nivel.preguntas[i].texto,
          options: nivelInfo.nivel.preguntas[i].opciones
        }
      ])
    : nivelInfo.nivel.preguntas.map(p => ({
        type: 'question',
        preguntaId: p.preguntaId,
        question: p.texto,
        options: p.opciones
      }))
  : [];

  const [slideIndex, setSlideIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  // 3) Refresca respuestas parciales si existieran en backend
  const initFn = useCallback(
    () => progresoService.initNivel(nivelId),
    [nivelId]
  );
  const { data: initData, loading, error } = useApi(initFn);

  useEffect(() => {
    if (initData?.respuestas) {
      setAnswers(
        initData.respuestas.map(r => ({
          preguntaId: r.preguntaId,
          seleccion: r.seleccion,
          correcta: r.correcta
        }))
      );
    }
  }, [initData]);

  if (loading) return <div className="p-4">Cargando nivel...</div>;
  if (error)   return <div className="p-4"><ErrorMessage error={error}/></div>;

  const slide  = slides[slideIndex] || {};
  const isLast = slideIndex === slides.length - 1;

  // 4) Al responder, envía a la API y avanza
  const handleAnswer = async seleccion => {
    // 1) Llamada al backend
    const res = await progresoService.answer(nivelId, {
      preguntaId: slide.preguntaId,
      seleccion
    });
    // 2) Añadimos la respuesta con el booleano correcta
    setAnswers(prev => [
      ...prev,
      {
        preguntaId: slide.preguntaId,
        seleccion,
        correcta: res.data.correcta
      }
    ]);
  };

  const handlePrev     = () => setSlideIndex(i => Math.max(i - 1, 0));
  const handleNext     = () => setSlideIndex(i => Math.min(i + 1, slides.length - 1));
  const handleComplete = async () => {
    const res = await progresoService.complete(nivelId);
    navigate(`/levels/${nivelId}/completed`, { state: res.data });
  };

  return (
    <div className="pb-16 p-4 flex flex-col h-full">
      <div className="flex-1">
        {slide.type === 'text' && (
          <div className="prose">
            <p>{slide.content}</p>
          </div>
        )}
        {slide.type === 'question' && (
          <div className="space-y-4">
            <p className="font-medium">{slide.question}</p>
            {slide.options.map((opt, idx) => {
              // Busca si ya respondieron esta pregunta
              const ans = answers.find(a => a.preguntaId === slide.preguntaId);
              // Determina estilos
              let classes = 'block w-full text-left px-4 py-2 border rounded mb-2';
              if (ans) {
                // Si esta es la opción seleccionada, coloreamos
                if (ans.seleccion === idx) {
                  classes += ans.correcta
                    ? ' bg-green-100 border-green-500'
                    : ' bg-red-100 border-red-500';
                }
                // Todas deshabilitadas tras responder
                return (
                  <button key={idx} className={classes} disabled>
                    {opt}
                  </button>
                );
              }
              // Si no han respondido todavía, botón activo
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={classes}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrev}
          disabled={slideIndex === 0}
          className="px-4 py-2 border rounded"
        >
          Anterior
        </button>
        {isLast ? (
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Terminar
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
}