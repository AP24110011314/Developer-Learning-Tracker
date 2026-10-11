import { motion } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Card component with optional hover lift, gradient header, and entrance animation.
 */
export function Card({ children, className, hover = false, gradient, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={clsx('card', hover && 'card-hover cursor-pointer', className)}
      {...props}
    >
      {gradient && (
        <div className={clsx('h-1 rounded-t-2xl', gradient)} />
      )}
      {children}
    </motion.div>
  );
}

/** Shorthand for card body padding */
export function CardBody({ children, className }) {
  return <div className={clsx('p-5', className)}>{children}</div>;
}

/** Stat card with gradient background, icon, and count-up animation */
export function StatCard({ label, value, icon: Icon, gradient = 'card-gradient-violet', subtitle, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      className={clsx('relative overflow-hidden rounded-2xl text-white p-5 bg-gradient-to-br', gradient)}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/10" />

      <div className="relative">
        {Icon && (
          <div className="mb-2 w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon size={18} />
          </div>
        )}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: index * 0.07 + 0.15 }}
          className="text-3xl font-extrabold tracking-tight"
        >
          {value}
        </motion.div>
        <div className="text-sm font-medium mt-1 text-white/80">{label}</div>
        {subtitle && <div className="text-xs mt-0.5 text-white/60">{subtitle}</div>}
      </div>
    </motion.div>
  );
}
