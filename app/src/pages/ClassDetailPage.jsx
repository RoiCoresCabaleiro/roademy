// src/pages/ClassDetailPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { claseService } from '../services/claseService';
import ErrorMessage from '../components/ErrorMessage';
import { extractError } from '../utils/errorHandler';
import { formatNivelId } from '../utils/formatters';

import { format, parseISO } from 'date-fns';


export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const STORAGE_KEY = `class-${id}-limitLogs`;
  const [limitLogs, setLimitLogs] = useState(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored != null ? Number(stored) : 30;
  });

  // Estados de la UI
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorOp, setErrorOp] = useState(null);

  const [copied, setCopied] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [confirmingExpel, setConfirmingExpel] = useState(null);

  const [showStudentsModal, setShowStudentsModal] = useState(false);


  // Llamada a la API
  const fetchClass = useCallback(
    () => claseService.verClase(id, limitLogs),
    [id, limitLogs]
  );
  const { data, isLoading, error, refetch } = useApi(fetchClass);

  // Inicializar nombre al cargar
  useEffect(() => {
    if (data?.clase && !editing) {
      setName(data.clase.nombre);
    }
  }, [data, editing]);

  // Polling cada 10 s para recargar TODO el data (cabecera, estudiantes y actividad)
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 10_000);  // 10 segundos en milisegundos
    return () => clearInterval(intervalId);
  }, [refetch]);

  // Guards
  if (isLoading && !data) return <div className="p-4">Cargando detalles…</div>;
  if (error) return <ErrorMessage error={error} />;

  const { clase, estudiantes = [], actividadReciente = [] } = data;

  const previewStudents = estudiantes.slice(0, 3);

  // Agrupar actividad por día
  const actividadesPorDia = actividadReciente.reduce((acc, log) => {
    const dia = format(parseISO(log.createdAt), 'yyyy-MM-dd');
    acc[dia] = acc[dia] || [];
    acc[dia].push(log);
    return acc;
  }, {});

  // Handlers
  const handleSave = async () => {
    if (!name.trim()) return;
    setErrorOp(null);
    setIsSaving(true);
    try {
      await claseService.actualizarClase(id, name.trim());
      setEditing(false);
      await refetch();
    } catch (err) {
      setErrorOp(extractError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clase.codigo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const startDelete = () => setConfirmDelete(true);
  const cancelDelete = () => setConfirmDelete(false);
  const handleDeleteClass = async () => {
    setErrorOp(null);
    setDeleting(true);
    try {
      await claseService.eliminarClase(id);
      navigate('/tutor/classes');
    } catch (err) {
      setErrorOp(extractError(err));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleRequestExpel = (studentId) => {
    setConfirmingExpel(studentId);
    setTimeout(() => {
      setConfirmingExpel(null);
    }, 2000);
  };

  const handleConfirmExpel = async (studentId) => {
    setErrorOp(null);
    try {
      await claseService.eliminarEstudiante(id, studentId);
      await refetch();
    } catch (err) {
      setErrorOp(extractError(err));
    } finally {
      setConfirmingExpel(null);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {errorOp && <ErrorMessage error={errorOp} />}

      {/* Navegación atrás */}
      <button
        onClick={() => navigate(-1)}
        className="text-gray-600 hover:text-gray-800 mb-2"
      >
        ← Volver a clases
      </button>

      {/* Cabecera con editar, copiar código y eliminar */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          {editing ? (
            <div className="flex space-x-2 flex-1">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="border px-2 py-1 rounded flex-1"
              />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold flex-1">{clase.nombre}</h2>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1 bg-yellow-500 text-white rounded mr-2"
              >
                Editar
              </button>
              <button
                onClick={handleCopy}
                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 mr-2"
              >
                Código: <span className="font-mono">{clase.codigo}</span>
              </button>
              {copied && (
                <span className="text-green-600 ml-2">Copiado</span>
              )}
              {!confirmDelete ? (
                <button
                  onClick={startDelete}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Borrar clase
                </button>
              ) : (
                <button
                  onClick={handleDeleteClass}
                  disabled={deleting}
                  className="px-3 py-1 bg-red-800 text-white rounded mr-2 disabled:opacity-50"
                >
                  Confirmar borrado
                </button>
              )}
              {confirmDelete && (
                <button
                  onClick={cancelDelete}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  Cancelar
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {/* Estudiantes */}
      <section className='mb-10'>
        <h3 className="font-semibold mb-2">Estudiantes</h3>
        {estudiantes.length === 0 ? (
          <p>No hay estudiantes.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {previewStudents.map(u => (
                <li
                  key={u.id}
                  className="flex justify-between items-center border rounded p-2"
                >
                  <div>
                    <p className="font-medium">{u.nombre}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                    <p className="text-sm text-gray-600">
                      ⭐ {u.estrellasObtenidasCurso}/{u.estrellasPosiblesCurso} ·{' '}
                      {u.porcentajeProgresoTotal}%
                    </p>
                  </div>
                  {confirmingExpel === u.id ? (
                    <button
                      onClick={() => handleConfirmExpel(u.id)}
                      className="px-2 py-1 bg-red-800 text-white rounded"
                    >
                      Confirmar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRequestExpel(u.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Expulsar
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {estudiantes.length > 3 && (
              <button
                onClick={() => setShowStudentsModal(true)}
                className="mt-2 text-blue-600 hover:underline"
              >
                Mostrar todos ({estudiantes.length})
              </button>
            )}
          </>
        )}
      </section>

      {/* Actividad reciente por días */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Actividad reciente</h3>

          <div className="flex items-center justify-end space-x-2 mb-2">
            <label htmlFor="limitLogs" className="text-sm">Nº de registros:</label>
            <select
              id="limitLogs"
              value={limitLogs}
              onChange={e => {
                const v = Number(e.target.value);
                setLimitLogs(v);
                sessionStorage.setItem(STORAGE_KEY, v);
              }}
              className="border px-2 py-1 rounded text-sm"
            >
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={0}>Todos</option>
            </select>
          </div>

          <button
            onClick={() => refetch()}
            className="text-sm text-blue-600 hover:underline"
          >
            Refrescar
          </button>
        </div>
        {actividadReciente.length === 0 ? (
          <p className="text-sm text-gray-500">Sin actividad reciente</p>
        ) : (
          Object.entries(actividadesPorDia).map(([dia, logs]) => (
            <div key={dia} className="mb-4">
              <h4 className="text-lg font-medium">
                {format(parseISO(dia), 'dd/MM/yyyy')}
              </h4>
              <ul className="space-y-1 mt-2">
                {logs.map((log, i) => {
                  // Encuentra nombre de usuario
                  const user = estudiantes.find(u => u.id === log.usuarioId);
                  // Determina estilo
                  let bg = 'bg-red-100';
                  if (log.logTipo === 'tema') bg = 'bg-yellow-100';
                  if (log.logTipo === 'nivel' && log.completado) {
                    bg = log.nivelTipo === 'leccion' ? 'bg-green-100' : 'bg-blue-100';
                  }
                  // Mensaje
                  const action = log.logTipo === 'tema'
                    ? `${user?.nombre || 'Alumno'} completó el tema ${log.referenciaId}`
                    : `${user?.nombre || 'Alumno'} : Nivel ${formatNivelId(log.referenciaId)}`;
                  const score = log.puntuacion != null
                    ? log.logTipo === 'nivel'
                      ? `${log.nivelTipo === 'leccion' ? `Estrellas: ${log.puntuacion}★ - ` : `Nota: ${log.puntuacion}/100 - `}`
                      : ''
                    : '';
                  const intento = log.intento != null
                    ? `Intento: ${log.intento} - `
                    : '';
                  return (
                    <li
                      key={i}
                      className={`${bg} p-2 rounded flex justify-between items-center`}
                    >
                      <span className="text-sm">
                        {action}
                      </span>
                      <span className="text-sm font-mono">
                        {score} {intento} {format(parseISO(log.createdAt), '[HH:mm]')}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </section>

      {/* MODAL DE ESTUDIANTES */}
      {showStudentsModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowStudentsModal(false)}  /* click fuera cierra */
        >
          <div
            className="bg-white w-11/12 max-w-lg max-h-[80vh] p-4 rounded overflow-y-auto no-scrollbar"
            onClick={e => e.stopPropagation()} /* click dentro no cierra */
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-semibold">Todos los estudiantes</h4>
              <button
                onClick={() => setShowStudentsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <ul className="space-y-2">
              {estudiantes.map(u => (
                <li
                  key={u.id}
                  className="flex justify-between items-center border rounded p-2"
                >
                  <div>
                    <p className="font-medium">{u.nombre}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                    <p className="text-sm text-gray-600">
                      ⭐ {u.estrellasObtenidasCurso}/{u.estrellasPosiblesCurso} · {u.porcentajeProgresoTotal}%
                    </p>
                  </div>
                  {/* Botón expulsar con confirmación */}
                  {confirmingExpel === u.id ? (
                    <button
                      onClick={() => handleConfirmExpel(u.id)}
                      className="px-2 py-1 bg-red-800 text-white rounded"
                    >
                      Confirmar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRequestExpel(u.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Expulsar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
