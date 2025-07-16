// src/components/ConfirmationModal.jsx

import Portal from "./Portal";

export default function ConfirmationModal({ isOpen, title, message, children, onCancel, onConfirm, isLoading }) {
  if (!isOpen) return null;
  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onCancel}
      >
        <div
          className="bg-white rounded-lg p-6 w-80"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          <p className="mb-4">{message}</p>
          {children}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded disabled:opacity-50"
            >
              {isLoading ? "Procesando…" : "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
