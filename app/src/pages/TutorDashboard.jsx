import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { usuarioService } from "../services/usuarioService";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmationModal from "../components/ConfirmationModal";
import ActivityChart from "../components/ActivityChart";
import Portal from "../components/Portal";
import { extractError } from "../utils/errorHandler";
import { LoadingScreen } from "../components/Spinner";

import {
  ArrowRightOnRectangleIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  UsersIcon,
  StarIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

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
    return <LoadingScreen message="Cargando datos del tutor..." />;
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
    if (errorEdit) setErrorEdit(null);
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
      setForm((f) => ({
        ...f,
        antiguaContraseña: "",
        contraseña: "",
        confirmar: "",
      }));
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
    <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Botón de logout en móvil (En desktop está en el header) */}
        <div className="flex justify-end md:hidden">
          <Button
            onClick={logout}
            variant="danger"
            size="sm"
            className="flex items-center"
            title="Cerrar sesión"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>

        {/* PERFIL */}
        <Card>
          <CardHeader>
            <CardTitle>Mi Perfil</CardTitle>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setErrorEdit(null);
                setForm({
                  nombre: "",
                  email: "",
                  antiguaContraseña: "",
                  contraseña: "",
                  confirmar: "",
                });
                setIsEditing(true);
              }}
              title="Editar perfil"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p className="text-neutral-700">
                <strong className="font-semibold">Nombre:</strong> {user.nombre}
              </p>
              <p className="text-neutral-700">
                <strong className="font-semibold">Email:</strong> {user.email}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* MODAL DE EDICIÓN DE PERFIL */}
        {isEditing && (
          <Portal>
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setIsEditing(false);
                setErrorEdit(null);
              }}
            >
              <Card
                className="w-full max-w-md overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader>
                  <CardTitle>Editar perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Nombre
                      </label>
                      <Input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder={user.nombre}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Email
                      </label>
                      <Input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder={user.email}
                      />
                    </div>
                    <hr className="border-neutral-200" />
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Contraseña actual
                      </label>
                      <Input
                        type="password"
                        name="antiguaContraseña"
                        value={form.antiguaContraseña}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Nueva contraseña
                      </label>
                      <Input
                        type="password"
                        name="contraseña"
                        value={form.contraseña}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Confirmar nueva contraseña
                      </label>
                      <Input
                        type="password"
                        name="confirmar"
                        value={form.confirmar}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  {errorEdit && (
                    <ErrorMessage error={errorEdit} className="mt-4" />
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setErrorEdit(null);
                    }}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveProfile}
                    loading={isSaving}
                  >
                    Guardar
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </Portal>
        )}

        {/* RESUMEN CLASES */}
        <Card>
          <CardHeader>
            <CardTitle>Mis clases</CardTitle>
            {clases.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refetchClases}
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                <ArrowPathIcon className="w-4 h-4 mr-1" /> Refrescar
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {clases.length === 0 ? (
              <p className="text-neutral-600">
                No tienes ninguna clase asignada.
              </p>
            ) : (
              <ul className="space-y-4">
                {clases.map((c) => (
                  <li
                    key={c.id}
                    className="
                      grid grid-cols-[1fr_auto] items-center gap-4
                      max-[360px]:grid-cols-1
                      border border-neutral-200 rounded-xl p-4
                      hover:shadow-soft transition-shadow duration-200
                    "
                  >
                    <div className="min-w-0">
                      <h3 className="font-medium text-neutral-800 text-lg mb-2 truncate">
                        {c.nombre}
                      </h3>

                      <div className="space-y-1 text-sm text-neutral-600">
                        <div className="flex items-center">
                          <UsersIcon className="w-4 h-4 mr-2" />
                          <span>
                            {c.numEstudiantes}{" "}
                            {c.numEstudiantes === 1
                              ? "estudiante"
                              : "estudiantes"}
                          </span>
                        </div>

                        {c.numEstudiantes > 0 && (
                          <div className="flex items-center">
                            <StarIcon className="w-4 h-4 mr-2 text-yellow-500" />
                            <span>{c.totalEstrellas}</span>
                          </div>
                        )}

                        {c.numEstudiantes > 0 && (
                          <div className="flex items-center">
                            <span className="mr-2">Progreso medio:</span>
                            <span className="font-medium">
                              {c.mediaProgresoTotal}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => goToDetalle(c.id)}
                      className="
                        justify-self-end flex items-center flex-shrink-0 whitespace-nowrap
                        max-[360px]:mt-2
                      "
                      title="Ver detalles"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                      <span className="ml-2 max-[420px]:hidden">
                        Ver detalles
                      </span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* GRÁFICO DE ACTIVIDAD */}
        <ActivityChart data={clasesData} />

        {/* DARSE DE BAJA */}
        <Card>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-neutral-800 ">Eliminar Cuenta</h2>
          </div>
          <CardContent>
            <p className="text-sm text-neutral-700 mb-4">
              Esta acción es irreversible y eliminará permanentemente tu cuenta
              y todos los datos asociados.
            </p>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => {
                setErrorDel(null);
                setDelPassword("");
                setConfirmingDelete(true);
              }}
            >
              <TrashIcon className="w-4 h-4 mr-2" /> Darse de baja
            </Button>
          </CardContent>

          {/* Modal de confirmación */}
          <ConfirmationModal
            isOpen={confirmingDelete}
            title="Eliminar cuenta"
            message="Esta acción es irreversible. Por favor, confirma tu contraseña para continuar:"
            onCancel={() => setConfirmingDelete(false)}
            onConfirm={handleDelete}
            isLoading={isDeleting}
          >
            <Input
              type="password"
              value={delPassword}
              onChange={(e) => setDelPassword(e.target.value)}
              placeholder="Contraseña"
              className="mb-4"
            />
            {errorDel && (
              <div className="mt-2">
                <ErrorMessage error={errorDel} />
              </div>
            )}
          </ConfirmationModal>
        </Card>
      </div>
    </div>
  );
}
