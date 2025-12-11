import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Adobe Spectrum Button Variants
 * 
 * Wysokości: small (24px), default (32px), large (40px)
 * Border-radius: 4-6px (subtelne zaokrąglenia)
 * Font-weight: 600 (semibold) dla primary, 400 (regular) dla secondary
 */
const spectrumButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 focus-visible:ring-primary rounded-md shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 focus-visible:ring-primary rounded-md border border-border",
        quiet:
          "bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20 focus-visible:ring-primary rounded-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive rounded-md shadow-sm",
        "destructive-quiet":
          "bg-transparent text-destructive hover:bg-destructive/10 active:bg-destructive/20 focus-visible:ring-destructive rounded-md",
      },
      size: {
        small: "h-6 px-3 text-xs rounded",
        default: "h-8 px-4 text-sm rounded-md",
        large: "h-10 px-6 text-base rounded-md",
        icon: "h-8 w-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface SpectrumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof spectrumButtonVariants> {
  asChild?: boolean
  loading?: boolean
}

/**
 * Adobe Spectrum Button Component
 * 
 * Zgodny z wytycznymi Adobe Spectrum Design System:
 * - Wysokie kontrasty (WCAG AA/AAA)
 * - Wyraźne stany hover/active/focus
 * - Loading state z spinnerem
 * - Pełna dostępność (keyboard navigation, ARIA)
 */
const SpectrumButton = React.forwardRef<HTMLButtonElement, SpectrumButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(spectrumButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            <span className="sr-only">Ładowanie...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
SpectrumButton.displayName = "SpectrumButton"

export { SpectrumButton, spectrumButtonVariants }

