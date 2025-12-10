# Plan testów widoku Dashboard

## 1. Testy strukturalne

### 1.1. Weryfikacja struktury komponentów

**Cel**: Sprawdzenie, czy wszystkie komponenty są poprawnie zaimplementowane zgodnie z planem.

**Kroki**:
1. Otwórz `src/pages/index.astro`
2. Sprawdź, czy strona Astro:
   - Ma `export const prerender = false;`
   - Importuje `DashboardView` z `../components/dashboard/DashboardView`
   - Importuje `Toaster` z `../components/ui/sonner`
   - Sprawdza autoryzację użytkownika (`getUser()`)
   - Przekierowuje na `/login?redirect=/` jeśli użytkownik nie jest zalogowany
   - Renderuje `DashboardView` z `client:load`
   - Renderuje `Toaster` dla toast notifications

3. Otwórz `src/components/dashboard/DashboardView.tsx`
4. Sprawdź, czy komponent:
   - Ma interfejs `DashboardState` z wszystkimi wymaganymi polami
   - Importuje wszystkie wymagane komponenty dzieci
   - Ma wszystkie wymagane sekcje (header, lista talii, dialogi)

5. Sprawdź, czy wszystkie komponenty dzieci istnieją:
   - `SearchBar.tsx` ✓
   - `DeckCard.tsx` ✓
   - `EmptyState.tsx` ✓
   - `CreateDeckDialog.tsx` ✓
   - `EditDeckDialog.tsx` ✓
   - `DeleteDeckDialog.tsx` ✓

**Oczekiwany wynik**: Wszystkie komponenty są poprawnie zaimplementowane zgodnie z planem.

### 1.2. Weryfikacja importów i zależności

**Cel**: Sprawdzenie, czy wszystkie importy są poprawne i nie ma brakujących zależności.

**Kroki**:
1. Sprawdź importy w `DashboardView.tsx`:
   - `import * as React from 'react'` ✓
   - `import { supabaseClient } from '../../db/supabase.client'` ✓
   - `import { fetchDecksWithCounts, fetchDueFlashcardCounts, createDeck, updateDeck, deleteDeck } from '../../lib/api/decks'` ✓
   - `import type { DeckViewModel } from '../../types'` ✓
   - `import { toast } from 'sonner'` ✓
   - Wszystkie komponenty dzieci ✓
   - Wszystkie komponenty Shadcn/ui ✓

2. Sprawdź importy w komponentach dzieci:
   - Wszystkie importy są poprawne ✓
   - Brak błędów kompilacji ✓

**Oczekiwany wynik**: Wszystkie importy są poprawne, brak błędów kompilacji.

### 1.3. Weryfikacja zgodności z planem implementacji

**Cel**: Sprawdzenie, czy implementacja jest zgodna z planem implementacji.

**Kroki**:
1. Porównaj strukturę komponentów z planem (sekcja 3):
   - `index.astro` ✓
   - `DashboardView` (React Component) ✓
   - `DashboardHeader` z `SearchBar` i `ActionButtons` ✓
   - `DecksGrid` z `DeckCard[]` ✓
   - `EmptyState` (conditional) ✓
   - Dialogi (`CreateDeckDialog`, `EditDeckDialog`, `DeleteDeckDialog`) ✓

2. Porównaj funkcjonalność z planem:
   - Wyszukiwanie talii w czasie rzeczywistym ✓
   - Tworzenie nowej talii ✓
   - Przekierowanie do generatora fiszek ✓
   - Nawigacja do widoku talii ✓
   - Rozpoczęcie sesji treningowej ✓
   - Przejście do trybu nauki ✓
   - Edycja nazwy talii ✓
   - Usunięcie talii ✓

**Oczekiwany wynik**: Implementacja jest zgodna z planem implementacji.

## 2. Testy funkcjonalne

### 2.1. Test podstawowego przepływu - wyświetlanie talii

**Cel**: Sprawdzenie, czy podstawowy przepływ wyświetlania talii działa poprawnie.

**Warunki wstępne**:
- Użytkownik jest zalogowany
- Użytkownik ma co najmniej jedną talię

