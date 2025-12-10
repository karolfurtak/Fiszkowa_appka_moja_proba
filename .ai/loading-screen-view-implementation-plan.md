# Plan implementacji widoku Ekran ładowania (podczas generowania)

## 1. Przegląd

Widok ekranu ładowania (`/loading/[session_id]`) jest przejściowym widokiem wyświetlanym podczas procesu generowania fiszek przez AI. Jego głównym celem jest informowanie użytkownika o trwającym procesie generowania, wyświetlanie wizualnego wskaźnika postępu oraz umożliwienie anulowania operacji. Widok pojawia się automatycznie po kliknięciu przycisku "Generuj" w widoku Generatora (`/generate`) i pozostaje aktywny do momentu zakończenia generowania lub jego anulowania przez użytkownika.

Po zakończeniu generowania użytkownik jest automatycznie przekierowywany na widok Weryfikacji propozycji (`/verify/[session_id]`), gdzie może przeglądać, akceptować, odrzucać i edytować wygenerowane propozycje fiszek przed zapisaniem ich do talii.

Widok implementuje wymagania z PRD (F-002 - generowanie fiszek z tekstu) oraz user story US-008 (inicjowanie generowania fiszek). Zapewnia płynne doświadczenie użytkownika podczas długotrwałej operacji generowania (10-30 sekund) poprzez wyraźne komunikaty statusu, animację ładowania i możliwość anulowania.

## 2. Routing widoku

**Ścieżka**: `/loading/[session_id]`

**Plik**: `src/pages/loading/[session_id].astro`

**Parametry routingu**:
- `session_id` (string) - identyfikator sesji generowania (`generation_session_id`) otrzymany z odpowiedzi endpointu `/api/generations`

**Middleware**: Widok wymaga autoryzacji (użytkownik musi być zalogowany). Jeśli użytkownik nie jest zalogowany, powinien być przekierowany na `/login?redirect=/loading/[session_id]`.

**Query Parameters**: Brak (wszystkie potrzebne dane są w `session_id`)

**Przykład URL**: `/loading/gen-1234567890-abc12345-xyz`

**Nawigacja**:
- **Wejście**: Automatyczne przekierowanie z Generatora (`/generate`) po kliknięciu "Generuj" i otrzymaniu `generation_session_id`
- **Wyjście**: Automatyczne przekierowanie na Weryfikację (`/verify/[session_id]`) po zakończeniu generowania lub ręczne przekierowanie z powrotem do Generatora (`/generate`) po anulowaniu

## 3. Struktura komponentów

```
loading/[session_id].astro (Astro Page)
└── LoadingScreen (React Component)
    ├── Container (div wrapper)
    │   ├── ProgressSection
    │   │   ├── Progress (Shadcn/ui) - pasek postępu
    │   │   ├── StatusMessage (div) - komunikat o statusie
    │   │   └── EstimatedTime (div) - szacowany czas (opcjonalnie)
    │   ├── SpinnerSection
    │   │   └── Spinner (Shadcn/ui) - animacja ładowania
    │   ├── ActionSection
    │   │   └── Button (Shadcn/ui) - przycisk "Anuluj"
    │   └── ErrorSection (conditional)
    │       └── Alert (Shadcn/ui) - komunikat błędu
    └── Toast (Shadcn/ui) - toast notifications (błędy sieci)
```

## 4. Szczegóły komponentów

### LoadingScreen (React Component)

**Lokalizacja**: `src/components/loading/LoadingScreen.tsx`

**Opis komponentu**: Główny komponent ekranu ładowania odpowiedzialny za wyświetlanie wizualnego wskaźnika postępu podczas generowania fiszek. Komponent zarządza stanem ładowania, komunikuje się z endpointem `/api/generations` w celu sprawdzenia statusu generowania (polling co 2-3 sekundy), wyświetla komunikaty statusu oraz obsługuje anulowanie operacji. Komponent jest klient-side (React), co umożliwia interaktywność i automatyczne odświeżanie statusu bez przeładowania strony.

**Główne elementy HTML i komponenty dzieci**:
- `<div className="container">` - główny kontener z wyśrodkowaną zawartością
- `Progress` (Shadcn/ui) - pasek postępu z wartością procentową (0-100%)
- `<div className="status-message">` - komunikat o aktualnym statusie generowania (np. "Analizowanie tekstu...", "Generowanie fiszek...")
- `<div className="estimated-time">` - opcjonalny szacowany czas zakończenia (np. "Szacowany czas: ~15 sekund")
- `Spinner` (Shadcn/ui) - animacja ładowania (rotujący spinner)
- `Button` (Shadcn/ui) - przycisk "Anuluj" z obsługą kliknięcia
- `Alert` (Shadcn/ui) - komunikat błędu (jeśli wystąpi błąd podczas generowania)
- `Toast` (Shadcn/ui) - toast notifications dla błędów sieci

**Obsługiwane zdarzenia**:
- `onMount` (useEffect) - inicjalizacja polling po zamontowaniu komponentu
- `onUnmount` (useEffect cleanup) - czyszczenie interwału polling przy odmontowaniu
- `onClick` - kliknięcie przycisku "Anuluj" (anulowanie generowania i powrót do generatora)
- Automatyczne przekierowanie po zakończeniu generowania (useEffect)

**Warunki walidacji** (szczegółowe, zgodnie z API):

