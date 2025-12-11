import * as React from "react"
import { cn } from "@/lib/utils"

export interface SpectrumSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
  animation?: "pulse" | "wave" | "none"
}

/**
 * Adobe Spectrum Skeleton Component
 * 
 * Zgodny z wytycznymi Adobe Spectrum Design System:
 * - Background: Subtelny szary
 * - Animation: Shimmer effect
 * - Shape: Odzwierciedla finalną zawartość
 */
const SpectrumSkeleton = React.forwardRef<HTMLDivElement, SpectrumSkeletonProps>(
  (
    {
      className,
      variant = "rectangular",
      width,
      height,
      animation = "pulse",
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles: React.CSSProperties = {
      width: width || (variant === "circular" ? "40px" : "100%"),
      height: height || (variant === "circular" ? "40px" : "1em"),
      ...style,
    }

    return (
      <div
        ref={ref}
        className={cn(
          "bg-muted",
          variant === "circular" && "rounded-full",
          variant === "rectangular" && "rounded",
          variant === "text" && "rounded",
          animation === "pulse" && "animate-pulse",
          animation === "wave" && "animate-shimmer",
          className
        )}
        style={baseStyles}
        aria-busy="true"
        aria-label="Ładowanie..."
        {...props}
      />
    )
  }
)
SpectrumSkeleton.displayName = "SpectrumSkeleton"

// Add shimmer animation if not exists
if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
    .animate-shimmer {
      background: linear-gradient(
        90deg,
        var(--muted) 0%,
        var(--muted-foreground) 20%,
        var(--muted) 40%,
        var(--muted) 100%
      );
      background-size: 1000px 100%;
      animation: shimmer 2s infinite;
    }
  `
  if (!document.head.querySelector('style[data-shimmer]')) {
    style.setAttribute('data-shimmer', 'true')
    document.head.appendChild(style)
  }
}

export { SpectrumSkeleton }
