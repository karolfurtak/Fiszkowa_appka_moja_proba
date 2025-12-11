import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { SpectrumButton } from "./spectrum-button"

const SpectrumDialog = DialogPrimitive.Root

const SpectrumDialogTrigger = DialogPrimitive.Trigger

const SpectrumDialogPortal = DialogPrimitive.Portal

const SpectrumDialogClose = DialogPrimitive.Close

const SpectrumDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
SpectrumDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/**
 * Adobe Spectrum Dialog Component
 * 
 * Zgodny z wytycznymi Adobe Spectrum Design System:
 * - Overlay: oklch(0 0 0 / 0.5) z blur backdrop (4px)
 * - Modal: biały background, border-radius 8px
 * - Max-width: 480px (small), 640px (medium), 800px (large)
 * - Shadow: shadow-xl
 * - Focus trap, escape key, click outside
 */
const SpectrumDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    size?: "small" | "medium" | "large"
  }
>(({ className, children, size = "medium", ...props }, ref) => (
  <SpectrumDialogPortal>
    <SpectrumDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-card p-0 shadow-xl duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        size === "small" && "max-w-[480px]",
        size === "medium" && "max-w-[640px]",
        size === "large" && "max-w-[800px]",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Zamknij</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SpectrumDialogPortal>
))
SpectrumDialogContent.displayName = DialogPrimitive.Content.displayName

const SpectrumDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 border-b border-border px-6 py-5",
      className
    )}
    {...props}
  />
)
SpectrumDialogHeader.displayName = "SpectrumDialogHeader"

const SpectrumDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
SpectrumDialogTitle.displayName = DialogPrimitive.Title.displayName

const SpectrumDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SpectrumDialogDescription.displayName = DialogPrimitive.Description.displayName

const SpectrumDialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-6 py-6 max-h-[70vh] overflow-y-auto", className)}
    {...props}
  />
)
SpectrumDialogBody.displayName = "SpectrumDialogBody"

const SpectrumDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 border-t border-border px-6 py-4 gap-2",
      className
    )}
    {...props}
  />
)
SpectrumDialogFooter.displayName = "SpectrumDialogFooter"

export {
  SpectrumDialog,
  SpectrumDialogPortal,
  SpectrumDialogOverlay,
  SpectrumDialogTrigger,
  SpectrumDialogClose,
  SpectrumDialogContent,
  SpectrumDialogHeader,
  SpectrumDialogTitle,
  SpectrumDialogDescription,
  SpectrumDialogBody,
  SpectrumDialogFooter,
}

