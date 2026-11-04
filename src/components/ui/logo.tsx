import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="LastPlate"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-green" />
      <circle
        cx="16"
        cy="17.5"
        r="7.75"
        fill="none"
        stroke="white"
        strokeWidth="1.6"
      />
      <path
        d="M16 21.8c2.9 0 4.5-1.9 4.5-4.7-2.9 0-4.5 1.9-4.5 4.7Z"
        fill="white"
      />
      <path
        d="M15.8 12.4c0-2.7 1.6-4.4 4.2-4.4 0 2.7-1.6 4.4-4.2 4.4Z"
        fill="white"
        fillOpacity="0.7"
      />
    </svg>
  );
}

export function Logo({
  href = "/donor/dashboard",
  className,
  wordmarkClassName,
  onClick,
}: {
  href?: string;
  className?: string;
  wordmarkClassName?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-control",
        className,
      )}
      aria-label="LastPlate home"
    >
      <LogoMark />
      <span
        className={cn(
          "text-[19px] font-semibold tracking-[-0.03em] text-ink",
          wordmarkClassName,
        )}
      >
        LastPlate
      </span>
    </Link>
  );
}
