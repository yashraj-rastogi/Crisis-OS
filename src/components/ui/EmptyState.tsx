import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-4">
        {icon ?? <Inbox className="w-7 h-7 text-slate-500" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
