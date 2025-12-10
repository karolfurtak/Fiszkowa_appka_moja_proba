# Test Plan - Widok Generator fiszek

## 1. Testy strukturalne

### 1.1. Weryfikacja komponentów
- [x] Strona Astro `src/pages/generate.astro` istnieje i jest poprawnie skonfigurowana
- [x] Komponent React `GeneratorForm` istnieje w `src/components/forms/GeneratorForm.tsx`
- [x] Komponent `CharacterCounter` istnieje w `src/components/forms/CharacterCounter.tsx`
- [x] Wszystkie importy są poprawne (używają względnych ścieżek)
- [x] Komponent używa `supabaseClient` z `src/db/supabase.client.ts`

### 1.2. Weryfikacja struktury formularza
- [x] Pole tekstu źródłowego (Textarea) z licznikiem znaków
- [x] Sekcja zaawansowana (Accordion) z polami:
  - [x] Język (Select)
  - [x] Domena wiedzy (Input)
  - [x] Min długość pytania (Input number)
  - [x] Max długość pytania (Input number)
  - [x] Max długość odpowiedzi (Input number)
  - [x] Preferencje użytkownika (Textarea) z licznikiem znaków
- [x] Przyciski: "Generuj" i "Anuluj"
- [x] Komunikaty błędów (Alert) dla każdego pola

## 2. Testy funkcjonalne

### 2.1. Walidacja po stronie klienta

#### Tekst źródłowy
- [ ] Puste pole → komunikat: "Tekst źródłowy jest wymagany"
- [ ] Tekst < 100 znaków → komunikat: "Tekst musi zawierać co najmniej 100 znaków"
- [ ] Tekst >= 100 znaków → brak błędu
- [ ] Licznik znaków pokazuje pomarańczowy kolor gdy < 100 znaków
- [ ] Licznik znaków pokazuje zielony kolor gdy >= 100 znaków

#### Język
- [ ] "auto" → brak błędu
- [ ] Kod języka 2 litery (pl, en, de, fr, es, it) → brak błędu
- [ ] Nieprawidłowy kod → komunikat: "Nieprawidłowy kod języka"

#### Domena wiedzy
- [ ] Puste pole → brak błędu (opcjonalne)
- [ ] Domena <= 100 znaków → brak błędu
- [ ] Domena > 100 znaków → komunikat: "Domena wiedzy nie może przekraczać 100 znaków"

#### Min długość pytania
- [ ] Puste pole → brak błędu (opcjonalne)
- [ ] Wartość 2-10000 → brak błędu
- [ ] Wartość < 2 lub > 10000 → komunikat: "Minimalna długość pytania musi być między 2 a 10000 znaków"
- [ ] Wartość nie jest liczbą → komunikat błędu

#### Max długość pytania
- [ ] Puste pole → brak błędu (opcjonalne)
- [ ] Wartość 2-10000 → brak błędu
- [ ] Wartość < 2 lub > 10000 → komunikat: "Maksymalna długość pytania musi być między 2 a 10000 znaków"
- [ ] Wartość < min długość → komunikat: "Maksymalna długość musi być większa lub równa minimalnej długości"
- [ ] Wartość nie jest liczbą → komunikat błędu

#### Max długość odpowiedzi
- [ ] Puste pole → brak błędu (opcjonalne)
- [ ] Wartość 1-500 → brak błędu
- [ ] Wartość < 1 lub > 500 → komunikat: "Maksymalna długość odpowiedzi musi być między 1 a 500 znaków"
- [ ] Wartość nie jest liczbą → komunikat błędu

#### Preferencje użytkownika
- [ ] Puste pole → brak błędu (opcjonalne)
- [ ] Preferencje <= 1500 znaków → brak błędu
- [ ] Preferencje > 1500 znaków → komunikat: "Preferencje użytkownika nie mogą przekraczać 1500 znaków"
- [ ] Licznik znaków pokazuje czerwony kolor gdy > 1500 znaków

