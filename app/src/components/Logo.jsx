export default function Logo({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className} flex items-center justify-center`}
    >
      <img
        src="/apple-touch-icon.png"
        alt="Roademy Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

// Componente para logo con texto
export function LogoWithText({ size = "md", showText = true, className = "" }) {
  // Solo el logo
  if (!showText) {
    return (
      <div className={`flex items-center ${className}`}>
        <Logo size={size} />
      </div>
    );
  }

  // Logo con texto
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Logo size={size} className="mb-4" />
      <h1 className="text-3xl font-bold text-neutral-900">Roademy</h1>
    </div>
  );
}
