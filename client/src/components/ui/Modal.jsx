import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Accessible modal dialog.
 * @param {{ open: boolean, onClose: () => void, title?: string, children: React.ReactNode, size?: 'sm'|'md'|'lg' }} props
 */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, handleKey]);

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative w-full ${widths[size]} card overflow-hidden shadow-modal my-auto`}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            {/* Gradient top bar */}
            <div className="h-1 bg-gradient-to-r from-primary-500 to-violet-500" />

            {title && (
              <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-[var(--border)]">
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className={`px-4 sm:px-6 py-4 sm:py-6 max-h-[82vh] overflow-y-auto ${!title ? 'pt-4 sm:pt-6' : ''}`}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
