import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? 56 : size === "sm" ? 32 : 42;
  const titleClass =
    size === "lg"
      ? "text-2xl"
      : size === "sm"
        ? "text-sm tracking-[0.18em]"
        : "text-base tracking-[0.22em]";
  const subClass =
    size === "lg" ? "text-sm" : size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <Link href="/" className="flex items-center gap-3 group">
      <KeyMark size={dims} />
      <span className="flex flex-col leading-tight">
        <span
          className={`font-serif font-semibold uppercase ${titleClass} text-ink`}
        >
          Golden Key
        </span>
        <span
          className={`uppercase tracking-[0.35em] text-gold-deep ${subClass}`}
        >
          Retreats
        </span>
      </span>
    </Link>
  );
}

function KeyMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="32" cy="20" r="11" stroke="#c9a24b" strokeWidth="2.5" />
      <circle cx="32" cy="20" r="4" fill="#c9a24b" />
      <path
        d="M32 31 L32 56 M32 44 L40 44 M32 50 L38 50"
        stroke="#c9a24b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
