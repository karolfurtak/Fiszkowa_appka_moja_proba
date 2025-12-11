import * as React from "react"
import { cn } from "@/lib/utils"

export interface SpectrumFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  title?: string
  description?: string
}

/**
 * Adobe Spectrum Form Component
 * 
 * Zgodny z wytycznymi Adobe Spectrum Design System:
 * - Spacing: 24px między sekcjami, 16px między polami
 * - Label zawsze widoczny
 * - Real-time validation
 * - Pełna dostępność
 */
const SpectrumForm = React.forwardRef<HTMLFormElement, SpectrumFormProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <form ref={ref} className={cn("space-y-6", className)} {...props}>
        {(title || description) && (
          <div className="space-y-2 mb-6">
            {title && (
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </form>
    )
  }
)
SpectrumForm.displayName = "SpectrumForm"

export interface SpectrumFieldsetProps
  extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: string
}

const SpectrumFieldset = React.forwardRef<
  HTMLFieldSetElement,
  SpectrumFieldsetProps
>(({ className, legend, children, ...props }, ref) => {
  return (
    <fieldset ref={ref} className={cn("space-y-4", className)} {...props}>
      {legend && (
        <legend className="text-base font-semibold mb-4">{legend}</legend>
      )}
      {children}
    </fieldset>
  )
})
SpectrumFieldset.displayName = "SpectrumFieldset"

export interface SpectrumFormGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  required?: boolean
  error?: string
  helperText?: string
}

const SpectrumFormGroup = React.forwardRef<
  HTMLDivElement,
  SpectrumFormGroupProps
>(({ className, label, required, error, helperText, children, ...props }, ref) => {
  const groupId = React.useId()
  const errorId = error ? `${groupId}-error` : undefined
  const helperId = helperText ? `${groupId}-helper` : undefined

  return (
    <div ref={ref} className={cn("space-y-1.5", className)} {...props}>
      {label && (
        <label
          htmlFor={groupId}
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

      <div id={groupId}>{children}</div>

      {error && (
        <p
          id={errorId}
          className="text-xs text-destructive flex items-center gap-1"
          role="alert"
        >
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
})
SpectrumFormGroup.displayName = "SpectrumFormGroup"

export { SpectrumForm, SpectrumFieldset, SpectrumFormGroup }
