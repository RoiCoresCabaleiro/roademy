// src/pages/StudentDashboard.jsx

import { useState, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { usuarioService } from "../services/usuarioService";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmationModal from "../components/ConfirmationModal";
import Portal from "../components/Portal";
import { extractError } from "../utils/errorHandler";
import { formatNivelId } from "../utils/formatters";

import { format, parseISO } from "date-fns";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function StudentDashboard() {
  const { logout } = useAuth();

  // Estados de la UI
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    antiguaContraseña: "",
    contraseña: "",
    confirmar: "",
  });
  const [errorEdit, setErrorEdit] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [joinCode, setJoinCode] = useState("");
  const [errorClass, setErrorClass] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [confirmLeaving, setConfirmLeaving] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [delPassword, setDelPassword] = useState("");
  const [errorDel, setErrorDel] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [limitLogs, setLimitLogs] = useState(5);

  // 1. Perfil básico
  const {
    data: profileData,
    isLoading: loadingProfile,
    error: errorProfile,
    refetch: refetchProfile,
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

  if (loadingProfile || (loadingDash && !dashboard))
    return <div className="p-4">Cargando datos...</div>;
  if (errorProfile)
    return (
      <div className="p-4">
        <ErrorMessage error={errorProfile} />
      </div>
    );
  if (errorDash)
    return (
      <div className="p-4">
        <ErrorMessage error={errorDash} />
      </div>
    );

  const { user } = profileData;
  const { progresoTotalCurso, progresoTemaActual, actividadReciente } =
    dashboard;

  // Agrupar actividad por día
  const actividadesPorDia = actividadReciente.reduce((acc, log) => {
    const dia = format(parseISO(log.createdAt), "yyyy-MM-dd");
    acc[dia] = acc[dia] || [];
    acc[dia].push(log);
    return acc;
  }, {});

  // Handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setErrorEdit(null);
    setIsSaving(true);
    try {
      if (form.contraseña && form.contraseña !== form.confirmar) {
        setErrorEdit("Las contraseñas nuevas no coinciden");
        return;
      }
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
      setForm((f) => ({ ...f, antiguaContraseña: "", contraseña: "" }));
    } catch (err) {
      setErrorEdit(extractError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleJoin = async () => {
    setErrorClass(null);
    setIsJoining(true);
    try {
      await usuarioService.joinClass(joinCode);
      await refetchProfile();
      setJoinCode("");
    } catch (err) {
      setErrorClass(extractError(err));
    } finally {
      setIsJoining(false);
      setConfirmLeaving(false);
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

  const cursoCompletado =
    progresoTemaActual.completados >= progresoTemaActual.totalNiveles &&
    progresoTotalCurso.estrellasObtenidasCurso >=
      progresoTotalCurso.estrellasPosiblesCurso;

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
            className="px-1 py-1 bg-yellow-500 rounded hover:bg-yellow-600"
            onClick={() => {
              setErrorEdit(null);
              setForm({
                nombre: "",
                email: "",
                antiguaContraseña: "",
                contraseña: "",
              });
              setIsEditing(true);
            }}
          >
            ✏️
          </button>
        </div>

        <div className="space-y-1">
          <p>
            <strong>Nombre:</strong> {user.nombre}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </section>

      {/* MODAL DE EDICIÓN DE PERFIL */}
      {isEditing && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => {
              setIsEditing(false);
              setErrorEdit(null);
            }}
          >
            <div
              className="bg-white p-6 rounded shadow-lg w-11/12 max-w-md no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Editar perfil</h3>
              {/* Formulario */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium">Nombre</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder={user.nombre}
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={user.email}
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
                <hr />
                <div className="flex flex-col">
                  <label className="text-sm font-medium">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    name="antiguaContraseña"
                    value={form.antiguaContraseña}
                    onChange={handleChange}
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    name="contraseña"
                    value={form.contraseña}
                    onChange={handleChange}
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmar"
                    value={form.confirmar}
                    onChange={handleChange}
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>

                {errorEdit && <ErrorMessage error={errorEdit} />}

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setErrorEdit(null);
                    }}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    /*disabled={
                      isSaving ||
                      (form.contraseña && !form.antiguaContraseña) ||
                      (form.contraseña && form.contraseña !== form.confirmar)
                    }*/
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* TARJETA 2: CLASE */}
      <section className="p-4 space-y-2 bg-white shadow rounded">
        <h2 className="font-semibold">Mi Clase</h2>

        {user.clase ? (
          <div className="space-y-1">
            <p>
              <strong>Nombre:</strong> {user.clase.nombre}
            </p>
            <p>
              <strong>Código:</strong> {user.clase.codigo}
            </p>
            <p>
              <strong>Tutor:</strong> {user.clase.tutor.nombre} (
              {user.clase.tutor.email})
            </p>

            {/* Botón que abre el modal */}
            <button
              type="button"
              onClick={() => {
                setErrorClass(null);
                setConfirmLeaving(true);
              }}
              className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Abandonar Clase
            </button>

            {/* Modal de confirmación */}
            <ConfirmationModal
              isOpen={confirmLeaving}
              title="Abandonar clase"
              message="¿Estás seguro de que quieres abandonar esta clase?"
              onCancel={() => {
                setConfirmLeaving(false);
                setErrorClass(null);
              }}
              onConfirm={handleLeave}
              isLoading={isLeaving}
            >
              {errorClass && (
                <div className="mt-2">
                  <ErrorMessage error={errorClass} />
                </div>
              )}
            </ConfirmationModal>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-gray-500">No perteneces a ninguna clase</p>
            <div className="flex items-center justify-between space-x-4 pt-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Código de la clase"
                className="border px-2 py-1 rounded w-full"
              />
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Unirse
              </button>
            </div>

            {errorClass && (
              <div className="mt-2">
                <ErrorMessage error={errorClass} />
              </div>
            )}
          </div>
        )}
      </section>

      {/* TARJETA 3: PROGRESO Y ACTIVIDAD */}
      <section className="space-y-4">
        {/* Progreso Total */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">Progreso Total</h2>
          <div className="flex items-center justify-between">
            <p>
              {progresoTotalCurso.estrellasObtenidasCurso}/
              {progresoTotalCurso.estrellasPosiblesCurso} ⭐ (
              {progresoTotalCurso.porcentajeProgresoTotal}%)
              {cursoCompletado && (
                <span className="text-green-500 ml-4">¡Curso completado!</span>
              )}
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2 overflow-hidden">
            {progresoTotalCurso.estrellasObtenidasCurso <
            progresoTotalCurso.estrellasPosiblesCurso ? (
              <div
                className="bg-green-500 h-4"
                style={{
                  width: `${progresoTotalCurso.porcentajeProgresoTotal}%`,
                }}
              />
            ) : (
              <div className="bg-yellow-500 h-4" />
            )}
          </div>
        </div>

        {/* Tema Actual */}
        {!cursoCompletado && (
          <div className="bg-white shadow rounded p-4">
            <h2 className="font-semibold mb-2">
              Tema Actual: {progresoTemaActual.titulo}
            </h2>
            <p>
              {progresoTemaActual.estrellasObtenidas}/
              {progresoTemaActual.estrellasPosibles} ⭐ (
              {progresoTemaActual.porcentaje}%)
            </p>
            <div className="relative w-full bg-gray-200 rounded-full h-4 mb-2 mt-2 overflow-hidden">
              {progresoTemaActual.estrellasObtenidas <
              progresoTemaActual.estrellasPosibles ? (
                <>
                  <div
                    className="bg-blue-500 h-4"
                    style={{
                      width: `${
                        (progresoTemaActual.estrellasObtenidas /
                          progresoTemaActual.estrellasPosibles) *
                        100
                      }%`,
                    }}
                  />
                  <div
                    className={
                      progresoTemaActual.estrellasObtenidas <
                      progresoTemaActual.estrellasNecesarias
                        ? "absolute top-0 h-4 w-2 bg-red-500"
                        : "absolute top-0 h-4 w-2 bg-green-500"
                    }
                    style={{
                      left: `${
                        (progresoTemaActual.estrellasNecesarias /
                          progresoTemaActual.estrellasPosibles) *
                        100
                      }%`,
                    }}
                  />
                </>
              ) : (
                <div className="bg-yellow-500 h-4" />
              )}
            </div>
            <h2 className="font-semibold mb-2">
              Requisitos para completar el tema:
            </h2>
            <p>
              Estrellas:{" "}
              <span
                className={
                  progresoTemaActual.estrellasObtenidas <
                  progresoTemaActual.estrellasNecesarias
                    ? "text-red-500"
                    : "text-green-500"
                }
              >
                {progresoTemaActual.estrellasObtenidas}/
                {progresoTemaActual.estrellasNecesarias}
              </span>
            </p>
            <p>
              Niveles completados:{" "}
              <span
                className={
                  progresoTemaActual.completados <
                  progresoTemaActual.totalNiveles
                    ? "text-red-500"
                    : "text-green-500"
                }
              >
                {progresoTemaActual.completados}/
                {progresoTemaActual.totalNiveles}
              </span>
            </p>
          </div>
        )}

        {/* Actividad Reciente */}
        <div className="bg-white shadow rounded p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Actividad Reciente</h2>

            <div className="flex items-center justify-end space-x-2 mb-2">
              <label htmlFor="limitLogs" className="text-sm">
                Nº de registros:
              </label>
              <select
                id="limitLogs"
                value={limitLogs}
                onChange={(e) => setLimitLogs(Number(e.target.value))}
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
              <div key={dia} className="mt-2">
                {/* Fecha agrupada */}
                <h4 className="text-lg font-medium">
                  {format(parseISO(dia), "dd/MM/yyyy")}
                </h4>
                <ul className="space-y-1 mt-2">
                  {logs.map((log, i) => {
                    let bg = "bg-red-100";
                    if (log.logTipo === "tema") {
                      bg = "bg-yellow-100";
                    } else if (log.logTipo === "nivel" && log.completado) {
                      bg =
                        log.nivelTipo === "leccion"
                          ? "bg-green-100"
                          : "bg-blue-100";
                    } else if (log.logTipo === "minijuego") {
                      bg = "bg-purple-100";
                    }

                    let left, right;
                    if (log.logTipo === "minijuego") {
                      left = <span className="text-sm">{log.nombre}</span>;
                      right = (
                        <span className="text-sm">
                          Puntuación: {log.puntuacion} -{" "}
                          {format(parseISO(log.createdAt), "[HH:mm]")}
                        </span>
                      );
                    } else {
                      const action =
                        log.logTipo === "tema"
                          ? `Tema ${log.referenciaId} completado`
                          : `Nivel ${formatNivelId(log.referenciaId)}`;
                      const score =
                        log.puntuacion != null
                          ? log.logTipo === "nivel"
                            ? `${
                                log.nivelTipo === "leccion"
                                  ? `Estrellas: ${log.puntuacion}★ - `
                                  : `Nota: ${log.puntuacion} - `
                              }`
                            : ""
                          : "";
                      const intento =
                        log.intento != null ? `Intento: ${log.intento} - ` : "";
                      left = <span className="text-sm">{action}</span>;
                      right = (
                        <span className="text-sm">
                          {score}
                          {intento}
                          {format(parseISO(log.createdAt), "[HH:mm]")}
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
        </div>
      </section>

      {/* TARJETA 4: ELIMINAR CUENTA */}
      <section className="p-4 bg-white shadow rounded space-y-2">
        <h2 className="font-semibold">Eliminar Cuenta</h2>

        {/* Botón que abre el modal */}
        <button
          type="button"
          onClick={() => {
            setErrorDel(null);
            setDelPassword("");
            setConfirmingDelete(true);
          }}
          className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          Darse de Baja
        </button>

        {/* Modal de confirmación */}
        <ConfirmationModal
          isOpen={confirmingDelete}
          title="Eliminar cuenta"
          message="Esta acción es irreversible. Por favor, confirma tu contraseña:"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
        >
          <input
            type="password"
            value={delPassword}
            onChange={(e) => setDelPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full border px-3 py-2 rounded"
          />

          {errorDel && (
            <div className="mt-4">
              <ErrorMessage error={errorDel} />
            </div>
          )}
        </ConfirmationModal>
      </section>
    </div>
  );
}
