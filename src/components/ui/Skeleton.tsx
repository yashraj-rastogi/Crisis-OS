import { cn } from '@/lib/utils';

interface SkeletonProps { className?: string; }

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-800/60', className)} />;
}

export function SkeletonLine({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('glass-card p-5 space-y-3', className)}>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
    </div>
  );
}
