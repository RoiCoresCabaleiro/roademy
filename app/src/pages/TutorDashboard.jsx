// src/pages/TutorDashboard.jsx

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { usuarioService } from "../services/usuarioService";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmationModal from "../components/ConfirmationModal";
import Portal from "../components/Portal";
import { extractError } from "../utils/errorHandler";

import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function TutorDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Estados locales para editar perfil
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
  // Estados locales para borrar cuenta
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [delPassword, setDelPassword] = useState("");
  const [errorDel, setErrorDel] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Datos de perfil
  const {
    data: profileData,
    isLoading: loadingProfile,
    error: errorProfile,
    refetch: refetchProfile,
  } = useApi(usuarioService.getProfile);

  // 2. Clases del tutor
  const fetchTutorDashboard = useCallback(
    () => usuarioService.getTutorDashboard(),
    []
  );
  const {
    data: clasesData,
    isLoading: loadingClases,
    error: errorClases,
    refetch: refetchClases,
  } = useApi(fetchTutorDashboard);

  if (loadingProfile || (loadingClases && !clasesData))
    return <div className="p-4">Cargando datos…</div>;
  if (errorProfile)
    return (
      <div className="p-4">
        <ErrorMessage error={errorProfile} />
      </div>
    );
  if (errorClases)
    return (
      <div className="p-4">
        <ErrorMessage error={errorClases} />
      </div>
    );

  const { user } = profileData;
  const { clases } = clasesData;

  // Handlers
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async () => {
    setErrorEdit(null);
    setIsSaving(true);
    try {
      if (form.contraseña && form.contraseña !== form.confirmar) {
        setErrorEdit("Las contraseñas no coinciden");
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

  const goToDetalle = (claseId) => {
    navigate(`/tutor/classes/${claseId}`);
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

      {/* PERFIL */}
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

      {/* — RESUMEN CLASES */}
      <section className="p-4 bg-white shadow rounded space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Mis clases</h2>
          {clases.length > 0 && (
            <button
              onClick={refetchClases}
              className="text-sm text-blue-500 hover:underline"
            >
              ↻ Refrescar
            </button>
          )}
        </div>

        {clases.length === 0 ? (
          <p className="text-gray-600">No tienes clases asignadas.</p>
        ) : (
          <ul className="space-y-4">
            {clases.map((c) => (
              <li
                key={c.id}
                className="flex justify-between items-center border rounded p-4 hover:shadow"
              >
                <div>
                  <h3 className="font-medium">{c.nombre}</h3>
                  <p className="text-sm text-gray-600">
                    {c.numEstudiantes}{" "}
                    {c.numEstudiantes === 1 ? "estudiante" : "estudiantes"}{" "}
                    {c.numEstudiantes > 0 && ` · ${c.totalEstrellas} ⭐`}
                  </p>
                  {c.numEstudiantes > 0 && (
                    <>
                      <p className="text-sm text-gray-600">
                        Progreso medio: {c.mediaProgresoTotal}%
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => goToDetalle(c.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Ver detalles
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* DARSE DE BAJA */}
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
          Darse de baja
        </button>

        {/* Modal de confirmación reutilizable */}
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
