import { useState, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { usuarioService } from "../services/usuarioService";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmationModal from "../components/ConfirmationModal";
import Portal from "../components/Portal";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { extractError } from "../utils/errorHandler";
import { formatNivelId } from "../utils/formatters";
import { LoadingScreen } from "../components/Spinner";

import { format, parseISO } from "date-fns";
import {
  ArrowRightOnRectangleIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
  UserGroupIcon,
  ArrowRightIcon,
  CheckCircleIcon,
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
    return <LoadingScreen message="Cargando datos del estudiante..." />;
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
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    }
  };

  const handleLeave = async () => {
    setErrorClass(null);
    setIsLeaving(true);
    try {
      await usuarioService.leaveClass();
      await refetchProfile();
      setConfirmLeaving(false);
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
        {/* Botón de logout SOLO para móvil - En desktop está en el header */}
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

        {/* MI CLASE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserGroupIcon className="w-6 h-6 flex-shrink-0 mr-2" />
              Mi Clase
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.clase ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p className="text-neutral-700">
                    <strong className="font-semibold">Nombre:</strong>{" "}
                    {user.clase.nombre}
                  </p>
                  <p className="text-neutral-700">
                    <strong className="font-semibold">Código:</strong>{" "}
                    <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded">
                      {user.clase.codigo}
                    </span>
                  </p>
                </div>
                <p className="text-neutral-700">
                  <strong className="font-semibold">Tutor:</strong>{" "}
                  {user.clase.tutor.nombre} ({user.clase.tutor.email})
                </p>
                <Button
                  onClick={() => {
                    setErrorClass(null);
                    setConfirmLeaving(true);
                  }}
                  variant="danger"
                  size="sm"
                  className="flex items-center"
                >
                  <ArrowRightIcon className="w-4 h-4 mr-2" />
                  Abandonar Clase
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-neutral-600">
                  No perteneces a ninguna clase
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Código de la clase"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleJoin}
                    loading={isJoining}
                    disabled={!joinCode.trim()}
                    variant="primary"
                    className="flex items-center justify-center"
                  >
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    Unirse
                  </Button>
                </div>
                {errorClass && <ErrorMessage error={errorClass} />}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PROGRESO TOTAL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <StarIcon className="w-6 h-6 flex-shrink-0 mr-2 text-yellow-500" />
              Progreso Total del Curso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-semibold">
                    {progresoTotalCurso.estrellasObtenidasCurso}/
                    {progresoTotalCurso.estrellasPosiblesCurso}
                  </span>
                  <span className="text-neutral-600">
                    ({progresoTotalCurso.porcentajeProgresoTotal}%)
                  </span>
                </div>
                {cursoCompletado && (
                  <div className="flex items-center text-success-600 font-medium">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    ¡Curso completado!
                  </div>
                )}
              </div>

              {/* Barra de progreso total */}
              <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-4 transition-all duration-500 ${
                    cursoCompletado ? "bg-yellow-500" : "bg-success-500"
                  }`}
                  style={{
                    width: `${progresoTotalCurso.porcentajeProgresoTotal}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TEMA ACTUAL */}
        {!cursoCompletado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AcademicCapIcon className="w-6 h-6 flex-shrink-0 mr-2 text-primary-600" />
                Tema Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Título del tema */}
                <div className="bg-primary-50 rounded-lg p-3 border-l-4 border-primary-500">
                  <h3 className="font-semibold text-primary-800">
                    {progresoTemaActual.titulo}
                  </h3>
                </div>

                {/* Progreso de estrellas */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">
                        {progresoTemaActual.estrellasObtenidas}/
                        {progresoTemaActual.estrellasPosibles}
                      </span>
                      <span className="text-neutral-600">
                        ({progresoTemaActual.porcentaje}%)
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso con indicador de estrellas necesarias */}
                  <div className="relative">
                    {(() => {
                      const alcanzadasNecesarias =
                        progresoTemaActual.estrellasObtenidas >=
                        progresoTemaActual.estrellasNecesarias;
                      const todasCompletas =
                        progresoTemaActual.estrellasObtenidas >=
                        progresoTemaActual.estrellasPosibles;

                      return (
                        <>
                          {/* Etiqueta del indicador*/}
                          <div
                            className="absolute -top-8 transform -translate-x-1/2 z-10"
                            style={{
                              left: `${Math.min(
                                95,
                                Math.max(
                                  5,
                                  (progresoTemaActual.estrellasNecesarias /
                                    progresoTemaActual.estrellasPosibles) *
                                    100
                                )
                              )}%`,
                            }}
                          >
                            <div
                              className={`text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-md ${
                                alcanzadasNecesarias
                                  ? "bg-success-500"
                                  : "bg-error-500"
                              }`}
                            >
                              {progresoTemaActual.estrellasNecesarias} ★{" "}
                              {alcanzadasNecesarias
                                ? "alcanzadas"
                                : "necesarias"}
                            </div>
                            <div
                              className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent ${
                                alcanzadasNecesarias
                                  ? "border-t-success-500"
                                  : "border-t-error-500"
                              }`}
                            ></div>
                          </div>

                          {/* Barra de progreso */}
                          <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden relative">
                            {/* Progreso actual */}
                            <div
                              className={`h-6 transition-all duration-500 ${
                                todasCompletas
                                  ? "bg-yellow-500" // Amarillo cuando todas las estrellas están completas
                                  : alcanzadasNecesarias
                                  ? "bg-success-500" // Verde cuando se alcanzan las necesarias
                                  : "bg-blue-500" // Azul inicialmente
                              }`}
                              style={{
                                width: `${
                                  (progresoTemaActual.estrellasObtenidas /
                                    progresoTemaActual.estrellasPosibles) *
                                  100
                                }%`,
                              }}
                            />

                            {/* Indicador de estrellas necesarias */}
                            <div
                              className={`absolute top-0 h-6 w-1 shadow-md ${
                                alcanzadasNecesarias
                                  ? "bg-success-500"
                                  : "bg-error-500"
                              }`}
                              style={{
                                left: `${Math.min(
                                  99,
                                  Math.max(
                                    0,
                                    (progresoTemaActual.estrellasNecesarias /
                                      progresoTemaActual.estrellasPosibles) *
                                      100
                                  )
                                )}%`,
                              }}
                              title={`${
                                progresoTemaActual.estrellasNecesarias
                              } estrellas ${
                                alcanzadasNecesarias
                                  ? "alcanzadas"
                                  : "necesarias"
                              } para desbloquear el siguiente tema`}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Requisitos para completar */}
                <div className="bg-neutral-50 rounded-xl p-4">
                  <h3 className="font-semibold text-neutral-800 mb-3">
                    Requisitos para completar el tema:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span>Estrellas:</span>
                      <span
                        className={`font-semibold ${
                          progresoTemaActual.estrellasObtenidas >=
                          progresoTemaActual.estrellasNecesarias
                            ? "text-success-600"
                            : "text-error-600"
                        }`}
                      >
                        {progresoTemaActual.estrellasObtenidas}/
                        {progresoTemaActual.estrellasNecesarias}
                      </span>
                      {progresoTemaActual.estrellasObtenidas >=
                        progresoTemaActual.estrellasNecesarias && (
                        <CheckCircleIcon className="w-4 h-4 text-success-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpenIcon className="w-4 h-4 text-primary-600" />
                      <span>Niveles:</span>
                      <span
                        className={`font-semibold ${
                          progresoTemaActual.completados >=
                          progresoTemaActual.totalNiveles
                            ? "text-success-600"
                            : "text-error-600"
                        }`}
                      >
                        {progresoTemaActual.completados}/
                        {progresoTemaActual.totalNiveles}
                      </span>
                      {progresoTemaActual.completados >=
                        progresoTemaActual.totalNiveles && (
                        <CheckCircleIcon className="w-4 h-4 text-success-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ACTIVIDAD RECIENTE */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4 w-full">
              <CardTitle className="flex items-center whitespace-nowrap">
                <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
                Actividad Reciente
              </CardTitle>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="limitLogs"
                  className="text-sm text-neutral-600 whitespace-nowrap"
                >
                  Registros:
                </label>
                <select
                  id="limitLogs"
                  value={limitLogs}
                  onChange={(e) => setLimitLogs(Number(e.target.value))}
                  className="border border-neutral-300 px-2 py-1 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={5}>5</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={0}>Todos</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {actividadReciente.length === 0 ? (
              <div className="text-center py-8">
                <BookOpenIcon className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
                <p className="text-neutral-600">Sin actividad reciente</p>
                <p className="text-sm text-neutral-500 mt-1">
                  ¡Empieza a estudiar para ver tu progreso aquí!
                </p>
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
                        const style = getActivityLogStyle(log);
                        const Icon = style.icon;

                        let content, details;
                        if (log.logTipo === "minijuego") {
                          content = `Jugaste ${log.nombre}`;
                          details = `Puntuación: ${log.puntuacion}`;
                        } else if (log.logTipo === "tema") {
                          content = `Completaste el tema ${log.referenciaId}`;
                          details = "";
                        } else {
                          const tipoTexto =
                            log.nivelTipo === "leccion"
                              ? "Lección"
                              : "Cuestionario";
                          content = `${tipoTexto} ${formatNivelId(
                            log.referenciaId
                          )}`;
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

        {/* MODAL DE CONFIRMACIÓN DE ABANDONAR CLASE */}
        <ConfirmationModal
          isOpen={confirmLeaving}
          title="Abandonar clase"
          message="¿Estás seguro de que quieres abandonar esta clase? Perderás el acceso a las actividades grupales."
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

        {/* ELIMINAR CUENTA */}
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
              onClick={() => {
                setErrorDel(null);
                setDelPassword("");
                setConfirmingDelete(true);
              }}
              variant="danger"
              size="sm"
              className="flex items-center"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Darse de baja
            </Button>
          </CardContent>
        </Card>

        {/* MODAL DE CONFIRMACIÓN DE ELIMINAR CUENTA */}
        <ConfirmationModal
          isOpen={confirmingDelete}
          title="Eliminar cuenta"
          message="Esta acción es irreversible. Por favor, confirma tu contraseña para continuar:"
          onCancel={() => {
            setConfirmingDelete(false);
            setErrorDel(null);
          }}
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

        <ScrollToTopButton threshold={900} />
      </div>
    </div>
  );
}
