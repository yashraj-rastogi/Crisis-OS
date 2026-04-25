// ============================================================
// Crisis OS — Card Component
// ============================================================

import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm:   'p-3',
  md:   'p-4 sm:p-5',
  lg:   'p-6',
};

export function Card({
  children,
  elevated = false,
  interactive = false,
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        elevated ? 'glass-card-elevated' : 'glass-card',
        paddingStyles[padding],
        interactive && [
          'cursor-pointer transition-all duration-200',
          'hover:border-slate-600 hover:bg-slate-800/80 hover:shadow-glass',
          'active:scale-[0.99]',
        ],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ---- Sub-components ----------------------------------------

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('pb-3 border-b border-slate-800', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold text-slate-100', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-sm text-slate-400 mt-0.5', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('pt-4', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('pt-4 mt-auto border-t border-slate-800 flex items-center gap-3', className)}>
      {children}
    </div>
  );
}
