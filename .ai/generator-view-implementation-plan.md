# Plan implementacji widoku Generator fiszek

## 1. Przegląd

Widok Generator fiszek (`/generate`) umożliwia użytkownikom wprowadzenie tekstu źródłowego i konfigurację parametrów generowania fiszek przez AI. Widok składa się z formularza zawierającego duże pole tekstowe na tekst źródłowy oraz sekcję zaawansowaną (collapsible, domyślnie zwinięta) z dodatkowymi parametrami konfiguracyjnymi. Po wypełnieniu formularza i kliknięciu "Generuj", użytkownik jest przekierowywany na ekran ładowania, a następnie na widok weryfikacji propozycji fiszek.

Widok jest zaimplementowany jako strona Astro z komponentem React `GeneratorForm` do obsługi interakcji użytkownika. Wszystkie komponenty UI pochodzą z biblioteki Shadcn/ui, zapewniając spójność z resztą aplikacji. Widok implementuje wymagania z PRD (F-002, F-003, F-004) i user stories (US-008).

## 2. Routing widoku

**Ścieżka**: `/generate`

**Plik**: `src/pages/generate.astro`

**Middleware**: Widok wymaga autoryzacji. Jeśli użytkownik nie jest zalogowany, powinien być przekierowany na `/login?redirect=/generate`.

**Query Parameters**: Brak (widok generatora nie obsługuje parametrów URL).

**Przykład URL**: `/generate`

## 3. Struktura komponentów

```
generate.astro (Astro Page)
└── GeneratorForm (React Component)
    ├── Form (HTML form element)
    │   ├── Section - Podstawowa konfiguracja
    │   │   ├── Label (Shadcn/ui) - "Tekst źródłowy"
    │   │   ├── Textarea (Shadcn/ui) - Pole tekstu źródłowego
    │   │   │   └── CharacterCounter (custom component) - Licznik znaków
    │   │   └── Alert (Shadcn/ui) - Komunikat błędu walidacji (conditional)
    │   ├── Accordion (Shadcn/ui) - Sekcja zaawansowana (collapsible)
    │   │   ├── AccordionItem
    │   │   │   ├── AccordionTrigger - "Ustawienia zaawansowane"
    │   │   │   └── AccordionContent
    │   │   │       ├── Label + Select (Shadcn/ui) - Wybór języka
    │   │   │       ├── Label + Input (Shadcn/ui) - Domena wiedzy (opcjonalne)
    │   │   │       ├── Label + Input (Shadcn/ui) - Min długość pytania
    │   │   │       ├── Label + Input (Shadcn/ui) - Max długość pytania
    │   │   │       ├── Label + Input (Shadcn/ui) - Max długość odpowiedzi
    │   │   │       ├── Label + Textarea (Shadcn/ui) - Preferencje użytkownika (opcjonalne)
    │   │   │       │   └── CharacterCounter (custom component) - Licznik znaków
    │   │   │       └── Alert (Shadcn/ui) - Komunikaty błędów walidacji (conditional)
    │   ├── Button (Shadcn/ui) - "Generuj" (submit)
    │   └── Button (Shadcn/ui) - "Anuluj" (opcjonalnie, powrót do dashboard)
    └── Toast (Shadcn/ui) - Komunikaty błędów sieci (conditional)
```

## 4. Szczegóły komponentów

### GeneratorForm (React Component)

**Lokalizacja**: `src/components/forms/GeneratorForm.tsx`

**Opis komponentu**: Główny komponent formularza generowania fiszek. Zarządza stanem formularza (tekst źródłowy, parametry zaawansowane), walidacją po stronie klienta (minimalna długość tekstu, zakresy długości pytań/odpowiedzi), integracją z API endpoint `/api/generations` oraz obsługą błędów. Komponent jest klient-side (React), co umożliwia interaktywność bez przeładowania strony. Po pomyślnym wysłaniu formularza użytkownik jest przekierowywany na ekran ładowania, a następnie na widok weryfikacji propozycji.

**Główne elementy HTML i komponenty dzieci**:
- `<form>` - główny element formularza z `onSubmit` handler
- `<section>` - sekcja podstawowej konfiguracji
- `Textarea` (Shadcn/ui) - pole tekstu źródłowego z licznikiem znaków
- `Accordion` (Shadcn/ui) - sekcja zaawansowana (zwijana/rozwijana)
- `Select` (Shadcn/ui) - dropdown wyboru języka (domyślnie "auto")
- `Input` (Shadcn/ui) - pola numeryczne dla długości pytań/odpowiedzi
- `Input` (Shadcn/ui) - pole tekstowe dla domeny wiedzy (opcjonalne)
- `Textarea` (Shadcn/ui) - pole preferencji użytkownika (opcjonalne, max 1500 znaków)
- `Label` (Shadcn/ui) - etykiety dla każdego pola
- `Alert` (Shadcn/ui) - wyświetlanie błędów walidacji inline pod polami
- `Button` (Shadcn/ui) - przycisk submit "Generuj" z stanem loading (spinner podczas generowania)
- `Button` (Shadcn/ui) - przycisk "Anuluj" (opcjonalnie, powrót do dashboard)
- `Toast` (Shadcn/ui) - toast notifications dla błędów sieci
- `CharacterCounter` (custom component) - licznik znaków dla pól tekstowych

**Obsługiwane zdarzenia**:
- `onChange` - aktualizacja wartości pól formularza w stanie
- `onBlur` - walidacja pola po opuszczeniu (touched state)
- `onSubmit` - walidacja i wysłanie formularza do API endpoint `/api/generations`
- `onFocus` - czyszczenie błędów dla danego pola (opcjonalnie)
- `onAccordionToggle` - rozwinięcie/zwinięcie sekcji zaawansowanej

**Warunki walidacji** (szczegółowe, zgodnie z API):

**Tekst źródłowy (`text` lub `source_text`)**:
- Wymagane (nie może być puste)
- Minimalna długość: 100 znaków (zgodnie z wymaganiami API)
- Komunikaty błędów:
  - Puste pole: "Tekst źródłowy jest wymagany"
  - Za krótki (< 100 znaków): "Tekst musi zawierać co najmniej 100 znaków"

