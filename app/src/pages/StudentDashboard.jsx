// src/pages/StudentDashboard.jsx

import { useState, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { usuarioService } from '../services/usuarioService';
import ErrorMessage from '../components/ErrorMessage';
import { extractError } from '../utils/errorHandler';
import { formatNivelId } from '../utils/formatters';

import { format, parseISO } from 'date-fns';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';


export default function StudentDashboard() {
  const { logout } = useAuth();

  // Hooks de estado – siempre en el top, antes de cualquier return
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', antiguaContraseña: '', contraseña: '' });
  const [errorEdit, setErrorEdit] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [joinCode, setJoinCode] = useState('');
  const [errorClass, setErrorClass] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [confirmLeaving, setConfirmLeaving] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [delPassword, setDelPassword] = useState('');
  const [errorDel, setErrorDel] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [limitLogs, setLimitLogs] = useState(5);

  // 1. Perfil básico
  const {
    data: profileData,
    isLoading: loadingProfile,
    error: errorProfile,
    refetch: refetchProfile
  } = useApi(usuarioService.getProfile);

  // 2. Dashboard (progreso + actividad)
  const fetchDashboard = useCallback(
    () => usuarioService.getDashboard(limitLogs),
    [limitLogs]
  );
  const {
    data: dashboard,
    isLoading: loadingDash,
    error: errorDash,
  } = useApi(fetchDashboard);

  // Mientras carga o hay error salimos antes de renderizar el resto
  if (loadingProfile || (loadingDash && !dashboard)) return <div className="p-4">Cargando datos...</div>;
  if (errorProfile) return <ErrorMessage error={errorProfile} />;
  if (errorDash) return <ErrorMessage error={errorDash} />;

  // Tras carga exitosa inicializamos el formulario con los datos del usuario
  const { user } = profileData;
  const { progresoTotalCurso, progresoTemaActual, actividadReciente } = dashboard;

  // Agrupar actividad por día
  const actividadesPorDia = actividadReciente.reduce((acc, log) => {
    const dia = format(parseISO(log.createdAt), 'yyyy-MM-dd');
    acc[dia] = acc[dia] || [];
    acc[dia].push(log);
    return acc;
  }, {});

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. Editar perfil
  const handleSaveProfile = async () => {
    setErrorEdit(null);
    setIsSaving(true);
    try {
      const payload = {};
      if (form.nombre.trim()) {
        payload.nombre = form.nombre.trim();
      }
      if (form.email.trim()) {
        payload.email = form.email.trim();
      }
      if (form.contraseña) {
        payload.antiguaContraseña = form.antiguaContraseña;
        payload.contraseña = form.contraseña;
      }
      await usuarioService.updateProfile(payload);
      await refetchProfile();
      setIsEditing(false);
      setForm(f => ({ ...f, antiguaContraseña: '', contraseña: '' }));
    } catch (err) {
      setErrorEdit(extractError(err));
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Unirse / Abandonar clase
  const handleJoin = async () => {
    setErrorClass(null);
    setIsJoining(true);
    try {
      await usuarioService.joinClass(joinCode);
      await refetchProfile();
      setJoinCode('');
    } catch (err) {
      setErrorClass(extractError(err));
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    setErrorClass(null);
    setIsLeaving(true);
    try {
      await usuarioService.leaveClass();
      await refetchProfile();
    } catch (err) {
      setErrorClass(extractError(err));
    } finally {
      setIsLeaving(false);
    }
  };

  // 5. Eliminar cuenta
  const handleDelete = async () => {
    setErrorDel(null);
    setIsDeleting(true);
    try {
      await usuarioService.deleteAccount(delPassword);
      logout();
    } catch (err) {
      setErrorDel(extractError(err));
      setIsDeleting(false);
    }
  };

  return (
    <div className="pb-8 p-4 space-y-6">
      <section className="md:hidden relative p-4 ">
        <button
          onClick={logout}
          className="absolute top-2 right-0 inline-flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          title="Cerrar sesión"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
          Cerrar sesión
        </button>
      </section>
      {/* TARJETA 1: PERFIL */}
      <section className="relative p-4 space-y-2 bg-white shadow rounded">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Mi Perfil</h2>
          <button
            className="text-blue-500"
            onClick={() => {
              if (!isEditing) {
                setForm({ nombre: '', email: '', antiguaContraseña: '', contraseña: '' });
                setErrorEdit(null);
              } else {
                setForm(f => ({ ...f, antiguaContraseña: '', contraseña: '' }));
                setErrorEdit(null);
              }
              setIsEditing(prev => !prev);
            }}
          >
            {isEditing ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {errorEdit && <ErrorMessage error={errorEdit} />}

        {isEditing ? (
          <div className="space-y-4">
            {/* Nombre */}
            <div className="flex flex-col">
              <label htmlFor="nombre" className="text-sm font-medium">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder={user.nombre}
                className="w-full border px-2 py-1 rounded"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={user.email}
                className="w-full border px-2 py-1 rounded"
              />
            </div>

            <hr className="my-2" />

            {/* Contraseña actual */}
            <div className="flex flex-col">
              <label htmlFor="antiguaContraseña" className="text-sm font-medium">
                Contraseña actual
              </label>
              <input
                id="antiguaContraseña"
                type="password"
                name="antiguaContraseña"
                value={form.antiguaContraseña}
                onChange={handleChange}
                placeholder=""
                className="w-full border px-2 py-1 rounded"
              />
            </div>

            {/* Contraseña nueva */}
            <div className="flex flex-col">
              <label htmlFor="contraseña" className="text-sm font-medium">
                Contraseña nueva
              </label>
              <input
                id="contraseña"
                type="password"
                name="contraseña"
                value={form.contraseña}
                onChange={handleChange}
                placeholder=""
                className="w-full border px-2 py-1 rounded"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSaving || (form.contraseña && !form.antiguaContraseña)}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
              Guardar cambios
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <p><strong>Nombre:</strong> {user.nombre}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}
      </section>

      {/* TARJETA 2: CLASE */}
      <section className="p-4 space-y-2 bg-white shadow rounded">
        <h2 className="font-semibold">Mi Clase</h2>
        {errorClass && <ErrorMessage error={errorClass} />}

        {user.clase ? (
          <div className="space-y-1">
            <p><strong>Nombre:</strong> {user.clase.nombre}</p>
            <p><strong>Código:</strong> {user.clase.codigo}</p>
            <p>
              <strong>Tutor:</strong> {user.clase.tutor.nombre} ({user.clase.tutor.email})
            </p>
            {!confirmLeaving ? (
              <button
                onClick={() => {
                  setErrorClass(null);
                  setConfirmLeaving(true);
                  setTimeout(() => setConfirmLeaving(false), 2000);
                }}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
              >
                Abandonar Clase
              </button>
            ) : (
              <button
                onClick={handleLeave}
                disabled={isLeaving}
                className="mt-2 px-4 py-2 bg-red-800 text-white rounded disabled:opacity-50"
              >
                Confirmar
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-gray-500">No perteneces a ninguna clase</p>
            <div className="flex inline-flex items-center space-x-2 pt-2">
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                placeholder="Código de la clase"
                className="border px-2 py-1 rounded"
              />
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Unirse
              </button>
            </div>
          </div>
        )}
      </section>

      {/* TARJETA 3: PROGRESO Y ACTIVIDAD */}
      <section className="space-y-4">
        {/* Progreso Total */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">Progreso Total</h2>
          <p>
            {progresoTotalCurso.estrellasObtenidasCurso}/{progresoTotalCurso.estrellasPosiblesCurso} ⭐{' '} ({progresoTotalCurso.porcentajeProgresoTotal}%)
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2 overflow-hidden">
            {progresoTotalCurso.estrellasObtenidasCurso < progresoTotalCurso.estrellasPosiblesCurso ? (
              <div
                className="bg-green-500 h-4"
                style={{ width: `${progresoTotalCurso.porcentajeProgresoTotal}%` }}
              />
            ) : (
              <div
                className="bg-yellow-500 h-4"
              />
            )}
          </div>
        </div>

        {/* Tema Actual */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">
            Tema Actual: {progresoTemaActual.titulo}
          </h2>
          <p>
            {progresoTemaActual.estrellasObtenidas}/{progresoTemaActual.estrellasPosibles} ⭐ {' '} ({progresoTemaActual.porcentaje}%)
          </p>
          <div className="relative w-full bg-gray-200 rounded-full h-4 mb-2 mt-2 overflow-hidden">
            {progresoTemaActual.estrellasObtenidas < progresoTemaActual.estrellasPosibles ? (
              <>
                <div
                  className="bg-blue-500 h-4"
                  style={{ width: `${ (progresoTemaActual.estrellasObtenidas / progresoTemaActual.estrellasPosibles) * 100 }%` }}
                />
                <div
                  className={progresoTemaActual.estrellasObtenidas < progresoTemaActual.estrellasNecesarias ? "absolute top-0 h-4 w-2 bg-red-500" : "absolute top-0 h-4 w-2 bg-green-500"}
                  style={{ left: `${ (progresoTemaActual.estrellasNecesarias / progresoTemaActual.estrellasPosibles) * 100 }%` }}
                />
              </>
            ) : (
              <div
                className="bg-yellow-500 h-4"
              />
            )}
          </div>
          <h2 className="font-semibold mb-2">
            Requisitos para completar el tema:
          </h2>
          <p>
            Estrellas:{' '}
            <span className={progresoTemaActual.estrellasObtenidas < progresoTemaActual.estrellasNecesarias ? 'text-red-500' : 'text-green-500'}>
              {progresoTemaActual.estrellasObtenidas}/{progresoTemaActual.estrellasNecesarias}
            </span>
          </p>
          <p>
              Niveles completados:{' '}
              <span className={progresoTemaActual.completados < progresoTemaActual.totalNiveles ? 'text-red-500' : 'text-green-500'}>
                {progresoTemaActual.completados}/{progresoTemaActual.totalNiveles}
              </span>
          </p>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white shadow rounded p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Actividad Reciente</h2>
          
            <div className="flex items-center justify-end space-x-2 mb-2">
              <label htmlFor="limitLogs" className="text-sm">Nº de registros:</label>
              <select
                id="limitLogs"
                value={limitLogs}
                onChange={e => setLimitLogs(Number(e.target.value))}
                className="border px-2 py-1 rounded text-sm"
              >
                <option value={5}>5</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={0}>Todos</option>
              </select>
            </div>
          </div>
          {actividadReciente.length === 0 ? (
            <p className="text-sm text-gray-500">Sin actividad reciente</p>
          ) : (
            Object.entries(actividadesPorDia).map(([dia, logs]) => (
              <div key={dia} className="mb-4">
                {/* Fecha agrupada */}
                <h4 className="text-lg font-medium">
                  {format(parseISO(dia), 'dd/MM/yyyy')}
                </h4>
                <ul className="space-y-1 mt-2">
                  {logs.map((log, i) => {
                    // Determina estilo
                    let bg = 'bg-red-100';
                    if (log.logTipo === 'tema') bg = 'bg-yellow-100';
                    if (log.logTipo === 'nivel' && log.completado) {
                      bg = log.nivelTipo === 'leccion' ? 'bg-green-100' : 'bg-blue-100';
                    }
                    // Crear mensaje
                    const action = log.logTipo === 'tema'
                        ? `Tema ${log.referenciaId} completado`
                        : `Nivel ${formatNivelId(log.referenciaId)}`;
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
        </div>
      </section>

      {/* TARJETA 4: ELIMINAR CUENTA */}
      <section className="p-4 bg-white shadow rounded space-y-2">
        <h2 className="font-semibold">Eliminar Cuenta</h2>
        {!confirmingDelete ? (
          <button
            onClick={() => {
              setErrorDel(null);
              setDelPassword('');
              setConfirmingDelete(true);
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
          >
            Darse de Baja
          </button>
        ) : (
          <div className="space-y-2">
            {errorDel && <ErrorMessage error={errorDel} />}
            <input
              type="password"
              value={delPassword}
              onChange={e => setDelPassword(e.target.value)}
              placeholder="Tu contraseña"
              className="w-full border px-2 py-1 rounded"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setConfirmingDelete(false)
                  setDelPassword('');
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}