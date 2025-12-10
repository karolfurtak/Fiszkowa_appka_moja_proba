# Plan testów widoku Ekran ładowania (`/loading/[session_id]`)

## 1. Testy strukturalne (Code Review)

### 1.1. Struktura plików
- [x] Plik `src/pages/loading/[session_id].astro` istnieje
- [x] Plik `src/components/loading/LoadingScreen.tsx` istnieje
- [x] Plik `src/hooks/useGenerationPolling.ts` istnieje
- [x] Wszystkie komponenty UI są dostępne (Progress, Button, Alert)

### 1.2. Routing i autoryzacja
- [x] Strona Astro obsługuje dynamiczny routing `[session_id]`
- [x] Walidacja `session_id` (przekierowanie na `/generate` jeśli nieprawidłowy)
- [x] Sprawdzenie autoryzacji przed renderowaniem
- [x] Przekierowanie na `/login?redirect=/loading/[session_id]` jeśli nieautoryzowany

### 1.3. Komponenty React
- [x] `LoadingScreen` jest komponentem funkcjonalnym z TypeScript
- [x] Wszystkie interfejsy TypeScript są zdefiniowane
- [x] Hook `useGenerationPolling` jest poprawnie eksportowany
- [x] Importy są poprawne (użycie aliasu `@/hooks/useGenerationPolling`)

### 1.4. Integracja API
- [x] Hook używa Supabase REST API do polling
- [x] Endpoint: `GET /rest/v1/flashcard_proposals?generation_session_id=eq.{session_id}`
- [x] Obsługa autoryzacji (JWT token)
- [x] Timeout dla pojedynczego requestu (10 sekund)
- [x] Timeout dla całego procesu (60 sekund)

### 1.5. Zarządzanie stanem
- [x] Użycie `useState` dla stanu komponentu
- [x] Użycie `useRef` dla referencji do interwałów
- [x] Użycie `useCallback` dla funkcji pomocniczych
- [x] Użycie `useMemo` dla obliczonych wartości
- [x] Cleanup interwałów w `useEffect`

### 1.6. UI i stylowanie
- [x] Użycie komponentów Shadcn/ui (Progress, Button, Alert)
- [x] Responsywny layout (mobile-first)
- [x] Animacje przejść dla paska postępu
- [x] Semantyczny HTML (`<main>`, `<section>`)

