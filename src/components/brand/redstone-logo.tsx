import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/public/site";

type LogoSize = "sm" | "md" | "lg" | "xl";

type RedstoneLogoProps = {
  href?: string;
  size?: LogoSize;
  showText?: boolean;
  subtitle?: string;
  className?: string;
  textClassName?: string;
  priority?: boolean;
};

const logoSizes: Record<LogoSize, number> = {
  sm: 40,
  md: 52,
  lg: 64,
  xl: 80,
};

export function RedstoneLogo({
  href,
  size = "md",
  showText = false,
  subtitle,
  className = "",
  textClassName = "",
  priority = false,
}: RedstoneLogoProps) {
  const dimension = logoSizes[size];
  const content = (
    <>
      <Image
        src="/images/redstone-logo.png"
        alt={showText ? "" : SITE_NAME}
        width={dimension}
        height={dimension}
        priority={priority}
        sizes={`${dimension}px`}
        className="shrink-0 rounded-full bg-white object-contain"
        style={{ width: dimension, height: dimension }}
      />
      {showText ? (
        <span className={`min-w-0 leading-tight ${textClassName}`}>
          <span className="block text-base font-black text-inherit sm:text-lg">
            {SITE_NAME}
          </span>
          {subtitle ? (
            <span className="block text-xs font-semibold uppercase tracking-wide opacity-70">
              {subtitle}
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  );

  const baseClassName = `inline-flex min-w-0 items-center gap-3 ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={baseClassName} aria-label={SITE_NAME}>
        {content}
      </Link>
    );
  }

  return <div className={baseClassName}>{content}</div>;
}
