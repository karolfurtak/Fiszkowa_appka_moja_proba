import { useState, useEffect } from 'react';

/**
 * Hook do pobierania aktualnej ścieżki URL
 * 
 * W Astro/SSR używamy window.location.pathname
 */
export function usePathname(): string {
  const [pathname, setPathname] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updatePathname = () => {
      setPathname(window.location.pathname);
    };

    // Aktualizuj przy zmianie URL (np. przez nawigację)
    window.addEventListener('popstate', updatePathname);

    // Obserwuj zmiany w historii przeglądarki
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      updatePathname();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      updatePathname();
    };

    return () => {
      window.removeEventListener('popstate', updatePathname);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return pathname;
}

