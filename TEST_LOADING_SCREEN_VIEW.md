# Plan testów widoku Ekran ładowania (LoadingScreen)

## 1. Testy strukturalne

### 1.1. Weryfikacja struktury komponentów

**Cel**: Sprawdzenie, czy wszystkie komponenty są poprawnie zaimplementowane zgodnie z planem.

**Kroki**:
1. Otwórz `src/pages/loading/[session_id].astro`
2. Sprawdź, czy strona Astro:
   - Ma `export const prerender = false;`
   - Importuje `LoadingScreen` z `../../components/loading/LoadingScreen`
   - Importuje `Toaster` z `../../components/ui/sonner`
   - Waliduje `session_id` (sprawdza czy nie jest pusty)
   - Sprawdza autoryzację użytkownika
   - Przekazuje `sessionId` do komponentu `LoadingScreen`
   - Renderuje `Toaster` dla toast notifications

3. Otwórz `src/components/loading/LoadingScreen.tsx`
4. Sprawdź, czy komponent:
   - Ma interfejs `LoadingScreenProps` z `sessionId: string`
   - Ma interfejs `LoadingScreenState` z wszystkimi wymaganymi polami
   - Importuje wszystkie wymagane komponenty Shadcn/ui
   - Importuje hook `useGenerationPolling`
   - Ma wszystkie wymagane sekcje (ProgressSection, SpinnerSection, ActionSection, ErrorSection)

5. Otwórz `src/hooks/useGenerationPolling.ts`
6. Sprawdź, czy hook:
   - Ma interfejs `UseGenerationPollingResult` z wszystkimi wymaganymi polami
   - Przyjmuje parametry: `sessionId`, `onComplete`, `onError`
   - Zwraca wszystkie wymagane wartości
   - Ma poprawne stałe (POLLING_INTERVAL, TIMEOUT_DURATION, ESTIMATED_DURATION)

**Oczekiwany wynik**: Wszystkie komponenty są poprawnie zaimplementowane zgodnie z planem.

### 1.2. Weryfikacja importów i zależności

**Cel**: Sprawdzenie, czy wszystkie importy są poprawne i nie ma brakujących zależności.

**Kroki**:
1. Sprawdź importy w `LoadingScreen.tsx`:
   - `import * as React from 'react'` ✓
   - `import { Progress } from '../ui/progress'` ✓
   - `import { Button } from '../ui/button'` ✓
   - `import { Alert, AlertDescription } from '../ui/alert'` ✓
   - `import { Loader2, AlertCircle } from 'lucide-react'` ✓
   - `import { toast } from 'sonner'` ✓
   - `import { useGenerationPolling } from '@/hooks/useGenerationPolling'` ✓

2. Sprawdź importy w `useGenerationPolling.ts`:
   - `import { useState, useEffect, useRef, useCallback } from 'react'` ✓
   - `import { supabaseClient } from '../db/supabase.client'` ✓
   - `import type { FlashcardProposalResponse } from '../types'` ✓

3. Sprawdź importy w `loading/[session_id].astro`:
   - `import LoadingScreen from '../../components/loading/LoadingScreen'` ✓
   - `import { Toaster } from '../../components/ui/sonner'` ✓

**Oczekiwany wynik**: Wszystkie importy są poprawne, brak błędów kompilacji.

### 1.3. Weryfikacja zgodności z planem implementacji

**Cel**: Sprawdzenie, czy implementacja jest zgodna z planem implementacji.

**Kroki**:
1. Porównaj strukturę komponentów z planem (sekcja 3):
   - `loading/[session_id].astro` ✓
   - `LoadingScreen` (React Component) ✓
   - `ProgressSection` z `Progress`, `StatusMessage`, `EstimatedTime` ✓
   - `SpinnerSection` z `Loader2` (spinner) ✓
   - `ActionSection` z `Button` "Anuluj" ✓
   - `ErrorSection` z `Alert` (conditional) ✓
   - `Toaster` dla toast notifications ✓

2. Porównaj funkcjonalność z planem:
   - Polling co 2-3 sekundy ✓
   - Timeout 60 sekund ✓
   - Automatyczne przekierowanie na `/verify/[session_id]` po zakończeniu ✓
   - Przycisk "Anuluj" przekierowuje na `/generate` ✓
   - Obsługa błędów z odpowiednimi komunikatami ✓

**Oczekiwany wynik**: Implementacja jest zgodna z planem implementacji.

## 2. Testy funkcjonalne

### 2.1. Test podstawowego przepływu generowania

**Cel**: Sprawdzenie, czy podstawowy przepływ generowania działa poprawnie.

**Warunki wstępne**:
- Użytkownik jest zalogowany
- Użytkownik ma poprawny `session_id` z widoku Generatora

