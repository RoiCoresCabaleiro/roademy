import { ButtonSpinner } from "../Spinner";

export default function Button({
  children,
  variant = "primary", // primary, secondary, danger, ghost, outline
  size = "md", // sm, md, lg
  loading = false,
  className = "",
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium rounded-xl transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: `bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500`,
    secondary: `bg-neutral-200 hover:bg-neutral-300 text-neutral-800 focus:ring-neutral-400`,
    danger: `bg-error-500 hover:bg-error-600 text-white focus:ring-error-500`,
    ghost: `bg-transparent hover:bg-neutral-100 text-neutral-700 focus:ring-neutral-300`,
    outline: `bg-transparent border border-neutral-300 hover:bg-neutral-100 text-neutral-700 focus:ring-neutral-300`,
  };

  const sizeStyles = {
    sm: `px-3 py-2 text-sm`,
    md: `px-4 py-3 text-base`,
    lg: `px-5 py-4 text-lg`,
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <ButtonSpinner />}
      {children}
    </button>
  );
}