### 1.7. Dostępność (WCAG AA)
- [x] Atrybuty ARIA dla paska postępu (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`)
- [x] `aria-live="polite"` dla komunikatu statusu
- [x] `aria-live="assertive"` dla błędów
- [x] `role="status"` dla komunikatów statusu
- [x] `role="alert"` dla błędów
- [x] `aria-label` dla przycisków i spinnera
- [x] `sr-only` dla ukrytego nagłówka
- [x] Focus management (focus na przycisku "Anuluj")

### 1.8. Obsługa błędów
- [x] Mapowanie błędów API na komunikaty po polsku
- [x] Obsługa błędów autoryzacji (przekierowanie na login)
- [x] Obsługa błędów sieci (offline detection)
- [x] Obsługa timeout (60 sekund)
- [x] Przycisk "Spróbuj ponownie"

## 2. Testy funkcjonalne (Manualne)

### 2.1. Przepływ podstawowy
1. **Wejście na widok z prawidłowym session_id**
   - [ ] Strona się ładuje bez błędów
   - [ ] Wyświetla się pasek postępu (0%)
   - [ ] Wyświetla się komunikat "Inicjowanie generowania..."
   - [ ] Wyświetla się spinner
   - [ ] Wyświetla się przycisk "Anuluj"

2. **Polling statusu generowania**
   - [ ] Polling uruchamia się automatycznie po załadowaniu
   - [ ] Postęp aktualizuje się co sekundę (0-100%)
   - [ ] Komunikaty statusu zmieniają się w zależności od postępu:
     - [ ] 0-30%: "Analizowanie tekstu..."
     - [ ] 30-70%: "Generowanie fiszek..."
     - [ ] 70-90%: "Kończenie generowania..."
     - [ ] 90-100%: "Prawie gotowe..."
   - [ ] Szacowany czas pozostały jest wyświetlany

3. **Zakończenie generowania**
   - [ ] Gdy propozycje zostaną znalezione, postęp osiąga 100%
   - [ ] Komunikat zmienia się na "Generowanie zakończone!"
   - [ ] Po 1 sekundzie następuje przekierowanie na `/verify/[session_id]`

### 2.2. Anulowanie generowania
1. **Kliknięcie przycisku "Anuluj"**
   - [ ] Przycisk jest dostępny przez klawiaturę (Tab, Enter)
   - [ ] Po kliknięciu następuje przekierowanie na `/generate`
   - [ ] Polling jest zatrzymywany (cleanup)

### 2.3. Obsługa błędów
1. **Błąd autoryzacji (401)**
   - [ ] Wyświetla się komunikat błędu "Sesja wygasła. Zaloguj się ponownie."
   - [ ] Po 2 sekundach następuje przekierowanie na `/login?redirect=/loading/[session_id]`

2. **Błąd sieci (offline)**
   - [ ] Wyświetla się komunikat "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
   - [ ] Wyświetla się przycisk "Spróbuj ponownie"

3. **Timeout (60 sekund)**
   - [ ] Po 60 sekundach bez znalezienia propozycji wyświetla się komunikat "Generowanie trwa dłużej niż zwykle. Proszę czekać..."
   - [ ] Wyświetla się przycisk "Spróbuj ponownie"

4. **Przycisk "Spróbuj ponownie"**
   - [ ] Po kliknięciu strona się odświeża
   - [ ] Polling restartuje się automatycznie

### 2.4. Przypadki brzegowe
1. **Odświeżenie strony podczas generowania**
   - [ ] Po odświeżeniu polling restartuje się automatycznie
   - [ ] Jeśli propozycje już istnieją, następuje przekierowanie na `/verify/[session_id]`

2. **Nieprawidłowy session_id**
   - [ ] Przekierowanie na `/generate?error=invalid_session`

3. **Brak autoryzacji**
   - [ ] Przekierowanie na `/login?redirect=/loading/[session_id]`

### 2.5. Dostępność (Screen Reader)
1. **Nawigacja klawiaturą**
   - [ ] Tab przechodzi przez wszystkie interaktywne elementy
   - [ ] Enter aktywuje przyciski
   - [ ] Focus jest widoczny na wszystkich elementach

2. **Screen Reader**
   - [ ] Komunikaty statusu są czytane przez screen reader (`aria-live="polite"`)
   - [ ] Błędy są czytane natychmiast (`aria-live="assertive"`)
   - [ ] Postęp jest czytany jako "Postęp generowania: X%"

### 2.6. Responsywność
1. **Desktop (1920x1080)**
   - [ ] Layout jest wyśrodkowany
   - [ ] Przyciski są w jednym rzędzie (`flex-row`)

2. **Tablet (768x1024)**
   - [ ] Layout jest responsywny
   - [ ] Przyciski mogą być w kolumnie (`flex-col`)

3. **Mobile (375x667)**
   - [ ] Layout jest responsywny
   - [ ] Przyciski są w kolumnie (`flex-col`)
   - [ ] Tekst jest czytelny

## 3. Testy integracyjne

### 3.1. Integracja z GeneratorForm
- [ ] Po kliknięciu "Generuj" w GeneratorForm następuje przekierowanie na `/loading/[session_id]`
- [ ] `session_id` jest przekazywany poprawnie

### 3.2. Integracja z VerificationView
- [ ] Po zakończeniu generowania następuje przekierowanie na `/verify/[session_id]`
- [ ] Propozycje są dostępne na widoku weryfikacji

## 4. Testy wydajności

### 4.1. Polling
- [ ] Polling nie powoduje wycieków pamięci (cleanup działa poprawnie)
- [ ] Częstotliwość polling (2.5 sekundy) jest odpowiednia
- [ ] Timeout (60 sekund) jest odpowiedni

### 4.2. Renderowanie
- [ ] Komponent nie powoduje niepotrzebnych re-renderów
- [ ] `useMemo` i `useCallback` są używane poprawnie

## 5. Wyniki testów

### Testy strukturalne: ✅ Wszystkie przeszły
### Testy funkcjonalne: ⏳ Do wykonania manualnie
### Testy integracyjne: ⏳ Do wykonania manualnie
### Testy wydajności: ⏳ Do wykonania manualnie

## 6. Uwagi

- Widok wymaga połączenia z Supabase API
- Testy funkcjonalne wymagają prawidłowego `session_id` z sesji generowania
- Testy timeout wymagają czekania 60 sekund (można zmniejszyć timeout dla testów)

