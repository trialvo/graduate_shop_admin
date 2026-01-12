import { useEffect, useRef, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
  titleId?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  showCloseButton = true,
  isFullscreen = false,
  titleId,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastActiveElRef = useRef<HTMLElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  /* ---------------- Mount / Unmount with animation ---------------- */
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const t = window.setTimeout(() => setMounted(false), 180);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  /* ---------------- ESC key close ---------------- */
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  /* ---------------- BODY SCROLL LOCK (NO LAYOUT SHIFT) ---------------- */
  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const html = document.documentElement;

    const scrollbarWidth = window.innerWidth - html.clientWidth;

    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    body.style.overflow = "hidden";

    // scrollbar compensation
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [isOpen]);

  /* ---------------- Focus management ---------------- */
  useEffect(() => {
    if (!isOpen) return;

    lastActiveElRef.current = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      const root = modalRef.current;
      if (!root) return;

      const focusable = root.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      (focusable[0] ?? root).focus();
    };

    const t = window.setTimeout(focusFirst, 50);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) {
      lastActiveElRef.current?.focus?.();
    }
  }, [mounted]);

  if (!mounted) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : "relative w-full rounded-[4px] bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10";

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`${contentClasses} ${className} transform transition-all duration-200 ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-[0.98] translate-y-1"
        }`}
      >
        {showCloseButton && !isFullscreen && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15"
          >
            ✕
          </button>
        )}

        {children}
      </div>
    </div>
  );
};
