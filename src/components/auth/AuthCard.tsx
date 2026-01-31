import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sun, Moon } from 'lucide-react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = stored === 'dark' || (!stored && systemPrefersDark);

    setIsDarkMode(initialDark);
    if (initialDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setIsMounted(true);
  }, []);

  const toggleDarkMode = React.useCallback(() => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newValue;
    });
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        {/* Card container */}
        <div
          className={`relative w-full max-w-md bg-card rounded-xl shadow-lg border border-border p-8 ${
            isMounted ? 'animate-card-entrance' : 'opacity-0'
          }`}
        >
          {/* Theme toggle - TOP RIGHT CORNER */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="absolute top-4 right-4 rounded-full w-10 h-10 hover:bg-muted"
                aria-label={isDarkMode ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {isDarkMode ? 'Tryb jasny' : 'Tryb ciemny'}
            </TooltipContent>
          </Tooltip>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
            <div className="w-16 h-1 mx-auto mt-3 rounded-full bg-gradient-to-r from-primary to-accent" />
          </div>

          {/* Content */}
          {children}

          {/* Footer */}
          {footer && (
            <div className="mt-6 pt-4 border-t border-border text-center text-sm">
              {footer}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
