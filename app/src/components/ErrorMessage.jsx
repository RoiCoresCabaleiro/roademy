import {
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export default function ErrorMessage({
  error,
  type = "error",
  className = "",
  showIcon = true,
  onDismiss = null,
}) {
  if (!error) return null;

  const message =
    typeof error === "string" ? error : error.message || "Ha ocurrido un error";

  const typeStyles = {
    error: {
      container: "bg-error-50 border-error-200 text-error-800",
      icon: XCircleIcon,
      iconColor: "text-error-500",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-800",
      icon: ExclamationTriangleIcon,
      iconColor: "text-yellow-500",
    },
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: InformationCircleIcon,
      iconColor: "text-blue-500",
    },
  };

  const style = typeStyles[type];
  const Icon = style.icon;

  return (
    <div
      className={`
      flex items-start gap-3 p-4 rounded-xl border
      ${style.container}
      ${className}
    `}
    >
      {showIcon && (
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-2 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <XCircleIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
