import * as React from "react"
import { cn } from "@/lib/utils"

export interface SpectrumListProps extends React.HTMLAttributes<HTMLUListElement> {
  variant?: "simple" | "interactive" | "selectable"
  density?: "compact" | "comfortable"
}

/**
 * Adobe Spectrum List Component
 * 
 * Zgodny z wytycznymi Adobe Spectrum Design System:
 * - Spacing: 8px (compact), 12px (comfortable)
 * - Min-height: 40px dla elementów
 * - Hover effect dla interaktywnych
 * - Pełna dostępność
 */
const SpectrumList = React.forwardRef<HTMLUListElement, SpectrumListProps>(
  ({ className, variant = "simple", density = "comfortable", ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn(
          "w-full space-y-0",
          density === "compact" && "space-y-2",
          density === "comfortable" && "space-y-3",
          className
        )}
        role={variant === "selectable" ? "listbox" : "list"}
        {...props}
      />
    )
  }
)
SpectrumList.displayName = "SpectrumList"

export interface SpectrumListItemProps
  extends React.LiHTMLAttributes<HTMLLIElement> {
  selected?: boolean
  primaryText?: string
  secondaryText?: string
  metadata?: React.ReactNode
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  actions?: React.ReactNode
}

const SpectrumListItem = React.forwardRef<HTMLLIElement, SpectrumListItemProps>(
  (
    {
      className,
      selected,
      primaryText,
      secondaryText,
      metadata,
      leftIcon,
      rightIcon,
      actions,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <li
        ref={ref}
        className={cn(
          "flex min-h-10 items-center justify-between gap-3 rounded px-4 py-3 text-sm transition-colors",
          selected
            ? "bg-primary/10 text-primary"
            : "hover:bg-muted/50",
          className
        )}
        aria-selected={selected}
        role={props.onClick ? "button" : undefined}
        tabIndex={props.onClick ? 0 : undefined}
        {...props}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {leftIcon && (
            <div className="flex-shrink-0 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            {primaryText && (
              <div className="font-medium truncate">{primaryText}</div>
            )}
            {secondaryText && (
              <div className="text-xs text-muted-foreground truncate">
                {secondaryText}
              </div>
            )}
            {children}
          </div>

          {metadata && (
            <div className="flex-shrink-0 text-xs text-muted-foreground">
              {metadata}
            </div>
          )}
        </div>

        {(rightIcon || actions) && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {rightIcon}
            {actions}
          </div>
        )}
      </li>
    )
  }
)
SpectrumListItem.displayName = "SpectrumListItem"

export { SpectrumList, SpectrumListItem }

