import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

const variants = {
  primary:
    'bg-gradient-to-r from-primary-500 to-violet-500 text-white shadow-sm hover:from-primary-600 hover:to-violet-600 hover:shadow-md active:scale-[0.98]',
  secondary:
    'bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-strong)] active:scale-[0.98]',
  ghost:
    'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] active:scale-[0.98]',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 shadow-sm hover:shadow-md active:scale-[0.98]',
  outline:
    'border border-[var(--border-focus)] text-primary-500 hover:bg-primary-50 active:scale-[0.98]',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  icon: 'p-2',
};

/**
 * @param {{ variant?: keyof variants, size?: keyof sizes, loading?: boolean, children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}

export default Button;