**Kroki**:
1. Przejdź na stronę `/`
2. Sprawdź, czy:
   - Wyświetla się nagłówek "Moje talie"
   - Wyświetla się wyszukiwarka
   - Wyświetlają się przyciski "Nowa talia" i "Generuj fiszki"
   - Wyświetlają się wszystkie talie użytkownika w siatce (grid)
   - Każda karta talii zawiera:
     - Nazwę talii
     - Liczbę fiszek
     - Badge z liczbą fiszek do powtórki (jeśli są)
     - Przyciski "Powtórka" i "Nauka"
     - Menu kontekstowe (trzy kropki)

**Oczekiwany wynik**: Podstawowy przepływ wyświetlania talii działa poprawnie.

### 2.2. Test wyszukiwania talii

**Cel**: Sprawdzenie, czy wyszukiwanie talii działa poprawnie.

**Warunki wstępne**:
- Użytkownik jest na stronie `/`
- Użytkownik ma co najmniej dwie talie o różnych nazwach

**Kroki**:
1. Wprowadź tekst wyszukiwania w pole "Szukaj talii..."
2. Sprawdź, czy:
   - Lista talii jest filtrowana w czasie rzeczywistym
   - Wyświetlają się tylko talie pasujące do zapytania (case-insensitive)
   - Wyświetla się przycisk wyczyszczenia wyszukiwania (X)

3. Wyczyść wyszukiwanie (kliknij X)
4. Sprawdź, czy:
   - Wszystkie talie są ponownie wyświetlone

5. Wprowadź zapytanie, które nie pasuje do żadnej talii
6. Sprawdź, czy:
   - Wyświetla się `EmptyState` z komunikatem "Nie znaleziono talii"
   - Wyświetla się przycisk "Wyczyść wyszukiwanie"

**Oczekiwany wynik**: Wyszukiwanie talii działa poprawnie, filtrowanie jest case-insensitive.

### 2.3. Test tworzenia nowej talii

**Cel**: Sprawdzenie, czy tworzenie nowej talii działa poprawnie.

**Warunki wstępne**:
- Użytkownik jest na stronie `/`

**Kroki**:
1. Kliknij przycisk "Nowa talia"
2. Sprawdź, czy:
   - Otwiera się dialog `CreateDeckDialog`
   - Pole nazwy talii ma focus
   - Wyświetla się przycisk "Anuluj" i "Utwórz"

3. Spróbuj utworzyć talię z pustą nazwą (kliknij "Utwórz")
4. Sprawdź, czy:
   - Wyświetla się komunikat błędu: "Nazwa talii jest wymagana"
   - Dialog nie zamyka się

5. Wprowadź nazwę talii z 1 znakiem
6. Sprawdź, czy:
   - Wyświetla się komunikat błędu: "Nazwa talii musi mieć co najmniej 2 znaki"

7. Wprowadź nazwę talii z więcej niż 200 znakami
8. Sprawdź, czy:
   - Wyświetla się komunikat błędu: "Nazwa talii nie może przekraczać 200 znaków"
   - Pole nie pozwala na wprowadzenie więcej niż 200 znaków

9. Wprowadź poprawną nazwę talii (np. "Testowa talia")
10. Kliknij "Utwórz"
11. Sprawdź, czy:
    - Dialog zamyka się
    - Wyświetla się toast notification: "Talia została utworzona"
    - Nowa talia pojawia się na liście
    - Lista talii jest odświeżona

**Oczekiwany wynik**: Tworzenie nowej talii działa poprawnie, walidacja działa poprawnie.

### 2.4. Test edycji talii

**Cel**: Sprawdzenie, czy edycja talii działa poprawnie.

**Warunki wstępne**:
- Użytkownik jest na stronie `/`
- Użytkownik ma co najmniej jedną talię

**Kroki**:
1. Kliknij menu kontekstowe (trzy kropki) na karcie talii
2. Kliknij "Edytuj"
3. Sprawdź, czy:
   - Otwiera się dialog `EditDeckDialog`
   - Pole nazwy talii jest wstępnie wypełnione aktualną nazwą
   - Tekst w polu jest zaznaczony (selected)

4. Zmień nazwę talii na nową
5. Kliknij "Zapisz"
6. Sprawdź, czy:
   - Dialog zamyka się
   - Wyświetla się toast notification: "Talia została zaktualizowana"
   - Nazwa talii na karcie jest zaktualizowana

7. Otwórz dialog edycji ponownie
8. Nie zmieniaj nazwy (pozostaw taką samą)
9. Kliknij "Zapisz"
10. Sprawdź, czy:
    - Dialog zamyka się bez wyświetlania toast notification
    - Nie ma niepotrzebnego zapytania do API