**Session ID**:
- Wymagane (nie może być puste)
- Format: string (UUID lub podobny identyfikator sesji)
- Walidacja: sprawdzanie czy `session_id` jest prawidłowym stringiem przed rozpoczęciem polling
- Komunikaty błędów:
  - Brak session_id: przekierowanie z powrotem do generatora z komunikatem błędu
  - Nieprawidłowy format: przekierowanie z powrotem do generatora z komunikatem błędu

**Status generowania**:
- Sprawdzanie przez polling co 2-3 sekundy
- Możliwe statusy:
  - `pending` - generowanie w toku
  - `completed` - generowanie zakończone (przekierowanie na weryfikację)
  - `failed` - błąd podczas generowania (wyświetlenie komunikatu błędu)
- Timeout: po 60 sekundach bez odpowiedzi wyświetlenie komunikatu timeout

**Typy (DTO i ViewModel)**:

**Props komponentu**:
```typescript
interface LoadingScreenProps {
  sessionId: string; // generation_session_id z URL
}
```

**Stan komponentu (ViewModel)**:
```typescript
interface LoadingScreenState {
  progress: number; // 0-100, procentowy postęp generowania
  statusMessage: string; // Aktualny komunikat statusu
  estimatedTimeRemaining: number | null; // Szacowany czas w sekundach (opcjonalnie)
  isGenerating: boolean; // Flaga czy generowanie jest w toku
  error: string | null; // Komunikat błędu (jeśli wystąpi)
  startTime: number; // Timestamp rozpoczęcia generowania (dla obliczania czasu)
  pollInterval: NodeJS.Timeout | null; // Referencja do interwału polling
}
```

**Typy Request/Response (z `src/types.ts`)**:
- Request (polling): `GET /rest/v1/flashcard_proposals?generation_session_id=eq.{session_id}&select=count` - sprawdzanie czy propozycje zostały utworzone
- Response: `GenerateFlashcardsResponse` - `{ generation_session_id: string, proposals: Array<...>, detected_domain: string, total_generated: number }`

**Props**: 
- `sessionId: string` - identyfikator sesji generowania otrzymany z URL (parametr routingu)

### Progress (Shadcn/ui)

**Opis komponentu**: Komponent paska postępu z biblioteki Shadcn/ui wyświetlający wizualny wskaźnik postępu generowania (0-100%). Komponent automatycznie aktualizuje wartość procentową na podstawie stanu `progress` z komponentu nadrzędnego.

**Główne elementy**: 
- Pasek postępu z wypełnieniem wizualnym (kolor akcentujący)
- Wartość procentowa wyświetlana jako tekst (np. "45%")
- Animacja płynnego przejścia przy zmianie wartości

**Props**:
```typescript
interface ProgressProps {
  value: number; // 0-100, wartość procentowa
  className?: string; // Opcjonalne klasy CSS
}
```

**Dostępność**: 
- `aria-valuenow={progress}` - aktualna wartość postępu
- `aria-valuemin="0"` - minimalna wartość
- `aria-valuemax="100"` - maksymalna wartość
- `aria-label="Postęp generowania fiszek"` - opis dla screen readerów

### Spinner (Shadcn/ui)

**Opis komponentu**: Komponent animacji ładowania z biblioteki Shadcn/ui wyświetlający rotujący spinner podczas generowania. Komponent zapewnia wizualną informację zwrotną, że operacja jest w toku.

**Główne elementy**: 
- Rotujący spinner (animacja CSS)
- Opcjonalny tekst pod spinnerem (np. "Proszę czekać...")

**Props**:
```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'; // Rozmiar spinnera
  className?: string; // Opcjonalne klasy CSS
}
```

**Dostępność**: 
- `aria-label="Ładowanie"` - opis dla screen readerów
- `role="status"` - rola statusu dla screen readerów

### StatusMessage (Custom Component)

**Opis komponentu**: Komponent wyświetlający aktualny komunikat statusu generowania. Komunikaty zmieniają się dynamicznie w zależności od etapu generowania (np. "Analizowanie tekstu...", "Generowanie fiszek...", "Kończenie..."). Komponent jest dostępny dla screen readerów przez `aria-live` region.

**Główne elementy**: 
- Tekst komunikatu statusu
- Opcjonalnie: ikona reprezentująca etap generowania

**Props**:
```typescript
interface StatusMessageProps {
  message: string; // Komunikat statusu
  className?: string; // Opcjonalne klasy CSS
}
```

**Dostępność**: 
- `aria-live="polite"` - region live dla screen readerów (ogłoszenie zmian statusu)
- `role="status"` - rola statusu

### EstimatedTime (Custom Component)

**Opis komponentu**: Opcjonalny komponent wyświetlający szacowany czas zakończenia generowania. Komponent oblicza szacowany czas na podstawie upłyniętego czasu i aktualnego postępu (lub używa stałej wartości szacunkowej, np. 15-30 sekund).

**Główne elementy**: 
- Tekst z szacowanym czasem (np. "Szacowany czas: ~15 sekund")
- Opcjonalnie: countdown timer pokazujący pozostały czas

**Props**:
```typescript
interface EstimatedTimeProps {
  timeRemaining: number | null; // Szacowany czas w sekundach (null jeśli nie można oszacować)
  className?: string; // Opcjonalne klasy CSS
}
```

**Dostępność**: 
- `aria-label="Szacowany czas zakończenia generowania"` - opis dla screen readerów

## 5. Typy

### Typy Request/Response (z `src/types.ts`)

