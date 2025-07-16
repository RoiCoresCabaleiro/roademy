// src/pages/ClassesPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { claseService } from '../services/claseService';
import ErrorMessage from '../components/ErrorMessage';
import Portal from '../components/Portal';
import { extractError } from '../utils/errorHandler';
import { copyToClipboard } from '../utils/clipboard';

export default function ClassesPage() {
  const { data, isLoading, error, refetch } = useApi(claseService.listarClases);
  const clases = data?.clases || [];

  // Estados de la UI
  const [globalError,  setGlobalError]  = useState(null);
  const [createError,  setCreateError]  = useState(null);
  const [editError,    setEditError]    = useState(null);
  // Crear
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  // Editar
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // Copiar feedback
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { refetch(); }, [refetch]);

  const startCreate = () => {
    setCreating(true);
    setGlobalError(null);
    setCreateError(null);
    setNewName('');
  };

  const cancelCreate = () => {
    setCreating(false);
    setCreateError(null);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreateError(null)
    setIsCreating(true);
    try {
      await claseService.crearClase(newName.trim());
      setNewName('');
      setCreating(false);
      await refetch();
    } catch (err) {
      setCreateError(extractError(err));
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditName(c.nombre);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    setEditError(null)
    setIsSaving(true);
    try {
      await claseService.actualizarClase(editingId, editName.trim());
      setEditingId(null);
      await refetch();
    } catch (err) {
      setEditError((extractError(err)));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-4">Cargando clases…</div>;
  if (error)
    return (
      <div className="p-4">
        <ErrorMessage error={error} />
      </div>
    );

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mis clases</h1>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Crear clase
        </button>
      </header>

      {globalError && !creating && editingId === null && <ErrorMessage error={globalError} />}

      {clases.length === 0 ? (
        <p className="text-gray-600">No hay clases creadas.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clases.map(c => (
            <div
              key={c.id}
              className="relative border rounded-lg shadow hover:bg-gray-200 transition"
            >
              {/* Botón Editar abre modal */}
              <button
                onClick={() => startEdit(c)}
                className="absolute top-4 right-4 px-2 py-1 bg-yellow-500 rounded hover:bg-yellow-600"
                title="Editar clase"
              >
                ✏️
              </button>

              {/* Tarjeta completa (nombre, alumnos, código y copiar) */}
              <Link
                to={`/tutor/classes/${c.id}`}
                className="block space-y-4 p-4"
              >
                <h2 className="text-xl font-semibold">{c.nombre}</h2>
                <p className="text-gray-700">
                  {c.numEstudiantes}{' '}
                  {c.numEstudiantes === 1 ? 'alumno' : 'alumnos'}
                </p>

                {/* Aquí metemos el código y el botón de copiar */}
                <div className="flex items-center mt-2">
                  <button
                    onClick={async e => {
                      e.preventDefault();
                      e.stopPropagation();
                      const ok = await copyToClipboard(c.codigo);
                      if (ok) {
                        setCopiedId(c.codigo);
                        setTimeout(() => setCopiedId(null), 3000);
                      } else {
                        setGlobalError('No se pudo copiar el código');
                      }
                    }}
                    className={`px-2 py-1 rounded ${copiedId === c.codigo ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-200 hover:bg-gray-300'}`}
                    title="Copiar código"
                  >
                    {c.codigo} 📋
                  </button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CREACIÓN */}
      {creating && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={cancelCreate}
          >
            <div
              className="bg-white p-6 rounded shadow-lg w-11/12 max-w-md space-y-2"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Crear nueva clase</h3>
              
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nombre de la clase"
                className="w-full border px-3 py-2 rounded"
              />

              {createError && <ErrorMessage error={createError} />}

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={cancelCreate}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={isCreating}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  disabled={isCreating}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* --- MODAL DE EDICIÓN --- */}
      {editingId !== null && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={cancelEdit}
          >
            <div
              className="bg-white p-6 rounded shadow-lg w-11/12 max-w-md space-y-2"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Renombrar clase</h3>
              
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
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
                  onClick={saveEdit}
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
    </div>
  );
}
