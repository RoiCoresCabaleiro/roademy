import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { claseService } from "../services/claseService";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmationModal from "../components/ConfirmationModal";
import Portal from "../components/Portal";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { extractError } from "../utils/errorHandler";
import { formatNivelId } from "../utils/formatters";
import { copyToClipboard } from "../utils/clipboard";
import { LoadingScreen } from "../components/Spinner";

import { format, parseISO } from "date-fns";

import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  UsersIcon,
  ArrowPathIcon,
  XMarkIcon,
  StarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import GamepadIcon from "../components/icons/GamepadIcon";

import Card, {
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // Copiar código
  const [copied, setCopied] = useState(false);
  // Borrar clase
  const [confirmDeleteClass, setConfirmDeleteClass] = useState(false);
  const [isDeletingClass, setIsDeletingClass] = useState(false);
  const [errorDeleteClass, setErrorDeleteClass] = useState(null);
  // Expulsar estudiante
  const [expelId, setExpelId] = useState(null);
  const [isExpelling, setIsExpelling] = useState(false);
  const [errorExpel, setErrorExpel] = useState(null);
  // Modal para mostrar todos los estudiantes
  const [showStudentsModal, setShowStudentsModal] = useState(false);

  // Llamada a la API
  const fetchClass = useCallback(
    () => claseService.verClase(id, limitLogs),
    [id, limitLogs]
  );
  const { data, isLoading, error, refetch } = useApi(fetchClass);

  // Polling cada 10 s para recargar TODO el data (cabecera, estudiantes y actividad)
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 10_000);
    return () => clearInterval(intervalId);
  }, [refetch]);

  // Guards
  if (isLoading && !data)
    return <LoadingScreen message="Cargando detalles de la clase..." />;
  if (error)
    return (
      <div className="p-4">
        <ErrorMessage error={error} />
      </div>
    );

  const { clase, estudiantes = [], actividadReciente = [] } = data;

  const previewStudents = estudiantes.slice(0, 3);

  // Agrupar actividad por día
  const actividadesPorDia = actividadReciente.reduce((acc, log) => {
    const dia = format(parseISO(log.createdAt), "yyyy-MM-dd");
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

  const handleRequestDeleteClass = () => {
    setErrorDeleteClass(null);
    setConfirmDeleteClass(true);
  };

  const handleConfirmDeleteClass = async () => {
    setErrorDeleteClass(null);
    setIsDeletingClass(true);
    try {
      await claseService.eliminarClase(id);
      const from = location.state?.from;
      if (from) {
        navigate(from, { replace: true });
        return;
      }
      navigate(-1);
    } catch (err) {
      setErrorDeleteClass(extractError(err));
    } finally {
      setIsDeletingClass(false);
    }
  };

  const handleRequestExpel = (studentId) => {
    setErrorExpel(null);
    setExpelId(studentId);
  };

  const handleExpel = async () => {
    setErrorExpel(null);
    setIsExpelling(true);
    try {
      await claseService.eliminarEstudiante(id, expelId);
      await refetch();
      setExpelId(null);
    } catch (err) {
      setErrorExpel(extractError(err));
      setIsExpelling(false);
    } finally {
      setIsExpelling(false);
    }
  };

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(clase.codigo);
    if (ok) {
      setGlobalError(null);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } else {
      setGlobalError("No se pudo copiar el código");
    }
  };

  // Función para obtener el estilo de cada log de actividad
  const getActivityLogStyle = (log) => {
    if (log.logTipo === "tema") {
      return {
        bg: "bg-yellow-50 border-yellow-200",
        icon: AcademicCapIcon,
        iconColor: "text-yellow-600",
        textColor: "text-yellow-800",
      };
    } else if (log.logTipo === "minijuego") {
      return {
        bg: "bg-purple-50 border-purple-200",
        icon: GamepadIcon,
        iconColor: "text-purple-600",
        textColor: "text-purple-800",
      };
    } else if (log.logTipo === "nivel" && log.completado) {
      if (log.nivelTipo === "leccion") {
        return {
          bg: "bg-success-50 border-success-200",
          icon: BookOpenIcon,
          iconColor: "text-success-600",
          textColor: "text-success-800",
        };
      } else {
        return {
          bg: "bg-blue-50 border-blue-200",
          icon: ClipboardDocumentCheckIcon,
          iconColor: "text-blue-600",
          textColor: "text-blue-800",
        };
      }
    } else {
      return {
        bg: "bg-error-50 border-error-200",
        icon: XMarkIcon,
        iconColor: "text-error-600",
        textColor: "text-error-800",
      };
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            {/* Botón volver */}
            <Button
              onClick={() => {
                const from = location.state?.from;
                if (from) {
                  navigate(from);
                } else {
                  navigate(-1);
                }
              }}
              variant="secondary"
              size="sm"
              className="flex items-center flex-shrink-0"
              title="Volver atrás"
            >
              <ArrowLeftIcon className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Volver</span>
            </Button>

            {/* Título de la clase */}
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 text-center flex-1 px-2 truncate">
              {clase.nombre}
            </h1>

            {/* Botones de editar/eliminar */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                onClick={startEdit}
                variant="primary"
                size="sm"
                className="flex items-center"
                title="Editar clase"
              >
                <PencilIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Button
                onClick={handleRequestDeleteClass}
                variant="danger"
                size="sm"
                className="flex items-center"
                title="Eliminar clase"
              >
                <TrashIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            </div>
          </div>

          {/* Código de clase */}
          <div className="flex justify-center">
            <button
              onClick={handleCopyCode}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-200
                ${
                  copied
                    ? "bg-success-50 border-success-200 text-success-700"
                    : "bg-white border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                }
              `}
              title="Copiar código de clase"
            >
              <span className="font-mono text-sm">Código: {clase.codigo}</span>
              {copied ? (
                <CheckIcon className="w-4 h-4 text-success-600" />
              ) : (
                <ClipboardDocumentIcon className="w-4 h-4 text-neutral-500" />
              )}
            </button>
          </div>
        </div>

        {/* Global Error */}
        {globalError && !editing && !showStudentsModal && (
          <ErrorMessage error={globalError} />
        )}

        {/* Estudiantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UsersIcon className="w-5 h-5 mr-2" />
              Estudiantes ({estudiantes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {estudiantes.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
                <p className="text-neutral-600">
                  No hay estudiantes en esta clase
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  Comparte el código de clase para que se unan estudiantes
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {previewStudents.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:shadow-soft transition-shadow duration-200"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <h4 className="font-medium text-neutral-800">
                          {u.nombre}
                        </h4>
                        <p className="text-sm text-neutral-600 truncate">
                          {u.email}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                          <div className="flex items-center">
                            <StarIcon className="w-4 h-4 mr-1 text-yellow-500" />
                            <span>
                              {u.estrellasObtenidasCurso}/
                              {u.estrellasPosiblesCurso}
                            </span>
                          </div>
                          <span>Progreso: {u.porcentajeProgresoTotal}%</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRequestExpel(u.id)}
                        variant="danger"
                        size="sm"
                        className="flex items-center flex-shrink-0"
                        title="Expulsar estudiante"
                      >
                        <TrashIcon className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Expulsar</span>
                      </Button>
                    </div>
                  ))}
                </div>

                {estudiantes.length > 3 && (
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => setShowStudentsModal(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center mx-auto text-sm"
                    >
                      <UsersIcon className="w-4 h-4 mr-2" />
                      Ver todos ({estudiantes.length})
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card id="actividad-reciente">
          <CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 w-full">
              <CardTitle className="text-left whitespace-nowrap">
                Actividad reciente
              </CardTitle>
              <div className="grid grid-cols-2 gap-4 w-full sm:contents">
                <div className="flex items-center gap-2 sm:justify-center sm:col-start-2">
                  <label
                    htmlFor="limitLogs"
                    className="text-sm text-neutral-600 whitespace-nowrap"
                  >
                    Registros:
                  </label>
                  <select
                    id="limitLogs"
                    value={limitLogs}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setLimitLogs(v);
                      sessionStorage.setItem(STORAGE_KEY, v);
                    }}
                    className="border border-neutral-300 px-2 py-1 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={10}>10</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={0}>Todos</option>
                  </select>
                </div>

                <div className="flex justify-end sm:col-start-3">
                  <Button
                    onClick={() => refetch()}
                    variant="ghost"
                    size="sm"
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                    Refrescar
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {actividadReciente.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardDocumentIcon className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
                <p className="text-neutral-600">Sin actividad reciente</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(actividadesPorDia).map(([dia, logs]) => (
                  <div key={dia}>
                    <h4 className="text-lg font-medium text-neutral-800 mb-3 border-b border-neutral-200 pb-2">
                      {format(parseISO(dia), "dd/MM/yyyy")}
                    </h4>
                    <div className="space-y-2">
                      {logs.map((log, i) => {
                        const user = estudiantes.find(
                          (u) => u.id === log.usuarioId
                        );
                        const style = getActivityLogStyle(log);
                        const Icon = style.icon;

                        let content, details;
                        if (log.logTipo === "minijuego") {
                          content = `${user?.nombre || "Alumno"} jugó ${
                            log.nombre
                          }`;
                          details = `Puntuación: ${log.puntuacion}`;
                        } else if (log.logTipo === "tema") {
                          content = `${
                            user?.nombre || "Alumno"
                          } completó el tema ${log.referenciaId}`;
                          details = "";
                        } else {
                          const tipoTexto =
                            log.nivelTipo === "leccion"
                              ? "Lección"
                              : "Cuestionario";
                          content = `${
                            user?.nombre || "Alumno"
                          } - ${tipoTexto} ${formatNivelId(log.referenciaId)}`;
                          const score =
                            log.puntuacion != null
                              ? log.nivelTipo === "leccion"
                                ? `${log.puntuacion}★`
                                : `Nota: ${log.puntuacion}`
                              : "";
                          const intento =
                            log.intento != null
                              ? `Intento: ${log.intento}`
                              : "";
                          details = [score, intento]
                            .filter(Boolean)
                            .join(" · ");
                        }

                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${style.bg} ${style.textColor}`}
                          >
                            <Icon
                              className={`w-5 h-5 flex-shrink-0 ${style.iconColor}`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{content}</p>
                              {details && (
                                <p className="text-xs opacity-75">{details}</p>
                              )}
                            </div>
                            <span className="text-xs opacity-75 flex-shrink-0">
                              {format(parseISO(log.createdAt), "HH:mm")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* MODAL DE EDICIÓN */}
        {editing && (
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && name.trim()) {
                            handleSave();
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
                    onClick={handleSave}
                    loading={isSaving}
                    disabled={!name.trim()}
                  >
                    Guardar cambios
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </Portal>
        )}

        {/* MODAL DE ESTUDIANTES */}
        {showStudentsModal && (
          <Portal>
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowStudentsModal(false);
                setStudentModalError(null);
              }}
            >
              <Card
                className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="flex-1">
                      Todos los estudiantes ({estudiantes.length})
                    </CardTitle>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          setShowStudentsModal(false);
                          setStudentModalError(null);
                        }}
                        variant="ghost"
                        size="sm"
                        className="p-2 -mr-2"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="overflow-y-auto max-h-[60vh]">
                  {studentModalError && (
                    <ErrorMessage error={studentModalError} className="mb-4" />
                  )}
                  <div className="space-y-3 mr-1">
                    {estudiantes.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <h4 className="font-medium text-neutral-800">
                            {u.nombre}
                          </h4>
                          <p className="text-sm text-neutral-600 truncate">
                            {u.email}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                            <div className="flex items-center">
                              <StarIcon className="w-4 h-4 mr-1 text-yellow-500" />
                              <span>
                                {u.estrellasObtenidasCurso}/
                                {u.estrellasPosiblesCurso}
                              </span>
                            </div>
                            <span>Progreso: {u.porcentajeProgresoTotal}%</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleRequestExpel(u.id)}
                          variant="danger"
                          size="sm"
                          className="flex items-center flex-shrink-0"
                          title="Expulsar estudiante"
                        >
                          <TrashIcon className="w-4 h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Expulsar</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Portal>
        )}

        {/* MODAL DE CONFIRMACIÓN DE EXPULSIÓN */}
        <ConfirmationModal
          isOpen={expelId !== null}
          title="Expulsar estudiante"
          message="¿Estás seguro de que quieres expulsar a este estudiante de la clase?"
          onCancel={() => setExpelId(null)}
          onConfirm={handleExpel}
          isLoading={isExpelling}
        >
          {errorExpel && (
            <div className="mt-2">
              <ErrorMessage error={errorExpel} />
            </div>
          )}
        </ConfirmationModal>

        {/* MODAL DE CONFIRMACIÓN DE ELIMINAR CLASE */}
        <ConfirmationModal
          isOpen={confirmDeleteClass}
          title="Eliminar clase"
          message="¿Estás seguro de que quieres eliminar esta clase? Esta acción no se puede deshacer y se perderán todos los datos asociados."
          onCancel={() => {
            setConfirmDeleteClass(false);
            setErrorDeleteClass(null);
          }}
          onConfirm={handleConfirmDeleteClass}
          isLoading={isDeletingClass}
        >
          {errorDeleteClass && (
            <div className="mt-2">
              <ErrorMessage error={errorDeleteClass} />
            </div>
          )}
        </ConfirmationModal>

        <ScrollToTopButton threshold={400} />
      </div>
    </div>
  );
}
