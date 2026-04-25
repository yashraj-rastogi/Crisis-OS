// ============================================================
// Crisis OS — Badge Component
// ============================================================

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'safe' | 'help' | 'unable' | 'pending' | 'active' | 'resolved' | 'draft' | 'low' | 'medium' | 'high' | 'critical';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:  'text-slate-300 bg-slate-800/50 border-slate-700',
  safe:     'text-green-400 bg-green-900/30 border-green-700',
  help:     'text-amber-400 bg-amber-900/30 border-amber-700',
  unable:   'text-red-400 bg-red-900/30 border-red-700',
  pending:  'text-slate-400 bg-slate-800/30 border-slate-700',
  active:   'text-blue-400 bg-blue-900/30 border-blue-700',
  resolved: 'text-emerald-400 bg-emerald-900/30 border-emerald-700',
  draft:    'text-slate-400 bg-slate-800/50 border-slate-600',
  low:      'text-green-400 bg-green-900/30 border-green-700',
  medium:   'text-amber-400 bg-amber-900/30 border-amber-700',
  high:     'text-red-400 bg-red-900/30 border-red-700',
  critical: 'text-purple-400 bg-purple-900/30 border-purple-700',
};

const dotColors: Record<BadgeVariant, string> = {
  default:  'bg-slate-400',
  safe:     'bg-green-400',
  help:     'bg-amber-400',
  unable:   'bg-red-400',
  pending:  'bg-slate-500',
  active:   'bg-blue-400',
  resolved: 'bg-emerald-400',
  draft:    'bg-slate-500',
  low:      'bg-green-400',
  medium:   'bg-amber-400',
  high:     'bg-red-400',
  critical: 'bg-purple-400',
};

export function Badge({ variant = 'default', children, dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border',
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
