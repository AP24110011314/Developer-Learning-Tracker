import { motion } from 'framer-motion';
import { Inbox, SearchX, Plus } from 'lucide-react';
import { Button } from './Button.jsx';

const icons = {
  empty: Inbox,
  search: SearchX,
};

/**
 * Empty state with icon, title, description, and optional CTA.
 * @param {{ icon?: 'empty'|'search', title: string, description?: string, action?: { label: string, onClick: () => void } }} props
 */
export function EmptyState({ icon = 'empty', title, description, action }) {
  const Icon = icons[icon] || Inbox;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
        <Icon size={32} className="text-primary-400" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-lg text-[var(--text-primary)]">{title}</h3>
        {description && (
          <p className="text-sm text-[var(--text-secondary)] max-w-xs">{description}</p>
        )}
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick}>
          <Plus size={16} />
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
