import * as React from 'react';
import { X, Home, Sparkles, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string | null;
  darkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Moje talie', icon: <Home className="h-5 w-5" /> },
  { href: '/generate', label: 'Generuj fiszki', icon: <Sparkles className="h-5 w-5" /> },
  { href: '/settings', label: 'Ustawienia', icon: <Settings className="h-5 w-5" /> },
];

export function MobileMenu({
  isOpen,
  onClose,
  pathname,
  darkMode,
  onToggleTheme,
  onLogout,
}: MobileMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus trap and keyboard handling
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Focus trap
      if (e.key === 'Tab' && menuRef.current) {
        const focusableElements = menuRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus close button when opening
    closeButtonRef.current?.focus();

    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const isActive = (path: string): boolean => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path) ?? false;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={menuRef}
        className="fixed inset-y-0 right-0 z-50 w-72 bg-background shadow-xl animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Menu nawigacyjne"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold text-lg">Menu</span>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Zamknij menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-2" aria-label="Nawigacja mobilna">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent'
              )}
              aria-current={isActive(item.href) ? 'page' : undefined}
              onClick={onClose}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12"
            onClick={() => {
              onToggleTheme();
            }}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            {darkMode ? 'Tryb jasny' : 'Tryb ciemny'}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              onLogout();
              onClose();
            }}
          >
            <LogOut className="h-5 w-5" />
            Wyloguj
          </Button>
        </div>
      </div>
    </>
  );
}
