import Link from "next/link";
import Image from "next/image";

type LogoSize = "header" | "header-lg" | "footer";

const HEADER_SRC = "/golden-key-retreats-logo.png";
const FOOTER_SRC = "/golden-key-retreats-logo-footer.png";

const variants: Record<
  LogoSize,
  { className: string; src: string; w: number; h: number }
> = {
  header: { className: "h-14 sm:h-28", src: HEADER_SRC, w: 2166, h: 726 },
  "header-lg": { className: "h-16 sm:h-32", src: HEADER_SRC, w: 2166, h: 726 },
  footer: { className: "h-20 sm:h-36", src: FOOTER_SRC, w: 2172, h: 724 },
};

export function Logo({
  variant = "header",
  asLink = true,
}: {
  variant?: LogoSize;
  asLink?: boolean;
}) {
  const v = variants[variant];
  const inner = (
    <Image
      src={v.src}
      alt="Golden Key Retreats"
      width={v.w}
      height={v.h}
      priority={variant !== "footer"}
      className={`${v.className} w-auto select-none`}
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
