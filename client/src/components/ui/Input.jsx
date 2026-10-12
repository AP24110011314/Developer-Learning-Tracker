import { forwardRef } from 'react';
import { clsx } from 'clsx';

/**
 * Styled input with label, error, and hint support.
 */
export const Input = forwardRef(function Input(
  { label, error, hint, id, className, ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={clsx('input', error && 'border-rose-500 focus:border-rose-500 focus:shadow-none', className)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-rose-500 font-medium">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-[var(--text-muted)]">
          {hint}
        </p>
      )}
    </div>
  );
});

/**
 * Styled select.
 */
export const Select = forwardRef(function Select(
  { label, error, id, children, className, ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={clsx(
          'input appearance-none cursor-pointer',
          error && 'border-rose-500',
          className
        )}
        aria-invalid={!!error}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p role="alert" className="text-xs text-rose-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
});

/**
 * Styled textarea.
 */
export const Textarea = forwardRef(function Textarea(
  { label, error, hint, id, className, ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        className={clsx('input resize-y', error && 'border-rose-500', className)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-rose-500 font-medium">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-[var(--text-muted)]">
          {hint}
        </p>
      )}
    </div>
  );
});