**Oczekiwany wynik**: Edycja talii działa poprawnie, walidacja działa poprawnie.

### 2.5. Test usuwania talii

**Cel**: Sprawdzenie, czy usuwanie talii działa poprawnie.

**Warunki wstępne**:
- Użytkownik jest na stronie `/`
- Użytkownik ma co najmniej jedną talię

**Kroki**:
1. Kliknij menu kontekstowe (trzy kropki) na karcie talii
2. Kliknij "Usuń"
3. Sprawdź, czy:
   - Otwiera się dialog `DeleteDeckDialog`
   - Wyświetla się ostrzeżenie z nazwą talii
   - Wyświetla się komunikat o nieodwracalności operacji
   - Wyświetlają się przyciski "Anuluj" i "Usuń" (destrukcyjny styl)

4. Kliknij "Anuluj"
5. Sprawdź, czy:
   - Dialog zamyka się
   - Talia nie została usunięta

6. Otwórz dialog usuwania ponownie
7. Kliknij "Usuń"
8. Sprawdź, czy:
   - Wyświetla się loader na przycisku "Usuń"
   - Dialog zamyka się po zakończeniu
   - Wyświetla się toast notification: "Talia została usunięta"
   - Talia znika z listy
   - Lista talii jest odświeżona

**Oczekiwany wynik**: Usuwanie talii działa poprawnie, dialog potwierdzenia działa poprawnie.

### 2.6. Test nawigacji do widoku talii

**Cel**: Sprawdzenie, czy nawigacja do widoku talii działa poprawnie.

**Warunki wstępne**:
- Użytkownik jest na stronie `/`
- Użytkownik ma co najmniej jedną talię

**Kroki**:
1. Kliknij na kartę talii (nie na przyciski)
2. Sprawdź, czy:
   - Następuje przekierowanie na `/deck/[id]` z poprawnym `id` talii

**Oczekiwany wynik**: Nawigacja do widoku talii działa poprawnie.

### 2.7. Test rozpoczęcia powtórki

**Cel**: Sprawdzenie, czy rozpoczęcie powtórki działa poprawnie.

**Warunki wstępne**:
- Użytkownik jest na stronie `/`
- Użytkownik ma co najmniej jedną talię z fiszkami do powtórki

**Kroki**:
1. Znajdź talię z badge "X do powtórki"
2. Sprawdź, czy:
   - Przycisk "Powtórka" jest aktywny (nie disabled)

3. Kliknij przycisk "Powtórka"
4. Sprawdź, czy:
   - Następuje przekierowanie na `/deck/[id]/review` z poprawnym `id` talii

5. Znajdź talię bez fiszek do powtórki (brak badge)
6. Sprawdź, czy:
   - Przycisk "Powtórka" jest nieaktywny (disabled)
   - Po najechaniu myszką wyświetla się tooltip: "Brak fiszek do powtórki"

**Oczekiwany wynik**: Rozpoczęcie powtórki działa poprawnie, przycisk jest disabled gdy brak fiszek do powtórki.

### 2.8. Test rozpoczęcia trybu nauki

**Cel**: Sprawdzenie, czy rozpoczęcie trybu nauki działa poprawnie.

**Warunki wstępne**:
- Użytkownik jest na stronie `/`
- Użytkownik ma co najmniej jedną talię z fiszkami

**Kroki**:
1. Znajdź talię z fiszkami (totalFlashcards > 0)
2. Sprawdź, czy:
   - Przycisk "Nauka" jest aktywny (nie disabled)

3. Kliknij przycisk "Nauka"
4. Sprawdź, czy:
   - Następuje przekierowanie na `/deck/[id]/study` z poprawnym `id` talii

5. Znajdź talię bez fiszek (totalFlashcards === 0)
6. Sprawdź, czy:
   - Przycisk "Nauka" jest nieaktywny (disabled)

**Oczekiwany wynik**: Rozpoczęcie trybu nauki działa poprawnie, przycisk jest disabled gdy brak fiszek.

### 2.9. Test przejścia do generatora fiszek

**Cel**: Sprawdzenie, czy przejście do generatora fiszek działa poprawnie.

**Warunki wstępne**:
- Użytkownik jest na stronie `/`

**Kroki**:
1. Kliknij przycisk "Generuj fiszki"
2. Sprawdź, czy:
   - Następuje przekierowanie na `/generate`