**GenerateFlashcardsResponse** (odpowiedź z endpointu `/api/generations`):
```typescript
interface GenerateFlashcardsResponse {
  generation_session_id: string; // Identyfikator sesji generowania
  proposals: Array<{
    id: number; // ID propozycji
    question: string; // Pytanie fiszki
    correct_answer: string; // Poprawna odpowiedź
    domain: string | null; // Wykryta dziedzina wiedzy
    status: ProposalStatus; // Status propozycji ('pending', 'accepted', 'rejected')
  }>;
  detected_domain: string; // Wykryta dziedzina wiedzy
  total_generated: number; // Całkowita liczba wygenerowanych propozycji
}
```

**ProposalStatus** (enum):
```typescript
type ProposalStatus = 'pending' | 'accepted' | 'rejected';
```

### Typy stanu komponentu (ViewModel)

**LoadingScreenState**:
```typescript
interface LoadingScreenState {
  // Postęp generowania (0-100%)
  progress: number;
  
  // Aktualny komunikat statusu
  statusMessage: string;
  
  // Szacowany czas zakończenia w sekundach (null jeśli nie można oszacować)
  estimatedTimeRemaining: number | null;
  
  // Flaga czy generowanie jest w toku
  isGenerating: boolean;
  
  // Komunikat błędu (null jeśli brak błędu)
  error: string | null;
  
  // Timestamp rozpoczęcia generowania (dla obliczania czasu)
  startTime: number;
  
  // Referencja do interwału polling (dla cleanup)
  pollInterval: NodeJS.Timeout | null;
}
```

### Typy błędów API

**ApiErrorResponse** (z `src/types.ts`):
```typescript
interface ApiErrorResponse {
  error: {
    code: string; // Kod błędu (np. 'VALIDATION_ERROR', 'UNAUTHORIZED', 'INTERNAL_ERROR')
    message: string; // Komunikat błędu
    details?: Record<string, unknown>; // Opcjonalne szczegóły błędu
  };
}
```

**Mapowanie błędów na komunikaty**:
- `VALIDATION_ERROR` → "Nieprawidłowe dane wejściowe. Spróbuj ponownie."
- `UNAUTHORIZED` → "Sesja wygasła. Zaloguj się ponownie."
- `NOT_FOUND` → "Nie znaleziono sesji generowania."
- `INTERNAL_ERROR` → "Wystąpił błąd podczas generowania. Spróbuj ponownie."
- `TIMEOUT` → "Generowanie trwa dłużej niż zwykle. Proszę czekać..."
- Inne błędy → "Wystąpił błąd podczas generowania. Spróbuj ponownie."

### Typy dla polling

**PollingStatus**:
```typescript
interface PollingStatus {
  isComplete: boolean; // Czy generowanie zostało zakończone
  proposalsCount: number; // Liczba utworzonych propozycji (0 jeśli jeszcze nie utworzone)
  error?: string; // Komunikat błędu (jeśli wystąpił)
}
```

## 6. Zarządzanie stanem

Widok ekranu ładowania używa lokalnego stanu React (`useState`) do zarządzania wartościami postępu, komunikatami statusu i błędami. Wymaga custom hooka `useGenerationPolling` do obsługi polling statusu generowania, ponieważ operacja jest długotrwała (10-30 sekund) i wymaga okresowego sprawdzania statusu.

**Struktura stanu**:
```typescript
const [state, setState] = useState<LoadingScreenState>({
  progress: 0,
  statusMessage: 'Inicjowanie generowania...',
  estimatedTimeRemaining: null,
  isGenerating: true,
  error: null,
  startTime: Date.now(),
  pollInterval: null,
});
```

**Custom Hook: `useGenerationPolling`**

**Lokalizacja**: `src/hooks/useGenerationPolling.ts`

**Opis**: Custom hook odpowiedzialny za polling statusu generowania co 2-3 sekundy. Hook sprawdza, czy propozycje zostały utworzone w bazie danych przez zapytanie do endpointu `/rest/v1/flashcard_proposals` z filtrem `generation_session_id=eq.{session_id}`. Gdy propozycje zostaną znalezione, hook oznacza generowanie jako zakończone i zwraca dane propozycji.

**Interfejs hooka**:
```typescript
interface UseGenerationPollingResult {
  isComplete: boolean; // Czy generowanie zostało zakończone
  proposals: FlashcardProposalResponse[] | null; // Lista propozycji (null jeśli jeszcze nie gotowe)
  error: string | null; // Komunikat błędu
  progress: number; // Postęp generowania (0-100%)
  statusMessage: string; // Aktualny komunikat statusu
}

function useGenerationPolling(
  sessionId: string,
  onComplete: (proposals: FlashcardProposalResponse[]) => void,
  onError: (error: string) => void
): UseGenerationPollingResult
```

**Parametry hooka**:
- `sessionId: string` - identyfikator sesji generowania
- `onComplete: (proposals: FlashcardProposalResponse[]) => void` - callback wywoływany po zakończeniu generowania
- `onError: (error: string) => void` - callback wywoływany w przypadku błędu

**Logika hooka**:
1. **Inicjalizacja**: Uruchomienie interwału polling co 2-3 sekundy po zamontowaniu komponentu
2. **Polling**: W każdym interwale:
   - Wysłanie zapytania `GET /rest/v1/flashcard_proposals?generation_session_id=eq.{session_id}&select=*`
   - Sprawdzenie czy propozycje zostały utworzone (czy odpowiedź zawiera propozycje)
   - Aktualizacja postępu na podstawie upłyniętego czasu (liniowa interpolacja 0-100% w czasie 10-30 sekund)
   - Aktualizacja komunikatu statusu w zależności od postępu