**Kroki**:
1. Przejdź na stronę `/loading/[session_id]` z poprawnym `session_id`
2. Sprawdź, czy:
   - Wyświetla się pasek postępu (Progress)
   - Wyświetla się komunikat statusu ("Inicjowanie generowania...")
   - Wyświetla się animacja ładowania (Loader2 spinner)
   - Wyświetla się przycisk "Anuluj"
   - Postęp zwiększa się stopniowo (0-100%)
   - Komunikat statusu zmienia się w zależności od postępu

3. Poczekaj na zakończenie generowania (lub symuluj zakończenie)
4. Sprawdź, czy:
   - Postęp osiąga 100%
   - Komunikat statusu zmienia się na "Generowanie zakończone!"
   - Następuje automatyczne przekierowanie na `/verify/[session_id]` po ~1 sekundzie

**Oczekiwany wynik**: Podstawowy przepływ generowania działa poprawnie, użytkownik jest przekierowany na widok weryfikacji.

### 2.2. Test anulowania generowania

**Cel**: Sprawdzenie, czy anulowanie generowania działa poprawnie.

**Warunki wstępne**:
- Użytkownik jest na stronie `/loading/[session_id]`
- Generowanie jest w toku

**Kroki**:
1. Kliknij przycisk "Anuluj"
2. Sprawdź, czy:
   - Wyświetla się toast notification: "Generowanie zostało anulowane"
   - Następuje przekierowanie na `/generate`

**Oczekiwany wynik**: Anulowanie działa poprawnie, użytkownik jest przekierowany na generator.

### 2.3. Test obsługi błędów - timeout

**Cel**: Sprawdzenie, czy timeout (60 sekund) jest poprawnie obsługiwany.

**Warunki wstępne**:
- Użytkownik jest na stronie `/loading/[session_id]`
- Generowanie trwa dłużej niż 60 sekund (lub symuluj timeout)

**Kroki**:
1. Poczekaj 60 sekund (lub symuluj timeout)
2. Sprawdź, czy:
   - Wyświetla się alert z komunikatem: "Generowanie trwa dłużej niż zwykle. Proszę czekać..."
   - Alert ma żółty kolor (warning style)
   - Nie wyświetla się przycisk "Wróć do generatora" (użytkownik może kontynuować oczekiwanie)
   - Polling jest zatrzymany

**Oczekiwany wynik**: Timeout jest poprawnie obsługiwany, alert jest wyświetlany z odpowiednim stylem.

### 2.4. Test obsługi błędów - błąd autoryzacji

**Cel**: Sprawdzenie, czy błąd autoryzacji jest poprawnie obsługiwany.

**Warunki wstępne**:
- Użytkownik ma wygasłą sesję (lub symuluj błąd autoryzacji)

**Kroki**:
1. Przejdź na stronę `/loading/[session_id]` z wygasłą sesją
2. Sprawdź, czy:
   - Wyświetla się alert z komunikatem: "Sesja wygasła. Zaloguj się ponownie."
   - Alert ma czerwony kolor (destructive style)
   - Następuje przekierowanie na `/login?redirect=/loading/[session_id]` po ~2 sekundach

**Oczekiwany wynik**: Błąd autoryzacji jest poprawnie obsługiwany, użytkownik jest przekierowany na login.

### 2.5. Test obsługi błędów - błąd sieci

**Cel**: Sprawdzenie, czy błąd sieci jest poprawnie obsługiwany.

**Warunki wstępne**:
- Użytkownik jest na stronie `/loading/[session_id]`
- Brak połączenia z internetem (lub symuluj błąd sieci)

**Kroki**:
1. Odłącz połączenie z internetem (lub symuluj błąd sieci)
2. Sprawdź, czy:
   - Wyświetla się alert z komunikatem: "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
   - Alert ma czerwony kolor (destructive style)
   - Wyświetla się przycisk "Spróbuj ponownie"
   - Wyświetla się przycisk "Wróć do generatora"

3. Kliknij przycisk "Spróbuj ponownie"
4. Sprawdź, czy:
   - Strona jest przeładowana
   - Polling jest restartowany

**Oczekiwany wynik**: Błąd sieci jest poprawnie obsługiwany, użytkownik może spróbować ponownie.

### 2.6. Test obsługi błędów - błąd serwera

**Cel**: Sprawdzenie, czy błąd serwera jest poprawnie obsługiwany.

**Warunki wstępne**:
- Użytkownik jest na stronie `/loading/[session_id]`
- Serwer zwraca błąd 500 (lub symuluj błąd serwera)

**Kroki**:
1. Symuluj błąd serwera (500 Internal Server Error)
2. Sprawdź, czy:
   - Wyświetla się alert z komunikatem: "Wystąpił błąd serwera podczas generowania. Spróbuj ponownie."
   - Alert ma czerwony kolor (destructive style)
   - Wyświetla się przycisk "Spróbuj ponownie"
   - Wyświetla się przycisk "Wróć do generatora"