### 2.2. Interakcje użytkownika

#### Wprowadzanie tekstu źródłowego
- [ ] Wartość pola jest aktualizowana w czasie rzeczywistym
- [ ] Licznik znaków jest aktualizowany w czasie rzeczywistym
- [ ] Błąd jest czyszczony gdy tekst jest poprawiony (jeśli pole było dotknięte)
- [ ] Walidacja wykonuje się przy `onBlur`

#### Rozwinięcie sekcji zaawansowanej
- [ ] Accordion jest domyślnie zwinięty
- [ ] Kliknięcie rozwija/zwija accordion
- [ ] Pola zaawansowane są widoczne po rozwinięciu

#### Wysłanie formularza
- [ ] Kliknięcie "Generuj" → walidacja wszystkich pól
- [ ] Jeśli walidacja nie przechodzi → wyświetlenie błędów, formularz nie jest wysyłany
- [ ] Jeśli walidacja przechodzi → ustawienie `isSubmitting = true`, przycisk disabled
- [ ] Wywołanie API `/api/generations` z poprawnymi danymi
- [ ] Przekierowanie na `/loading/{generation_session_id}` po sukcesie

#### Anulowanie
- [ ] Kliknięcie "Anuluj" → przekierowanie na `/`

### 2.3. Obsługa błędów API

#### Błąd 400 (Invalid request)
- [ ] Komunikat błędu jest wyświetlony pod odpowiednim polem lub jako ogólny błąd
- [ ] Użytkownik może poprawić dane i spróbować ponownie

#### Błąd 401 (Unauthorized)
- [ ] Przekierowanie na `/login?redirect=/generate`
- [ ] Toast notification: "Sesja wygasła. Zaloguj się ponownie."

#### Błąd 500 (Server error)
- [ ] Ogólny komunikat błędu: "Wystąpił błąd serwera podczas generowania fiszek. Spróbuj ponownie."
- [ ] Użytkownik może spróbować ponownie

#### Błąd sieci
- [ ] Toast notification: "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
- [ ] Użytkownik może spróbować ponownie

#### Timeout
- [ ] Toast notification: "Generowanie trwa dłużej niż zwykle. Spróbuj ponownie lub skontaktuj się z supportem."
- [ ] Użytkownik może spróbować ponownie

## 3. Testy dostępności (WCAG AA)

### 3.1. Nawigacja klawiaturą
- [ ] Tab przechodzi przez wszystkie pola formularza w logicznej kolejności
- [ ] Enter w formularzu wysyła formularz
- [ ] Escape zamyka tooltipy (jeśli otwarte)
- [ ] Wszystkie interaktywne elementy są dostępne przez klawiaturę

### 3.2. Screen reader
- [ ] Wszystkie pola mają poprawne `aria-label` lub są powiązane z `<Label>`
- [ ] Komunikaty błędów są czytane przez screen reader (`aria-live="polite"`)
- [ ] Liczniki znaków są czytane przez screen reader (`aria-live="polite"`)
- [ ] Ogólne błędy są czytane natychmiast (`aria-live="assertive"`)
- [ ] Wymagane pola mają `aria-required="true"`

### 3.3. Kontrast i wizualne wskaźniki
- [ ] Czerwone obramowanie pól z błędami jest widoczne
- [ ] Komunikaty błędów mają odpowiedni kontrast
- [ ] Liczniki znaków mają odpowiedni kontrast (pomarańczowy/czerwony dla ostrzeżeń)

## 4. Testy wydajności

### 4.1. Optymalizacja React
- [x] Handlerów używają `React.useCallback`
- [x] Komponent `CharacterCounter` używa `React.memo`
- [x] Funkcje pomocnicze używają `React.useCallback`

### 4.2. Renderowanie
- [ ] Formularz renderuje się szybko (< 100ms)
- [ ] Zmiany wartości pól nie powodują niepotrzebnych re-renderów
- [ ] Accordion rozwija/zwija się płynnie