**Język (`language`)**:
- Opcjonalne (domyślnie "auto")
- Dozwolone wartości: "auto" lub kod języka (np. "pl", "en", "de", "fr", "es", "it")
- Komunikaty błędów:
  - Nieprawidłowy kod języka: "Nieprawidłowy kod języka"

**Domena wiedzy (`domain`)**:
- Opcjonalne (może być puste)
- Maksymalna długość: 100 znaków (zgodnie z API)
- Komunikaty błędów:
  - Za długa (> 100 znaków): "Domena wiedzy nie może przekraczać 100 znaków"

**Min długość pytania (`question_min_length`)**:
- Opcjonalne (domyślnie nie ustawione, API używa wartości domyślnej)
- Jeśli ustawione: musi być liczbą całkowitą z zakresu 2-10000 (zgodnie z ograniczeniami bazy danych)
- Komunikaty błędów:
  - Nieprawidłowa wartość (nie liczba): "Minimalna długość pytania musi być liczbą"
  - Poza zakresem (< 2 lub > 10000): "Minimalna długość pytania musi być między 2 a 10000 znaków"

**Max długość pytania (`question_max_length`)**:
- Opcjonalne (domyślnie nie ustawione, API używa wartości domyślnej)
- Jeśli ustawione: musi być liczbą całkowitą z zakresu 2-10000 (zgodnie z ograniczeniami bazy danych)
- Jeśli ustawione zarówno `question_min_length` jak i `question_max_length`: `question_max_length` musi być >= `question_min_length`
- Komunikaty błędów:
  - Nieprawidłowa wartość (nie liczba): "Maksymalna długość pytania musi być liczbą"
  - Poza zakresem (< 2 lub > 10000): "Maksymalna długość pytania musi być między 2 a 10000 znaków"
  - Mniejsza niż min: "Maksymalna długość musi być większa lub równa minimalnej długości"

**Max długość odpowiedzi (`answer_max_length`)**:
- Opcjonalne (domyślnie nie ustawione, API używa wartości domyślnej)
- Jeśli ustawione: musi być liczbą całkowitą z zakresu 1-500 (zgodnie z ograniczeniami bazy danych)
- Komunikaty błędów:
  - Nieprawidłowa wartość (nie liczba): "Maksymalna długość odpowiedzi musi być liczbą"
  - Poza zakresem (< 1 lub > 500): "Maksymalna długość odpowiedzi musi być między 1 a 500 znaków"

**Preferencje użytkownika (`user_preferences`)**:
- Opcjonalne (może być puste)
- Maksymalna długość: 1500 znaków (zgodnie z wymaganiami API)
- Komunikaty błędów:
  - Za długie (> 1500 znaków): "Preferencje użytkownika nie mogą przekraczać 1500 znaków"

**Walidacja po stronie serwera (API)**:
- API endpoint `/api/generations` dodatkowo weryfikuje wszystkie parametry
- Błędy z API są mapowane na komunikaty w języku polskim:
  - `400` - Invalid request (text too short, missing text) → odpowiedni komunikat w zależności od błędu
  - `401` - Unauthorized → przekierowanie na `/login?redirect=/generate`
  - `500` - AI service error → "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie."

**Typy (DTO i ViewModel)**:

**Props komponentu**:
```typescript
interface GeneratorFormProps {
  // Brak props - komponent jest samowystarczalny
}
```

**Stan komponentu (ViewModel)**:
```typescript
interface GeneratorFormState {
  // Podstawowe pola
  sourceText: string;
  
  // Sekcja zaawansowana
  language: string; // "auto" lub kod języka
  domain: string; // Opcjonalne
  questionMinLength: number | null; // Opcjonalne
  questionMaxLength: number | null; // Opcjonalne
  answerMaxLength: number | null; // Opcjonalne
  userPreferences: string; // Opcjonalne
  
  // Stan formularza
  errors: {
    sourceText?: string;
    language?: string;
    domain?: string;
    questionMinLength?: string;
    questionMaxLength?: string;
    answerMaxLength?: string;
    userPreferences?: string;
    general?: string; // Dla błędów API
  };
  
  touched: {
    sourceText: boolean;
    language: boolean;
    domain: boolean;
    questionMinLength: boolean;
    questionMaxLength: boolean;
    answerMaxLength: boolean;
    userPreferences: boolean;
  };
  
  isSubmitting: boolean;
  isAdvancedOpen: boolean; // Stan accordion (zwinięty/rozwinięty)
}
```

**Typy Request/Response (z `src/types.ts`)**:
- Request: `GenerateFlashcardsRequest` - `{ text?: string, source_text?: string, domain?: string, language?: string, question_min_length?: number, question_max_length?: number, answer_max_length?: number, user_preferences?: string }`
- Response: `GenerateFlashcardsResponse` - `{ generation_session_id: string, proposals: Array<{ id: number, question: string, correct_answer: string, domain: string | null, status: ProposalStatus }>, detected_domain: string, total_generated: number }`

**Props**: Brak props - komponent jest samowystarczalny i nie przyjmuje żadnych props od rodzica.

### CharacterCounter (Custom Component)

**Lokalizacja**: `src/components/forms/CharacterCounter.tsx`

**Opis komponentu**: Komponent pomocniczy wyświetlający licznik znaków dla pól tekstowych. Pomaga użytkownikowi kontrolować długość wprowadzanego tekstu.

**Główne elementy**: 
- `<span>` - wyświetla liczbę znaków i maksymalną długość (jeśli ustawiona)
- Styl: szary tekst, mniejszy rozmiar czcionki, wyrównany do prawej

**Props**:
```typescript
interface CharacterCounterProps {
  currentLength: number;
  maxLength?: number; // Opcjonalne (dla preferencji użytkownika: 1500)
  minLength?: number; // Opcjonalne (dla tekstu źródłowego: 100)
}
```

