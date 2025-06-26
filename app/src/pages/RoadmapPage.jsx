// src/pages/RoadmapPage.jsx

import { useApi } from '../hooks/useApi';
import { progresoService } from '../services/progresoService';
import TemaBanner from '../components/TemaBanner';
import LevelCard  from '../components/LevelCard';
import { getTemas } from '../data/temarioService';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';

export default function RoadmapPage() {
  const navigate = useNavigate();

  // 1) Llamada al endpoint
  const { data, isLoading: loading, error } = useApi(
    () => progresoService.getRoadmap(),
    []
  );

  if (loading) return <div className="p-4">Cargando RoadMap...</div>;
  if (error)   return <div className="p-4"><ErrorMessage error={error}/></div>;

  // 2) Extraemos del data
  const { niveles: apiNiveles, temas: apiTemas, nivelActual } = data;

  // 3) Metadata estática
  const temasJson = getTemas();

  // 4) Fusionar JSON estático + datos de niveles
  const nivelesPorTema = temasJson.map(tema => ({
    ...tema,
    niveles: tema.niveles.map(nivel => {
      const prog = apiNiveles.find(x => x.nivelId === nivel.nivelId) || {};
      return { ...nivel, ...prog };
    })
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
    <div className="pb-16">
      {nivelesPorTema.map(tema => {
        // Encontrar el estado de este tema en la respuesta de la API
        const apiTema = apiTemas.find(t => t.temaId === tema.temaId) || {};

        return (
          <section key={tema.temaId}>
            <TemaBanner
              titulo={tema.titulo}
              desbloqueado={apiTema.desbloqueado}
              estrellas={apiTema.estrellasObtenidas}
              totEstrellas={apiTema.estrellasNecesarias}
              completados={apiTema.completados}
              total={apiTema.totalNiveles}
            />
            <div className="flex flex-wrap justify-start p-4">
              {tema.niveles.map(n => (
                <LevelCard
                  key={n.nivelId}
                  nivel={n}
                  temaOrden={tema.orden}
                  nivelOrden={n.orden}
                  onClick={handleLevelClick}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
