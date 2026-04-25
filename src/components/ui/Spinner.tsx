// ============================================================
// Crisis OS — Spinner Component
// ============================================================

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary-400', sizeMap[size])} />
      {label && <span className="text-xs text-slate-500">{label}</span>}
    </div>
  );
}