**Logika wyświetlania**:
- Jeśli `maxLength` jest ustawione: "X / Y znaków" (np. "250 / 1500 znaków")
- Jeśli tylko `minLength` jest ustawione: "X znaków (min: Y)" (np. "150 znaków (min: 100)")
- Jeśli przekroczono `maxLength`: tekst na czerwono
- Jeśli nie osiągnięto `minLength`: tekst na pomarańczowo

## 5. Typy

### Typy Request/Response (z `src/types.ts`)

**GenerateFlashcardsRequest**:
```typescript
interface GenerateFlashcardsRequest {
  text?: string;                    // Tekst źródłowy (alternatywa dla source_text)
  source_text?: string;             // Tekst źródłowy (alternatywa dla text, zgodność z kursem)
  domain?: string;                  // Opcjonalna domena wiedzy (max 100 znaków)
  language?: string;                // Opcjonalny język ("auto" lub kod języka)
  question_min_length?: number;     // Opcjonalna min długość pytania (2-10000)
  question_max_length?: number;     // Opcjonalna max długość pytania (2-10000)
  answer_max_length?: number;      // Opcjonalna max długość odpowiedzi (1-500)
  user_preferences?: string;         // Opcjonalne preferencje użytkownika (max 1500 znaków)
}
```

**GenerateFlashcardsResponse**:
```typescript
interface GenerateFlashcardsResponse {
  generation_session_id: string;    // Unikalny identyfikator sesji generowania
  proposals: Array<{                // Lista wygenerowanych propozycji fiszek
    id: number;                     // ID propozycji w bazie danych
    question: string;               // Pytanie (2-10000 znaków)
    correct_answer: string;          // Poprawna odpowiedź (max 500 znaków)
    domain: string | null;          // Wykryta domena wiedzy
    status: ProposalStatus;         // Status propozycji ("pending")
  }>;
  detected_domain: string;          // Wykryta przez AI domena wiedzy
  total_generated: number;          // Całkowita liczba wygenerowanych propozycji
}
```

### Typy stanu komponentu (ViewModel)

**GeneratorFormState**:
```typescript
interface GeneratorFormState {
  // Wartości pól formularza
  sourceText: string;                // Tekst źródłowy (wymagany, min 100 znaków)
  language: string;                 // Język (domyślnie "auto")
  domain: string;                   // Domena wiedzy (opcjonalne, max 100 znaków)
  questionMinLength: number | null; // Min długość pytania (opcjonalne, 2-10000)
  questionMaxLength: number | null; // Max długość pytania (opcjonalne, 2-10000)
  answerMaxLength: number | null;  // Max długość odpowiedzi (opcjonalne, 1-500)
  userPreferences: string;           // Preferencje użytkownika (opcjonalne, max 1500 znaków)
  
  // Błędy walidacji (klucz = nazwa pola)
  errors: {
    sourceText?: string;             // Błąd walidacji tekstu źródłowego
    language?: string;               // Błąd walidacji języka
    domain?: string;                 // Błąd walidacji domeny
    questionMinLength?: string;      // Błąd walidacji min długości pytania
    questionMaxLength?: string;      // Błąd walidacji max długości pytania
    answerMaxLength?: string;        // Błąd walidacji max długości odpowiedzi
    userPreferences?: string;         // Błąd walidacji preferencji
    general?: string;                 // Ogólny błąd (np. z API)
  };
  
  // Flagi "dotkniętych" pól (dla walidacji onBlur)
  touched: {
    sourceText: boolean;
    language: boolean;
    domain: boolean;
    questionMinLength: boolean;
    questionMaxLength: boolean;
    answerMaxLength: boolean;
    userPreferences: boolean;
  };
  
  // Stan ładowania podczas generowania
  isSubmitting: boolean;
  
  // Stan accordion (zwinięty/rozwinięty)
  isAdvancedOpen: boolean;
}
```

### Typy błędów API

**ApiErrorResponse** (z `src/types.ts`):
```typescript
interface ApiErrorResponse {
  error: {
    code: string;                   // Kod błędu (np. "VALIDATION_ERROR", "UNAUTHORIZED")
    message: string;                // Komunikat błędu
    details?: Record<string, unknown>; // Dodatkowe szczegóły błędu
  };
}
```

**Mapowanie błędów na komunikaty**:
- `VALIDATION_ERROR` → odpowiedni komunikat w zależności od pola (z `details`)
- `UNAUTHORIZED` → przekierowanie na `/login?redirect=/generate`
- `INTERNAL_ERROR` lub `500` → "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie."
- `RATE_LIMIT_EXCEEDED` → "Zbyt wiele żądań. Spróbuj ponownie za chwilę."
- Inne błędy → "Wystąpił nieoczekiwany błąd. Spróbuj ponownie."

## 6. Zarządzanie stanem

Widok generatora używa lokalnego stanu React (`useState`) do zarządzania wartościami formularza, błędami walidacji i stanem ładowania. Nie wymaga custom hooka ani globalnego stanu, ponieważ:

1. **Stan formularza**: Zarządzany lokalnie przez `useState` w komponencie `GeneratorForm`
2. **Walidacja**: Wykonywana synchronicznie po stronie klienta przed wysłaniem do API
3. **Przekierowanie**: Po pomyślnym wysłaniu formularza użytkownik jest przekierowywany na ekran ładowania (`/loading?session_id={generation_session_id}`) lub bezpośrednio na widok weryfikacji (`/verify/{generation_session_id}`)

**Struktura stanu**:
```typescript
const [formState, setFormState] = useState<GeneratorFormState>({
  sourceText: '',
  language: 'auto',
  domain: '',
  questionMinLength: null,
  questionMaxLength: null,
  answerMaxLength: null,
  userPreferences: '',
  errors: {},
  touched: {
    sourceText: false,
    language: false,
    domain: false,
    questionMinLength: false,
    questionMaxLength: false,
    answerMaxLength: false,
    userPreferences: false,
  },
  isSubmitting: false,
  isAdvancedOpen: false,
});
```