## 5. Testy integracyjne

### 5.1. Integracja z API
- [ ] Request body jest poprawnie sformatowany zgodnie z `GenerateFlashcardsRequest`
- [ ] Nagłówek `Authorization` zawiera poprawny token
- [ ] Response jest poprawnie przetwarzany
- [ ] `generation_session_id` jest poprawnie przekazywany do przekierowania

### 5.2. Integracja z routingiem
- [ ] Przekierowanie na `/loading/{generation_session_id}` działa poprawnie
- [ ] Przekierowanie na `/login?redirect=/generate` działa poprawnie (gdy brak autoryzacji)
- [ ] Przekierowanie na `/` działa poprawnie (przycisk Anuluj)

## 6. Testy przypadków brzegowych

### 6.1. Sesja wygasła
- [ ] Podczas generowania → przekierowanie na login z odpowiednim redirect URL

### 6.2. Wielokrotne kliknięcia
- [ ] Wielokrotne kliknięcia "Generuj" → tylko jedno żądanie jest wysyłane (przycisk disabled)

### 6.3. Błąd podczas przekierowania
- [ ] Jeśli `generation_session_id` jest nieprawidłowy → widok loading wyświetli komunikat błędu

### 6.4. Brak odpowiedzi z API (timeout)
- [ ] Timeout po 60 sekundach → komunikat błędu, możliwość ponownej próby

## 7. Instrukcje testowania manualnego

### Scenariusz 1: Pomyślne generowanie
1. Zaloguj się do aplikacji
2. Przejdź na `/generate`
3. Wprowadź tekst źródłowy >= 100 znaków
4. Kliknij "Generuj"
5. **Oczekiwany rezultat**: Przekierowanie na `/loading/{generation_session_id}`

### Scenariusz 2: Walidacja tekstu źródłowego
1. Przejdź na `/generate`
2. Wprowadź tekst < 100 znaków
3. Opuść pole (Tab lub kliknij gdzie indziej)
4. **Oczekiwany rezultat**: Komunikat błędu pod polem, pomarańczowy licznik znaków
5. Spróbuj wysłać formularz
6. **Oczekiwany rezultat**: Formularz nie jest wysyłany, błąd pozostaje widoczny

### Scenariusz 3: Walidacja zakresów długości
1. Przejdź na `/generate`
2. Wprowadź tekst >= 100 znaków
3. Rozwiń sekcję zaawansowaną
4. Ustaw min długość pytania = 100
5. Ustaw max długość pytania = 50
6. Opuść pole max długości
7. **Oczekiwany rezultat**: Komunikat błędu: "Maksymalna długość musi być większa lub równa minimalnej długości"

### Scenariusz 4: Błąd autoryzacji
1. Wyloguj się z aplikacji
2. Przejdź na `/generate`
3. **Oczekiwany rezultat**: Przekierowanie na `/login?redirect=/generate`

### Scenariusz 5: Nawigacja klawiaturą
1. Przejdź na `/generate`
2. Użyj Tab do nawigacji przez pola
3. **Oczekiwany rezultat**: Focus przechodzi przez wszystkie pola w logicznej kolejności
4. Naciśnij Enter w formularzu
5. **Oczekiwany rezultat**: Formularz jest wysyłany (jeśli walidacja przechodzi)

## 8. Checklist finalizacji

- [x] Wszystkie komponenty są zaimplementowane
- [x] Wszystkie funkcjonalności są zaimplementowane
- [x] Optymalizacja wydajności jest zaimplementowana
- [x] Dostępność (WCAG AA) jest zaimplementowana
- [x] Obsługa błędów jest zaimplementowana
- [x] Integracja z API jest zaimplementowana
- [ ] Testy manualne zostały wykonane
- [ ] Wszystkie scenariusze testowe zostały zweryfikowane

