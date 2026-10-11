import { useId } from 'react';

/**
 * BigO logo — inline SVG, no image files.
 * Rounded-square badge with the app's indigo → violet → pink gradient,
 * containing a white "O" ring with a small upward-trending curve inside
 * (a nod to Big-O notation).
 *
 * <Logo size={32} />            icon only
 * <Logo withText />             icon + "BigO" wordmark ("Big" in theme text,
 *                               "O" in gradient; pass textClassName="text-white"
 *                               when rendering on a gradient background)
 */
export default function Logo({ size = 32, withText = false, textClassName = '' }) {
  const gradientId = useId();

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="BigO logo"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradientId} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="0.5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${gradientId})`} />
      {/* "O" ring */}
      <circle cx="24" cy="25" r="10.5" stroke="#ffffff" strokeWidth="4" />
      {/* upward-trending curve inside the ring */}
      <path
        d="M17.5 28.5 L22 24 L25 26.5 L30.5 20"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="30.5" cy="20" r="1.9" fill="#ffffff" />
    </svg>
  );

  if (!withText) {
    return <span className="logo-hover">{icon}</span>;
  }

  return (
    <span className="logo-hover" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      {icon}
      <span
        className={`font-extrabold tracking-tight ${textClassName}`}
        style={{ fontSize: size * 0.62, lineHeight: 1, color: textClassName ? undefined : 'var(--text-primary)' }}
      >
        Big<span className="gradient-text">O</span>
      </span>
    </span>
  );
}