**Funkcje pomocnicze do zarządzania stanem**:
- `setSourceText(value: string)` - aktualizacja tekstu źródłowego i czyszczenie błędu
- `setLanguage(value: string)` - aktualizacja języka
- `setDomain(value: string)` - aktualizacja domeny i walidacja długości
- `setQuestionMinLength(value: number | null)` - aktualizacja min długości pytania i walidacja zakresu
- `setQuestionMaxLength(value: number | null)` - aktualizacja max długości pytania i walidacja zakresu oraz zgodności z min
- `setAnswerMaxLength(value: number | null)` - aktualizacja max długości odpowiedzi i walidacja zakresu
- `setUserPreferences(value: string)` - aktualizacja preferencji i walidacja długości
- `validateField(fieldName: string, value: string | number | null)` - walidacja pojedynczego pola
- `validateForm()` - walidacja całego formularza przed wysłaniem
- `setFieldError(fieldName: string, error: string | null)` - ustawienie błędu dla pola
- `setFieldTouched(fieldName: string)` - oznaczenie pola jako "dotknięte"
- `toggleAdvanced()` - przełączanie stanu accordion (zwinięty/rozwinięty)

## 7. Integracja API

Widok generatora integruje się z **API endpoint `/api/generations`** (proxy do Supabase Edge Function `/functions/v1/generate-flashcards`).

**Endpoint**: `POST /api/generations`

