import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useApi } from "../hooks/useApi"
import { progresoService } from "../services/progresoService"
import ErrorMessage from "../components/ErrorMessage"
import { LoadingScreen } from "../components/Spinner"
import { extractError } from "../utils/errorHandler"
import { getNivelData } from "../data/temarioService"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline"

export default function LevelPage() {
  const { nivelId } = useParams()
  const navigate = useNavigate()

  // Estados de la UI
  const [slideIndex, setSlideIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [globalError, setGlobalError] = useState(null)

  // 3) Cargar respuestas parciales existentes
  const initFn = useCallback(() => progresoService.initNivel(nivelId), [nivelId])
  const { data: initData, isLoading, error } = useApi(initFn)

  useEffect(() => {
    if (initData?.respuestas) {
      setAnswers(
        initData.respuestas.map((r) => ({
          preguntaId: r.preguntaId,
          seleccion: r.seleccion,
          correcta: r.correcta,
        })),
      )
    }
  }, [initData])

  // 1) Metadata del nivel (teoría + preguntas)
  const nivelInfo = getNivelData(nivelId)

  // Guard - nivel no existe en el temario embebido
  if (!nivelInfo) {
    return (
      <div className="p-4">
        <ErrorMessage error={`Nivel con ID "${nivelId}" no encontrado.`} />
      </div>
    )
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
    : []

  if (isLoading) {
    return <LoadingScreen message="Cargando nivel..." />
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage error={error} />
      </div>
    )
  }

  const slide = slides[slideIndex] || {}
  const isFirst = slideIndex === 0
  const isLast = slideIndex === slides.length - 1

  // 4) Peticion a la API para procesar y guardar cada respuesta
  const handleAnswer = async (seleccion) => {
    try {
      setGlobalError(null)
      const res = await progresoService.answer(nivelId, {
        preguntaId: slide.preguntaId,
        seleccion,
      })
      setAnswers((prev) => [
        ...prev.filter((a) => a.preguntaId !== slide.preguntaId),
        {
          preguntaId: slide.preguntaId,
          seleccion,
          correcta: res.data.correcta,
        },
      ])
    } catch (err) {
      setGlobalError(extractError(err))
    }
  }

  // 5) Navegación entre slides
  const goTo = (idx) => {
    setGlobalError(null)
    setSlideIndex(Math.min(Math.max(idx, 0), slides.length - 1))
  }
  const handlePrev = () => {
    setGlobalError(null)
    goTo(slideIndex - 1)
  }
  const handleNext = () => {
    setGlobalError(null)
    goTo(slideIndex + 1)
  }
  const handleComplete = async () => {
    setGlobalError(null)
    try {
      const res = await progresoService.complete(nivelId)
      navigate(`/levels/${nivelId}/completed`, { state: res.data })
    } catch (err) {
      setGlobalError(extractError(err))
    }
  }

  return (
    <div className="flex flex-col h-full bg-primary-100">
      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Teoría */}
          {slide.content && (
            <div className="bg-white rounded-xl shadow-sm border border-white p-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpenIcon className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold">Lección</h2>
              </div>
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{slide.content}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Pregunta */}
          <div className="bg-white rounded-xl shadow-sm border border-white p-4">
            <div className="flex items-center gap-2 mb-4">
              <QuestionMarkCircleIcon className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold">Pregunta</h2>
            </div>

            <div className="prose max-w-none mb-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{slide.question}</ReactMarkdown>
            </div>

            {/* Opciones */}
            <div className="space-y-3">
              {slide.options.map((opt, idx) => {
                const ans = answers.find((a) => a.preguntaId === slide.preguntaId)
                let classes = "w-full text-left p-4 rounded-lg border-2 transition-colors"

                if (ans) {
                  if (ans.seleccion === idx) {
                    classes += ans.correcta
                      ? " bg-green-50 border-green-300 text-green-800"
                      : " bg-red-50 border-red-300 text-red-800"
                  } else {
                    classes += " bg-gray-50 border-gray-200 text-gray-500"
                  }
                  return (
                    <button key={idx} className={classes} disabled>
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {ans.seleccion === idx && (
                          <div className={`p-1 rounded-full ${ans.correcta ? "bg-green-200" : "bg-red-200"}`}>
                            {ans.correcta ? (
                              <CheckIcon className="w-4 h-4 text-green-600" />
                            ) : (
                              <XMarkIcon className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                }

                classes += " bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer"

                return (
                  <button key={idx} onClick={() => handleAnswer(idx)} className={classes}>
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Controles inferiores */}
      <div className="sticky bottom-0 left-0 w-full bg-white border-t border-neutral-200 shadow-lg">
        <div className="max-w-4xl mx-auto p-2">
          {globalError && (
            <div className="mb-3">
              <ErrorMessage error={globalError} />
            </div>
          )}

          {/* Navegación */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {/* Botón anterior */}
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className={`p-2 rounded-full ${
                isFirst ? "bg-gray-100 text-gray-400" : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            {/* Paginación de preguntas */}
            <div className="flex-1 max-w-sm">
              <div className="flex items-center justify-center gap-1 overflow-x-auto px-1 py-2">
                {slides.map((s, i) => {
                  const ans = answers.find((a) => a.preguntaId === s.preguntaId)
                  let classes =
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer flex-shrink-0"

                  if (ans) {
                    classes += ans.correcta ? " bg-green-500 text-white" : " bg-red-500 text-white"
                  } else {
                    classes += " bg-gray-200 text-gray-600"
                  }

                  if (i === slideIndex) {
                    classes += " ring-2 ring-orange-400"
                  }

                  return (
                    <button key={s.preguntaId} className={classes} onClick={() => goTo(i)}>
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Botón siguiente */}
            <button
              onClick={handleNext}
              disabled={isLast}
              className={`p-2 rounded-full ${
                isLast ? "bg-gray-100 text-gray-400" : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Botón Terminar */}
          <div className="text-center">
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Terminar Nivel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
