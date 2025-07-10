// src/pages/ClassDetailPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { claseService } from '../services/claseService';
import ErrorMessage from '../components/ErrorMessage';
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
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Expulsar estudiante
  const [confirmingExpel, setConfirmingExpel] = useState(null);
  // Modal para mostrar todos los estudiantes
  const [showStudentsModal, setShowStudentsModal] = useState(false);


  // Llamada a la API
  const fetchClass = useCallback(
    () => claseService.verClase(id, limitLogs),
    [id, limitLogs]
  );
  const { data, isLoading, error, refetch } = useApi(fetchClass);

  // Inicializar nombre al cargar
  //useEffect(() => {
  //  if (data?.clase && !editing) setName(data.clase.nombre);
  //}, [data, editing]);

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

  const startDelete = () => {
    setConfirmDelete(true);
    setTimeout(() => setConfirmDelete(false), 2000);
  }
  const handleDeleteClass = async () => {
    setGlobalError(null);
    setDeleting(true);
    try {
      await claseService.eliminarClase(id);
      navigate('/tutor/classes');
    } catch (err) {
      setGlobalError(extractError(err));
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
    setStudentModalError(null);
    try {
      await claseService.eliminarEstudiante(id, studentId);
      await refetch();
    } catch (err) {
      setStudentModalError(extractError(err));
    } finally {
      setConfirmingExpel(null);
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
          {!confirmDelete ? (
            <button
              onClick={startDelete}
              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
              title="Eliminar clase"
            >
              🗑️
            </button>
          ) : (
            <button
              onClick={handleDeleteClass}
              disabled={deleting}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded disabled:opacity-50"
              title="Confirmar eliminación"
            >
              ✓
            </button>
          )}
        </div>
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={cancelEdit}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-11/12 max-w-sm no-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Renombrar clase</h3>
            {editError && <ErrorMessage error={editError} />}
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
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
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => {setShowStudentsModal(false); setStudentModalError(null);}}  /* click fuera cierra */
        >
          <div
            className="bg-white w-11/12 max-w-lg max-h-[80vh] p-6 rounded overflow-y-auto no-scrollbar"
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
