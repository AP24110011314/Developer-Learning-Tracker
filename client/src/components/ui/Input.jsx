import { forwardRef } from 'react';
import { clsx } from 'clsx';

/**
 * Styled input with label, error, and hint support.
 *
 * Optional `icon` (a lucide component) renders a left icon, and
 * `rightElement` renders a right-side node (e.g. a password visibility
 * toggle). Horizontal padding is computed explicitly from those props —
 * never mix px utilities with pl/pr utilities on the same element.
 *
 * NOTE: icon inputs must use the `.field-input` class, not `.input`.
 * `.input` sets `padding` in unlayered CSS, which always beats Tailwind's
 * layered padding utilities, so any extra left padding added next to
 * `.input` is silently ignored and the icon overlaps the text.
 */
export const Input = forwardRef(function Input(
  { label, error, hint, id, className, icon: Icon, rightElement, disabled, ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <div className="group relative">
        {Icon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-primary-500"
          >
            <Icon size={16} />
          </span>
        )}
        <input
          id={id}
          ref={ref}
          disabled={disabled}
          className={clsx(
            'field-input',
            Icon ? 'pl-11' : 'pl-4',
            rightElement ? 'pr-11' : 'pr-4',
            error && 'field-error',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
            {rightElement}
          </span>
        )}
      </div>
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
