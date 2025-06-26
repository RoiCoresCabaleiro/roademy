import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { usuarioService } from '../services/usuarioService';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from '../components/ErrorMessage';
import { extractError } from '../utils/errorHandler';

export default function StudentDashboard() {
  const { logout } = useAuth();

  // Hooks de estado – siempre en el top, antes de cualquier return
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    antiguaContraseña: '',
    contraseña: '',
    contraseña2: ''
  });
  const [errorEdit, setErrorEdit] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [joinCode, setJoinCode] = useState('');
  const [errorClass, setErrorClass] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [delPassword, setDelPassword] = useState('');
  const [errorDel, setErrorDel] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Perfil básico
  const {
    data: profileData,
    isLoading: loadingProfile,
    error: errorProfile,
    refetch: refetchProfile
  } = useApi(() => usuarioService.getProfile(), []);

  // 2. Dashboard (progreso + actividad)
  const {
    data: dashboard,
    isLoading: loadingDash,
    error: errorDash
  } = useApi(() => usuarioService.getDashboard(), []);

  // Mientras carga o hay error salimos antes de renderizar el resto
  if (loadingProfile || loadingDash) return <div className="p-4">Cargando datos...</div>;
  if (errorProfile) return <ErrorMessage error={errorProfile} />;
  if (errorDash) return <ErrorMessage error={errorDash} />;

  // Tras carga exitosa inicializamos el formulario con los datos del usuario
  const { user } = profileData;
  const { progresoTotalCurso, progresoTemaActual, actividadReciente } = dashboard;

  // Al montar, rellenamos el form con nombre/email
  if (!form.nombre) {
    setForm(f => ({ ...f, nombre: user.nombre, email: user.email }));
  }

  // Helpers
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. Editar perfil
  const handleSaveProfile = async () => {
    setErrorEdit(null);
    setIsSaving(true);
    try {
      const payload = { nombre: form.nombre, email: form.email };
      if (form.contraseña) {
        payload.antiguaContraseña = form.antiguaContraseña;
        payload.contraseña = form.contraseña;
      }
      await usuarioService.updateProfile(payload);
      await refetchProfile();
      setIsEditing(false);
      // limpia campos de contraseña
      setForm(f => ({ ...f, antiguaContraseña: '', contraseña: '', contraseña2: '' }));
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
      localStorage.removeItem('accessToken');
      logout();
    } catch (err) {
      setErrorDel(extractError(err));
      setIsDeleting(false);
    }
  };

  return (
    <div className="pb-16 p-4 space-y-6">
      {/* TARJETA 1: PERFIL */}
      <section className="p-4 space-y-2 bg-white shadow rounded">
        <div className="flex justify-between">
          <h2 className="font-semibold">Mi Perfil</h2>
          <button
            className="text-blue-500"
            onClick={() => {
              // Al cancelar, limpiamos campos de contraseña
              if (isEditing) {
                setForm(f => ({ ...f, antiguaContraseña: '', contraseña: '', contraseña2: '' }));
                setErrorEdit(null);
              }
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {errorEdit && <ErrorMessage error={errorEdit} />}

        {isEditing ? (
          <div className="space-y-2">
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              className="w-full border px-2 py-1 rounded"
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full border px-2 py-1 rounded"
            />
            <hr className="my-2" />
            <input
              type="password"
              name="antiguaContraseña"
              value={form.antiguaContraseña}
              onChange={handleChange}
              placeholder="Contraseña actual"
              className="w-full border px-2 py-1 rounded"
            />
            <input
              type="password"
              name="contraseña"
              value={form.contraseña}
              onChange={handleChange}
              placeholder="Contraseña nueva"
              className="w-full border px-2 py-1 rounded"
            />
            <input
              type="password"
              name="contraseña2"
              value={form.contraseña2}
              onChange={handleChange}
              placeholder="Repite contraseña nueva"
              className="w-full border px-2 py-1 rounded"
            />
            <button
              onClick={handleSaveProfile}
              disabled={
                isSaving ||
                (form.contraseña && form.contraseña !== form.contraseña2)
              }
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
              Guardar
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
            <button
              onClick={handleLeave}
              disabled={isLeaving}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
            >
              Abandonar Clase
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-gray-500">No perteneces a ninguna clase</p>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              placeholder="Código de la clase"
              className="w-full border px-2 py-1 rounded"
            />
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Unirse a Clase
            </button>
          </div>
        )}
      </section>

      {/* TARJETA 3: PROGRESO Y ACTIVIDAD */}
      <section className="space-y-4">
        {/* Progreso Total */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">Progreso Total</h2>
          <p>
            {progresoTotalCurso.porcentajeProgresoTotal}% — ⭐{' '}
            {progresoTotalCurso.estrellasObtenidasCurso}/
            {progresoTotalCurso.estrellasPosiblesCurso}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{ width: `${progresoTotalCurso.porcentajeProgresoTotal}%` }}
            />
          </div>
        </div>

        {/* Tema Actual */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">
            Tema Actual: {progresoTemaActual.titulo}
          </h2>
          <div className="relative w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{
                width: `${
                  (progresoTemaActual.estrellasObtenidas /
                    progresoTemaActual.estrellasPosibles) *
                  100
                }%`
              }}
            />
            <div
              className="absolute top-0 h-4 w-1 bg-red-500"
              style={{
                left: `${
                  (progresoTemaActual.estrellasNecesarias /
                    progresoTemaActual.estrellasPosibles) *
                  100
                }%`
              }}
            />
          </div>
          <p>
              Niveles completados:{' '}
              <span className={progresoTemaActual.completados < progresoTemaActual.totalNiveles ? 'text-red-500' : 'text-green-500'}>
                {progresoTemaActual.completados}/{progresoTemaActual.totalNiveles}
              </span>
          </p>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">Actividad Reciente</h2>
          {actividadReciente.length === 0 ? (
            <p className="text-sm text-gray-500">Sin actividad reciente</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {actividadReciente.map((log, i) => {
                const fecha = new Date(log.createdAt).toLocaleString();
                if (log.logTipo === 'nivel') {
                  return (
                    <li key={i}>
                      Nivel {log.referenciaId}{' '}
                      {log.completado ? 'completado' : 'no completado'}.{' '}
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
                return (
                  <li key={i}>
                    {log.logTipo} {log.referenciaId} – {fecha}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* TARJETA 4: ELIMINAR CUENTA */}
      <section className="p-4 bg-white shadow rounded">
        <h2 className="font-semibold">Eliminar Cuenta</h2>
        {!confirmingDelete ? (
          <button
            onClick={() => {
              setConfirmingDelete(true);
              setErrorDel(null);
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
                Confirmar Baja
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
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