**Oczekiwany wynik**: Przejście do generatora fiszek działa poprawnie.

### 2.10. Test empty state - brak talii

**Cel**: Sprawdzenie, czy empty state jest wyświetlany poprawnie gdy brak talii.

**Warunki wstępne**:
- Użytkownik jest na stronie `/`
- Użytkownik nie ma żadnych talii

**Kroki**:
1. Sprawdź, czy:
   - Wyświetla się `EmptyState` z komunikatem "Nie masz jeszcze żadnych talii"
   - Wyświetla się ikona (FileQuestion)
   - Wyświetlają się przyciski "Utwórz pierwszą talię" i "Generuj fiszki"

2. Kliknij przycisk "Utwórz pierwszą talię"
3. Sprawdź, czy:
   - Otwiera się dialog `CreateDeckDialog`

4. Zamknij dialog
5. Kliknij przycisk "Generuj fiszki"
6. Sprawdź, czy:
   - Następuje przekierowanie na `/generate`

**Oczekiwany wynik**: Empty state jest wyświetlany poprawnie, przyciski działają poprawnie.

### 2.11. Test obsługi błędów - błąd autoryzacji

**Cel**: Sprawdzenie, czy błąd autoryzacji jest poprawnie obsługiwany.

**Warunki wstępne**:
- Użytkownik ma wygasłą sesję (lub symuluj błąd autoryzacji)

**Kroki**:
1. Przejdź na stronę `/` z wygasłą sesją
2. Sprawdź, czy:
   - Następuje przekierowanie na `/login?redirect=/`

**Oczekiwany wynik**: Błąd autoryzacji jest poprawnie obsługiwany, użytkownik jest przekierowany na login.

### 2.12. Test obsługi błędów - błąd sieci

**Cel**: Sprawdzenie, czy błąd sieci jest poprawnie obsługiwany.

**Warunki wstępne**:
- Użytkownik jest na stronie `/`
- Brak połączenia z internetem (lub symuluj błąd sieci)

**Kroki**:
1. Odłącz połączenie z internetem (lub symuluj błąd sieci)
2. Odśwież stronę
3. Sprawdź, czy:
   - Wyświetla się Alert z komunikatem błędu
   - Wyświetla się przycisk "Spróbuj ponownie"

4. Przywróć połączenie z internetem
5. Kliknij przycisk "Spróbuj ponownie"
6. Sprawdź, czy:
   - Talie są ponownie pobierane
   - Lista talii jest wyświetlona

**Oczekiwany wynik**: Błąd sieci jest poprawnie obsługiwany, użytkownik może spróbować ponownie.

### 2.13. Test obsługi błędów - duplikacja nazwy talii

**Cel**: Sprawdzenie, czy błąd duplikacji nazwy talii jest poprawnie obsługiwany.

**Warunki wstępne**:
- Użytkownik jest na stronie `/`
- Użytkownik ma talię o nazwie "Test"

**Kroki**:
1. Kliknij przycisk "Nowa talia"
2. Wprowadź nazwę "Test" (taka sama jak istniejąca talia)
3. Kliknij "Utwórz"
4. Sprawdź, czy:
   - Wyświetla się komunikat błędu: "Talia o tej nazwie już istnieje"
   - Dialog nie zamyka się
   - Pole nazwy ma focus

**Oczekiwany wynik**: Błąd duplikacji nazwy talii jest poprawnie obsługiwany.

## 3. Testy dostępności (WCAG AA)

### 3.1. Test nawigacji klawiaturą

**Cel**: Sprawdzenie, czy wszystkie elementy są dostępne przez klawiaturę.

**Kroki**:
1. Przejdź na stronę `/`
2. Użyj klawisza Tab do nawigacji
3. Sprawdź, czy:
   - Wszystkie przyciski są dostępne przez Tab
   - Pole wyszukiwania jest dostępne przez Tab
   - Karty talii są dostępne przez Tab (Enter/Space aktywuje)
   - Menu kontekstowe jest dostępne przez Tab
   - Dialogi są dostępne przez Tab (focus trap)
   - Escape zamyka dialogi

**Oczekiwany wynik**: Wszystkie elementy są dostępne przez klawiaturę.

### 3.2. Test screen readera

**Cel**: Sprawdzenie, czy komunikaty są czytane przez screen reader.