**Oczekiwany wynik**: Błąd serwera jest poprawnie obsługiwany, użytkownik może spróbować ponownie lub wrócić do generatora.

### 2.7. Test walidacji session_id

**Cel**: Sprawdzenie, czy walidacja `session_id` działa poprawnie.

**Warunki wstępne**:
- Użytkownik jest zalogowany

**Kroki**:
1. Przejdź na stronę `/loading/` (bez `session_id`)
2. Sprawdź, czy:
   - Następuje przekierowanie na `/generate?error=invalid_session`

3. Przejdź na stronę `/loading/` (z pustym `session_id`)
4. Sprawdź, czy:
   - Następuje przekierowanie na `/generate?error=invalid_session`

**Oczekiwany wynik**: Walidacja `session_id` działa poprawnie, nieprawidłowe wartości powodują przekierowanie na generator.

### 2.8. Test odświeżenia strony

**Cel**: Sprawdzenie, czy odświeżenie strony działa poprawnie.

**Warunki wstępne**:
- Użytkownik jest na stronie `/loading/[session_id]`
- Generowanie jest w toku

**Kroki**:
1. Odśwież stronę (F5 lub Ctrl+R)
2. Sprawdź, czy:
   - Polling jest automatycznie restartowany
   - Stan jest resetowany (postęp zaczyna się od 0%)
   - Jeśli propozycje już istnieją, następuje przekierowanie na `/verify/[session_id]`

**Oczekiwany wynik**: Odświeżenie strony działa poprawnie, polling jest restartowany.

## 3. Testy dostępności (WCAG AA)

### 3.1. Test nawigacji klawiaturą

**Cel**: Sprawdzenie, czy wszystkie elementy są dostępne przez klawiaturę.

**Kroki**:
1. Przejdź na stronę `/loading/[session_id]`
2. Użyj klawisza Tab do nawigacji
3. Sprawdź, czy:
   - Focus jest ustawiony na przycisku "Anuluj" po załadowaniu strony
   - Wszystkie przyciski są dostępne przez Tab
   - Enter aktywuje przyciski
   - Escape zamyka modale (jeśli istnieją)

**Oczekiwany wynik**: Wszystkie elementy są dostępne przez klawiaturę.

### 3.2. Test screen readera

**Cel**: Sprawdzenie, czy komunikaty są czytane przez screen reader.

**Kroki**:
1. Włącz screen reader (NVDA, JAWS, VoiceOver)
2. Przejdź na stronę `/loading/[session_id]`
3. Sprawdź, czy:
   - Komunikat statusu jest czytany przez screen reader (`aria-live="polite"`)
   - Pasek postępu jest czytany z wartością procentową (`aria-valuenow`, `aria-label`)
   - Błędy są czytane przez screen reader (`aria-live="assertive"`)
   - Wszystkie przyciski mają odpowiednie `aria-label`

**Oczekiwany wynik**: Wszystkie komunikaty są czytane przez screen reader.

### 3.3. Test kontrastu kolorów

**Cel**: Sprawdzenie, czy kontrast kolorów spełnia wymagania WCAG AA (4.5:1).

**Kroki**:
1. Przejdź na stronę `/loading/[session_id]`
2. Sprawdź kontrast kolorów:
   - Tekst komunikatu statusu vs tło
   - Tekst błędów vs tło alertu
   - Tekst przycisków vs tło przycisków
   - Tekst szacowanego czasu vs tło

**Oczekiwany wynik**: Kontrast kolorów spełnia wymagania WCAG AA (4.5:1).

## 4. Testy wydajności

### 4.1. Test polling - częstotliwość

**Cel**: Sprawdzenie, czy polling działa z odpowiednią częstotliwością.

**Kroki**:
1. Przejdź na stronę `/loading/[session_id]`
2. Otwórz DevTools → Network
3. Sprawdź, czy:
   - Zapytania do API są wysyłane co ~2.5 sekundy (POLLING_INTERVAL)
   - Nie ma nadmiernej liczby zapytań

**Oczekiwany wynik**: Polling działa z odpowiednią częstotliwością, nie ma nadmiernej liczby zapytań.

### 4.2. Test timeout - czas trwania

**Cel**: Sprawdzenie, czy timeout działa po 60 sekundach.

**Kroki**:
1. Przejdź na stronę `/loading/[session_id]` z `session_id`, który nie zwróci propozycji
2. Poczekaj 60 sekund
3. Sprawdź, czy:
   - Timeout jest wywoływany po dokładnie 60 sekundach
   - Polling jest zatrzymany po timeout

**Oczekiwany wynik**: Timeout działa po 60 sekundach, polling jest zatrzymany.

## 5. Testy integracyjne

