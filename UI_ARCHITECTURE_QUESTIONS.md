# Pytania i Zalecenia - Architektura UI dla MVP 10xCards

## Pytania i Rekomendacje

1. **Czy aplikacja powinna mieć strukturę Single Page Application (SPA) czy Multi-Page Application (MPA) z routingiem?**

Rekomendacja: Ze względu na użycie Astro, zalecam hybrydowe podejście - główne widoki jako osobne strony Astro (MPA) dla lepszego SEO i wydajności, a interaktywne komponenty (generator, tryb nauki) jako React SPA wewnątrz stron. Struktura: `/` (dashboard), `/generate` (generator), `/deck/[id]` (widok talii), `/deck/[id]/review` (tryb treningu), `/deck/[id]/study` (tryb nauki), `/verify/[session_id]` (weryfikacja propozycji), `/settings` (ustawienia konta).

2. **Jak powinien wyglądać przepływ użytkownika od generowania fiszek do ich zapisania w talii?**

Rekomendacja: Liniowy przepływ: Dashboard → Generator (wklejenie tekstu + konfiguracja) → Ekran ładowania (progress indicator podczas generowania) → Ekran weryfikacji (lista propozycji z możliwością akceptacji/odrzucenia/edycji) → Wybór talii (dropdown z istniejącymi + opcja utworzenia nowej) → Powrót do Dashboard z komunikatem sukcesu. Każdy krok powinien mieć możliwość powrotu do poprzedniego oraz wyraźne wskaźniki postępu.

3. **Jak powinien być zorganizowany widok weryfikacji propozycji fiszek, aby użytkownik mógł efektywnie przeglądać i akceptować wiele propozycji?**

Rekomendacja: Widok weryfikacji powinien mieć układ kart (card layout) z każdą propozycją jako osobną kartą. Każda karta zawiera: pytanie, odpowiedź, domenę, checkbox "Akceptuj" (domyślnie zaznaczony), przycisk "Odrzuć", przycisk "Regeneruj dystraktory" (jeśli dotyczy), przycisk "Edytuj". Na górze: przycisk "Akceptuj wszystkie", "Odrzuć wszystkie", licznik zaakceptowanych/odrzuconych. Na dole: dropdown wyboru talii + przycisk "Zapisz zaakceptowane". Użyj infinite scroll lub paginacji dla większych sesji generowania.

4. **Jak powinien być zaprojektowany interfejs trybu treningu (spaced repetition) z testem wielokrotnego wyboru?**

Rekomendacja: Pełnoekranowy widok z jedną fiszką na raz. Układ: góra - pasek postępu (X/Y fiszek), środek - pytanie (duży, czytelny tekst), dół - 4 przyciski odpowiedzi (losowo ułożone, równy rozmiar, wyraźne style hover/focus). Po wyborze: natychmiastowa wizualna informacja zwrotna (zielony/czerwony kolor, ikona ✓/✗), krótkie opóźnienie (1-2s), automatyczne przejście do następnej fiszki. Na końcu sesji: ekran podsumowania z wynikiem, listą błędnych odpowiedzi, przyciskiem "Zakończ" powracającym do talii.

5. **Jak powinien być zorganizowany dashboard z listą talii, aby użytkownik mógł szybko zobaczyć postęp i rozpocząć naukę?**

Rekomendacja: Dashboard powinien mieć układ siatki (grid) lub listy kart talii. Każda karta talii zawiera: nazwę talii, liczbę fiszek do powtórki (due today) - wyróżniona, całkowitą liczbę fiszek, przycisk "Rozpocznij powtórkę" (aktywny tylko jeśli są fiszki do powtórki), przycisk "Tryb nauki", menu kontekstowe (edytuj, usuń). Na górze: przycisk "Nowa talia", przycisk "Generuj fiszki", wyszukiwarka talii. Jeśli brak talii: ekran powitalny z CTA "Utwórz pierwszą talię" lub "Wygeneruj fiszki".

6. **Jak powinna być obsługiwana autoryzacja i ochrona tras w interfejsie użytkownika?**

Rekomendacja: Implementuj middleware autoryzacji w Astro, który sprawdza sesję użytkownika przed renderowaniem chronionych stron. Nieautoryzowani użytkownicy są przekierowywani na `/login` z parametrem `redirect` wskazującym na docelową stronę. Wszystkie komponenty React powinny używać Supabase client do sprawdzania stanu autoryzacji. Chronione trasy: `/`, `/generate`, `/deck/*`, `/settings`. Publiczne: `/login`, `/register`. Użyj Supabase Auth helpers dla zarządzania sesją po stronie klienta.

7. **Jak powinien być zaprojektowany formularz generowania fiszek z konfiguracją zaawansowaną (długość pytań, język, domena)?**

Rekomendacja: Formularz powinien mieć układ dwukolumnowy lub accordion z sekcjami: "Podstawowe" (pole tekstowe source_text - duże textarea, rozwijane), "Zaawansowane" (collapsible section z: dropdown języka, pole domeny, pola numeryczne min/max długości pytań, max długości odpowiedzi). Domyślnie sekcja zaawansowana jest zwinięta. Przycisk "Generuj" na dole formularza. Walidacja po stronie klienta przed wysłaniem: sprawdzenie długości tekstu (min 100 znaków), zakresów długości pytań/odpowiedzi. Wyświetlanie błędów inline pod odpowiednimi polami.

8. **Jak powinien być zaprojektowany widok trybu nauki (swobodne przeglądanie) z odwracalnymi kartami?**

Rekomendacja: Widok podobny do trybu treningu, ale bez przycisków odpowiedzi. Karta fiszki z pytaniem widocznym, kliknięcie lub przycisk "Pokaż odpowiedź" odsłania odpowiedź (animacja flip). Nawigacja: przyciski "Poprzednia" / "Następna" lub gesty swipe (na urządzeniach dotykowych), lista wszystkich fiszek w talii po lewej stronie (sidebar) z możliwością szybkiego przejścia. Wskaźnik pozycji (np. "5/20"). Możliwość filtrowania po statusie (wszystkie/learning/mastered).

9. **Jak powinna być obsługiwana komunikacja z API i zarządzanie stanem podczas długotrwałych operacji (generowanie fiszek może trwać 10-30 sekund)?**

Rekomendacja: Użyj React Query (TanStack Query) lub podobnej biblioteki do zarządzania stanem i cache'owania danych z API. Dla generowania fiszek: implementuj WebSocket lub polling (co 2-3 sekundy) do sprawdzania statusu, wyświetlaj progress bar z szacowanym czasem. Dla operacji accept/reject: optymistic updates - natychmiastowa aktualizacja UI, rollback w przypadku błędu. Loading states: skeleton loaders dla list, spinners dla przycisków. Error boundaries dla obsługi błędów na poziomie komponentów.

10. **Jak powinien być zaprojektowany system nawigacji i struktura menu w aplikacji?**

Rekomendacja: Główna nawigacja powinna być w formie sidebar (desktop) lub bottom navigation (mobile). Elementy: Logo/Home (dashboard), "Moje talie" (dashboard), "Generuj fiszki", "Opanowane" (archiwum), "Ustawienia", "Wyloguj". Breadcrumbs dla głębszych poziomów (np. Dashboard > Talia "Biologia" > Tryb treningu). Aktywna trasa powinna być wyróżniona wizualnie. Mobile: hamburger menu z drawer. Użyj komponentów Shadcn/ui: NavigationMenu, Sidebar, Breadcrumb dla spójności.

