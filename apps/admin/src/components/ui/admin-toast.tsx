'use client';

import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  message: string;
  title: string;
  variant: ToastVariant;
};

type AdminToastOptions = {
  message: string;
  title?: string;
  variant?: ToastVariant;
};

type AdminToastContextValue = {
  toast: (options: AdminToastOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
};

const AUTO_DISMISS_MS = 5000;

function createToastId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // randomUUID exige secure context (HTTPS ou localhost)
    }
  }

  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

const VARIANT_META: Record<
  ToastVariant,
  { title: string; borderClass: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    title: 'Sucesso',
    borderClass: 'border-[#188038]',
    Icon: CheckCircle2,
  },
  error: {
    title: 'Erro',
    borderClass: 'border-[#d93025]',
    Icon: XCircle,
  },
  info: {
    title: 'Aviso',
    borderClass: 'border-[#1967d2]',
    Icon: Info,
  },
};

function AdminToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}): React.JSX.Element {
  const meta = VARIANT_META[toast.variant];
  const Icon = meta.Icon;

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.id]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="admin-flash-toast-container max-w-sm rounded-lg border border-[#dadce0] bg-white p-4 shadow-lg"
    >
      <div className={cn('admin-gcp-toast flex gap-3 border-l-4 pl-3', meta.borderClass)}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#3c4043]" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#3c4043]">{toast.title}</p>
          <p className="mt-1 text-sm text-[#3c4043]">{toast.message}</p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded p-0.5 text-[#5f6368] transition-colors hover:bg-[#f1f3f4] hover:text-[#3c4043]"
          aria-label="Fechar aviso"
          onClick={() => onDismiss(toast.id)}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function AdminToaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}): React.JSX.Element | null {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[var(--admin-z-toast)] flex max-w-sm flex-col gap-2"
      aria-label="Notificações"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <AdminToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

export function AdminToastProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((options: AdminToastOptions) => {
    const variant = options.variant ?? 'info';
    const meta = VARIANT_META[variant];

    setToasts((current) => [
      ...current,
      {
        id: createToastId(),
        message: options.message,
        title: options.title ?? meta.title,
        variant,
      },
    ]);
  }, []);

  const value = useMemo<AdminToastContextValue>(
    () => ({
      toast: pushToast,
      success: (message, title) =>
        pushToast({
          message,
          variant: 'success',
          ...(title !== undefined ? { title } : {}),
        }),
      error: (message, title) =>
        pushToast({
          message,
          variant: 'error',
          ...(title !== undefined ? { title } : {}),
        }),
    }),
    [pushToast],
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <AdminToaster toasts={toasts} onDismiss={dismiss} />
    </AdminToastContext.Provider>
  );
}

export function useAdminToast(): AdminToastContextValue {
  const context = useContext(AdminToastContext);
  if (!context) {
    throw new Error('useAdminToast must be used within AdminToastProvider');
  }
  return context;
}

export function AdminToastOnMount({
  message,
  variant = 'error',
  title,
}: {
  message: string;
  variant?: ToastVariant;
  title?: string;
}): null {
  const adminToast = useAdminToast();

  useEffect(() => {
    if (variant === 'success') {
      adminToast.success(message, title);
      return;
    }

    if (variant === 'error') {
      adminToast.error(message, title);
      return;
    }

    adminToast.toast({
      message,
      variant,
      ...(title !== undefined ? { title } : {}),
    });
  }, [adminToast, message, title, variant]);

  return null;
}
