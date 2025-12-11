import * as React from "react"
import { cn } from "@/lib/utils"

export interface SpectrumProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: "linear" | "circular"
  size?: "small" | "default" | "large"
  showLabel?: boolean
  label?: string
}

/**
 * Adobe Spectrum Progress Component
 * 
 * Zgodny z wytycznymi Adobe Spectrum Design System:
 * - Height: 4px (linear), 32px (circular)
 * - Color: Primary color
 * - Background: Subtelny szary
 * - Stany: Indeterminate, Determinate, Complete
 */
const SpectrumProgress = React.forwardRef<HTMLDivElement, SpectrumProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      variant = "linear",
      size = "default",
      showLabel = false,
      label,
      ...props
    },
    ref
  ) => {
    const percentage = value !== undefined ? Math.min(Math.max((value / max) * 100, 0), 100) : undefined
    const isIndeterminate = value === undefined

    if (variant === "circular") {
      const sizeMap = {
        small: 24,
        default: 32,
        large: 40,
      }
      const radius = sizeMap[size]
      const circumference = 2 * Math.PI * (radius - 4)
      const offset = isIndeterminate
        ? undefined
        : circumference - (percentage! / 100) * circumference

      return (
        <div
          ref={ref}
          className={cn("relative inline-flex items-center justify-center", className)}
          role="progressbar"
          aria-valuenow={isIndeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
          {...props}
        >
          <svg
            className={cn(
              "transform -rotate-90",
              isIndeterminate && "animate-spin"
            )}
            width={radius * 2}
            height={radius * 2}
          >
            <circle
              cx={radius}
              cy={radius}
              r={radius - 4}
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-muted"
            />
            {!isIndeterminate && (
              <circle
                cx={radius}
                cy={radius}
                r={radius - 4}
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="text-primary transition-all duration-300"
              />
            )}
          </svg>
          {showLabel && !isIndeterminate && (
            <span className="absolute text-xs font-semibold text-foreground">
              {Math.round(percentage!)}%
            </span>
          )}
        </div>
      )
    }

    // Linear variant
    const heightMap = {
      small: "h-1",
      default: "h-1",
      large: "h-1.5",
    }

    return (
      <div
        ref={ref}
        className={cn("w-full space-y-1", className)}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        {...props}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-muted",
            heightMap[size]
          )}
        >
          <div
            className={cn(
              "h-full bg-primary transition-all duration-300",
              isIndeterminate
                ? "animate-[progress_1.5s_ease-in-out_infinite] w-1/3"
                : "w-full"
            )}
            style={
              !isIndeterminate
                ? {
                    transform: `translateX(-${100 - percentage!}%)`,
                  }
                : undefined
            }
          />
        </div>
        {showLabel && !isIndeterminate && label && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold text-foreground">
              {Math.round(percentage!)}%
            </span>
          </div>
        )}
      </div>
    )
  }
)
SpectrumProgress.displayName = "SpectrumProgress"

// Add animation for indeterminate progress
if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.textContent = `
    @keyframes progress {
      0% {
        transform: translateX(-100%);
      }
      50% {
        transform: translateX(300%);
      }
      100% {
        transform: translateX(-100%);
      }
    }
  `
  document.head.appendChild(style)
}

export { SpectrumProgress }

