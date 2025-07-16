// src/pages/LevelPage.jsx

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useApi } from "../hooks/useApi";
import { progresoService } from "../services/progresoService";
import ErrorMessage from "../components/ErrorMessage";
import { extractError } from "../utils/errorHandler";
import { getNivelData } from "../data/temarioService";

export default function LevelPage() {
  const { nivelId } = useParams();
  const navigate = useNavigate();

  // Estados de la UI
  const [slideIndex, setSlideIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [globalError, setGlobalError] = useState(null);

  // 3) Cargar respuestas parciales existentes
  const initFn = useCallback(
    () => progresoService.initNivel(nivelId),
    [nivelId]
  );
  const { data: initData, loading, error } = useApi(initFn);

  useEffect(() => {
    if (initData?.respuestas) {
      setAnswers(
        initData.respuestas.map((r) => ({
          preguntaId: r.preguntaId,
          seleccion: r.seleccion,
          correcta: r.correcta,
        }))
      );
    }
  }, [initData]);

  // 1) Metadata del nivel (teoría + preguntas)
  const nivelInfo = getNivelData(nivelId);

  // Guard - nivel no existe en el temario embebido
  if (!nivelInfo) {
   return (
     <div className="p-4">
       <ErrorMessage error={`Nivel con ID “${nivelId}” no encontrado.`} />
     </div>
    );
  }

  // 2) Construir slides agrupando teoría + pregunta
  const slides = nivelInfo
    ? nivelInfo.nivel.tipo === "leccion"
      ? nivelInfo.nivel.teoria.map((t, i) => ({
          preguntaId: nivelInfo.nivel.preguntas[i].preguntaId,
          content: t.texto,
          question: nivelInfo.nivel.preguntas[i].texto,
          options: nivelInfo.nivel.preguntas[i].opciones,
        }))
      : nivelInfo.nivel.preguntas.map((p) => ({
          preguntaId: p.preguntaId,
          content: null,
          question: p.texto,
          options: p.opciones,
        }))
    : [];

  if (loading) return <div className="p-4">Cargando nivel...</div>;
  if (error)
    return (
      <div className="p-4">
        <ErrorMessage error={error} />
      </div>
    );

  const slide = slides[slideIndex] || {};
  const isFirst = slideIndex === 0;
  const isLast = slideIndex === slides.length - 1;

  // 4) Al responder, enviamos al backend y guardamos la respuesta
  const handleAnswer = async (seleccion) => {
    try {
      setGlobalError(null);
      const res = await progresoService.answer(nivelId, {
        preguntaId: slide.preguntaId,
        seleccion,
      });
      setAnswers((prev) => [
        ...prev.filter((a) => a.preguntaId !== slide.preguntaId),
        {
          preguntaId: slide.preguntaId,
          seleccion,
          correcta: res.data.correcta,
        },
      ]);
    } catch (err) {
      setGlobalError(extractError(err));
    }
  };

  // 5) Navegación entre slides
  const goTo = (idx) => {
    setGlobalError(null);
    setSlideIndex(Math.min(Math.max(idx, 0), slides.length - 1));
  };
  const handlePrev = () => {
    setGlobalError(null);
    goTo(slideIndex - 1);
  };
  const handleNext = () => {
    setGlobalError(null);
    goTo(slideIndex + 1);
  };
  const handleComplete = async () => {
    setGlobalError(null);
    try {
      const res = await progresoService.complete(nivelId);
      navigate(`/levels/${nivelId}/completed`, { state: res.data });
    } catch (err) {
      setGlobalError(extractError(err));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pb-10 md:pb-20 no-scrollbar">
        {slide.content && (
          <div className="prose mb-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {slide.content}
            </ReactMarkdown>
          </div>
        )}

        <div className="space-y-4">
          <div className="prose font-semibold">
            <h3>Pregunta:</h3>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {slide.question}
            </ReactMarkdown>
          </div>
          {slide.options.map((opt, idx) => {
            const ans = answers.find((a) => a.preguntaId === slide.preguntaId);
            let classes =
              "block w-full text-left px-4 py-2 mb-2 border rounded";
            if (ans) {
              if (ans.seleccion === idx) {
                classes += ans.correcta
                  ? " bg-green-100 border-green-500"
                  : " bg-red-100 border-red-500";
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

      {/* Controles inferiores */}
      <div className="sticky bottom-0 left-0 w-full bg-white border-t z-10">
        <div className="flex flex-col items-center pt-3 pb-4 space-y-2 px-4">
          {globalError && <ErrorMessage error={globalError} />}

          {/* Flechas y paginación */}
          <div className="flex items-center space-x-6">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className={`px-3 py-2 text-2xl bg-blue-300 rounded-full ${
                isFirst ? "opacity-30" : "hover:bg-blue-400"
              }`}
            >
              ←
            </button>

            <div className="flex space-x-2">
              {slides.map((s, i) => {
                const ans = answers.find((a) => a.preguntaId === s.preguntaId);
                let circleCls =
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer";
                if (ans) {
                  circleCls += ans.correcta
                    ? " bg-green-500 text-white"
                    : " bg-red-500 text-white";
                } else {
                  circleCls += " bg-gray-200 text-gray-600";
                }
                if (i === slideIndex) {
                  circleCls += " ring-2 ring-blue-500";
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

            <button
              onClick={handleNext}
              disabled={isLast}
              className={`px-3 py-2 text-2xl bg-blue-300 rounded-full ${
                isLast ? "opacity-30" : "hover:bg-blue-400"
              }`}
            >
              →
            </button>
          </div>

          {/* Botón Terminar */}
          <button
            onClick={handleComplete}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Terminar
          </button>
        </div>
      </div>
    </div>
  );
}
