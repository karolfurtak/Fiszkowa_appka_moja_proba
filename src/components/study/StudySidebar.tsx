import * as React from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { FlashcardListItem } from './FlashcardListItem';
import type { FlashcardResponse } from '../../types';

/**
 * Propsy komponentu StudySidebar
 */
interface StudySidebarProps {
  /**
   * Lista fiszek do wyświetlenia
   */
  flashcards: FlashcardResponse[];
  /**
   * Aktualny indeks wyświetlanej fiszki (0-based)
   */
  currentIndex: number;
  /**
   * Czy sidebar jest otwarty
   */
  isOpen: boolean;
  /**
   * Callback wyboru fiszki z listy
   */
  onFlashcardSelect: (index: number) => void;
  /**
   * Callback zamknięcia sidebara
   */
  onClose: () => void;
}

/**
 * Komponent sidebara z listą fiszek
 *
 * Wyświetla listę wszystkich fiszek w talii z możliwością
 * szybkiego przejścia do konkretnej fiszki. Może być ukryty/pokazany.
 */
export const StudySidebar = React.memo(function StudySidebar({
  flashcards,
  currentIndex,
  isOpen,
  onFlashcardSelect,
  onClose,
}: StudySidebarProps) {
  /**
   * Obsługa zamknięcia sidebara
   */
  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  /**
   * Obsługa wyboru fiszki
   */
  const handleFlashcardSelect = React.useCallback(
    (index: number) => {
      onFlashcardSelect(index);
    },
    [onFlashcardSelect]
  );

  /**
   * Obsługa klawisza Escape
   */
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg z-50 transform transition-transform duration-300 ease-in-out"
        role="complementary"
        aria-label="Lista fiszek"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Lista fiszek</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Zamknij sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        {/* Lista fiszek */}
        <nav className="overflow-y-auto h-[calc(100%-4rem)]" aria-label="Nawigacja między fiszkami">
          <ul className="p-2 space-y-1">
            {flashcards.map((flashcard, index) => (
              <FlashcardListItem
                key={flashcard.id}
                flashcard={flashcard}
                index={index}
                isActive={index === currentIndex}
                onClick={handleFlashcardSelect}
              />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
});

