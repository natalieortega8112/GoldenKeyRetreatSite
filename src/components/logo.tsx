import Link from "next/link";
import Image from "next/image";

type LogoSize = "header" | "header-lg" | "footer";

const sizes: Record<LogoSize, { className: string }> = {
  header: { className: "h-12 sm:h-24" },
  "header-lg": { className: "h-14 sm:h-28" },
  footer: { className: "h-10 sm:h-12" },
};

export function Logo({
  variant = "header",
  asLink = true,
}: {
  variant?: LogoSize;
  asLink?: boolean;
}) {
  const inner = (
    <Image
      src="/golden-key-retreats-logo.png"
      alt="Golden Key Retreats"
      width={2172}
      height={724}
      priority={variant !== "footer"}
      className={`${sizes[variant].className} w-auto select-none`}
    />
  );

  if (!asLink) return inner;

  return (
    <Link
      href="/"
      aria-label="Golden Key Retreats home"
      className="inline-flex items-center"
    >
      {inner}
    </Link>
  );
}