### 5.1. Test integracji z GeneratorForm

**Cel**: Sprawdzenie, czy integracja z widokiem Generatora działa poprawnie.

**Kroki**:
1. Przejdź na stronę `/generate`
2. Wypełnij formularz i kliknij "Generuj"
3. Sprawdź, czy:
   - Następuje przekierowanie na `/loading/[session_id]` z poprawnym `session_id`
   - `session_id` jest przekazany z odpowiedzi API `/api/generations`

**Oczekiwany wynik**: Integracja z GeneratorForm działa poprawnie, przekierowanie następuje z poprawnym `session_id`.

### 5.2. Test integracji z VerificationView

**Cel**: Sprawdzenie, czy integracja z widokiem Weryfikacji działa poprawnie.

**Kroki**:
1. Przejdź na stronę `/loading/[session_id]`
2. Poczekaj na zakończenie generowania
3. Sprawdź, czy:
   - Następuje przekierowanie na `/verify/[session_id]` z poprawnym `session_id`
   - Propozycje są dostępne na widoku weryfikacji

**Oczekiwany wynik**: Integracja z VerificationView działa poprawnie, przekierowanie następuje z poprawnym `session_id`.

## 6. Testy edge cases

### 6.1. Test z bardzo długim session_id

**Cel**: Sprawdzenie, czy bardzo długi `session_id` jest poprawnie obsługiwany.

**Kroki**:
1. Przejdź na stronę `/loading/[session_id]` z bardzo długim `session_id` (np. 1000 znaków)
2. Sprawdź, czy:
   - Strona działa poprawnie
   - Nie ma błędów w konsoli

**Oczekiwany wynik**: Bardzo długi `session_id` jest poprawnie obsługiwany.

### 6.2. Test z nieprawidłowym formatem session_id

**Cel**: Sprawdzenie, czy nieprawidłowy format `session_id` jest poprawnie obsługiwany.

**Kroki**:
1. Przejdź na stronę `/loading/[session_id]` z nieprawidłowym formatem `session_id` (np. zawierającym znaki specjalne)
2. Sprawdź, czy:
   - Strona działa poprawnie
   - Polling zwraca odpowiedni błąd (404 Not Found)
   - Błąd jest poprawnie wyświetlony

**Oczekiwany wynik**: Nieprawidłowy format `session_id` jest poprawnie obsługiwany.

### 6.3. Test z wieloma równoczesnymi sesjami

**Cel**: Sprawdzenie, czy wiele równoczesnych sesji jest poprawnie obsługiwanych.

**Kroki**:
1. Otwórz kilka kart z różnymi `session_id`
2. Sprawdź, czy:
   - Każda karta działa niezależnie
   - Polling działa poprawnie dla każdej sesji
   - Nie ma konfliktów między sesjami

**Oczekiwany wynik**: Wiele równoczesnych sesji jest poprawnie obsługiwanych.

## 7. Podsumowanie testów

### 7.1. Lista testów do wykonania

- [ ] Test strukturalny - weryfikacja struktury komponentów
- [ ] Test strukturalny - weryfikacja importów i zależności
- [ ] Test strukturalny - weryfikacja zgodności z planem
- [ ] Test funkcjonalny - podstawowy przepływ generowania
- [ ] Test funkcjonalny - anulowanie generowania
- [ ] Test funkcjonalny - obsługa błędów (timeout)
- [ ] Test funkcjonalny - obsługa błędów (autoryzacja)
- [ ] Test funkcjonalny - obsługa błędów (sieć)
- [ ] Test funkcjonalny - obsługa błędów (serwer)
- [ ] Test funkcjonalny - walidacja session_id
- [ ] Test funkcjonalny - odświeżenie strony
- [ ] Test dostępności - nawigacja klawiaturą
- [ ] Test dostępności - screen reader
- [ ] Test dostępności - kontrast kolorów
- [ ] Test wydajności - częstotliwość polling
- [ ] Test wydajności - timeout
- [ ] Test integracyjny - integracja z GeneratorForm
- [ ] Test integracyjny - integracja z VerificationView
- [ ] Test edge case - bardzo długi session_id
- [ ] Test edge case - nieprawidłowy format session_id
- [ ] Test edge case - wiele równoczesnych sesji

### 7.2. Kryteria akceptacji

Widok LoadingScreen jest uznany za zaimplementowany poprawnie, jeśli:
1. Wszystkie testy strukturalne przechodzą
2. Wszystkie testy funkcjonalne przechodzą
3. Wszystkie testy dostępności przechodzą
4. Wszystkie testy wydajności przechodzą
5. Wszystkie testy integracyjne przechodzą
6. Wszystkie testy edge cases przechodzą
7. Implementacja jest zgodna z planem implementacji
8. Implementacja jest zgodna z PRD (F-002) i user story (US-008)

