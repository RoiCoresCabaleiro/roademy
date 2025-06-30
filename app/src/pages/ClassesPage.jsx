// src/pages/ClassesPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { claseService } from '../services/claseService';
import ErrorMessage from '../components/ErrorMessage';
import { extractError } from '../utils/errorHandler';

export default function ClassesPage() {
  const { data, isLoading, error, refetch } =
    useApi(claseService.listarClases);
  const clases = data?.clases || [];

  // Crear
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [opError, setOpError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Editar inline
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Copiar feedback
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setOpError(null);
    setIsCreating(true);
    try {
      await claseService.crearClase(newName.trim());
      setNewName('');
      setCreating(false);
      await refetch();
    } catch (err) {
      setOpError(extractError(err));
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditName(c.nombre);
    setOpError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    setOpError(null);
    setIsSaving(true);
    try {
      await claseService.actualizarClase(id, editName.trim());
      setEditingId(null);
      await refetch();
    } catch (err) {
      setOpError(extractError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(code);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  if (isLoading) return <div className="p-4">Cargando clases…</div>;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mis clases</h1>
        <button
          onClick={() => setCreating(c => !c)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {creating ? 'Cancelar' : '+ Crear clase'}
        </button>
      </header>

      {opError && <ErrorMessage error={opError} />}

      {creating && (
        <div className="flex space-x-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nombre de nueva clase"
            className="flex-1 border px-3 py-2 rounded"
          />
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      )}

      {clases.length === 0 ? (
        <p className="text-gray-600">No hay clases creadas.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clases.map(c => (
            <div
              key={c.id}
              className="relative border rounded-lg p-6 shadow hover:shadow-md transition"
            >
              {/* Inline edit */}
              {editingId === c.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full border px-2 py-1 rounded"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => saveEdit(c.id)}
                      disabled={isSaving}
                      className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-300 rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Botón Editar */}
                  <button
                    onClick={() => startEdit(c)}
                    className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-800"
                    title="Editar clase"
                  >
                    ✏️
                  </button>

                  {/* Enlazamos el resto de la tarjeta */}
                  <Link
                    to={`/tutor/classes/${c.id}`}
                    className="block space-y-4"
                  >
                    <h2 className="text-xl font-semibold">{c.nombre}</h2>

                    <div className="flex items-center">
                      <span className="font-mono font-medium bg-gray-100 px-2 py-1 rounded">
                        {c.codigo}
                      </span>
                      <button
                        onClick={e => {
                          e.preventDefault();
                          handleCopyCode(c.codigo);
                        }}
                        className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                        title="Copiar código"
                      >
                        📋
                      </button>
                      {copiedId === c.codigo && (
                        <span className="ml-2 text-green-600 text-sm">
                          Copiado
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700">
                      {c.numEstudiantes}{' '}
                      {c.numEstudiantes === 1 ? 'alumno' : 'alumnos'}
                    </p>
                  </Link>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
