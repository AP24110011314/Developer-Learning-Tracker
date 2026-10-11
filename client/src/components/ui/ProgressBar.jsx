import { clsx } from 'clsx';

/**
 * Progress bar.
 * @param {{ value: number, max?: number, className?: string, label?: string, showPercent?: boolean }} props
 */
export function ProgressBar({ value, max = 100, className, label, showPercent = false, color = 'primary' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const fills = {
    primary: 'bg-gradient-to-r from-primary-500 to-violet-500',
    emerald: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
    amber:   'bg-gradient-to-r from-amber-400 to-orange-500',
    rose:    'bg-gradient-to-r from-rose-400 to-rose-600',
    cyan:    'bg-gradient-to-r from-cyan-400 to-cyan-600',
  };

  return (
    <div className={clsx('space-y-1', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between text-xs">
          {label && <span className="text-[var(--text-secondary)] font-medium">{label}</span>}
          {showPercent && <span className="text-[var(--text-muted)]">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="progress-track">
        <div
          className={clsx('progress-fill', fills[color] || fills.primary)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

/**
 * Circular progress ring (SVG).
 */
export function ProgressRing({ value, max = 100, size = 80, strokeWidth = 8, children, color = '#6366f1' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--bg-input)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
