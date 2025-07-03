// src/pages/RoadmapPage.jsx

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { progresoService } from '../services/progresoService';
import TemaBanner from '../components/TemaBanner';
import LevelCard  from '../components/LevelCard';
import ErrorMessage from '../components/ErrorMessage';
import { getTemas } from '../data/temarioService';


export default function RoadmapPage() {
  const navigate = useNavigate();
  const elementRefs = useRef({});

  // 1) Llamada al endpoint del roadmap
  const { data, isLoading: loading, error } = useApi(progresoService.getRoadmap);

  // Datos de temas desde el json embebido del temario
  const temasJson = getTemas();

  // 4) Scroll automático al nivel actual o al último tema desbloqueado
  useEffect(() => {
    if (loading || error || !data) return;

    const { niveles: apiNiveles, temas: apiTemas, nivelActual } = data;

    const nivelesPorTema = temasJson.map(tema => ({
      ...tema,
      niveles: tema.niveles.map(nivel => {
        const prog = apiNiveles.find(x => x.nivelId === nivel.nivelId) || {};
        return { ...nivel, ...prog, temaId: tema.temaId };
      })
    }));
    const reversedTemas = [...nivelesPorTema].reverse().map(tema => ({
      ...tema,
      niveles: [...tema.niveles].reverse()
    }));

    const nivelEl = elementRefs.current[`nivel-${nivelActual}`];
    if (nivelEl) {
      nivelEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    for (const tema of reversedTemas) {
      const apiTema = apiTemas.find(t => t.temaId === tema.temaId) || {};
      if (apiTema.desbloqueado) {
        const bannerEl = elementRefs.current[`tema-${tema.temaId}`];
        if (bannerEl) {
          bannerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        break;
      }
    }
  }, [loading, error, data, temasJson]);


  if (loading || !data) return <div className="p-4">Cargando RoadMap...</div>;
  if (error) return <div className="p-4"><ErrorMessage error={error}/></div>;

  const { niveles: apiNiveles, temas: apiTemas, nivelActual } = data;

  // 2) Fusionar JSON estático + datos de niveles
  const nivelesPorTema = temasJson.map(tema => ({
    ...tema,
    niveles: tema.niveles.map(nivel => {
      const prog = apiNiveles.find(x => x.nivelId === nivel.nivelId) || {};
      return { ...nivel, ...prog, temaId: tema.temaId };
    })
  }));

  // 3) Invertir orden de temas y niveles
  const reversedTemas = [...nivelesPorTema].reverse().map(tema => ({
    ...tema,
    niveles: [...tema.niveles].reverse()
  }));

  
  // 5) Control de acceso a cada nivel
  const handleLevelClick = nivelId => {
    const actual = apiNiveles.find(x => x.nivelId === nivelActual);
    const clic   = apiNiveles.find(x => x.nivelId === nivelId);

    const allow =
      // a) el nivel en curso
      nivelId === nivelActual ||
      // b) niveles ya completados
      (clic && clic.completado) ||
      // c) niveles de temas anteriores al actual
      (actual && clic && clic.temaId < actual.temaId);

    if (allow) navigate(`/levels/${nivelId}`);
  };

  return (
    <div className="pb-8">
      {reversedTemas.map(tema => {
        const apiTema = apiTemas.find(t => t.temaId === tema.temaId) || {};
        return (
          <section key={tema.temaId}>
            {/* Banner con ref */}
            <div
              ref={el => { elementRefs.current[`tema-${tema.temaId}`] = el; }}
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

            {/* Niveles apilados verticalmente y centrados */}
            <div className="flex flex-col items-center p-4 space-y-2">
              {tema.niveles.map(n => (
                <div
                  key={n.nivelId}
                  ref={el => {
                    if (n.nivelId === nivelActual) {
                      elementRefs.current[`nivel-${n.nivelId}`] = el;
                    }
                  }}
                >
                  <LevelCard
                    nivel={n}
                    nivelActual={nivelActual}
                    temaOrden={tema.orden}
                    nivelOrden={n.orden}
                    onClick={handleLevelClick}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
