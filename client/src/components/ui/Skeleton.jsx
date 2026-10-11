import { clsx } from 'clsx';

/**
 * Skeleton loader. Use `className` to set dimensions.
 * @param {{ className?: string, rounded?: string }} props
 */
export function Skeleton({ className, rounded = 'rounded-xl' }) {
  return (
    <div
      className={clsx('skeleton', rounded, className)}
      aria-busy="true"
      aria-label="Loading…"
    />
  );
}

/** Skeleton card placeholder */
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}

/** Row of skeleton stat cards */
export function SkeletonStatCards({ count = 4 }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}