3. **Zakończenie**: Gdy propozycje zostaną znalezione:
   - Zatrzymanie interwału polling
   - Wywołanie `onComplete` z listą propozycji
   - Zwrócenie `isComplete = true`
4. **Timeout**: Po 60 sekundach bez odpowiedzi:
   - Zatrzymanie interwału polling
   - Wywołanie `onError` z komunikatem timeout
   - Zwrócenie `error = "TIMEOUT"`
5. **Cleanup**: Przy odmontowaniu komponentu:
   - Zatrzymanie interwału polling
   - Czyszczenie zasobów

**Funkcje pomocnicze do zarządzania stanem**:
- `updateProgress(elapsedTime: number, estimatedDuration: number): number` - obliczanie postępu na podstawie upłyniętego czasu
- `getStatusMessage(progress: number): string` - zwracanie komunikatu statusu na podstawie postępu
- `calculateEstimatedTime(elapsedTime: number, progress: number): number | null` - obliczanie szacowanego czasu zakończenia

**Integracja z React Query (opcjonalnie)**:
- Hook może używać `useQuery` z React Query do cache'owania odpowiedzi z polling
- `refetchInterval: 2000` - automatyczne odświeżanie co 2 sekundy
- `staleTime: 0` - dane zawsze uznawane za nieaktualne (wymagane dla polling)

## 7. Integracja API

Widok ekranu ładowania integruje się z **Supabase REST API** przez klienta Supabase (`@supabase/supabase-js`) do sprawdzania statusu generowania przez polling.

**Endpoint polling**: `GET /rest/v1/flashcard_proposals?generation_session_id=eq.{session_id}&select=*`

**Klient Supabase**: Użycie klienta z `src/lib/supabase.ts`:
```typescript
import { supabase } from '@/lib/supabase';
```

**Wywołanie API (polling)**:
```typescript
const { data, error } = await supabase
  .from('flashcard_proposals')
  .select('*')
  .eq('generation_session_id', sessionId);
```

**Typy Request**:
- Query Parameters:
  - `generation_session_id` - identyfikator sesji generowania (z URL)
  - `select` - pola do zwrócenia (`*` dla wszystkich pól)

**Typy Response**:

**Sukces (200)** - propozycje znalezione:
```typescript
Array<FlashcardProposalResponse> // Lista propozycji fiszek
```

