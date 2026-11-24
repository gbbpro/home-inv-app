import { createContext, useCallback, useContext, useRef, useState } from "react";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const show = useCallback((message, { error = false } = {}) => {
    clearTimeout(timer.current);
    setToast({ message, error, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), error ? 5000 : 2500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[calc(0.75rem+env(safe-area-inset-top))] z-[60] flex justify-center px-4 md:top-20"
      >
        {toast && (
          <div
            key={toast.key}
            className={`pointer-events-auto flex max-w-sm animate-drop-in items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              toast.error ? "bg-red-600 text-white" : "bg-stone-900 text-white"
            }`}
          >
            {toast.error ? <FiAlertCircle className="shrink-0" /> : <FiCheckCircle className="shrink-0 text-brand-200" />}
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