**Klient**: Użycie `fetch` API z nagłówkami autoryzacji:
```typescript
const response = await fetch('/api/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`, // Token z Supabase Auth
  },
  body: JSON.stringify(requestBody),
});
```

**Typy Request**:
- `text` lub `source_text`: string (wymagany, min 100 znaków)
- `domain`: string (opcjonalne, max 100 znaków)
- `language`: string (opcjonalne, "auto" lub kod języka)
- `question_min_length`: number (opcjonalne, 2-10000)
- `question_max_length`: number (opcjonalne, 2-10000)
- `answer_max_length`: number (opcjonalne, 1-500)
- `user_preferences`: string (opcjonalne, max 1500 znaków)

**Typy Response**:

**Sukces (200)**:
```typescript
{
  generation_session_id: string;    // Unikalny identyfikator sesji
  proposals: Array<{                // Lista propozycji fiszek
    id: number;
    question: string;
    correct_answer: string;
    domain: string | null;
    status: "pending";
  }>;
  detected_domain: string;          // Wykryta domena
  total_generated: number;         // Liczba wygenerowanych propozycji
}
```

**Błąd (400, 401, 500)**:
```typescript
{
  error: {
    code: string;                   // Kod błędu
    message: string;                // Komunikat błędu
    details?: Record<string, unknown>; // Szczegóły błędu
  };
}
```

**Obsługa odpowiedzi**:
1. **Sukces**: 
   - Przekierowanie na widok weryfikacji: `/verify/{generation_session_id}`
   - Alternatywnie: przekierowanie na ekran ładowania `/loading?session_id={generation_session_id}` (jeśli ekran ładowania jest implementowany)
   - Użycie `window.location.href` lub routera Astro dla przekierowania

2. **Błąd**:
   - Mapowanie kodu błędu na komunikat w języku polskim
   - Wyświetlenie komunikatu błędu inline pod odpowiednim polem lub jako ogólny błąd
   - Ustawienie `isSubmitting = false` aby umożliwić ponowną próbę

**Uwaga**: Endpoint `/api/generations` jest proxy do Supabase Edge Function `/functions/v1/generate-flashcards`. Edge Function automatycznie zapisuje wszystkie wygenerowane propozycje do tabeli `flashcard_proposals` z statusem `'pending'` i przypisuje im `generation_session_id`. Propozycje nie są jeszcze przypisane do żadnej talii - to nastąpi dopiero po akceptacji w widoku weryfikacji.

## 8. Interakcje użytkownika

### 8.1. Wprowadzanie tekstu źródłowego

**Akcja**: Użytkownik wprowadza tekst w pole tekstu źródłowego.

**Reakcja**:
- Wartość pola jest aktualizowana w stanie (`setSourceText`)
- Licznik znaków jest aktualizowany w czasie rzeczywistym
- Jeśli pole było dotknięte i miał błąd, błąd jest czyszczony
- Jeśli tekst ma mniej niż 100 znaków, licznik znaków pokazuje pomarańczowy kolor (ostrzeżenie)
- Jeśli tekst ma 100+ znaków, licznik znaków pokazuje zielony kolor (gotowe do generowania)

### 8.2. Rozwinięcie sekcji zaawansowanej

**Akcja**: Użytkownik klika na accordion "Ustawienia zaawansowane".

**Reakcja**:
- Accordion rozwija się (`isAdvancedOpen = true`)
- Wyświetlane są dodatkowe pola: język, domena, długości pytań/odpowiedzi, preferencje
- Użytkownik może skonfigurować parametry generowania

### 8.3. Konfiguracja parametrów zaawansowanych

**Akcja**: Użytkownik wprowadza wartości w pola sekcji zaawansowanej.

**Reakcja**:
- Wartości są aktualizowane w stanie
- Walidacja jest wykonywana przy `onBlur` (opuszczenie pola)
- Jeśli wartość jest nieprawidłowa (np. poza zakresem, nieprawidłowy format), wyświetlany jest komunikat błędu inline pod polem
- Jeśli ustawione są zarówno `questionMinLength` jak i `questionMaxLength`, sprawdzana jest zgodność (max >= min)

### 8.4. Walidacja

**Akcja**: Użytkownik opuszcza pole (`onBlur`).

**Reakcja**:
- Ustawienie `touched.{fieldName} = true`
- Walidacja pola zgodnie z regułami walidacji
- Jeśli błąd → wyświetlenie komunikatu błędu inline pod polem
- Jeśli poprawny → usunięcie komunikatu błędu (jeśli był)

### 8.5. Wysłanie formularza

**Akcja**: Użytkownik klika przycisk "Generuj" lub naciska Enter w formularzu.

**Reakcja**:
1. `preventDefault()` na zdarzeniu submit
2. Walidacja wszystkich pól (tekst źródłowy min 100 znaków, zakresy długości, zgodność min/max)
3. Jeśli walidacja nie przechodzi:
   - Oznaczenie wszystkich pól jako "dotknięte" (`touched = true` dla wszystkich)
   - Wyświetlenie błędów inline pod odpowiednimi polami
   - Przycisk pozostaje aktywny
   - Formularz nie jest wysyłany
4. Jeśli walidacja przechodzi:
   - Ustawienie `isSubmitting = true`
   - Przycisk staje się nieaktywny (disabled) z spinnerem
   - Przygotowanie request body zgodnie z `GenerateFlashcardsRequest`
   - Wywołanie `POST /api/generations` z danymi formularza
   - Oczekiwanie na odpowiedź API

### 8.6. Sukces generowania

**Akcja**: API zwraca sukces (propozycje fiszek wygenerowane, `generation_session_id` zwrócony).

**Reakcja**:
1. Ustawienie `isSubmitting = false`
2. Przekierowanie użytkownika:
   - Na widok weryfikacji: `/verify/{generation_session_id}`
   - Alternatywnie: na ekran ładowania `/loading?session_id={generation_session_id}` (jeśli ekran ładowania jest implementowany)
3. Użycie `window.location.href` lub routera Astro dla przekierowania

### 8.7. Błąd generowania

**Akcja**: API zwraca błąd (tekst za krótki, błąd serwera, brak autoryzacji, itp.).

**Reakcja**:
1. Ustawienie `isSubmitting = false`
2. Mapowanie kodu błędu na komunikat w języku polskim:
   - `400` (Invalid request) → odpowiedni komunikat w zależności od szczegółów błędu (wyświetlony pod odpowiednim polem lub jako ogólny błąd)
   - `401` (Unauthorized) → przekierowanie na `/login?redirect=/generate`
   - `500` (AI service error) → ogólny komunikat błędu: "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie."
3. Wyświetlenie komunikatu błędu inline pod odpowiednim polem lub jako ogólny błąd (Alert)
4. Przycisk staje się ponownie aktywny (użytkownik może poprawić dane i spróbować ponownie)

### 8.8. Błąd sieci

**Akcja**: Brak połączenia z internetem lub timeout żądania.

**Reakcja**:
1. Ustawienie `isSubmitting = false`
2. Wyświetlenie toast notification: "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
3. Przycisk staje się ponownie aktywny

### 8.9. Anulowanie

**Akcja**: Użytkownik klika przycisk "Anuluj" (jeśli dostępny).

**Reakcja**:
- Przekierowanie na dashboard (`/`)
- Alternatywnie: zamknięcie modala (jeśli generator jest w modalu)

## 9. Warunki i walidacja

### 9.1. Warunki wymagane przez API

**Tekst źródłowy (`text` lub `source_text`)**:
- **Wymagane**: Tak
- **Minimalna długość**: 100 znaków
- **Weryfikacja w komponencie**: Długość tekstu jest weryfikowana po stronie klienta przed wysłaniem (`onBlur` i przed submit)

**Język (`language`)**:
- **Wymagane**: Nie (domyślnie "auto")
- **Dozwolone wartości**: "auto" lub kod języka (np. "pl", "en", "de", "fr", "es", "it")
- **Weryfikacja w komponencie**: Format języka jest weryfikowany po stronie klienta (jeśli użytkownik wprowadza własny kod)

**Domena wiedzy (`domain`)**:
- **Wymagane**: Nie
- **Maksymalna długość**: 100 znaków
- **Weryfikacja w komponencie**: Długość domeny jest weryfikowana po stronie klienta (`onBlur`)

**Min długość pytania (`question_min_length`)**:
- **Wymagane**: Nie
- **Zakres**: 2-10000 (zgodnie z ograniczeniami bazy danych)
- **Weryfikacja w komponencie**: Zakres jest weryfikowany po stronie klienta (`onBlur`)

**Max długość pytania (`question_max_length`)**:
- **Wymagane**: Nie
- **Zakres**: 2-10000 (zgodnie z ograniczeniami bazy danych)
- **Zgodność z min**: Jeśli ustawione zarówno `question_min_length` jak i `question_max_length`, `question_max_length` musi być >= `question_min_length`
- **Weryfikacja w komponencie**: Zakres i zgodność z min są weryfikowane po stronie klienta (`onBlur`)

**Max długość odpowiedzi (`answer_max_length`)**:
- **Wymagane**: Nie
- **Zakres**: 1-500 (zgodnie z ograniczeniami bazy danych)
- **Weryfikacja w komponencie**: Zakres jest weryfikowany po stronie klienta (`onBlur`)

**Preferencje użytkownika (`user_preferences`)**:
- **Wymagane**: Nie
- **Maksymalna długość**: 1500 znaków
- **Weryfikacja w komponencie**: Długość preferencji jest weryfikowana po stronie klienta (`onBlur`)

### 9.2. Wpływ warunków na stan interfejsu

**Pole tekstu źródłowego**:
- Jeśli tekst ma < 100 znaków → wyświetlenie komunikatu błędu pod polem po `onBlur` lub przed submit, pole ma czerwone obramowanie (Shadcn/ui `error` variant), licznik znaków pokazuje pomarańczowy kolor
- Jeśli tekst ma 100+ znaków → brak komunikatu błędu, pole ma normalne obramowanie, licznik znaków pokazuje zielony kolor

**Pola numeryczne (długości pytań/odpowiedzi)**:
- Jeśli wartość jest poza zakresem → wyświetlenie komunikatu błędu pod polem, pole ma czerwone obramowanie
- Jeśli wartość jest poprawna → brak komunikatu błędu, pole ma normalne obramowanie
- Jeśli `question_max_length` < `question_min_length` → wyświetlenie komunikatu błędu pod polem `question_max_length`

**Pole domeny wiedzy**:
- Jeśli domena ma > 100 znaków → wyświetlenie komunikatu błędu pod polem, pole ma czerwone obramowanie
- Jeśli domena jest poprawna → brak komunikatu błędu, pole ma normalne obramowanie

**Pole preferencji użytkownika**:
- Jeśli preferencje mają > 1500 znaków → wyświetlenie komunikatu błędu pod polem, pole ma czerwone obramowanie, licznik znaków pokazuje czerwony kolor
- Jeśli preferencje są poprawne → brak komunikatu błędu, pole ma normalne obramowanie, licznik znaków pokazuje normalny kolor

**Przycisk "Generuj"**:
- Jeśli formularz ma błędy walidacji → przycisk pozostaje aktywny, ale formularz nie jest wysyłany
- Jeśli formularz jest w trakcie wysyłania (`isSubmitting = true`) → przycisk jest nieaktywny (disabled) z spinnerem
- Jeśli formularz jest poprawny i nie jest w trakcie wysyłania → przycisk jest aktywny

**Accordion "Ustawienia zaawansowane"**:
- Domyślnie zwinięty (`isAdvancedOpen = false`)
- Po kliknięciu rozwija się/zwija się (`isAdvancedOpen` przełączane)

### 9.3. Walidacja po stronie klienta vs serwera

**Po stronie klienta** (przed wysłaniem):
- Długość tekstu źródłowego (min 100 znaków)
- Zakresy długości pytań/odpowiedzi (2-10000 dla pytań, 1-500 dla odpowiedzi)
- Zgodność min/max długości pytań (max >= min)
- Długość domeny wiedzy (max 100 znaków)
- Długość preferencji użytkownika (max 1500 znaków)
- Format języka (jeśli użytkownik wprowadza własny kod)

**Po stronie serwera** (API):
- Wszystkie powyższe walidacje są ponownie weryfikowane przez Edge Function
- Dodatkowo: sprawdzenie autoryzacji użytkownika, walidacja struktury żądania
- Wszystkie błędy z API są mapowane na komunikaty w języku polskim i wyświetlane w interfejsie

## 10. Obsługa błędów

### 10.1. Błędy walidacji po stronie klienta

**Tekst źródłowy - za krótki (< 100 znaków)**:
- **Komunikat**: "Tekst musi zawierać co najmniej 100 znaków"
- **Lokalizacja**: Inline pod polem tekstu źródłowego
- **Styl**: Czerwone obramowanie pola, komunikat w `<Alert>` lub `<span>` z klasą błędu

**Długość pytania - poza zakresem**:
- **Komunikat**: "Minimalna długość pytania musi być między 2 a 10000 znaków" lub "Maksymalna długość pytania musi być między 2 a 10000 znaków"
- **Lokalizacja**: Inline pod odpowiednim polem
- **Styl**: Czerwone obramowanie pola, komunikat w `<Alert>` lub `<span>` z klasą błędu

**Długość pytania - niezgodność min/max**:
- **Komunikat**: "Maksymalna długość musi być większa lub równa minimalnej długości"
- **Lokalizacja**: Inline pod polem `question_max_length`
- **Styl**: Czerwone obramowanie pola, komunikat w `<Alert>` lub `<span>` z klasą błędu

**Długość odpowiedzi - poza zakresem**:
- **Komunikat**: "Maksymalna długość odpowiedzi musi być między 1 a 500 znaków"
- **Lokalizacja**: Inline pod polem `answer_max_length`
- **Styl**: Czerwone obramowanie pola, komunikat w `<Alert>` lub `<span>` z klasą błędu

**Domena wiedzy - za długa (> 100 znaków)**:
- **Komunikat**: "Domena wiedzy nie może przekraczać 100 znaków"
- **Lokalizacja**: Inline pod polem domeny
- **Styl**: Czerwone obramowanie pola, komunikat w `<Alert>` lub `<span>` z klasą błędu

**Preferencje użytkownika - za długie (> 1500 znaków)**:
- **Komunikat**: "Preferencje użytkownika nie mogą przekraczać 1500 znaków"
- **Lokalizacja**: Inline pod polem preferencji
- **Styl**: Czerwone obramowanie pola, komunikat w `<Alert>` lub `<span>` z klasą błędu

### 10.2. Błędy API

**400 - Invalid request (tekst za krótki, brak tekstu)**:
- **Komunikat**: "Tekst źródłowy jest zbyt krótki. Musi zawierać co najmniej 100 znaków." (pod polem tekstu źródłowego)
- **Lokalizacja**: Inline pod polem tekstu źródłowego
- **Styl**: Czerwone obramowanie pola, komunikat w `<Alert>` lub `<span>` z klasą błędu
- **Akcja użytkownika**: Może poprawić tekst i spróbować ponownie

**401 - Unauthorized**:
- **Komunikat**: Przekierowanie na `/login?redirect=/generate`
- **Lokalizacja**: Przekierowanie (nie wyświetlany w interfejsie)
- **Styl**: N/A
- **Akcja użytkownika**: Użytkownik jest przekierowywany na stronę logowania

**500 - AI service error**:
- **Komunikat**: "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie."
- **Lokalizacja**: Ogólny komunikat błędu na górze formularza (`<Alert>`)
- **Styl**: Alert z typem `destructive` (Shadcn/ui)
- **Akcja użytkownika**: Może spróbować ponownie po sprawdzeniu połączenia

**Inne błędy API**:
- **Komunikat**: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie."
- **Lokalizacja**: Ogólny komunikat błędu na górze formularza (`<Alert>`)
- **Styl**: Alert z typem `destructive` (Shadcn/ui)

### 10.3. Błędy sieci

**Brak połączenia z internetem**:
- **Komunikat**: "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
- **Lokalizacja**: Toast notification (Shadcn/ui `Toast`)
- **Styl**: Toast z typem `destructive`
- **Akcja użytkownika**: Może spróbować ponownie po przywróceniu połączenia

**Timeout żądania**:
- **Komunikat**: "Żądanie przekroczyło limit czasu. Spróbuj ponownie."
- **Lokalizacja**: Toast notification
- **Styl**: Toast z typem `destructive`
- **Akcja użytkownika**: Może spróbować ponownie

### 10.4. Przypadki brzegowe

**Użytkownik nie zalogowany próbuje wejść na `/generate`**:
- **Obsługa**: Middleware w Astro sprawdza sesję przed renderowaniem strony
- **Akcja**: Przekierowanie na `/login?redirect=/generate`
- **Komunikat**: Brak (ciche przekierowanie)

**Sesja wygasła podczas generowania**:
- **Obsługa**: API zwraca `401 Unauthorized`
- **Akcja**: Przekierowanie na `/login?redirect=/generate`
- **Komunikat**: Toast notification: "Sesja wygasła. Zaloguj się ponownie."

**Wielokrotne kliknięcia przycisku "Generuj"**:
- **Obsługa**: Przycisk jest nieaktywny (`disabled`) podczas `isSubmitting = true`
- **Akcja**: Zapobiega wielokrotnym żądaniom do API

**Błąd podczas przekierowania na widok weryfikacji**:
- **Obsługa**: Jeśli `generation_session_id` nie istnieje lub jest nieprawidłowy, widok weryfikacji wyświetli komunikat błędu
- **Akcja**: Użytkownik może wrócić do generatora i spróbować ponownie

**Brak odpowiedzi z API (timeout)**:
- **Obsługa**: Timeout po określonym czasie (np. 60 sekund)
- **Akcja**: Wyświetlenie komunikatu błędu, użytkownik może spróbować ponownie
- **Komunikat**: "Generowanie trwa dłużej niż zwykle. Spróbuj ponownie lub skontaktuj się z supportem."

## 11. Kroki implementacji

### Krok 1: Utworzenie strony Astro

1. Utwórz plik `src/pages/generate.astro`
2. Dodaj podstawową strukturę strony Astro z:
   - Importem komponentu `GeneratorForm`
   - Layoutem strony (wspólny layout z topbarem)
   - Meta tagami (title: "Generator fiszek - 10xCards", description)
3. Dodaj middleware sprawdzający autoryzację (przekierowanie na `/login?redirect=/generate` jeśli użytkownik nie jest zalogowany)

### Krok 2: Utworzenie komponentu GeneratorForm

1. Utwórz plik `src/components/forms/GeneratorForm.tsx`
2. Zainstaluj zależności React (jeśli nie są już zainstalowane)
3. Zaimportuj komponenty Shadcn/ui: `Textarea`, `Input`, `Select`, `Label`, `Button`, `Alert`, `Toast`, `Accordion`
4. Zaimportuj klienta Supabase: `import { supabase } from '@/lib/supabase'` (do pobrania tokena autoryzacji)
5. Utwórz interfejs `GeneratorFormState` dla stanu komponentu
6. Utwórz komponent funkcjonalny `GeneratorForm` z podstawową strukturą JSX

### Krok 3: Implementacja stanu i logiki formularza

1. Dodaj `useState` dla stanu formularza (`sourceText`, `language`, `domain`, `questionMinLength`, `questionMaxLength`, `answerMaxLength`, `userPreferences`)
2. Dodaj `useState` dla błędów walidacji (`errors`)
3. Dodaj `useState` dla "dotkniętych" pól (`touched`)
4. Dodaj `useState` dla stanu ładowania (`isSubmitting`)
5. Dodaj `useState` dla stanu accordion (`isAdvancedOpen`)
6. Utwórz funkcje pomocnicze:
   - `validateSourceText(text: string): string | null`
   - `validateLanguage(language: string): string | null`
   - `validateDomain(domain: string): string | null`
   - `validateQuestionMinLength(value: number | null): string | null`
   - `validateQuestionMaxLength(value: number | null, minLength: number | null): string | null`
   - `validateAnswerMaxLength(value: number | null): string | null`
   - `validateUserPreferences(preferences: string): string | null`
   - `validateForm(): boolean`

### Krok 4: Implementacja obsługi zdarzeń

1. Dodaj `onChange` handlery dla każdego pola:
   - `handleSourceTextChange(e: React.ChangeEvent<HTMLTextAreaElement>)`
   - `handleLanguageChange(value: string)`
   - `handleDomainChange(e: React.ChangeEvent<HTMLInputElement>)`
   - `handleQuestionMinLengthChange(e: React.ChangeEvent<HTMLInputElement>)`
   - `handleQuestionMaxLengthChange(e: React.ChangeEvent<HTMLInputElement>)`
   - `handleAnswerMaxLengthChange(e: React.ChangeEvent<HTMLInputElement>)`
   - `handleUserPreferencesChange(e: React.ChangeEvent<HTMLTextAreaElement>)`
2. Dodaj `onBlur` handlery dla każdego pola (walidacja po opuszczeniu):
   - `handleSourceTextBlur()`
   - `handleLanguageBlur()`
   - `handleDomainBlur()`
   - `handleQuestionMinLengthBlur()`
   - `handleQuestionMaxLengthBlur()`
   - `handleAnswerMaxLengthBlur()`
   - `handleUserPreferencesBlur()`
3. Dodaj `onSubmit` handler dla formularza:
   - `handleSubmit(e: React.FormEvent)`
4. Dodaj handler dla accordion:
   - `handleToggleAdvanced()`

### Krok 5: Implementacja integracji z API

1. W `handleSubmit`:
   - Wywołaj `validateForm()` przed wysłaniem
   - Jeśli walidacja przechodzi, ustaw `isSubmitting = true`
   - Pobierz token autoryzacji z Supabase: `const { data: { session } } = await supabase.auth.getSession()`
   - Przygotuj request body zgodnie z `GenerateFlashcardsRequest` (mapowanie `sourceText` na `text` lub `source_text`)
   - Wywołaj `POST /api/generations` z danymi formularza i nagłówkiem autoryzacji
   - Obsłuż odpowiedź:
     - Sukces: przekierowanie na `/verify/{generation_session_id}`
     - Błąd: mapowanie błędu na komunikat i wyświetlenie w interfejsie
   - Ustaw `isSubmitting = false` w `finally`

### Krok 6: Implementacja UI komponentów

1. Dodaj `<form>` z `onSubmit={handleSubmit}`
2. Dodaj sekcję podstawową:
   - `<Label>` dla tekstu źródłowego
   - `<Textarea>` z wartością `formState.sourceText`, `onChange={handleSourceTextChange}`, `onBlur={handleSourceTextBlur}`
   - `<CharacterCounter>` z `currentLength={formState.sourceText.length}`, `minLength={100}`
   - `<Alert>` lub `<span>` dla komunikatu błędu (jeśli `errors.sourceText`)
3. Dodaj accordion sekcji zaawansowanej:
   - `<Accordion>` z `value={formState.isAdvancedOpen ? 'advanced' : ''}`, `onValueChange={handleToggleAdvanced}`
   - `<AccordionItem>` z `value="advanced"`
   - `<AccordionTrigger>` z tekstem "Ustawienia zaawansowane"
   - `<AccordionContent>` z polami:
     - `<Label>` + `<Select>` dla języka (wartości: "auto", "pl", "en", "de", "fr", "es", "it")
     - `<Label>` + `<Input>` dla domeny wiedzy
     - `<Label>` + `<Input>` dla min długości pytania (typ `number`)
     - `<Label>` + `<Input>` dla max długości pytania (typ `number`)
     - `<Label>` + `<Input>` dla max długości odpowiedzi (typ `number`)
     - `<Label>` + `<Textarea>` dla preferencji użytkownika
     - `<CharacterCounter>` dla preferencji (max 1500 znaków)
     - `<Alert>` lub `<span>` dla komunikatów błędów (jeśli `errors.{fieldName}`)
4. Dodaj przycisk submit:
   - `<Button>` z typem `submit`, `disabled={isSubmitting}`
   - Tekst: "Generuj"
   - Spinner podczas `isSubmitting` (opcjonalnie)
5. Opcjonalnie: dodaj przycisk "Anuluj":
   - `<Button>` z typem `button`, `onClick={() => window.location.href = '/'}`
   - Tekst: "Anuluj"

### Krok 7: Utworzenie komponentu CharacterCounter

1. Utwórz plik `src/components/forms/CharacterCounter.tsx`
2. Utwórz komponent funkcjonalny `CharacterCounter` z props `CharacterCounterProps`
3. Implementuj logikę wyświetlania:
   - Jeśli `maxLength` jest ustawione: "X / Y znaków"
   - Jeśli tylko `minLength` jest ustawione: "X znaków (min: Y)"
   - Jeśli przekroczono `maxLength`: tekst na czerwono
   - Jeśli nie osiągnięto `minLength`: tekst na pomarańczowo
4. Dodaj odpowiednie style (Tailwind CSS)

### Krok 8: Implementacja obsługi błędów

1. Utwórz funkcję `mapApiError(error: ApiErrorResponse): string` do mapowania błędów API na komunikaty w języku polskim
2. W `handleSubmit`, po otrzymaniu błędu z API:
   - Wywołaj `mapApiError` aby uzyskać komunikat
   - Ustaw odpowiedni błąd w stanie (`setFieldError` lub `setGeneralError`)
3. Dodaj `<Alert>` dla ogólnych błędów (jeśli `errors.general`)
4. Dodaj toast notification dla błędów sieci (użyj Shadcn/ui `Toast`)

### Krok 9: Implementacja dostępności (WCAG AA)

1. Dodaj właściwe `<label>` dla każdego pola (Shadcn/ui `Label` automatycznie to obsługuje)
2. Dodaj `aria-describedby` dla komunikatów błędów (powiązanie z polami)
3. Dodaj `aria-live="polite"` dla dynamicznych komunikatów błędów
4. Upewnij się, że wszystkie interaktywne elementy są dostępne przez klawiaturę (Tab, Enter)
5. Dodaj właściwe `aria-labels` dla przycisków (jeśli tekst nie jest wystarczająco opisowy)
6. Dodaj `aria-expanded` dla accordion (Shadcn/ui automatycznie to obsługuje)

### Krok 10: Stylowanie i UX

1. Użyj komponentów Shadcn/ui dla spójności z resztą aplikacji
2. Dodaj odpowiednie marginesy i odstępy między polami
3. Dodaj wizualne wskaźniki błędów (czerwone obramowanie pól z błędami)
4. Dodaj wskaźniki postępu (licznik znaków z kolorami)
5. Upewnij się, że formularz jest responsywny (desktop-first, ale działa na mobile)
6. Dodaj tooltips wyjaśniające parametry (opcjonalnie, użyj Shadcn/ui `Tooltip`)

### Krok 11: Testowanie

1. **Testy manualne**:
   - Generowanie z poprawnymi danymi → sukces, przekierowanie na weryfikację
   - Generowanie z za krótkim tekstem (< 100 znaków) → komunikat błędu
   - Generowanie z nieprawidłowymi zakresami długości → komunikaty błędów
   - Generowanie z niezgodnością min/max długości pytań → komunikat błędu
   - Generowanie bez autoryzacji → przekierowanie na logowanie
   - Błąd sieci → toast notification
   - Nawigacja do generatora z dashboardu → poprawne wyświetlenie formularza

2. **Testy dostępności**:
   - Nawigacja klawiaturą (Tab, Enter)
   - Screen reader (komunikaty błędów są czytane)
   - Kontrast kolorów (czerwone obramowania błędów)
   - Accordion z właściwymi aria-attributes

3. **Testy integracyjne**:
   - Integracja z API endpoint `/api/generations`
   - Przekierowanie na widok weryfikacji po sukcesie
   - Obsługa błędów API (400, 401, 500)

### Krok 12: Dokumentacja i finalizacja

1. Dodaj komentarze w kodzie dla złożonych funkcji walidacji
2. Zaktualizuj dokumentację projektu (jeśli istnieje)
3. Upewnij się, że wszystkie typy są poprawnie zdefiniowane w `src/types.ts`
4. Sprawdź zgodność z PRD (F-002, F-003, F-004) i user story (US-008)

