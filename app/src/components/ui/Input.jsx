export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`
        w-full px-4 py-3 border border-neutral-300 rounded-xl
        focus:ring-2 focus:ring-primary-500 focus:border-primary-500
        transition-colors duration-200
        placeholder-neutral-400
        ${className}
      `}
      {...props}
    />
  );
}