**Kroki**:
1. Włącz screen reader (NVDA, JAWS, VoiceOver)
2. Przejdź na stronę `/`
3. Sprawdź, czy:
   - Wszystkie przyciski mają odpowiednie `aria-label`
   - Komunikaty błędów są czytane przez screen reader (`role="alert"`)
   - Karty talii są czytane z odpowiednimi informacjami
   - Dialogi są czytane z odpowiednimi opisami

**Oczekiwany wynik**: Wszystkie komunikaty są czytane przez screen reader.

### 3.3. Test kontrastu kolorów

**Cel**: Sprawdzenie, czy kontrast kolorów spełnia wymagania WCAG AA (4.5:1).

**Kroki**:
1. Przejdź na stronę `/`
2. Sprawdź kontrast kolorów:
   - Tekst na kartach talii vs tło
   - Tekst błędów vs tło alertu
   - Tekst przycisków vs tło przycisków
   - Badge "X do powtórki" vs tło

**Oczekiwany wynik**: Kontrast kolorów spełnia wymagania WCAG AA (4.5:1).

## 4. Testy wydajności

### 4.1. Test filtrowania - wydajność

**Cel**: Sprawdzenie, czy filtrowanie talii działa wydajnie.

**Kroki**:
1. Przejdź na stronę `/` z dużą liczbą talii (np. 50+)
2. Wprowadź tekst wyszukiwania
3. Sprawdź, czy:
   - Filtrowanie jest natychmiastowe (bez opóźnień)
   - Nie ma problemów z wydajnością renderowania

**Oczekiwany wynik**: Filtrowanie działa wydajnie nawet przy dużej liczbie talii.

### 4.2. Test ładowania danych

**Cel**: Sprawdzenie, czy ładowanie danych działa wydajnie.

**Kroki**:
1. Przejdź na stronę `/`
2. Sprawdź, czy:
   - Wyświetla się loader podczas ładowania
   - Dane są ładowane w rozsądnym czasie (< 2 sekundy)
   - Nie ma niepotrzebnych zapytań do API

**Oczekiwany wynik**: Ładowanie danych działa wydajnie.

## 5. Testy integracyjne

### 5.1. Test integracji z API - pobieranie talii

**Cel**: Sprawdzenie, czy integracja z API działa poprawnie.

**Kroki**:
1. Przejdź na stronę `/`
2. Otwórz DevTools → Network
3. Sprawdź, czy:
   - Wysyłane są zapytania do `/rest/v1/decks` z poprawnymi parametrami
   - Wysyłane są zapytania do `/rest/v1/flashcards` dla liczby fiszek do powtórki
   - Odpowiedzi są poprawnie przetwarzane

**Oczekiwany wynik**: Integracja z API działa poprawnie.

### 5.2. Test integracji z widokiem talii

**Cel**: Sprawdzenie, czy integracja z widokiem talii działa poprawnie.

**Kroki**:
1. Przejdź na stronę `/`
2. Kliknij na kartę talii
3. Sprawdź, czy:
   - Następuje przekierowanie na `/deck/[id]` z poprawnym `id`
   - Widok talii wyświetla poprawną talię

**Oczekiwany wynik**: Integracja z widokiem talii działa poprawnie.

### 5.3. Test integracji z trybem treningu

**Cel**: Sprawdzenie, czy integracja z trybem treningu działa poprawnie.

**Kroki**:
1. Przejdź na stronę `/`
2. Kliknij przycisk "Powtórka" na karcie talii z fiszkami do powtórki
3. Sprawdź, czy:
   - Następuje przekierowanie na `/deck/[id]/review` z poprawnym `id`
   - Tryb treningu wyświetla fiszki do powtórki

**Oczekiwany wynik**: Integracja z trybem treningu działa poprawnie.

### 5.4. Test integracji z trybem nauki

**Cel**: Sprawdzenie, czy integracja z trybem nauki działa poprawnie.

**Kroki**:
1. Przejdź na stronę `/`
2. Kliknij przycisk "Nauka" na karcie talii z fiszkami
3. Sprawdź, czy:
   - Następuje przekierowanie na `/deck/[id]/study` z poprawnym `id`
   - Tryb nauki wyświetla fiszki

**Oczekiwany wynik**: Integracja z trybem nauki działa poprawnie.

## 6. Testy edge cases

### 6.1. Test z bardzo długą nazwą talii

**Cel**: Sprawdzenie, czy bardzo długa nazwa talii jest poprawnie obsługiwana.

