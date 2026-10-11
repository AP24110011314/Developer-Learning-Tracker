import { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Tab bar component.
 * @param {{ tabs: Array<{id: string, label: string, icon?: React.ComponentType}>, active: string, onChange: (id: string) => void }} props
 */
export function Tabs({ tabs, active, onChange }) {
  return (
    <div
      role="tablist"
      className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border)]"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'relative flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150',
              isActive
                ? 'text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-500 to-violet-500"
                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {Icon && <Icon size={14} />}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
