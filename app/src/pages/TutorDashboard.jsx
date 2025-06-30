// src/pages/TutorDashboard.jsx

import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { usuarioService } from '../services/usuarioService';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from '../components/ErrorMessage';
import { extractError } from '../utils/errorHandler';

export default function TutorDashboard() {
  const { logout } = useAuth();

  // 1. Datos de perfil
  const {
    data: profileData,
    isLoading: loadingProfile,
    error: errorProfile,
    refetch: refetchProfile
  } = useApi(usuarioService.getProfile);

  // Estados locales para editar perfil
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', antiguaContraseña: '', contraseña: '' });
  const [errorEdit, setErrorEdit] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados locales para borrar cuenta
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [delPassword, setDelPassword] = useState('');
  const [errorDel, setErrorDel] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Editar perfil
  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

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

  // Eliminar cuenta
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

  if (loadingProfile) return <div className="p-4">Cargando perfil…</div>;
  if (errorProfile) return <ErrorMessage error={errorProfile} />;

  const { user } = profileData;

  return (
    <div className="pb-16 p-4 space-y-6">
      <section className="md:hidden relative p-4 ">
        <button
          onClick={logout}
          className="absolute top-2 right-0 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          title="Cerrar sesión"
        >
          Cerrar sesión
        </button>
      </section>
      {/* PERFIL */}
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

      {/* DARSE DE BAJA */}
      <section className="p-4 bg-white shadow rounded space-y-2">
        <h2 className="font-semibold">Eliminar Cuenta</h2>

        {!confirmingDelete ? (
          <button
            onClick={() => {
              setErrorDel(null);
              setConfirmingDelete(true);
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
          >
            Darse de baja
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
