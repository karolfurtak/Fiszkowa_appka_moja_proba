import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

/**
 * Propsy komponentu DeckBreadcrumb
 */
interface DeckBreadcrumbProps {
  /**
   * Nazwa talii
   */
  deckName: string;
}

/**
 * Komponent breadcrumbs dla widoku talii
 *
 * Wyświetla nawigację: Dashboard > [Nazwa talii]
 */
export const DeckBreadcrumb = React.memo(function DeckBreadcrumb({
  deckName,
}: DeckBreadcrumbProps) {
  const handleDashboardClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = '/';
  }, []);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" onClick={handleDashboardClick}>
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{deckName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
});

