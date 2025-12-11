import * as React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface SpectrumNavItem {
  id: string
  label: string
  icon?: LucideIcon
  href?: string
  onClick?: () => void
  badge?: string | number
  children?: SpectrumNavItem[]
}

export interface SpectrumNavigationProps
  extends React.HTMLAttributes<HTMLElement> {
  items: SpectrumNavItem[]
  activeId?: string
  variant?: "top" | "sidebar"
  collapsed?: boolean
}

/**
 * Adobe Spectrum Navigation Component
 * 
 * Zgodny z wytycznymi Adobe Spectrum Design System:
 * - Top Nav: 48px height, border-bottom
 * - Sidebar: 240px width (collapsed: 48px)
 * - Navigation items: 32px height
 * - States: Default, Hover, Active/Selected, Focus
 */
const SpectrumNavigation = React.forwardRef<
  HTMLElement,
  SpectrumNavigationProps
>(
  (
    { className, items, activeId, variant = "top", collapsed = false, ...props },
    ref
  ) => {
    const isSidebar = variant === "sidebar"

    return (
      <nav
        ref={ref}
        className={cn(
          "flex",
          isSidebar
            ? "flex-col w-60 border-r border-border bg-sidebar"
            : "h-12 items-center border-b border-border bg-background",
          collapsed && isSidebar && "w-12",
          className
        )}
        aria-label="Główna nawigacja"
        {...props}
      >
        {isSidebar ? (
          <div className="flex flex-col gap-1 p-2">
            {items.map((item) => (
              <SpectrumNavItem
                key={item.id}
                item={item}
                active={item.id === activeId}
                collapsed={collapsed}
                level={0}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1 px-4">
            {items.map((item) => (
              <SpectrumNavItem
                key={item.id}
                item={item}
                active={item.id === activeId}
                collapsed={false}
                level={0}
              />
            ))}
          </div>
        )}
      </nav>
    )
  }
)
SpectrumNavigation.displayName = "SpectrumNavigation"

interface SpectrumNavItemProps {
  item: SpectrumNavItem
  active: boolean
  collapsed: boolean
  level: number
}

const SpectrumNavItem = ({ item, active, collapsed, level }: SpectrumNavItemProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = item.children && item.children.length > 0
  const Icon = item.icon

  const content = (
    <>
      {Icon && (
        <Icon
          className={cn(
            "h-4 w-4 flex-shrink-0",
            collapsed && "mx-auto"
          )}
          aria-hidden="true"
        />
      )}
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="flex-shrink-0 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <span className="flex-shrink-0" aria-hidden="true">
              ▼
            </span>
          )}
        </>
      )}
    </>
  )

  const baseClasses = cn(
    "flex items-center gap-2 h-8 rounded px-3 text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    active
      ? "bg-primary/10 text-primary"
      : "text-foreground hover:bg-muted/50",
    collapsed && "justify-center px-2",
    level > 0 && "pl-6"
  )

  if (item.href) {
    return (
      <a
        href={item.href}
        className={baseClasses}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </a>
    )
  }

  if (item.onClick) {
    return (
      <button
        onClick={item.onClick}
        className={baseClasses}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={baseClasses} aria-current={active ? "page" : undefined}>
      {content}
    </div>
  )
}

export { SpectrumNavigation }

