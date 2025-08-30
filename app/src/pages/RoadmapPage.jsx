"use client"

import { useEffect, useLayoutEffect, useRef, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useApi } from "../hooks/useApi"
import { progresoService } from "../services/progresoService"
import TemaBanner from "../components/TemaBanner"
import LevelCard from "../components/LevelCard"
import MinijuegoCard from "../components/MinijuegoCard"
import RoadConnector from "../components/RoadConnector"
import ErrorMessage from "../components/ErrorMessage"
import { LoadingScreen } from "../components/Spinner"
import { getTemas } from "../data/temarioService"

export default function RoadmapPage() {
  const navigate = useNavigate()
  const elementRefs = useRef({})
  const [nivelExpandido, setNivelExpandido] = useState(null)
  const [minijuegoExpandido, setMinijuegoExpandido] = useState(null)

  // Llamada al endpoint
  const { data, isLoading: loading, error } = useApi(progresoService.getRoadmap)

  const apiNiveles = useMemo(() => data?.niveles || [], [data])
  const apiTemas = useMemo(() => data?.temas || [], [data])
  const minijuegos = useMemo(() => data?.minijuegos || [], [data])
  const nivelActual = data?.nivelActual ?? null

  // Auto-expandir el nivel actual
  useEffect(() => {
    if (nivelActual != null) {
      setNivelExpandido(nivelActual)
    }
  }, [nivelActual])

  // Agrupar minijuegos por nivel de desbloqueo
  const minijuegosPorNivel = useMemo(() => {
    const map = {}
    minijuegos.forEach((m) => {
      if (!map[m.nivelDesbloqueo]) map[m.nivelDesbloqueo] = []
      map[m.nivelDesbloqueo].push(m)
    })
    return map
  }, [minijuegos])

  // Fusionar datos JSON con API y revertir orden
  const temasConDatos = useMemo(() => {
    const temasJson = getTemas()

    const fused = temasJson.map((tema) => {
      const apiTema = apiTemas.find((t) => t.temaId === tema.temaId) || {}
      return {
        ...tema,
        ...apiTema,
        niveles: tema.niveles.map((nivel) => {
          const prog = apiNiveles.find((x) => x.nivelId === nivel.nivelId) || {}
          return { ...nivel, ...prog, temaId: tema.temaId }
        }),
      }
    })

    return fused
      .slice()
      .reverse()
      .map((tema) => ({
        ...tema,
        niveles: tema.niveles.slice().reverse(),
      }))
  }, [apiNiveles, apiTemas])

  // Crear flujo completo de elementos
  const temasConFlujo = useMemo(() => {
    return temasConDatos.map((tema) => {
      const flujo = []

      tema.niveles.forEach((nivel) => {
        // Primero minijuegos
        const minijuegosDeEsteNivel = minijuegosPorNivel[nivel.nivelId] || []
        minijuegosDeEsteNivel.forEach((juego) => {
          flujo.push({
            tipo: "minijuego",
            data: juego,
            key: `minijuego-${juego.id}`,
          })
        })

        // Después el nivel
        flujo.push({
          tipo: "nivel",
          data: nivel,
          key: `nivel-${nivel.nivelId}`,
        })
      })

      return { ...tema, flujo }
    })
  }, [temasConDatos, minijuegosPorNivel])

  // Scroll automático al cargar
  useLayoutEffect(() => {
    if (loading || error) return

    const scrollToElement = (element) => {
      if (element) {
        element.scrollIntoView({
          behavior: "instant",
          block: "center",
        })
      }
    }

    if (nivelActual != null) {
      const nivelEl = elementRefs.current[`nivel-${nivelActual}`]
      scrollToElement(nivelEl)
      return
    }

    for (const tema of temasConFlujo) {
      if (tema.desbloqueado) {
        const bannerEl = elementRefs.current[`tema-${tema.temaId}`]
        scrollToElement(bannerEl)
        break
      }
    }
  }, [loading, error, nivelActual, temasConFlujo])

  // Handlers
  const handleLevelClick = (nivelId) => {
    const nivelClickeado = apiNiveles.find((x) => x.nivelId === nivelId)
    const nivelActualData = apiNiveles.find((x) => x.nivelId === nivelActual)

    const puedeAcceder =
      nivelId === nivelActual ||
      (nivelClickeado && nivelClickeado.completado) ||
      (nivelActualData && nivelClickeado && nivelClickeado.temaId < nivelActualData.temaId)

    if (puedeAcceder) {
      navigate(`/levels/${nivelId}`)
    }
  }

  const handleToggleNivel = (nivelId) => {
    setNivelExpandido((prev) => (prev === nivelId ? null : nivelId))
    setMinijuegoExpandido(null)
  }

  const handleToggleMinijuego = (minijuegoId) => {
    setMinijuegoExpandido((prev) => (prev === minijuegoId ? null : minijuegoId))
    setNivelExpandido(null)
  }

  if (loading) {
    return <LoadingScreen message="Cargando roadmap..." />
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage error={error} />
      </div>
    )
  }

  // Función para determinar posición en zigzag
  const getPositionSide = (globalIndex) => {
    return globalIndex % 2 === 0 ? "center" : globalIndex % 4 === 1 ? "right" : "left"
  }

  const getPositionClass = (side) => {
    const positions = {
      mobile: {
        left: "left-[calc(50%-120px)]",
        center: "left-1/2 -translate-x-1/2",
        right: "left-[calc(50%+40px)]",
      },
      desktop: {
        left: "md:left-[calc(50%-190px)]",
        center: "md:left-1/2 md:-translate-x-1/2",
        right: "md:left-[calc(50%+110px)]",
      },
    }

    return `${positions.mobile[side]} ${positions.desktop[side]}`
  }

  // Calcular filas dinámicas basadas en contenido
  const calcularFilas = () => {
    const filas = []
    let globalElementIndex = 0

    const alturas = {
      // Altura base de niveles (sin expandir)
      nivelBase: 80,
      // Altura del nivel actual sin expandir
      nivelActualBase: 100,
      // Altura de niveles sin desbloquear
      nivelBloqueado: 75,
      // Altura cuando nivel está expandido
      nivelExpandido: 215,
      // Altura base de minijuegos (sin expandir)
      minijuegoBase: 105,
      // Altura cuando minijuego está expandido
      minijuegoExpandido: 180,
      // Altura de los conectores
      conector: 85,
      // Padding entre elementos
      padding: 0,
    }

    temasConFlujo.forEach((tema, temaIndex) => {
      tema.flujo.forEach((elemento, elementoIndex) => {
        const currentSide = getPositionSide(globalElementIndex)
        const nextSide = getPositionSide(globalElementIndex + 1)

        // Verificar si está expandido
        const isExpanded =
          (elemento.tipo === "nivel" && nivelExpandido === elemento.data.nivelId) ||
          (elemento.tipo === "minijuego" && minijuegoExpandido === elemento.data.id)

        // Calcular altura del elemento según su tipo
        let alturaElemento
        if (elemento.tipo === "minijuego") {
          alturaElemento = isExpanded ? alturas.minijuegoExpandido : alturas.minijuegoBase
        } else {
          // Para niveles - determinar el estado del nivel
          const esActual = elemento.data.nivelId === nivelActual
          const esAccesible = esActual || elemento.data.completado

          if (isExpanded) {
            alturaElemento = alturas.nivelExpandido
          } else if (esActual) {
            alturaElemento = alturas.nivelActualBase
          } else if (!esAccesible) {
            alturaElemento = alturas.nivelBloqueado
          } else {
            alturaElemento = alturas.nivelBase
          }
        }
        // Añadir fila del elemento
        filas.push({
          ...elemento,
          tipo: elemento.tipo,
          altura: alturaElemento + alturas.padding,
          side: currentSide,
          nextSide,
          temaIndex,
          elementoIndex,
          isExpanded,
        })

        // Añadir fila del conector si no es el último elemento
        const isLastElementInTema = elementoIndex === tema.flujo.length - 1
        const isLastTema = temaIndex === temasConFlujo.length - 1
        const showConnector = !(isLastElementInTema && isLastTema)

        if (showConnector) {
          filas.push({
            tipo: "conector",
            key: `conector-${elemento.key}`,
            altura: alturas.conector,
            startSide: currentSide,
            endSide: nextSide,
            temaIndex,
          })
        }

        globalElementIndex++
      })
    })

    return filas
  }

  const filas = calcularFilas()

  return (
    <div className="bg-primary-50 pb-8">
      {temasConFlujo.map((tema, temaIndex) => (
        <div key={tema.temaId} className="w-full">
          {/* Banner del tema */}
          <div
            ref={(el) => {
              elementRefs.current[`tema-${tema.temaId}`] = el
            }}
            className="sticky top-0 z-30 mb-4"
          >
            <TemaBanner
              titulo={tema.titulo}
              desbloqueado={tema.desbloqueado || false}
              estrellas={tema.estrellasObtenidas || 0}
              estrellasNec={tema.estrellasNecesarias || 0}
              estrellasTot={tema.estrellasPosibles || 0}
              completados={tema.completados || 0}
              total={tema.totalNiveles || tema.niveles.length}
            />
          </div>

          {/* Filas secuenciales */}
          <div className="w-full">
            {filas
              .filter((fila) => fila.temaIndex === temaIndex)
              .map((fila) => (
                <div key={fila.key} className="relative w-full overflow-x-clip" style={{ height: `${fila.altura}px` }}>
                  {fila.tipo === "conector" ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RoadConnector startSide={fila.startSide} endSide={fila.endSide} />
                    </div>
                  ) : (
                    <div className={`absolute top-1/2 -translate-y-1/2 ${getPositionClass(fila.side)}`}>
                      {fila.tipo === "nivel" ? (
                        <div
                          ref={(el) => {
                            if (fila.data.nivelId === nivelActual) {
                              elementRefs.current[`nivel-${fila.data.nivelId}`] = el
                            }
                          }}
                        >
                          <LevelCard
                            nivel={fila.data}
                            nivelActual={nivelActual}
                            temaOrden={tema.orden}
                            nivelOrden={fila.data.orden}
                            expandido={nivelExpandido === fila.data.nivelId}
                            onToggle={() => handleToggleNivel(fila.data.nivelId)}
                            onAccion={handleLevelClick}
                            position={fila.side}
                          />
                        </div>
                      ) : (
                        <MinijuegoCard
                          juego={fila.data}
                          expandido={minijuegoExpandido === fila.data.id}
                          onToggle={() => handleToggleMinijuego(fila.data.id)}
                          onAccion={() => navigate(`/minigames/${fila.data.id}`)}
                          position={fila.side}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
