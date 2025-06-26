// src/components/ErrorMessage.jsx

/**
 * Muestra de forma estilizada un mensaje de error.
 */
export default function ErrorMessage({ error }) {
  if (!error) return null;
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
      {error}
    </div>
  );
}
