// src/pages/RoadmapPage.jsx

import { useEffect, useLayoutEffect, useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { progresoService } from "../services/progresoService";
import TemaBanner from "../components/TemaBanner";
import LevelCard from "../components/LevelCard";
import MinijuegoCard from "../components/MinijuegoCard";
import ErrorMessage from "../components/ErrorMessage";
import { getTemas } from "../data/temarioService";

export default function RoadmapPage() {
  const navigate = useNavigate();
  const elementRefs = useRef({});
  const [nivelExpandido, setNivelExpandido] = useState(null);
  const [minijuegoExpandido, setMinijuegoExpandido] = useState(null);

  // 1) Llamada al endpoint
  const {
    data,
    isLoading: loading,
    error,
  } = useApi(progresoService.getRoadmap);

  const apiNiveles = useMemo(() => data?.niveles || [], [data]);
  const apiTemas = useMemo(() => data?.temas || [], [data]);
  const minijuegos = useMemo(() => data?.minijuegos || [], [data]);
  const nivelActual = data?.nivelActual ?? null;

  useEffect(() => {
    if (nivelActual != null) {
      setNivelExpandido(nivelActual);
    }
  }, [nivelActual]);

  // 3) Agrupar minijuegos por nivel
  const minijuegosPorNivel = useMemo(() => {
    const map = {};
    minijuegos.forEach((m) => {
      if (!map[m.nivelDesbloqueo]) map[m.nivelDesbloqueo] = [];
      map[m.nivelDesbloqueo].push(m);
    });
    return map;
  }, [minijuegos]);

  // 4) Fusionar JSON + API y revertir orden UNA sola vez
  const reversedTemas = useMemo(() => {
    const temasJson = getTemas();
    // Fusionar
    const fused = temasJson.map((tema) => ({
      ...tema,
      niveles: tema.niveles.map((nivel) => {
        const prog = apiNiveles.find((x) => x.nivelId === nivel.nivelId) || {};
        return { ...nivel, ...prog, temaId: tema.temaId };
      }),
    }));
    // Invertir temas y sus niveles
    return fused
      .slice()
      .reverse()
      .map((tema) => ({
        ...tema,
        niveles: tema.niveles.slice().reverse(),
      }));
  }, [apiNiveles]);

  // 5) Scroll automático
  useLayoutEffect(() => {
    if (loading || error) return;

    // a) Si hay nivelActual accesible, scroll directo a él
    if (nivelActual != null) {
      const nivelEl = elementRefs.current[`nivel-${nivelActual}`];
      if (nivelEl)
        nivelEl.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      // b) Si no hay nivelActual, scroll al banner del último tema desbloqueado
      for (const tema of reversedTemas) {
        const apiTema = apiTemas.find((t) => t.temaId === tema.temaId) || {};
        if (apiTema.desbloqueado) {
          const bannerEl = elementRefs.current[`tema-${tema.temaId}`];
          if (bannerEl)
            bannerEl.scrollIntoView({ behavior: "smooth", block: "start" });
          break;
        }
      }
    }
  }, [loading, error, nivelActual, apiTemas, reversedTemas]);

  // 6) Estados de carga / error
  if (loading) return <div className="p-4">Cargando RoadMap...</div>;
  if (error)
    return (
      <div className="p-4">
        <ErrorMessage error={error} />
      </div>
    );

  // 7) Control de clic en nivel
  const handleLevelClick = (id) => {
    const actual = apiNiveles.find((x) => x.nivelId === nivelActual);
    const clic = apiNiveles.find((x) => x.nivelId === id);
    const allow =
      id === nivelActual ||
      (clic && clic.completado) ||
      (actual && clic && clic.temaId < actual.temaId);
    if (allow) navigate(`/levels/${id}`);
  };

  return (
    <div className="pb-8">
      {reversedTemas.map((tema) => {
        const apiTema = apiTemas.find((t) => t.temaId === tema.temaId) || {};
        return (
          <section key={tema.temaId}>
            {/* Banner */}
            <div
              ref={(el) => {
                elementRefs.current[`tema-${tema.temaId}`] = el;
              }}
              className="sticky top-0 bg-white z-20"
            >
              <TemaBanner
                titulo={tema.titulo}
                desbloqueado={apiTema.desbloqueado}
                estrellas={apiTema.estrellasObtenidas}
                estrellasNec={apiTema.estrellasNecesarias}
                estrellasTot={apiTema.estrellasPosibles}
                completados={apiTema.completados}
                total={apiTema.totalNiveles}
              />
            </div>

            {/* Niveles + Minijuegos */}
            <div className="flex flex-col items-center p-4 space-y-2">
              {tema.niveles.map((nivel) => (
                <div
                  key={nivel.nivelId}
                  className="w-full flex flex-col items-center"
                >
                  {/* Minijuegos (si los hay) */}
                  {minijuegosPorNivel[nivel.nivelId]?.map((juego) => (
                    <MinijuegoCard
                      key={juego.id}
                      juego={juego}
                      expandido={minijuegoExpandido === juego.id}
                      onToggle={() => {
                        setMinijuegoExpandido((prev) =>
                          prev === juego.id ? null : juego.id
                        );
                        setNivelExpandido(null);
                      }}
                      onAccion={() => navigate(`/minigames/${juego.id}`)}
                    />
                  ))}

                  {/* Nivel */}
                  <div
                    ref={(el) => {
                      if (nivel.nivelId === nivelActual) {
                        elementRefs.current[`nivel-${nivel.nivelId}`] = el;
                      }
                    }}
                  >
                    <LevelCard
                      nivel={nivel}
                      nivelActual={nivelActual}
                      temaOrden={tema.orden}
                      nivelOrden={nivel.orden}
                      expandido={nivelExpandido === nivel.nivelId}
                      onToggle={() => {
                        setNivelExpandido((prev) =>
                          prev === nivel.nivelId ? null : nivel.nivelId
                        );
                        setMinijuegoExpandido(null);
                      }}
                      onAccion={handleLevelClick}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
