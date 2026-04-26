type Props = {
  className?: string;
};

export function KeyDivider({ className = "" }: Props) {
  return (
    <div
      className={`w-full flex items-center px-6 sm:px-10 ${className}`}
      aria-hidden
    >
      <span className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/50 to-gold-deep" />
      <Key />
      <span className="flex-1 h-px bg-gradient-to-l from-transparent via-gold/50 to-gold-deep" />
    </div>
  );
}

/**
 * Horizontal key whose shaft IS the divider line at y=14 (matches the
 * 1px gold lines on either side, so visually it looks like one continuous
 * gold thread that swells into a key in the middle).
 */
function Key() {
  return (
    <svg
      width="92"
      height="28"
      viewBox="0 0 92 28"
      className="shrink-0 -mx-1"
      aria-hidden
    >
      <defs>
        <linearGradient id="kd-shaft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c9a24b" />
          <stop offset="100%" stopColor="#a8842d" />
        </linearGradient>
        <linearGradient id="kd-bow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2c98a" />
          <stop offset="60%" stopColor="#c9a24b" />
          <stop offset="100%" stopColor="#a8842d" />
        </linearGradient>
      </defs>

      {/* Shaft = the divider line continuing through the key */}
      <line
        x1="0"
        y1="14"
        x2="92"
        y2="14"
        stroke="url(#kd-shaft)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Teeth on the LEFT end of the shaft (key teeth point down) */}
      <g fill="url(#kd-shaft)">
        <rect x="6" y="14" width="2.5" height="6" rx="0.4" />
        <rect x="11" y="14" width="2" height="4.5" rx="0.4" />
        <rect x="15" y="14" width="2.5" height="6" rx="0.4" />
      </g>

      {/* Ornate bow on the RIGHT end — line passes through its center */}
      <g>
        {/* outer ring */}
        <circle cx="78" cy="14" r="10" fill="none" stroke="url(#kd-bow)" strokeWidth="2" />
        {/* small flourish curls */}
        <path
          d="M78 2 q -2 -2 -1 -3 q 2 1 1 3 z M78 26 q -2 2 -1 3 q 2 -1 1 -3 z"
          fill="url(#kd-bow)"
        />
        {/* inner quatrefoil dot */}
        <circle cx="78" cy="14" r="2" fill="url(#kd-bow)" />
        {/* inner accent ring */}
        <circle cx="78" cy="14" r="6" fill="none" stroke="url(#kd-bow)" strokeWidth="0.6" opacity="0.6" />
      </g>
    </svg>
  );
}
