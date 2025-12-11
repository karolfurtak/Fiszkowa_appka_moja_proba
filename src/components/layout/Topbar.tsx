import * as React from 'react';
import { supabaseClient } from '../../db/supabase.client';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Sparkles, Settings, Trophy, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { usePathname } from '../../hooks/usePathname';
import { useTheme } from '@/hooks/useTheme';

/**
 * Komponent Topbar - główna nawigacja aplikacji
 *
 * Wyświetla logo, linki nawigacyjne i przycisk wylogowania.
 * Zgodnie z planem UI: Logo/Home, Moje talie, Generuj fiszki, Opanowane, Ustawienia, Wyloguj
 */
export default function Topbar() {
  const pathname = usePathname();
  const { darkMode, toggleTheme, isInitialized } = useTheme();

  /**
   * Obsługa wylogowania
   */
  const handleLogout = React.useCallback(async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success('Wylogowano pomyślnie');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Nie udało się wylogować. Spróbuj ponownie.');
    }
  }, []);

  /**
   * Sprawdzenie czy link jest aktywny
   */
  const isActive = React.useCallback(
    (path: string): boolean => {
      if (path === '/') {
        return pathname === '/';
      }
      return pathname?.startsWith(path) ?? false;
    },
    [pathname]
  );

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label="Główna nawigacja"
    >
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo i główne linki */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="flex items-center gap-2 font-semibold text-lg hover:text-primary transition-colors"
            aria-label="Przejdź do dashboardu"
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">10xCards</span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" isActive={isActive('/')} icon={<Home className="h-4 w-4" />}>
              Moje talie
            </NavLink>
            <NavLink href="/generate" isActive={isActive('/generate')} icon={<Sparkles className="h-4 w-4" />}>
              Generuj fiszki
            </NavLink>
            <NavLink href="/settings" isActive={isActive('/settings')} icon={<Settings className="h-4 w-4" />}>
              Ustawienia
            </NavLink>
          </div>
        </div>

        {/* Przyciski po prawej stronie */}
        <div className="flex items-center gap-2">
          {/* Przełącznik dark mode */}
          {isInitialized && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="gap-2"
              aria-label={darkMode ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
            >
              {darkMode ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {darkMode ? 'Jasny' : 'Ciemny'}
              </span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
            aria-label="Wyloguj się"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Wyloguj</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}

/**
 * Komponent linku nawigacyjnego
 */
interface NavLinkProps {
  href: string;
  isActive: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function NavLink({ href, isActive, icon, children }: NavLinkProps) {
  return (
    <a
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon}
      {children}
    </a>
  );
}

