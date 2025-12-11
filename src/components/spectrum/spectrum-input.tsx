import * as React from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { cn } from "@/lib/utils"

export interface SpectrumInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

/**
 * Adobe Spectrum Input Component
 * 
 * Zgodny z wytycznymi Adobe Spectrum Design System:
 * - Wysokość: 32px standardowa
 * - Border: 1px solid, wyraźny focus ring
 * - Label zawsze widoczny (nie tylko placeholder)
 * - Real-time validation z wyraźnymi komunikatami
 * - Pełna dostępność (aria-describedby, aria-invalid)
 */
const SpectrumInput = React.forwardRef<HTMLInputElement, SpectrumInputProps>(
  (
    {
      className,
      type = "text",
      label,
      helperText,
      error,
      required,
      leftIcon,
      rightIcon,
      id,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId()
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText ? `${inputId}-helper` : undefined
    const describedBy = [ariaDescribedBy, errorId, helperId].filter(Boolean).join(" ") || undefined

    const hasError = !!error
    const showSuccess = !hasError && props.value && type !== "password"

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-foreground block"
          >
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-label="wymagane">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            id={inputId}
            ref={ref}
            className={cn(
              "flex h-8 w-full rounded border bg-background px-3 py-2 text-sm",
              "placeholder:text-muted-foreground",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-40",
              "read-only:bg-muted read-only:cursor-default",
              leftIcon && "pl-9",
              (rightIcon || hasError || showSuccess) && "pr-9",
              hasError
                ? "border-destructive focus-visible:ring-destructive"
                : "border-border focus-visible:ring-primary hover:border-foreground/20",
              className
            )}
            aria-invalid={hasError}
            aria-required={required}
            aria-describedby={describedBy}
            {...props}
          />

          {rightIcon && !hasError && !showSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {rightIcon}
            </div>
          )}

          {hasError && (
            <AlertCircle
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none"
              aria-hidden="true"
            />
          )}

          {showSuccess && (
            <CheckCircle2
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-chart-3 pointer-events-none"
              aria-hidden="true"
            />
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="text-xs text-destructive flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
SpectrumInput.displayName = "SpectrumInput"

export { SpectrumInput }

