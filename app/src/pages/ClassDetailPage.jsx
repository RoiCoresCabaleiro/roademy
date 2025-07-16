// src/pages/ClassDetailPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { claseService } from '../services/claseService';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmationModal from '../components/ConfirmationModal';
import Portal from '../components/Portal';
import { extractError } from '../utils/errorHandler';
import { formatNivelId } from '../utils/formatters';
import { copyToClipboard } from '../utils/clipboard';

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
  const [globalError, setGlobalError] = useState(null);
  const [editError, setEditError] = useState(null);
  const [studentModalError, setStudentModalError] = useState(null); 
  // Editar clase (nombre)
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // Copiar código
  const [copied, setCopied] = useState(false);
  // Borrar clase
  const [confirmDeleteClass, setConfirmDeleteClass] = useState(false);
  const [isDeletingClass, setIsDeletingClass] = useState(false);
  const [errorDeleteClass, setErrorDeleteClass] = useState(null);
  // Expulsar estudiante
  const [expelId, setExpelId] = useState(null);
  const [isExpelling, setIsExpelling] = useState(false);
  const [errorExpel, setErrorExpel] = useState(null);
  // Modal para mostrar todos los estudiantes
  const [showStudentsModal, setShowStudentsModal] = useState(false);


  // Llamada a la API
  const fetchClass = useCallback(
    () => claseService.verClase(id, limitLogs),
    [id, limitLogs]
  );
  const { data, isLoading, error, refetch } = useApi(fetchClass);

  // Polling cada 10 s para recargar TODO el data (cabecera, estudiantes y actividad)
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 10_000);  // 10 segundos en milisegundos
    return () => clearInterval(intervalId);
  }, [refetch]);

  // Guards
  if (isLoading && !data) return <div className="p-4">Cargando detalles…</div>;
  if (error)
    return (
      <div className="p-4">
        <ErrorMessage error={error} />
      </div>
    );

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
   const startEdit = () => {
    setEditing(true);
    setEditError(null);
    if (data?.clase) setName(data.clase.nombre);
  };
  const cancelEdit = () => {
    setEditing(false);
    setEditError(null);
    if (data?.clase) setName(data.clase.nombre);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setEditError(null);
    setIsSaving(true);
    try {
      await claseService.actualizarClase(id, name.trim());
      setEditing(false);
      await refetch();
    } catch (err) {
      setEditError(extractError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestDeleteClass = () => {
    setErrorDeleteClass(null);
    setConfirmDeleteClass(true);
  };

  const handleConfirmDeleteClass = async () => {
    setErrorDeleteClass(null);
    setIsDeletingClass(true);
    try {
      await claseService.eliminarClase(id);
      navigate('/tutor/classes');
    } catch (err) {
      setErrorDeleteClass(extractError(err));
    } finally {
      setIsDeletingClass(false);
      // Sólo cerramos el modal aquí si quieres:
      // setConfirmDeleteClass(false);
    }
  };

  const handleRequestExpel = (studentId) => {
    setErrorExpel(null);
    setExpelId(studentId);
  };
  const handleExpel = async () => {
    setErrorExpel(null);
    setIsExpelling(true);
    try {
      await claseService.eliminarEstudiante(id, expelId);
      await refetch();
      setExpelId(null);
    } catch (err) {
      setErrorExpel(extractError(err));
      setIsExpelling(false);
    } finally {
      setIsExpelling(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Navegación atrás, nombreclase y editar*/}
      <div className='flex items-center gap-4 mb-4'>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          &larr;
        </button>
        <h2 className="text-2xl font-bold flex-1 flex justify-center">{clase.nombre}</h2>
        <button
          onClick={startEdit}
          className="px-2 py-1 bg-yellow-500 rounded hover:bg-yellow-600"
          title="Editar clase"
        >
          ✏️
        </button>
      </div>

      {/* copiar código y eliminar */}
      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-center ml-6">
          <button
            onClick={async () => {
              const ok = await copyToClipboard(clase.codigo);
              if (ok) {
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              } else {
                setGlobalError('No se pudo copiar el código');
              }
            }}
            className={`px-2 py-1 rounded ${copied ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-200 hover:bg-gray-300'}`}
            title="Copiar código"
          >
            {clase.codigo} 📋
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRequestDeleteClass}
            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
            title="Eliminar clase"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {editing && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={cancelEdit}
          >
            <div
              className="bg-white p-6 rounded shadow-lg w-11/12 max-w-sm no-scrollbar space-y-2"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Renombrar clase</h3>
              
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />

              {editError && <ErrorMessage error={editError} />}

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  disabled={isSaving}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {globalError && !editing && !showStudentsModal && <ErrorMessage error={globalError} />}

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
                  
                  <button
                    type="button"
                    onClick={() => handleRequestExpel(u.id)}
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Expulsar
                  </button>
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
                  const user = estudiantes.find(u => u.id === log.usuarioId);

                  let bg = 'bg-red-100';
                  if (log.logTipo === 'tema') {
                    bg = 'bg-yellow-100';
                  } else if (log.logTipo === 'nivel' && log.completado) {
                    bg = log.nivelTipo === 'leccion' ? 'bg-green-100' : 'bg-blue-100';
                  } else if (log.logTipo === 'minijuego') {
                    bg = 'bg-purple-100';
                  }
                  
                  let left, right;
                  if (log.logTipo === 'minijuego') {
                    left = (
                      <span className="text-sm">
                        {user?.nombre || 'Alumno'} : {log.nombre}
                      </span>
                    );
                    right = (
                      <span className="text-sm">
                        Puntuación: {log.puntuacion} - {format(parseISO(log.createdAt), '[HH:mm]')}
                      </span>
                    );
                  } else {
                    const action = log.logTipo === 'tema'
                      ? `${user?.nombre || 'Alumno'} completó el tema ${log.referenciaId}`
                      : `${user?.nombre || 'Alumno'} : Nivel ${formatNivelId(log.referenciaId)}`;

                    const score = log.puntuacion != null
                      ? log.nivelTipo === 'leccion'
                        ? `Estrellas: ${log.puntuacion}★ - `
                        : `Nota: ${log.puntuacion} - `
                      : '';

                    const intento = log.intento != null ? `Intento: ${log.intento} - ` : '';

                    left = <span className="text-sm">{action}</span>;
                    right = (
                      <span className="text-sm">
                        {score}{intento}{format(parseISO(log.createdAt), '[HH:mm]')}
                      </span>
                    );
                  }

                  return (
                    <li
                      key={i}
                      className={`${bg} p-2 rounded flex justify-between items-center`}
                    >
                      {left} {right}
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
        <Portal>
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => {setShowStudentsModal(false); setStudentModalError(null);}}  /* click fuera cierra */
          >
            <div
              className="bg-white w-11/12 max-w-lg max-h-[80vh] py-6 px-4 rounded overflow-y-auto no-scrollbar md:px-6"
              onClick={e => e.stopPropagation()} /* click dentro no cierra */
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-semibold">Todos los estudiantes</h4>
                <button
                  onClick={() => {setShowStudentsModal(false); setStudentModalError(null);}}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
              {studentModalError && <ErrorMessage error={studentModalError} />}
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

                    <button
                      type="button"
                      onClick={() => handleRequestExpel(u.id)}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                    >
                      Expulsar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Portal>
      )}

      {/* — MODAL DE CONFIRMACIÓN DE EXPULSIÓN — */}
      <ConfirmationModal
        isOpen={expelId !== null}
        title="Expulsar estudiante"
        message="¿Estás seguro de que quieres expulsar a este estudiante?"
        onCancel={() => setExpelId(null)}
        onConfirm={handleExpel}
        isLoading={isExpelling}
      >
        {errorExpel && (
          <div className="mt-2">
            <ErrorMessage error={errorExpel} />
          </div>
        )}
      </ConfirmationModal>


      {/* — MODAL DE CONFIRMACIÓN DE ELIMINAR CLASE — */}
      <ConfirmationModal
        isOpen={confirmDeleteClass}
        title="Eliminar clase"
        message="¿Estás seguro de que quieres eliminar esta clase? Esta acción no se puede deshacer."
        onCancel={() => {
          setConfirmDeleteClass(false);
          setErrorDeleteClass(null);
        }}
        onConfirm={handleConfirmDeleteClass}
        isLoading={isDeletingClass}
      >
        {errorDeleteClass && (
          <div className="mt-2">
            <ErrorMessage error={errorDeleteClass} />
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
}
