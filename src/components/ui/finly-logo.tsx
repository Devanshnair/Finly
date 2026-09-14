import Link from "next/link";
import { cn } from "@/lib/utils";

interface FinlyLogoProps {
  className?: string;
  href?: string;
  compact?: boolean;
}

const WORD = "finly";

export function FinlyLogo({ className, href = "/", compact = false }: FinlyLogoProps) {
  const content = compact ? (
    <div
      className={cn(
        "flex items-baseline font-display text-2xl font-bold tracking-tight text-foreground select-none",
        className
      )}
    >
      <span className="inline-block">f</span>
      <span className="ml-[1px] inline-block text-brand">.</span>
    </div>
  ) : (
    <div
      className={cn(
        "group flex items-baseline font-display text-2xl font-bold tracking-tight text-foreground select-none",
        className
      )}
    >
      {WORD.split("").map((letter, i) => (
        <span
          key={i}
          className="inline-block group-hover:animate-jiggle"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          {letter}
        </span>
      ))}
      <span
        className="ml-[1px] inline-block text-brand group-hover:animate-dot-pop"
        style={{ animationDelay: `${WORD.length * 40}ms` }}
      >
        .
      </span>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex items-baseline focus-visible:outline-none cursor-pointer",
          !compact && "group"
        )}
        aria-label={compact ? "Finly home (f.)" : "Finly home"}
      >
        {content}
      </Link>
    );
  }

  return content;
}

export const Logo = FinlyLogo;
