// src/pages/LevelPage.jsx

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { progresoService } from '../services/progresoService';
import ErrorMessage from '../components/ErrorMessage';
import { extractError } from '../utils/errorHandler';
import { getNivelData } from '../data/temarioService';


export default function LevelPage() {
  const { nivelId } = useParams();
  const navigate    = useNavigate();

  // 1) Metadata del nivel (teoría + preguntas)
  const nivelInfo = getNivelData(nivelId);

  // 2) Construir slides agrupando teoría + pregunta
  const slides = nivelInfo
    ? nivelInfo.nivel.tipo === 'leccion'
      ? nivelInfo.nivel.teoria.map((t, i) => ({
          preguntaId: nivelInfo.nivel.preguntas[i].preguntaId,
          content: t.texto,
          question: nivelInfo.nivel.preguntas[i].texto,
          options: nivelInfo.nivel.preguntas[i].opciones
        }))
      : nivelInfo.nivel.preguntas.map(p => ({
          preguntaId: p.preguntaId,
          content: null,
          question: p.texto,
          options: p.opciones
        }))
    : [];

  const [slideIndex, setSlideIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [completeError, setCompleteError] = useState(null);

  // 3) Cargar respuestas parciales existentes
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
          seleccion:  r.seleccion,
          correcta:   r.correcta
        }))
      );
    }
  }, [initData]);

  if (loading) return <div className="p-4">Cargando nivel...</div>;
  if (error)   return <div className="p-4"><ErrorMessage error={error}/></div>;

  const slide  = slides[slideIndex] || {};
  const isFirst = slideIndex === 0;
  const isLast  = slideIndex === slides.length - 1;

  // 4) Al responder, enviamos al backend y guardamos la respuesta
  const handleAnswer = async seleccion => {
    try {
      const res = await progresoService.answer(nivelId, {
        preguntaId: slide.preguntaId,
        seleccion
      });
      setAnswers(prev => [
        ...prev.filter(a => a.preguntaId !== slide.preguntaId),
        {
          preguntaId: slide.preguntaId,
          seleccion,
          correcta: res.data.correcta
        }
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  // 5) Navegación entre slides
  const goTo = idx => setSlideIndex(Math.min(Math.max(idx, 0), slides.length - 1));
  const handlePrev = () => goTo(slideIndex - 1);
  const handleNext = () => goTo(slideIndex + 1);
  const handleComplete = async () => {
    setCompleteError(null);
    try {
      const res = await progresoService.complete(nivelId);
      navigate(`/levels/${nivelId}/completed`, { state: res.data });
    } catch (err) {
      const msg = extractError(err);
      setCompleteError(msg);
    }
  };

  return (
    <div className="pb-8 p-4 flex flex-col h-full">
      {/* Contenido de la slide */}
      <div className="flex-1">
        {slide.content && (
          <div className="prose mb-6">
            <p>{slide.content}</p>
          </div>
        )}
        <div className="space-y-4">
          <p className="font-medium">{slide.question}</p>
          {slide.options.map((opt, idx) => {
            const ans = answers.find(a => a.preguntaId === slide.preguntaId);
            let classes = 'block w-full text-left px-4 py-2 border rounded mb-2';
            if (ans) {
              if (ans.seleccion === idx) {
                classes += ans.correcta
                  ? ' bg-green-100 border-green-500'
                  : ' bg-red-100 border-red-500';
              }
              return (
                <button key={idx} className={classes} disabled>
                  {opt}
                </button>
              );
            }
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
      </div>

      {/* Controles de navegación */}
      <div className="flex flex-col items-center mt-4 space-y-2">
        {/* Error al terminar nivel */}
        <ErrorMessage error={completeError} />
        <div className="flex items-center space-x-6">
          {/* Flecha Anterior */}
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className={`p-3 text-3xl bg-gray-100 rounded-full ${isFirst ? 'opacity-50' : 'hover:bg-gray-200'}`}
          >
            ←
          </button>

          {/* Botones circulares de paginación */}
          <div className="flex space-x-2">
            {slides.map((s, i) => {
              const ans = answers.find(a => a.preguntaId === s.preguntaId);
              let circleCls = 'w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer';
              if (ans) {
                circleCls += ans.correcta
                  ? ' bg-green-500 text-white'
                  : ' bg-red-500 text-white';
              } else {
                circleCls += ' bg-gray-200 text-gray-600';
              }
              if (i === slideIndex) {
                circleCls += ' ring-2 ring-blue-500';
              }
              return (
                <button
                  key={s.preguntaId}
                  className={circleCls}
                  onClick={() => goTo(i)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Flecha Siguiente */}
          <button
            onClick={handleNext}
            disabled={isLast}
            className={`p-3 text-3xl bg-gray-100 rounded-full ${isLast ? 'opacity-50' : 'hover:bg-gray-200'}`}
          >
            →
          </button>
        </div>

        {/* Botón Terminar */}
        <button
          onClick={handleComplete}
          className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Terminar
        </button>
      </div>
    </div>
  );
}
