"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// One place for "did that work?" feedback.
//
// Before this, every surface invented its own inline notice — a small red line
// under a button, a pill that never cleared, or nothing at all. Uploads in
// particular finished silently, so creators could not tell a file had attached.
// Actions now report through here so success and failure look the same
// everywhere and are impossible to miss.

export type ToastTone = "success" | "error" | "info";

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  push: (tone: ToastTone, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Errors stay longer — they usually carry an instruction. */
const DURATION: Record<ToastTone, number> = {
  success: 3200,
  info: 3600,
  error: 6000,
};

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-2), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), DURATION[tone]);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (message: string) => push("success", message),
      error: (message: string) => push("error", message),
      info: (message: string) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/**
 * Access the toast API.
 *
 * Returns no-ops when no provider is mounted, so a shared component can be
 * dropped onto a public page without crashing.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  return (
    context ?? {
      push: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    }
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      // Announced to screen readers without stealing focus.
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-5 sm:items-end sm:px-6"
    >
      {toasts.map((toast) => (
        <ToastRow key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

const TONE_STYLES: Record<ToastTone, string> = {
  success: "bg-dark-green text-white",
  info: "bg-near-black text-white",
  error: "bg-danger-surface text-heritage-red-ink ring-1 ring-heritage-red/25",
};

function ToastRow({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      className={[
        "toast-in pointer-events-auto flex w-full max-w-[420px] items-start gap-3 rounded-2xl px-4 py-3 shadow-[0_20px_50px_-20px_rgba(14,15,12,0.5)]",
        TONE_STYLES[toast.tone],
      ].join(" ")}
    >
      <span aria-hidden className="mt-0.5 shrink-0">
        {toast.tone === "success" ? (
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <circle cx="10" cy="10" r="9" fill="#9fe870" />
            <path
              d="m6 10.2 2.6 2.6L14 7.4"
              stroke="#163300"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : toast.tone === "error" ? (
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <circle cx="10" cy="10" r="9" fill="#da291c" />
            <path
              d="M10 5.6v5M10 13.6v.6"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <circle cx="10" cy="10" r="9" fill="#9fe870" />
            <path
              d="M10 9v5.4M10 6.2v.6"
              stroke="#163300"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>

      <p className="flex-1 text-[13px] font-semibold leading-[1.5]">
        {toast.message}
      </p>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="-mr-1 shrink-0 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
          <path
            d="m5.5 5.5 9 9m0-9-9 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
