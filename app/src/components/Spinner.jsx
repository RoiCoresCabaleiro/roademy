export default function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full border-2 border-neutral-200 border-t-primary-500"></div>
    </div>
  );
}

// Componente para pantallas de carga completas
export function LoadingScreen({ message = "Cargando..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
      <Spinner size="xl" className="mb-4" />
      <p className="text-neutral-600 text-sm">{message}</p>
    </div>
  );
}

// Componente para botones con loading
export function ButtonSpinner({ className = "" }) {
  return <Spinner size="sm" className={`mr-2 ${className}`} />;
}
