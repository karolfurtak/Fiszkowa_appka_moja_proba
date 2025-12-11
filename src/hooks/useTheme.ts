import * as React from 'react';
import { loadAppSettings, saveAppSettings } from '@/lib/api/settings';

/**
 * Hook do zarządzania motywem (dark mode)
 * 
 * Zapewnia synchronizację z localStorage i preferencjami systemowymi.
 * Automatycznie aktualizuje klasę 'dark' na elemencie <html>.
 */
export function useTheme() {
  const [darkMode, setDarkMode] = React.useState<boolean>(false);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);

  /**
   * Inicjalizacja motywu przy montowaniu komponentu
   */
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Wczytaj ustawienia z localStorage
    const settings = loadAppSettings();
    setDarkMode(settings.darkMode);
    
    // Zastosuj motyw natychmiast
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setIsInitialized(true);

    // Nasłuchuj zmian preferencji systemowych (tylko jeśli nie ma zapisanego ustawienia)
    const darkModeStorage = localStorage.getItem('darkMode');
    if (darkModeStorage === null) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  /**
   * Przełączanie motywu
   */
  const toggleTheme = React.useCallback(() => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    saveAppSettings({ darkMode: newDarkMode, verificationViewMode: loadAppSettings().verificationViewMode });
  }, [darkMode]);

  /**
   * Ustawienie motywu
   */
  const setTheme = React.useCallback((enabled: boolean) => {
    setDarkMode(enabled);
    saveAppSettings({ darkMode: enabled, verificationViewMode: loadAppSettings().verificationViewMode });
  }, []);

  return {
    darkMode,
    toggleTheme,
    setTheme,
    isInitialized,
  };
}

