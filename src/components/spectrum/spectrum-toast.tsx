import * as React from "react"
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react"
import { toast as sonnerToast } from "sonner"

import { cn } from "@/lib/utils"
import { SpectrumButton } from "./spectrum-button"

export type SpectrumToastVariant = "info" | "success" | "warning" | "error"

export interface SpectrumToastProps {
  variant?: SpectrumToastVariant
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

const toastIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
}

const toastStyles = {
  info: "border-primary/20 bg-primary/5",
  success: "border-chart-3/20 bg-chart-3/5",
  warning: "border-chart-5/20 bg-chart-5/5",
  error: "border-destructive/20 bg-destructive/5",
}

/**
 * Adobe Spectrum Toast Component
 * 
 * Zgodny z wytycznymi Adobe Spectrum Design System:
 * - Position: top-right (default)
 * - Width: 320px max
 * - Auto-dismiss: 5 sekund
 * - Typy: Info, Success, Warning, Error
 * - Animation: slide-in from right, fade-out
 */
export function spectrumToast({
  variant = "info",
  title,
  description,
  duration = 5000,
  action,
}: SpectrumToastProps) {
  const Icon = toastIcons[variant]

  return sonnerToast.custom(
    (t) => (
      <div
        className={cn(
          "w-full max-w-[320px] rounded-lg border p-4 shadow-lg",
          "flex items-start gap-3",
          toastStyles[variant],
          "animate-in slide-in-from-right-full"
        )}
        role="alert"
        aria-live={variant === "error" ? "assertive" : "polite"}
        aria-atomic="true"
      >
        <Icon
          className={cn(
            "h-5 w-5 flex-shrink-0 mt-0.5",
            variant === "info" && "text-primary",
            variant === "success" && "text-chart-3",
            variant === "warning" && "text-chart-5",
            variant === "error" && "text-destructive"
          )}
          aria-hidden="true"
        />

        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {action && (
            <div className="pt-2">
              <SpectrumButton
                variant="quiet"
                size="small"
                onClick={() => {
                  action.onClick()
                  sonnerToast.dismiss(t)
                }}
              >
                {action.label}
              </SpectrumButton>
            </div>
          )}
        </div>

        <button
          onClick={() => sonnerToast.dismiss(t)}
          className="flex-shrink-0 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Zamknij"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    {
      duration,
      position: "top-right",
    }
  )
}

// Convenience functions
export const toast = {
  info: (title: string, description?: string, options?: Partial<SpectrumToastProps>) =>
    spectrumToast({ variant: "info", title, description, ...options }),
  success: (title: string, description?: string, options?: Partial<SpectrumToastProps>) =>
    spectrumToast({ variant: "success", title, description, ...options }),
  warning: (title: string, description?: string, options?: Partial<SpectrumToastProps>) =>
    spectrumToast({ variant: "warning", title, description, ...options }),
  error: (title: string, description?: string, options?: Partial<SpectrumToastProps>) =>
    spectrumToast({ variant: "error", title, description, ...options }),
}

