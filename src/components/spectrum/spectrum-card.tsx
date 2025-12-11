import * as React from "react"

import { cn } from "@/lib/utils"

export interface SpectrumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "quiet" | "interactive" | "selected"
  header?: React.ReactNode
  footer?: React.ReactNode
}

/**
 * Adobe Spectrum Card Component
 * 
 * Zgodny z wytycznymi Adobe Spectrum Design System:
 * - Background: biały (light) / ciemny szary (dark)
 * - Border-radius: 6px
 * - Padding: 16px standardowy, 24px dla większych kart
 * - Shadow: subtelny shadow-sm
 * - Warianty: default, quiet, interactive, selected
 */
const SpectrumCard = React.forwardRef<HTMLDivElement, SpectrumCardProps>(
  ({ className, variant = "default", header, footer, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md border bg-card text-card-foreground",
          variant === "default" && "shadow-sm",
          variant === "quiet" && "shadow-none",
          variant === "interactive" &&
            "cursor-pointer transition-shadow hover:shadow-md active:shadow-sm",
          variant === "selected" &&
            "border-primary shadow-sm ring-1 ring-primary/20",
          className
        )}
        {...props}
      >
        {header && (
          <div className="border-b border-border px-6 py-4">
            {header}
          </div>
        )}

        <div className={cn("px-6 py-4", !header && !footer && "px-6 py-4")}>
          {children}
        </div>

        {footer && (
          <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    )
  }
)
SpectrumCard.displayName = "SpectrumCard"

const SpectrumCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
SpectrumCardHeader.displayName = "SpectrumCardHeader"

const SpectrumCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
SpectrumCardTitle.displayName = "SpectrumCardTitle"

const SpectrumCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SpectrumCardDescription.displayName = "SpectrumCardDescription"

const SpectrumCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
SpectrumCardContent.displayName = "SpectrumCardContent"

const SpectrumCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-end gap-2", className)}
    {...props}
  />
))
SpectrumCardFooter.displayName = "SpectrumCardFooter"

export {
  SpectrumCard,
  SpectrumCardHeader,
  SpectrumCardTitle,
  SpectrumCardDescription,
  SpectrumCardContent,
  SpectrumCardFooter,
}