**Przykład odpowiedzi**:
```json
[
  {
    "id": 1,
    "user_id": "uuid",
    "question": "What is photosynthesis?",
    "correct_answer": "The process by which plants convert light energy into chemical energy",
    "image_url": null,
    "domain": "Biology",
    "generation_session_id": "gen-1234567890-abc12345-xyz",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**Błąd (401 Unauthorized)**:
```typescript
{
  error: {
    code: 'UNAUTHORIZED',
    message: 'JWT expired or invalid'
  }
}
```

**Błąd (404 Not Found)** - brak propozycji (generowanie jeszcze w toku):
```typescript
[] // Pusta tablica - to jest normalne podczas generowania
```

**Obsługa odpowiedzi**:
1. **Propozycje znalezione** (tablica niepusta):
   - Zatrzymanie polling
   - Oznaczenie generowania jako zakończone
   - Przekierowanie na `/verify/[session_id]` z danymi propozycji

2. **Brak propozycji** (pusta tablica):
   - Kontynuacja polling
   - Aktualizacja postępu i komunikatu statusu
   - Sprawdzenie timeout (jeśli upłynęło >60 sekund → błąd timeout)

3. **Błąd API**:
   - Zatrzymanie polling
   - Wyświetlenie komunikatu błędu
   - Opcja ponowienia lub powrotu do generatora

**Uwagi dotyczące polling**:
- **Częstotliwość**: Polling co 2-3 sekundy (2000-3000ms)
- **Timeout**: Po 60 sekundach bez znalezienia propozycji wyświetlenie komunikatu timeout
- **Optymalizacja**: Zapytanie zwraca tylko liczbę propozycji (`count`) w pierwszej fazie, a pełne dane dopiero po zakończeniu (opcjonalnie)
- **Rate limiting**: Supabase ma domyślne limity rate limiting - polling co 2-3 sekundy jest bezpieczny

## 8. Interakcje użytkownika

### 8.1. Wejście na widok

**Akcja**: Użytkownik klika przycisk "Generuj" w widoku Generatora (`/generate`).

**Reakcja**:
1. Formularz jest walidowany przed wysłaniem
2. Jeśli walidacja przechodzi, wywołanie endpointu `POST /api/generations` z danymi formularza
3. Po otrzymaniu odpowiedzi z `generation_session_id`:
   - Zapisanie `session_id` w stanie (opcjonalnie w sessionStorage dla odzyskania po odświeżeniu strony)
   - Przekierowanie na `/loading/[session_id]`
4. Po załadowaniu widoku `/loading/[session_id]`:
   - Automatyczne uruchomienie polling przez `useGenerationPolling`
   - Wyświetlenie ekranu ładowania z progress barem, spinnerem i komunikatem statusu

### 8.2. Polling statusu

**Akcja**: Automatyczne sprawdzanie statusu generowania co 2-3 sekundy.

**Reakcja**:
1. W każdym interwale polling:
   - Wysłanie zapytania `GET /rest/v1/flashcard_proposals?generation_session_id=eq.{session_id}`
   - Sprawdzenie czy odpowiedź zawiera propozycje
2. **Jeśli propozycje nie zostały jeszcze utworzone** (pusta tablica):
   - Aktualizacja postępu (liniowa interpolacja 0-100% w czasie 10-30 sekund)
   - Aktualizacja komunikatu statusu w zależności od postępu:
     - 0-30%: "Analizowanie tekstu..."
     - 30-70%: "Generowanie fiszek..."
     - 70-90%: "Kończenie generowania..."
     - 90-100%: "Prawie gotowe..."
   - Kontynuacja polling
3. **Jeśli propozycje zostały znalezione** (tablica niepusta):
   - Zatrzymanie polling
   - Oznaczenie generowania jako zakończone (`isComplete = true`)
   - Automatyczne przekierowanie na `/verify/[session_id]` z danymi propozycji

### 8.3. Aktualizacja postępu

**Akcja**: Automatyczna aktualizacja postępu na podstawie upłyniętego czasu.

**Reakcja**:
1. Obliczanie postępu:
   - `elapsedTime = Date.now() - startTime` (w sekundach)
   - `progress = Math.min(100, (elapsedTime / estimatedDuration) * 100)`
   - `estimatedDuration = 20` (sekund) - domyślny szacowany czas generowania
2. Aktualizacja paska postępu (`Progress` komponent):
   - Wartość `value={progress}` aktualizowana w czasie rzeczywistym
   - Animacja płynnego przejścia przy zmianie wartości
3. Aktualizacja komunikatu statusu:
   - Komunikat zmienia się dynamicznie w zależności od wartości `progress`
   - Komunikaty są dostępne dla screen readerów przez `aria-live` region

### 8.4. Anulowanie generowania

**Akcja**: Użytkownik klika przycisk "Anuluj".

**Reakcja**:
1. Zatrzymanie polling (cleanup interwału)
2. Wyświetlenie modal potwierdzenia (opcjonalnie): "Czy na pewno chcesz anulować generowanie?"
3. **Jeśli użytkownik potwierdza anulowanie**:
   - Zatrzymanie polling
   - Przekierowanie z powrotem na `/generate`
   - Opcjonalnie: zachowanie wprowadzonego tekstu w formularzu (sessionStorage)
   - Toast notification: "Generowanie zostało anulowane"
4. **Jeśli użytkownik anuluje potwierdzenie**:
   - Powrót do ekranu ładowania
   - Kontynuacja polling

**Uwaga**: Anulowanie nie usuwa propozycji z bazy danych (jeśli zostały już utworzone). Propozycje pozostają w bazie z `status='pending'` i mogą być później przeglądane przez użytkownika.

### 8.5. Zakończenie generowania

**Akcja**: Polling wykrywa, że propozycje zostały utworzone (odpowiedź API zawiera propozycje).

**Reakcja**:
1. Zatrzymanie polling
2. Oznaczenie generowania jako zakończone (`isComplete = true`)
3. Ustawienie postępu na 100%
4. Aktualizacja komunikatu statusu: "Generowanie zakończone!"
5. Opóźnienie 500ms-1s (dla lepszego UX - użytkownik widzi komunikat sukcesu)
6. Automatyczne przekierowanie na `/verify/[session_id]`:
   - Przekazanie danych propozycji przez router state (opcjonalnie)
   - Lub pobranie propozycji na widoku weryfikacji przez `session_id`

### 8.6. Błąd podczas generowania

**Akcja**: API zwraca błąd lub timeout (60 sekund bez odpowiedzi).

**Reakcja**:
1. Zatrzymanie polling
2. Ustawienie `error` w stanie z odpowiednim komunikatem:
   - Błąd API: "Wystąpił błąd podczas generowania. Spróbuj ponownie."
   - Timeout: "Generowanie trwa dłużej niż zwykle. Proszę czekać..."
   - Błąd autoryzacji: "Sesja wygasła. Zaloguj się ponownie."
3. Wyświetlenie komunikatu błędu (`Alert` komponent):
   - Czerwony alert z komunikatem błędu
   - Przycisk "Spróbuj ponownie" (opcjonalnie)
   - Przycisk "Wróć do generatora"
4. **Jeśli użytkownik klika "Spróbuj ponownie"**:
   - Restart polling
   - Reset stanu błędu
   - Kontynuacja sprawdzania statusu
5. **Jeśli użytkownik klika "Wróć do generatora"**:
   - Przekierowanie na `/generate`
   - Opcjonalnie: zachowanie wprowadzonego tekstu

### 8.7. Błąd sieci

**Akcja**: Brak połączenia z internetem lub timeout żądania podczas polling.

**Reakcja**:
1. Wykrycie błędu sieci (np. `fetch` throws error)
2. Zatrzymanie polling
3. Wyświetlenie toast notification: "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
4. Opcja ponowienia polling po przywróceniu połączenia
5. Przycisk "Wróć do generatora" pozostaje dostępny

### 8.8. Odświeżenie strony

**Akcja**: Użytkownik odświeża stronę podczas generowania.

**Reakcja**:
1. Po odświeżeniu strony:
   - `session_id` jest zachowany w URL (`/loading/[session_id]`)
   - Komponent `LoadingScreen` montuje się ponownie
   - `useGenerationPolling` uruchamia się automatycznie
   - Sprawdzenie czy propozycje już istnieją (jeśli tak → przekierowanie na weryfikację)
   - Jeśli nie → kontynuacja polling od miejsca, w którym zostało przerwane
2. Postęp jest resetowany (nie można odzyskać dokładnego postępu, ale polling sprawdzi status)

## 9. Warunki i walidacja

### 9.1. Warunki wymagane przez API

**Session ID**:
- **Wymagane**: Tak (musi być obecny w URL)
- **Format**: String (UUID lub podobny identyfikator)
- **Weryfikacja w komponencie**: Sprawdzanie czy `session_id` jest prawidłowym stringiem przed rozpoczęciem polling
- **Komunikaty błędów**:
  - Brak session_id: Przekierowanie na `/generate` z komunikatem: "Nieprawidłowa sesja generowania"
  - Nieprawidłowy format: Przekierowanie na `/generate` z komunikatem: "Nieprawidłowy format identyfikatora sesji"

**Autoryzacja**:
- **Wymagane**: Tak (użytkownik musi być zalogowany)
- **Weryfikacja**: Middleware w Astro sprawdza sesję przed renderowaniem strony
- **Komunikaty błędów**:
  - Brak autoryzacji: Przekierowanie na `/login?redirect=/loading/[session_id]`
  - Sesja wygasła podczas polling: Wyświetlenie komunikatu błędu i przekierowanie na `/login`

**Status generowania**:
- **Sprawdzanie**: Polling co 2-3 sekundy przez zapytanie do `/rest/v1/flashcard_proposals`
- **Możliwe stany**:
  - `pending` - generowanie w toku (propozycje jeszcze nie utworzone)
  - `completed` - generowanie zakończone (propozycje utworzone)
  - `failed` - błąd podczas generowania (rzadko, ponieważ Edge Function zwraca błąd od razu)

### 9.2. Wpływ warunków na stan interfejsu

**Pole session_id**:
- Jeśli session_id jest nieprawidłowy → przekierowanie na generator z komunikatem błędu
- Jeśli session_id jest prawidłowy → rozpoczęcie polling

**Status generowania**:
- Jeśli propozycje nie zostały jeszcze utworzone → wyświetlenie ekranu ładowania z progress barem i spinnerem
- Jeśli propozycje zostały utworzone → automatyczne przekierowanie na weryfikację
- Jeśli wystąpi błąd → wyświetlenie komunikatu błędu z opcją ponowienia

**Postęp generowania**:
- Postęp jest obliczany na podstawie upłyniętego czasu (liniowa interpolacja 0-100%)
- Postęp aktualizuje się automatycznie co sekundę (niezależnie od polling)
- Pasek postępu (`Progress`) aktualizuje wartość `value` w czasie rzeczywistym

**Komunikaty statusu**:
- Komunikaty zmieniają się dynamicznie w zależności od postępu:
  - 0-30%: "Analizowanie tekstu..."
  - 30-70%: "Generowanie fiszek..."
  - 70-90%: "Kończenie generowania..."
  - 90-100%: "Prawie gotowe..."
- Komunikaty są dostępne dla screen readerów przez `aria-live="polite"` region

**Przycisk "Anuluj"**:
- Przycisk jest zawsze aktywny (można anulować w dowolnym momencie)
- Po kliknięciu wyświetla się modal potwierdzenia (opcjonalnie)
- Po potwierdzeniu anulowania → przekierowanie na generator

**Timeout**:
- Po 60 sekundach bez znalezienia propozycji → wyświetlenie komunikatu timeout
- Komunikat timeout: "Generowanie trwa dłużej niż zwykle. Proszę czekać..."
- Opcja kontynuacji oczekiwania lub powrotu do generatora

### 9.3. Walidacja po stronie klienta vs serwera

**Po stronie klienta** (przed rozpoczęciem polling):
- Format session_id (sprawdzenie czy jest stringiem)
- Sprawdzenie czy użytkownik jest zalogowany (middleware)
- Walidacja upłyniętego czasu (timeout po 60 sekundach)

**Po stronie serwera** (API):
- Sprawdzenie autoryzacji (JWT token)
- Sprawdzenie czy session_id istnieje w bazie danych
- Sprawdzenie czy propozycje zostały utworzone (zapytanie do `flashcard_proposals`)
- Wszystkie błędy z API są mapowane na komunikaty w języku polskim i wyświetlane w interfejsie

## 10. Obsługa błędów

### 10.1. Błędy walidacji po stronie klienta

**Brak session_id**:
- **Komunikat**: "Nieprawidłowa sesja generowania"
- **Lokalizacja**: Przekierowanie na `/generate` z komunikatem błędu (toast notification)
- **Styl**: Toast z typem `destructive` (Shadcn/ui)
- **Akcja użytkownika**: Może ponownie wypełnić formularz i kliknąć "Generuj"

**Nieprawidłowy format session_id**:
- **Komunikat**: "Nieprawidłowy format identyfikatora sesji"
- **Lokalizacja**: Przekierowanie na `/generate` z komunikatem błędu
- **Styl**: Toast z typem `destructive`
- **Akcja użytkownika**: Może ponownie wypełnić formularz i kliknąć "Generuj"

### 10.2. Błędy API

**401 Unauthorized** (sesja wygasła):
- **Komunikat**: "Sesja wygasła. Zaloguj się ponownie."
- **Lokalizacja**: Alert na ekranie ładowania + przekierowanie na `/login?redirect=/loading/[session_id]`
- **Styl**: Alert z typem `destructive` (Shadcn/ui)
- **Akcja użytkownika**: Po zalogowaniu powrót na ekran ładowania (jeśli generowanie jeszcze trwa)

**404 Not Found** (brak propozycji - normalne podczas generowania):
- **Obsługa**: To nie jest błąd - pusta tablica oznacza, że generowanie jeszcze trwa
- **Reakcja**: Kontynuacja polling

**500 Internal Server Error**:
- **Komunikat**: "Wystąpił błąd serwera podczas generowania. Spróbuj ponownie."
- **Lokalizacja**: Alert na ekranie ładowania
- **Styl**: Alert z typem `destructive`
- **Akcja użytkownika**: Przycisk "Spróbuj ponownie" (restart polling) lub "Wróć do generatora"

**Timeout (60 sekund)**:
- **Komunikat**: "Generowanie trwa dłużej niż zwykle. Proszę czekać..."
- **Lokalizacja**: Alert na ekranie ładowania
- **Styl**: Alert z typem `warning` (Shadcn/ui) - żółty kolor
- **Akcja użytkownika**: Opcja kontynuacji oczekiwania lub powrotu do generatora

### 10.3. Błędy sieci

**Brak połączenia z internetem**:
- **Komunikat**: "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
- **Lokalizacja**: Toast notification (Shadcn/ui `Toast`)
- **Styl**: Toast z typem `destructive`
- **Akcja użytkownika**: Może spróbować ponownie po przywróceniu połączenia (przycisk "Spróbuj ponownie")

**Timeout żądania**:
- **Komunikat**: "Żądanie przekroczyło limit czasu. Spróbuj ponownie."
- **Lokalizacja**: Toast notification
- **Styl**: Toast z typem `destructive`
- **Akcja użytkownika**: Może spróbować ponownie (przycisk "Spróbuj ponownie")

### 10.4. Przypadki brzegowe

**Użytkownik odświeża stronę podczas generowania**:
- **Obsługa**: `session_id` jest zachowany w URL, polling restartuje się automatycznie
- **Akcja**: Sprawdzenie czy propozycje już istnieją (jeśli tak → przekierowanie na weryfikację)
- **Komunikat**: Brak (ciche odzyskanie stanu)

**Użytkownik klika "Wstecz" w przeglądarce**:
- **Obsługa**: Przekierowanie na poprzednią stronę (generator)
- **Akcja**: Polling jest zatrzymywany przy odmontowaniu komponentu (cleanup)
- **Komunikat**: Brak (normalne zachowanie przeglądarki)

**Generowanie zakończone, ale użytkownik nie został przekierowany**:
- **Obsługa**: Polling wykrywa propozycje i automatycznie przekierowuje użytkownika
- **Akcja**: Przekierowanie na `/verify/[session_id]` po wykryciu propozycji
- **Komunikat**: Brak (automatyczne przekierowanie)

**Wielokrotne kliknięcia przycisku "Anuluj"**:
- **Obsługa**: Przycisk jest nieaktywny (`disabled`) po pierwszym kliknięciu (podczas potwierdzenia)
- **Akcja**: Zapobiega wielokrotnym żądaniom anulowania

**Polling kontynuuje się po zakończeniu generowania**:
- **Obsługa**: Cleanup interwału w `useEffect` po wykryciu zakończenia generowania
- **Akcja**: Zatrzymanie polling przed przekierowaniem na weryfikację

## 11. Kroki implementacji

### Krok 1: Utworzenie strony Astro

1. Utwórz plik `src/pages/loading/[session_id].astro`
2. Dodaj podstawową strukturę strony Astro z:
   - Importem komponentu `LoadingScreen`
   - Layoutem strony (wspólny layout dla aplikacji)
   - Meta tagami (title, description)
   - Middleware sprawdzającym autoryzację przed renderowaniem strony
3. Przekaż `session_id` z parametru routingu do komponentu `LoadingScreen` jako prop

### Krok 2: Utworzenie komponentu LoadingScreen

1. Utwórz plik `src/components/loading/LoadingScreen.tsx`
2. Zainstaluj zależności React (jeśli nie są już zainstalowane)
3. Zaimportuj komponenty Shadcn/ui: `Progress`, `Spinner`, `Button`, `Alert`, `Toast`
4. Zaimportuj klienta Supabase: `import { supabase } from '@/lib/supabase'`
5. Utwórz interfejs `LoadingScreenProps` i `LoadingScreenState` dla props i stanu komponentu
6. Utwórz komponent funkcjonalny `LoadingScreen` z podstawową strukturą JSX

### Krok 3: Implementacja custom hooka useGenerationPolling

1. Utwórz plik `src/hooks/useGenerationPolling.ts`
2. Zaimportuj klienta Supabase: `import { supabase } from '@/lib/supabase'`
3. Zaimportuj typy: `FlashcardProposalResponse` z `src/types.ts`
4. Utwórz interfejs `UseGenerationPollingResult` dla zwracanego wyniku hooka
5. Zaimplementuj hook `useGenerationPolling`:
   - Użyj `useState` dla stanu polling (`isComplete`, `proposals`, `error`, `progress`, `statusMessage`)
   - Użyj `useEffect` dla inicjalizacji polling po zamontowaniu komponentu
   - Użyj `useRef` dla przechowywania referencji do interwału polling
   - Zaimplementuj funkcję `checkStatus()` do sprawdzania statusu przez API
   - Zaimplementuj funkcję `updateProgress()` do obliczania postępu
   - Zaimplementuj funkcję `getStatusMessage()` do zwracania komunikatu statusu
   - Zaimplementuj cleanup interwału przy odmontowaniu komponentu
6. Dodaj obsługę timeout (60 sekund)
7. Dodaj obsługę błędów API

### Krok 4: Implementacja stanu i logiki komponentu LoadingScreen

1. Dodaj `useState` dla stanu komponentu (`progress`, `statusMessage`, `estimatedTimeRemaining`, `isGenerating`, `error`, `startTime`)
2. Dodaj `useGenerationPolling` hook z odpowiednimi callbackami:
   - `onComplete`: przekierowanie na `/verify/[session_id]`
   - `onError`: ustawienie błędu w stanie
3. Utwórz funkcje pomocnicze:
   - `handleCancel()` - obsługa kliknięcia przycisku "Anuluj"
   - `handleRetry()` - obsługa kliknięcia przycisku "Spróbuj ponownie"
   - `formatTime(seconds: number): string` - formatowanie czasu dla wyświetlenia

### Krok 5: Implementacja UI komponentów

1. Dodaj kontener główny z wyśrodkowaną zawartością:
   - `<div className="container mx-auto max-w-2xl p-8">`
2. Dodaj sekcję ProgressSection:
   - `<Progress value={progress} className="w-full" />` - pasek postępu
   - `<div className="status-message">{statusMessage}</div>` - komunikat statusu
   - Opcjonalnie: `<EstimatedTime timeRemaining={estimatedTimeRemaining} />` - szacowany czas
3. Dodaj sekcję SpinnerSection:
   - `<Spinner size="lg" />` - animacja ładowania
4. Dodaj sekcję ActionSection:
   - `<Button onClick={handleCancel}>Anuluj</Button>` - przycisk anulowania
5. Dodaj sekcję ErrorSection (conditional):
   - `<Alert variant="destructive">{error}</Alert>` - komunikat błędu (jeśli `error !== null`)
   - Przycisk "Spróbuj ponownie" (jeśli błąd)
   - Przycisk "Wróć do generatora" (jeśli błąd)

### Krok 6: Implementacja dostępności (WCAG AA)

1. Dodaj właściwe atrybuty ARIA:
   - `aria-live="polite"` dla komunikatu statusu (`StatusMessage`)
   - `aria-valuenow`, `aria-valuemin`, `aria-valuemax` dla paska postępu (`Progress`)
   - `aria-label` dla przycisków i spinnera
   - `role="status"` dla komunikatu statusu
2. Upewnij się, że wszystkie interaktywne elementy są dostępne przez klawiaturę (Tab, Enter)
3. Dodaj focus management (focus na przycisku "Anuluj" po załadowaniu)
4. Upewnij się, że kontrast kolorów spełnia wymagania WCAG AA (4.5:1 dla tekstu)

### Krok 7: Implementacja obsługi błędów

1. Utwórz funkcję `mapApiError(error: ApiErrorResponse): string` do mapowania błędów API na komunikaty w języku polskim
2. W `useGenerationPolling`, po otrzymaniu błędu z API:
   - Wywołaj `mapApiError` aby uzyskać komunikat
   - Wywołaj `onError` callback z komunikatem błędu
3. W komponencie `LoadingScreen`, po otrzymaniu błędu:
   - Ustaw `error` w stanie
   - Wyświetl `Alert` z komunikatem błędu
   - Dodaj przyciski "Spróbuj ponownie" i "Wróć do generatora"

### Krok 8: Implementacja przekierowań

1. W `onComplete` callback z `useGenerationPolling`:
   - Użyj routera Astro lub `window.location.href` do przekierowania na `/verify/[session_id]`
   - Opcjonalnie: przekaż dane propozycji przez router state
2. W `handleCancel`:
   - Użyj routera Astro lub `window.location.href` do przekierowania na `/generate`
   - Opcjonalnie: zachowanie wprowadzonego tekstu w sessionStorage
3. W obsłudze błędów autoryzacji:
   - Przekierowanie na `/login?redirect=/loading/[session_id]`

### Krok 9: Stylowanie i UX

1. Użyj komponentów Shadcn/ui dla spójności z resztą aplikacji
2. Dodaj odpowiednie marginesy i odstępy między sekcjami
3. Dodaj animacje płynnego przejścia dla paska postępu
4. Upewnij się, że ekran jest responsywny (desktop-first, ale działa na mobile)
5. Dodaj wizualne wskaźniki błędów (czerwone obramowanie, ikony błędów)

### Krok 10: Testowanie

1. **Testy manualne**:
   - Generowanie fiszek z poprawnymi danymi → sukces, przekierowanie na weryfikację
   - Generowanie fiszek z nieprawidłowym session_id → przekierowanie na generator z komunikatem błędu
   - Kliknięcie "Anuluj" → przekierowanie na generator
   - Odświeżenie strony podczas generowania → restart polling
   - Timeout (60 sekund) → wyświetlenie komunikatu timeout
   - Błąd sieci → wyświetlenie toast notification

2. **Testy dostępności**:
   - Nawigacja klawiaturą (Tab, Enter)
   - Screen reader (komunikaty statusu są czytane)
   - Kontrast kolorów (czerwone alerty błędów)

3. **Testy integracyjne**:
   - Integracja z Supabase REST API (polling)
   - Przekierowanie na weryfikację po zakończeniu generowania
   - Obsługa błędów API

### Krok 11: Dokumentacja i finalizacja

1. Dodaj komentarze w kodzie dla złożonych funkcji (polling, obliczanie postępu)
2. Zaktualizuj dokumentację projektu (jeśli istnieje)
3. Upewnij się, że wszystkie typy są poprawnie zdefiniowane w `src/types.ts`
4. Sprawdź zgodność z PRD (F-002) i user story (US-008)
5. Sprawdź zgodność z UI planem (Widok 5: Ekran ładowania)

