import * as React from 'react';
import { useTheme } from '@/hooks/useTheme';

/**
 * Komponent ThemeProvider
 * 
 * Inicjalizuje i zarządza motywem aplikacji.
 * Powinien być używany w głównym layoutcie aplikacji.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useTheme(); // Inicjalizuje i zarządza motywem
  
  return <>{children}</>;
}

