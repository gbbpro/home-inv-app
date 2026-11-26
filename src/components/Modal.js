import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

// Bottom sheet on phones, centered dialog on larger screens.
export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  const panel = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panel.current?.querySelector("input, select, textarea");
    if (first && window.matchMedia("(min-width: 768px)").matches) first.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = size === "sm" ? "md:max-w-sm" : "md:max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur dark:bg-black/60-[2px]" onClick={onClose} />
      <div
        ref={panel}
        className={`relative flex max-h-[92dvh] w-full animate-slide-up flex-col rounded-t-3xl bg-surface shadow-sheet dark:border dark:border-stone-200 md:rounded-2xl ${width}`}
      >
        <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-4 md:px-6 md:pt-5">
          <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
          <button type="button" onClick={onClose} className="btn-ghost -mr-2 h-9 w-9 rounded-full p-0" aria-label="Close">
            <FiX size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-5 md:px-6">{children}</div>
        {footer && (
          <div className="flex gap-3 border-t border-stone-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
