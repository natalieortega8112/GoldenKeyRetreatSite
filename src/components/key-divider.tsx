type Props = {
  className?: string;
  width?: "sm" | "md" | "lg";
};

const widths: Record<NonNullable<Props["width"]>, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

export function KeyDivider({ className = "", width = "md" }: Props) {
  return (
    <div
      className={`mx-auto flex items-center gap-3 sm:gap-5 px-6 ${widths[width]} ${className}`}
      aria-hidden
    >
      <span className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/60 to-gold-deep" />
      <Diamond />
      <Key />
      <Diamond />
      <span className="flex-1 h-px bg-gradient-to-l from-transparent via-gold/60 to-gold-deep" />
    </div>
  );
}

function Diamond() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      className="shrink-0"
      aria-hidden
    >
      <polygon points="4,0 8,4 4,8 0,4" fill="#a8842d" />
    </svg>
  );
}

function Key() {
  // Ornate horizontal key — cream-stroked accents echo the logo's curly bow
  return (
    <svg
      width="60"
      height="24"
      viewBox="0 0 60 24"
      className="shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id="kdg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e2c98a" />
          <stop offset="50%" stopColor="#c9a24b" />
          <stop offset="100%" stopColor="#a8842d" />
        </linearGradient>
      </defs>

      {/* Ornate bow (right side, like a vintage key handle) */}
      <g fill="url(#kdg)">
        {/* outer ring */}
        <path d="M48 12 a8 8 0 1 0 -16 0 a8 8 0 1 0 16 0 z M46 12 a6 6 0 1 1 -12 0 a6 6 0 1 1 12 0 z" />
        {/* small flourish curls top + bottom of bow */}
        <path d="M40 2.2 q -2 -1.5 -1 -2.2 q 1 0.6 1 2.2 z M40 21.8 q -2 1.5 -1 2.2 q 1 -0.6 1 -2.2 z" />
        {/* center quatrefoil dot */}
        <circle cx="40" cy="12" r="1.6" />
      </g>

      {/* Shaft */}
      <rect x="3" y="11" width="29" height="2" rx="1" fill="url(#kdg)" />

      {/* Teeth at left end */}
      <g fill="url(#kdg)">
        <rect x="3" y="13" width="3" height="4" rx="0.5" />
        <rect x="8" y="13" width="2.5" height="3" rx="0.5" />
      </g>
    </svg>
  );
}
