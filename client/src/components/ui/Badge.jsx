import { clsx } from 'clsx';

const difficultyMap = {
  easy:   'badge-easy',
  medium: 'badge-medium',
  hard:   'badge-hard',
};

const statusMap = {
  solved:  'badge-solved',
  revisit: 'badge-revisit',
  stuck:   'badge-stuck',
};

const dotColorMap = {
  easy:    'bg-emerald-500',
  medium:  'bg-amber-500',
  hard:    'bg-rose-500',
  solved:  'bg-green-500',
  revisit: 'bg-amber-500',
  stuck:   'bg-red-500',
};

/**
 * Badge component. Pass `variant` for semantic colors or `className` for custom.
 * @param {{ variant?: 'easy'|'medium'|'hard'|'solved'|'revisit'|'stuck', dot?: boolean } & React.HTMLAttributes<HTMLSpanElement>} props
 */
export function Badge({ children, variant, dot = false, className, ...props }) {
  const cls = variant
    ? (difficultyMap[variant] || statusMap[variant] || '')
    : '';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        cls,
        className
      )}
      {...props}
    >
      {dot && variant && (
        <span className={clsx('w-1.5 h-1.5 rounded-full', dotColorMap[variant])} />
      )}
      {children}
    </span>
  );
}

/**
 * Topic tag with a stable color derived from the topic name.
 */
const TOPIC_PALETTES = [
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
];

function hashTopic(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h % TOPIC_PALETTES.length;
}

export function TopicTag({ topic }) {
  const palette = TOPIC_PALETTES[hashTopic(topic)];
  return (
    <span className={clsx('inline-flex px-2 py-0.5 rounded-md text-xs font-medium', palette)}>
      {topic}
    </span>
  );
}
