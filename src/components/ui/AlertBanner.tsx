// ============================================================
// Crisis OS — AlertBanner Component
// ============================================================

import { X, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, type ReactNode } from 'react';

type AlertType = 'info' | 'warning' | 'danger' | 'success';

interface AlertBannerProps {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  className?: string;
}

const typeStyles: Record<AlertType, string> = {
  info:    'bg-blue-900/30 border-blue-700 text-blue-300',
  warning: 'bg-amber-900/30 border-amber-700 text-amber-300',
  danger:  'bg-red-900/30 border-red-700 text-red-300',
  success: 'bg-emerald-900/30 border-emerald-700 text-emerald-300',
};

const typeIcons: Record<AlertType, typeof Info> = {
  info:    Info,
  warning: AlertTriangle,
  danger:  AlertCircle,
  success: CheckCircle2,
};

export function AlertBanner({
  type = 'info',
  title,
  children,
  dismissible = false,
  className,
}: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const Icon = typeIcons[type];

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 p-4 rounded-xl border text-sm animate-fade-in',
        typeStyles[type],
        className,
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold mb-1">{title}</p>
        )}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
