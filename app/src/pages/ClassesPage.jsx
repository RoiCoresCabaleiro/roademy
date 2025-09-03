import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { claseService } from "../services/claseService";
import ErrorMessage from "../components/ErrorMessage";
import Portal from "../components/Portal";
import { extractError } from "../utils/errorHandler";
import { copyToClipboard } from "../utils/clipboard";
import { LoadingScreen } from "../components/Spinner";

import {
  PlusIcon,
  PencilIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function ClassesPage() {
  const { data, isLoading, error, refetch } = useApi(claseService.listarClases);
  const clases = data?.clases || [];

  // Estados de la UI
  const [globalError, setGlobalError] = useState(null);
  const [createError, setCreateError] = useState(null);
  const [editError, setEditError] = useState(null);
  // Crear
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  // Editar
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // Copiar feedback
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const startCreate = () => {
    setCreating(true);
    setGlobalError(null);
    setCreateError(null);
    setNewName("");
  };

  const cancelCreate = () => {
    setCreating(false);
    setCreateError(null);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreateError(null);
    setIsCreating(true);
    try {
      await claseService.crearClase(newName.trim());
      setNewName("");
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
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    setEditError(null);
    setIsSaving(true);
    try {
      await claseService.actualizarClase(editingId, editName.trim());
      setEditingId(null);
      await refetch();
    } catch (err) {
      setEditError(extractError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = async (e, codigo) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await copyToClipboard(codigo);
    if (ok) {
      setGlobalError(null);
      setCopiedId(codigo);
      setTimeout(() => setCopiedId(null), 3000);
    } else {
      setGlobalError("No se pudo copiar el código");
    }
  };

  if (isLoading) return <LoadingScreen message="Cargando clases..." />;
  if (error)
    return (
      <div className="p-4">
        <ErrorMessage error={error} />
      </div>
    );

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-neutral-800">Mis clases</h1>
          <Button
            onClick={startCreate}
            variant="primary"
            className="flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Crear clase
          </Button>
        </div>

        {/* Global Error */}
        {globalError && !creating && editingId === null && (
          <ErrorMessage error={globalError} />
        )}

        {/* Lista de clases */}
        {clases.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <UsersIcon className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-800 mb-2">
                No hay clases creadas
              </h3>
              <p className="text-neutral-600 mb-6">
                Crea tu primera clase para empezar a gestionar estudiantes
              </p>
              <Button
                onClick={startCreate}
                variant="primary"
                className="flex items-center mx-auto"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Crear primera clase
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clases.map((c) => (
              <Card
                key={c.id}
                className="relative group hover:shadow-medium transition-shadow duration-200"
              >
                <button
                  onClick={() => startEdit(c)}
                  className="absolute top-4 right-4 z-10 p-2 bg-primary-500 text-white rounded-lg shadow-soft 
                             opacity-100 md:opacity-0 md:group-hover:opacity-100 
                             transition-opacity duration-200 
                             hover:bg-primary-600 active:bg-primary-700"
                  title="Editar clase"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>

                <Link to={`/tutor/classes/${c.id}`} className="block">
                  <CardContent>
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-neutral-800 pr-8">
                        {c.nombre}
                      </h2>

                      <div className="flex items-center text-neutral-600">
                        <UsersIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm">
                          {c.numEstudiantes}{" "}
                          {c.numEstudiantes === 1
                            ? "estudiante"
                            : "estudiantes"}
                        </span>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={(e) => handleCopyCode(e, c.codigo)}
                          className={`
                            flex items-center justify-between w-full px-3 py-2 rounded-lg border transition-colors duration-200
                            ${
                              copiedId === c.codigo
                                ? "bg-success-50 border-success-200 text-success-700"
                                : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                            }
                          `}
                          title="Copiar código de clase"
                        >
                          <span className="font-mono text-sm">
                            Código: {c.codigo}
                          </span>
                          {copiedId === c.codigo ? (
                            <CheckIcon className="w-4 h-4 text-success-600" />
                          ) : (
                            <ClipboardDocumentIcon className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* MODAL DE CREACIÓN */}
        {creating && (
          <Portal>
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={cancelCreate}
            >
              <Card
                className="w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader>
                  <CardTitle>Crear nueva clase</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Nombre de la clase
                      </label>
                      <Input
                        type="text"
                        name="nombreClase"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newName.trim()) {
                            handleCreate();
                          }
                        }}
                      />
                    </div>
                  </div>
                  {createError && (
                    <ErrorMessage error={createError} className="mt-4" />
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="secondary"
                    onClick={cancelCreate}
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCreate}
                    loading={isCreating}
                    disabled={!newName.trim()}
                  >
                    Crear clase
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </Portal>
        )}

        {/* MODAL DE EDICIÓN */}
        {editingId !== null && (
          <Portal>
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={cancelEdit}
            >
              <Card
                className="w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader>
                  <CardTitle>Renombrar clase</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Nombre de la clase
                      </label>
                      <Input
                        type="text"
                        name="nombreClase"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && editName.trim()) {
                            saveEdit();
                          }
                        }}
                      />
                    </div>
                  </div>
                  {editError && (
                    <ErrorMessage error={editError} className="mt-4" />
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="secondary"
                    onClick={cancelEdit}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={saveEdit}
                    loading={isSaving}
                    disabled={!editName.trim()}
                  >
                    Guardar cambios
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </Portal>
        )}
      </div>
    </div>
  );
}
