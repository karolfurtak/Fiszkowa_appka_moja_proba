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
 * Propsy komponentu StudyBreadcrumb
 */
interface StudyBreadcrumbProps {
  /**
   * Nazwa talii
   */
  deckName: string;
  /**
   * ID talii (dla linku)
   */
  deckId: number;
}

/**
 * Komponent breadcrumbs dla widoku trybu nauki
 *
 * Wyświetla nawigację: Dashboard > [Nazwa talii] > Tryb nauki
 */
export const StudyBreadcrumb = React.memo(function StudyBreadcrumb({
  deckName,
  deckId,
}: StudyBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={`/deck/${deckId}`}>{deckName}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Tryb nauki</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
});

