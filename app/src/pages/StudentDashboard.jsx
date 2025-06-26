import { useApi } from '../hooks/useApi';
import { usuarioService } from '../services/usuarioService';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from '../components/ErrorMessage';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  const { data: dashboard, isLoading: loading, error } = useApi(
    () => usuarioService.getDashboard(),
    [],
  );

  if (loading) return <div className="p-4">Cargando datos...</div>;
  if (error)   return <div className="p-4"><ErrorMessage error={error} /></div>;

  const { progresoTotalCurso, progresoTemaActual, actividadReciente } = dashboard;

  return (
    <div className="pb-16"> {/* padding bottom para el footer */}
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold">Hola, {user.nombre}!</h1>
        <p className="text-sm text-gray-600">{user.email}</p>
      </header>

      <section className="p-4 space-y-4">
        {/* Tarjeta Progreso Total */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">Progreso Total</h2>
          <p>
            {progresoTotalCurso.porcentajeProgresoTotal}% completado<br/>
            ⭐ {progresoTotalCurso.estrellasObtenidasCurso} / {progresoTotalCurso.estrellasPosiblesCurso}
          </p>
        </div>

        {/* Tarjeta Tema Actual */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">Tema Actual: {progresoTemaActual.titulo}</h2>
          <p>{progresoTemaActual.porcentaje}% completado</p>
          <p>Lección {progresoTemaActual.nivelActual} de {progresoTemaActual.totalNiveles}</p>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">Actividad Reciente</h2>
          {actividadReciente.length === 0
            ? <p className="text-sm text-gray-500">Sin actividad reciente</p>
            : (
              <ul className="space-y-1 text-sm">
                {actividadReciente.map((log, i) => {
                  // formateamos la fecha en local
                  const fecha = new Date(log.createdAt).toLocaleString();

                  if (log.logTipo === 'nivel') {
                    return (
                      <li key={i}>
                        Nivel {log.referenciaId} {log.completado ? 'completado' : 'no completado'}.{' '}
                        Puntuación: {log.puntuacion} – {fecha}
                      </li>
                    );
                  }

                  if (log.logTipo === 'tema') {
                    return (
                      <li key={i}>
                        Tema {log.referenciaId} completado – {fecha}
                      </li>
                    );
                  }

                  // Por si hay otros tipos no contemplados
                  return (
                    <li key={i}>
                      {log.logTipo} {log.referenciaId} – {fecha}
                    </li>
                  );
                })}
              </ul>
            )
          }
        </div>
      </section>
    </div>
  );
}
