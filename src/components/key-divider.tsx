type Props = {
  className?: string;
};

/**
 * Decorative gold divider — a continuous thin gold line spanning the full
 * section width with an ornate fleur-de-lis flourish centered on top.
 */
export function KeyDivider({ className = "" }: Props) {
  return (
    <div
      className={`w-full flex items-center ${className}`}
      aria-hidden
    >
      <span className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/55 to-gold-deep" />
      <Flourish />
      <span className="flex-1 h-px bg-gradient-to-l from-transparent via-gold/55 to-gold-deep" />
    </div>
  );
}

function Flourish() {
  return (
    <svg
      width="56"
      height="36"
      viewBox="0 0 56 36"
      className="shrink-0 -mx-px"
      aria-hidden
    >
      <defs>
        <linearGradient id="kd-flourish" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2c98a" />
          <stop offset="55%" stopColor="#c9a24b" />
          <stop offset="100%" stopColor="#a8842d" />
        </linearGradient>
      </defs>

      <g fill="url(#kd-flourish)" stroke="url(#kd-flourish)" strokeWidth="0.4">
        {/* Center upright petal pointed at top */}
        <path d="M28 4
                 C 26 10, 26 16, 28 22
                 C 30 16, 30 10, 28 4 Z" />

        {/* Tiny dot at the very top of the center petal */}
        <circle cx="28" cy="3" r="1.4" />

        {/* Left curling petal */}
        <path d="M28 22
                 C 22 20, 17 16, 14 11
                 C 16 16, 19 20, 24 23
                 C 21 22, 18 22, 16 23
                 C 19 24, 23 24, 26 23 Z" />

        {/* Right curling petal (mirror of left) */}
        <path d="M28 22
                 C 34 20, 39 16, 42 11
                 C 40 16, 37 20, 32 23
                 C 35 22, 38 22, 40 23
                 C 37 24, 33 24, 30 23 Z" />

        {/* Horizontal banded base ribbon */}
        <path d="M16 24
                 Q 28 21 40 24
                 Q 28 27 16 24 Z" />

        {/* Two small flanking dots */}
        <circle cx="13" cy="24" r="1.1" />
        <circle cx="43" cy="24" r="1.1" />
      </g>
    </svg>
  );
}
