type Props = {
  className?: string;
  /** "light" for use on cream backgrounds, "dark" for cream-soft. */
  tone?: "light" | "dark";
};

export function KeyDivider({ className = "", tone = "light" }: Props) {
  const lineColor =
    tone === "dark"
      ? "from-transparent via-gold/70 to-gold-deep"
      : "from-transparent via-gold/60 to-gold-deep";

  return (
    <div className={`w-full flex items-center ${className}`} aria-hidden>
      <span className={`flex-1 h-0.5 bg-gradient-to-r ${lineColor}`} />
      <Flourish />
      <span
        className={`flex-1 h-0.5 bg-gradient-to-l ${lineColor}`}
      />
    </div>
  );
}

function Flourish() {
  return (
    <svg
      width="68"
      height="44"
      viewBox="0 0 68 44"
      className="shrink-0 -mx-px drop-shadow-sm"
      aria-hidden
    >
      <defs>
        <linearGradient id="kd-flourish" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2c98a" />
          <stop offset="55%" stopColor="#c9a24b" />
          <stop offset="100%" stopColor="#a8842d" />
        </linearGradient>
      </defs>

      <g
        fill="url(#kd-flourish)"
        stroke="url(#kd-flourish)"
        strokeWidth="0.6"
      >
        {/* Center upright petal */}
        <path
          d="M34 4
             C 31 12, 31 20, 34 28
             C 37 20, 37 12, 34 4 Z"
        />

        {/* Crowning dot */}
        <circle cx="34" cy="3" r="1.8" />

        {/* Left curling petal */}
        <path
          d="M34 27
             C 26 25, 20 20, 17 13
             C 19 20, 23 25, 29 28
             C 25 27, 21 27, 18 28
             C 22 30, 27 30, 31 28 Z"
        />

        {/* Right curling petal */}
        <path
          d="M34 27
             C 42 25, 48 20, 51 13
             C 49 20, 45 25, 39 28
             C 43 27, 47 27, 50 28
             C 46 30, 41 30, 37 28 Z"
        />

        {/* Banded base ribbon */}
        <path d="M19 30 Q 34 26 49 30 Q 34 34 19 30 Z" />

        {/* Flanking dots */}
        <circle cx="15" cy="30" r="1.4" />
        <circle cx="53" cy="30" r="1.4" />
      </g>
    </svg>
  );
}
