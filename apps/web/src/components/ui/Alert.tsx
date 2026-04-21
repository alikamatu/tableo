'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const config: Record<
  AlertVariant,
  {
    icon: React.ElementType;
    containerClass: string;
    iconClass: string;
  }
> = {
  success: {
    icon: CheckCircle,
    containerClass: 'bg-white dark:bg-zinc-900 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    iconClass: 'text-emerald-500',
  },
  error: {
    icon: AlertCircle,
    containerClass: 'bg-white dark:bg-zinc-900 border-rose-500/20 text-rose-600 dark:text-rose-400',
    iconClass: 'text-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-white dark:bg-zinc-900 border-amber-500/20 text-amber-600 dark:text-amber-400',
    iconClass: 'text-amber-500',
  },
  info: {
    icon: Info,
    containerClass: 'bg-white dark:bg-zinc-900 border-blue-500/20 text-blue-600 dark:text-blue-400',
    iconClass: 'text-blue-500',
  },
};

export function Alert({ variant, title, message, onClose, className }: AlertProps) {
  const { icon: Icon, containerClass, iconClass } = config[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      role="alert"
      className={cn(
        'fixed top-6 left-1/2 -translate-x-1/2 z-[9999]',
        'flex items-center gap-3.5 px-4 py-3 rounded-2xl shadow-2xl border min-w-[320px] max-w-[420px]',
        containerClass,
        className,
      )}
    >
      <div className={cn('p-1.5 rounded-xl bg-current/5', iconClass)}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        {title && <p className="font-bold text-[13px] leading-tight mb-0.5">{title}</p>}
        <p className="text-[13px] font-medium leading-tight opacity-90">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="flex-shrink-0 p-1 rounded-lg hover:bg-current/5 transition-colors opacity-60 hover:opacity-100"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      )}
    </motion.div>
  );
}

// ─── useAlert — manages a single dismissible alert ───────────────────────────

interface AlertState {
  variant: AlertVariant;
  message: string;
  title?: string;
}

export function useAlert() {
  const [alert, setAlert] = React.useState<AlertState | null>(null);
  const timer = React.useRef<NodeJS.Timeout | null>(null);

  const dismiss = React.useCallback(() => {
    setAlert(null);
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const show = React.useCallback(
    (variant: AlertVariant, message: string, title?: string, duration = 5000) => {
      setAlert({ variant, message, title });
      if (timer.current) clearTimeout(timer.current);
      if (variant !== 'error') {
        timer.current = setTimeout(dismiss, duration);
      }
    },
    [dismiss],
  );

  const node = (
    <AnimatePresence>
      {alert && (
        <Portal>
          <Alert
            variant={alert.variant}
            message={alert.message}
            title={alert.title}
            onClose={dismiss}
          />
        </Portal>
      )}
    </AnimatePresence>
  );

  return { show, dismiss, node, active: !!alert };
}

// ─── Portal helper ──────────────────────────────────────────────────────────

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