**Kroki**:
1. Utwórz talię z nazwą o długości 200 znaków
2. Sprawdź, czy:
   - Nazwa jest poprawnie wyświetlona na karcie (z `line-clamp-2` jeśli za długa)
   - Nazwa jest poprawnie wyświetlona w dialogu edycji

**Oczekiwany wynik**: Bardzo długa nazwa talii jest poprawnie obsługiwana.

### 6.2. Test z wieloma taliami

**Cel**: Sprawdzenie, czy wiele talii jest poprawnie obsługiwanych.

**Kroki**:
1. Utwórz wiele talii (np. 20+)
2. Sprawdź, czy:
   - Wszystkie talie są wyświetlone w siatce
   - Siatka jest responsywna (grid dostosowuje się do szerokości ekranu)
   - Wyszukiwanie działa poprawnie

**Oczekiwany wynik**: Wiele talii jest poprawnie obsługiwanych.

### 6.3. Test z taliami bez fiszek

**Cel**: Sprawdzenie, czy talie bez fiszek są poprawnie obsługiwane.

**Kroki**:
1. Utwórz talię bez fiszek
2. Sprawdź, czy:
   - Karta talii wyświetla "0 fiszek"
   - Przycisk "Powtórka" jest disabled
   - Przycisk "Nauka" jest disabled

**Oczekiwany wynik**: Talie bez fiszek są poprawnie obsługiwane.

### 6.4. Test z taliami z dużą liczbą fiszek do powtórki

**Cel**: Sprawdzenie, czy talie z dużą liczbą fiszek do powtórki są poprawnie obsługiwane.

**Kroki**:
1. Utwórz talię z dużą liczbą fiszek do powtórki (np. 100+)
2. Sprawdź, czy:
   - Badge "X do powtórki" jest poprawnie wyświetlony
   - Przycisk "Powtórka" jest aktywny

**Oczekiwany wynik**: Talie z dużą liczbą fiszek do powtórki są poprawnie obsługiwane.

## 7. Podsumowanie testów

### 7.1. Lista testów do wykonania

- [ ] Test strukturalny - weryfikacja struktury komponentów
- [ ] Test strukturalny - weryfikacja importów i zależności
- [ ] Test strukturalny - weryfikacja zgodności z planem
- [ ] Test funkcjonalny - wyświetlanie talii
- [ ] Test funkcjonalny - wyszukiwanie talii
- [ ] Test funkcjonalny - tworzenie nowej talii
- [ ] Test funkcjonalny - edycja talii
- [ ] Test funkcjonalny - usuwanie talii
- [ ] Test funkcjonalny - nawigacja do widoku talii
- [ ] Test funkcjonalny - rozpoczęcie powtórki
- [ ] Test funkcjonalny - rozpoczęcie trybu nauki
- [ ] Test funkcjonalny - przejście do generatora fiszek
- [ ] Test funkcjonalny - empty state
- [ ] Test funkcjonalny - obsługa błędów (autoryzacja)
- [ ] Test funkcjonalny - obsługa błędów (sieć)
- [ ] Test funkcjonalny - obsługa błędów (duplikacja)
- [ ] Test dostępności - nawigacja klawiaturą
- [ ] Test dostępności - screen reader
- [ ] Test dostępności - kontrast kolorów
- [ ] Test wydajności - filtrowanie
- [ ] Test wydajności - ładowanie danych
- [ ] Test integracyjny - integracja z API
- [ ] Test integracyjny - integracja z widokiem talii
- [ ] Test integracyjny - integracja z trybem treningu
- [ ] Test integracyjny - integracja z trybem nauki
- [ ] Test edge case - bardzo długa nazwa talii
- [ ] Test edge case - wiele talii
- [ ] Test edge case - talie bez fiszek
- [ ] Test edge case - talie z dużą liczbą fiszek do powtórki

### 7.2. Kryteria akceptacji

Widok Dashboard jest uznany za zaimplementowany poprawnie, jeśli:
1. Wszystkie testy strukturalne przechodzą
2. Wszystkie testy funkcjonalne przechodzą
3. Wszystkie testy dostępności przechodzą
4. Wszystkie testy wydajności przechodzą
5. Wszystkie testy integracyjne przechodzą
6. Wszystkie testy edge cases przechodzą
7. Implementacja jest zgodna z planem implementacji
8. Implementacja jest zgodna z PRD i user story (US-006)
