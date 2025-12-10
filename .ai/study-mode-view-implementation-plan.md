# Plan implementacji widoku Tryb nauki (/deck/[id]/study)

## 1. Przegląd

Widok "Tryb nauki" (`/deck/[id]/study`) umożliwia użytkownikowi swobodne przeglądanie wszystkich fiszek w talii w formie odwracalnych kart. W przeciwieństwie do trybu treningu, nie ma tutaj testu wielokrotnego wyboru - użytkownik po prostu przegląda materiał, odwracając karty, aby zobaczyć odpowiedzi. Widok oferuje płynną animację flip karty, nawigację między fiszkami (przyciski, gesty swipe, sidebar), filtrowanie po statusie oraz pełną obsługę klawiaturą dla dostępności.

Główny cel widoku to umożliwienie użytkownikowi swobodnego zapoznania się z materiałem bez presji testu, co jest szczególnie przydatne podczas pierwszego przeglądania nowych fiszek lub powtórki materiału w formie przeglądowej.

## 2. Routing widoku

- **Ścieżka:** `/deck/[id]/study`
- **Parametr dynamiczny:** `id` - identyfikator talii (number)
- **Typ routingu:** Astro dynamic route z React komponentem
- **Middleware:** Wymaga autoryzacji (sprawdzenie sesji przed renderowaniem)
- **Przekierowania:**
  - Jeśli użytkownik nie jest zalogowany → `/login?redirect=/deck/[id]/study`
  - Jeśli talia nie istnieje lub nie należy do użytkownika → `/deck/[id]` (lista fiszek) z toast notification
  - Jeśli brak fiszek w talii → `/deck/[id]` z toast notification

## 3. Struktura komponentów

```
StudyMode (React)
├── Breadcrumb (Shadcn/ui)
├── StudyHeader
│   ├── DeckName
│   ├── PositionIndicator ("X / Y")
│   └── StudyControls
│       ├── Select (filtr statusu: wszystkie/learning/mastered)
│       └── Button "Ukryj/Pokaż sidebar"
├── StudyContent
│   ├── FlashcardFlip (główna karta)
│   │   ├── FlashcardFront
│   │   │   ├── Question (duży tekst)
│   │   │   └── ImagePreview (jeśli image_url)
│   │   └── FlashcardBack
│   │       └── Answer (duży tekst)
│   ├── FlipControls
│   │   └── Button "Pokaż odpowiedź" (alternatywa dla kliknięcia)
│   └── NavigationControls
│       ├── Button "Poprzednia" (disabled na pierwszej)
│       └── Button "Następna" (disabled na ostatniej)
└── StudySidebar (opcjonalnie, można ukryć)
    ├── SidebarHeader
    │   └── Button "Zamknij"
    └── FlashcardList
        └── FlashcardListItem[] (dla każdej fiszki)
            ├── QuestionPreview (skrócony)
            ├── StatusBadge
            └── onClick → przejście do fiszki
```

## 4. Szczegóły komponentów

### StudyMode

- **Opis komponentu:** Główny komponent widoku trybu nauki. Zarządza stanem fiszek, aktualną pozycją, filtrowaniem, nawigacją i animacją flip. Integruje się z API do pobierania fiszek i obsługuje wszystkie interakcje użytkownika (kliknięcia, klawiaturę, gesty swipe).

- **Główne elementy:**
  - `<main>` - główny kontener z semantycznym HTML
  - `<section>` - sekcja nagłówka
  - `<section>` - sekcja głównej karty
  - `<aside>` - sidebar z listą fiszek (opcjonalnie)
  - Breadcrumb - nawigacja: Dashboard > [Nazwa talii] > Tryb nauki
  - StudyHeader - nagłówek z kontrolkami
  - StudyContent - główna zawartość z kartą
  - StudySidebar - sidebar z listą fiszek

- **Obsługiwane zdarzenia:**
  - `onMount` - pobranie danych talii i fiszek przy załadowaniu komponentu
  - `onFilterChange` - zmiana filtra statusu (aktualizacja listy i pozycji)
  - `onCardFlip` - odwrócenie karty (zmiana stanu isFlipped)
  - `onPrevious` - przejście do poprzedniej fiszki
  - `onNext` - przejście do następnej fiszki
  - `onFlashcardSelect` - wybór fiszki z sidebara (przejście do konkretnej pozycji)
  - `onSwipeLeft` - gest swipe w lewo (następna fiszka)
  - `onSwipeRight` - gest swipe w prawo (poprzednia fiszka)
  - `onKeyDown` - obsługa nawigacji klawiaturą (strzałki, Enter, Space, Escape)
  - `onSidebarToggle` - pokazanie/ukrycie sidebara

- **Obsługiwana walidacja:**
  - Sprawdzenie, czy talia istnieje i należy do użytkownika (przed wyświetleniem)
  - Walidacja parametru `id` z URL (musi być liczbą)
  - Sprawdzenie, czy są fiszki do wyświetlenia (empty state)

- **Typy:**
  - Props: `{ deckId: number }`
  - State: `StudyModeState` (zobacz sekcję Typy)

- **Props:**
  - `deckId: number` - identyfikator talii z parametru URL

### StudyHeader

- **Opis komponentu:** Nagłówek widoku trybu nauki wyświetlający nazwę talii, wskaźnik pozycji (X / Y) oraz kontrolki (filtr statusu, przełącznik sidebara).

- **Główne elementy:**
  - `<header>` - kontener nagłówka
  - `<h1>` lub `<h2>` - nazwa talii
  - `<div>` - wskaźnik pozycji ("5 / 20")
  - `<div>` - kontener kontrolek
  - Select (Shadcn/ui) - filtr statusu
  - Button (Shadcn/ui) - przełącznik sidebara

- **Obsługiwane zdarzenia:**
  - `onFilterChange` - zmiana filtra statusu (callback do rodzica)
  - `onSidebarToggle` - przełączenie widoczności sidebara (callback do rodzica)

- **Obsługiwana walidacja:**
  - Wartość filtra musi być jedną z: "all", "learning", "mastered"

- **Typy:**
  - Props: `StudyHeaderProps`

- **Props:**
  ```typescript
  interface StudyHeaderProps {
    deckName: string;
    currentIndex: number;
    totalCount: number;
    statusFilter: FlashcardStatusFilter;
    isSidebarOpen: boolean;
    onFilterChange: (filter: FlashcardStatusFilter) => void;
    onSidebarToggle: () => void;
  }
  ```

### FlashcardFlip

- **Opis komponentu:** Komponent karty fiszki z animacją flip. Wyświetla stronę przednią (pytanie) i tylną (odpowiedź) z płynną animacją CSS transform przy odwróceniu. Obsługuje kliknięcie na kartę oraz przycisk "Pokaż odpowiedź" jako alternatywne sposoby odwrócenia.

- **Główne elementy:**
  - `<div>` - kontener karty z `perspective` (CSS 3D transform)
  - `<div>` - wewnętrzny kontener z `transform-style: preserve-3d`
  - `<div>` - strona przednia (front) z `backface-visibility: hidden`
  - `<div>` - strona tylna (back) z `backface-visibility: hidden` i `transform: rotateY(180deg)`
  - `<h2>` lub `<p>` - pytanie (duży tekst, wyśrodkowany)
  - `<img>` - obrazek (jeśli image_url)
  - `<p>` - odpowiedź (duży tekst, wyśrodkowany)
  - CSS transitions dla płynnej animacji

- **Obsługiwane zdarzenia:**
  - `onClick` - kliknięcie na kartę (odwrócenie, jeśli nie jest odwrócona)
  - `onFlip` - programatyczne odwrócenie (przez przycisk lub klawiaturę)
  - `onSwipeLeft` - gest swipe w lewo (następna fiszka)
  - `onSwipeRight` - gest swipe w prawo (poprzednia fiszka)

- **Obsługiwana walidacja:**
  - Brak walidacji (tylko wyświetlanie)

- **Typy:**
  - Props: `FlashcardFlipProps`

- **Props:**
  ```typescript
  interface FlashcardFlipProps {
    flashcard: FlashcardResponse;
    isFlipped: boolean;
    onFlip: () => void;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
  }
  ```

### FlashcardFront

- **Opis komponentu:** Strona przednia karty fiszki wyświetlająca pytanie i opcjonalny obrazek.

- **Główne elementy:**
  - `<div>` - kontener strony przedniej
  - `<h2>` lub `<p>` - pytanie (duży tekst, wyśrodkowany, czytelny)
  - `<img>` - obrazek (jeśli image_url, z obsługą błędów ładowania)

- **Obsługiwane zdarzenia:**
  - `onClick` - kliknięcie na stronę przednią (odwrócenie karty)

- **Obsługiwana walidacja:**
  - Brak walidacji (tylko wyświetlanie)

- **Typy:**
  - Props: `FlashcardFrontProps`

- **Props:**
  ```typescript
  interface FlashcardFrontProps {
    question: string;
    imageUrl: string | null;
    onFlip: () => void;
  }
  ```

### FlashcardBack

- **Opis komponentu:** Strona tylna karty fiszki wyświetlająca poprawną odpowiedź.

- **Główne elementy:**
  - `<div>` - kontener strony tylnej
  - `<p>` - odpowiedź (duży tekst, wyśrodkowany, czytelny)

- **Obsługiwane zdarzenia:**
  - `onClick` - kliknięcie na stronę tylną (odwrócenie karty z powrotem)

- **Obsługiwana walidacja:**
  - Brak walidacji (tylko wyświetlanie)

- **Typy:**
  - Props: `FlashcardBackProps`

- **Props:**
  ```typescript
  interface FlashcardBackProps {
    answer: string;
    onFlip: () => void;
  }
  ```

### NavigationControls

- **Opis komponentu:** Kontrolki nawigacji między fiszkami. Zawiera przyciski "Poprzednia" i "Następna" z automatycznym wyłączaniem na pierwszej/ostatniej fiszce.

- **Główne elementy:**
  - `<nav>` - semantyczny kontener nawigacji
  - `<div>` - kontener przycisków
  - Button (Shadcn/ui) - przycisk "Poprzednia" (z ikoną strzałki w lewo)
  - Button (Shadcn/ui) - przycisk "Następna" (z ikoną strzałki w prawo)

- **Obsługiwane zdarzenia:**
  - `onPrevious` - przejście do poprzedniej fiszki (callback do rodzica)
  - `onNext` - przejście do następnej fiszki (callback do rodzica)

- **Obsługiwana walidacja:**
  - Przycisk "Poprzednia" nieaktywny (disabled) gdy `currentIndex === 0`
  - Przycisk "Następna" nieaktywny (disabled) gdy `currentIndex === totalCount - 1`

- **Typy:**
  - Props: `NavigationControlsProps`

- **Props:**
  ```typescript
  interface NavigationControlsProps {
    currentIndex: number;
    totalCount: number;
    onPrevious: () => void;
    onNext: () => void;
  }
  ```

### StudySidebar

- **Opis komponentu:** Sidebar z listą wszystkich fiszek w talii. Umożliwia szybkie przejście do konkretnej fiszki poprzez kliknięcie na element listy. Może być ukryty/pokazany przez użytkownika.

- **Główne elementy:**
  - `<aside>` - semantyczny kontener sidebara
  - `<div>` - kontener z pozycjonowaniem (fixed lub absolute)
  - `<header>` - nagłówek sidebara z przyciskiem zamknięcia
  - `<ul>` - lista fiszek
  - `<li>` - każda fiszka jako element listy
  - Button (Shadcn/ui) - przycisk zamknięcia sidebara

- **Obsługiwane zdarzenia:**
  - `onFlashcardSelect` - wybór fiszki z listy (callback do rodzica z indexem)
  - `onClose` - zamknięcie sidebara (callback do rodzica)

- **Obsługiwana walidacja:**
  - Brak walidacji (tylko wyświetlanie)

- **Typy:**
  - Props: `StudySidebarProps`

- **Props:**
  ```typescript
  interface StudySidebarProps {
    flashcards: FlashcardResponse[];
    currentIndex: number;
    isOpen: boolean;
    onFlashcardSelect: (index: number) => void;
    onClose: () => void;
  }
  ```

### FlashcardListItem

- **Opis komponentu:** Pojedynczy element listy w sidebarze reprezentujący fiszkę. Wyświetla skrócone pytanie, status i wyróżnia aktualnie wyświetlaną fiszkę.

- **Główne elementy:**
  - `<li>` - element listy
  - `<button>` - klikalny element (przejście do fiszki)
  - `<span>` - skrócone pytanie (np. pierwsze 50 znaków)
  - Badge (Shadcn/ui) - status fiszki (learning/mastered)
  - Wyróżnienie wizualne dla aktualnie wyświetlanej fiszki

- **Obsługiwane zdarzenia:**
  - `onClick` - kliknięcie na element (przejście do fiszki)

- **Obsługiwana walidacja:**
  - Brak walidacji (tylko wyświetlanie)

- **Typy:**
  - Props: `FlashcardListItemProps`

- **Props:**
  ```typescript
  interface FlashcardListItemProps {
    flashcard: FlashcardResponse;
    index: number;
    isActive: boolean;
    onClick: (index: number) => void;
  }
  ```

## 5. Typy

### Typy DTO (z src/types.ts)

Widok wykorzystuje następujące typy DTO zdefiniowane w `src/types.ts`:

- **DeckResponse** - odpowiedź API dla talii
  ```typescript
  type DeckResponse = Deck; // z database.types
  // Zawiera: id, user_id, name, created_at, updated_at
  ```

- **FlashcardResponse** - odpowiedź API dla fiszki
  ```typescript
  type FlashcardResponse = Flashcard; // z database.types
  // Zawiera:
  // - id: number
  // - deck_id: number
  // - question: string (2-10000 znaków)
  // - correct_answer: string (max 500 znaków)
  // - image_url: string | null
  // - status: 'learning' | 'mastered'
  // - due_date: string (ISO timestamp)
  // - interval: number
  // - consecutive_correct_answers: number
  // - created_at: string
  // - updated_at: string
  ```

- **FlashcardFront** - strona przednia fiszki
  ```typescript
  type FlashcardFront = Pick<Flashcard, 'question' | 'image_url'>;
  // Zawiera: question, image_url
  ```

- **FlashcardBack** - strona tylna fiszki
  ```typescript
  type FlashcardBack = Pick<Flashcard, 'correct_answer'>;
  // Zawiera: correct_answer
  ```

### Niestandardowe typy ViewModel

- **FlashcardStatusFilter** - filtr statusu fiszek
  ```typescript
  type FlashcardStatusFilter = 'all' | 'learning' | 'mastered';
  ```

- **StudyModeState** - stan głównego komponentu widoku
  ```typescript
  interface StudyModeState {
    deck: DeckResponse | null;
    flashcards: FlashcardResponse[];
    filteredFlashcards: FlashcardResponse[];
    currentIndex: number;
    statusFilter: FlashcardStatusFilter;
    isFlipped: boolean;
    isSidebarOpen: boolean;
    isLoading: boolean;
    isDeckLoading: boolean;
    error: string | null;
    swipeStartX: number | null;
    swipeStartY: number | null;
  }
  ```

- **SwipeGesture** - dane gestu swipe
  ```typescript
  interface SwipeGesture {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    threshold: number; // minimalna odległość dla uznania gestu (np. 50px)
  }
  ```

- **FlashcardPosition** - pozycja fiszki w liście
  ```typescript
  interface FlashcardPosition {
    index: number; // 0-based index
    total: number; // całkowita liczba fiszek
    isFirst: boolean;
    isLast: boolean;
  }
  ```

## 6. Zarządzanie stanem

Widok wykorzystuje kombinację React hooks i React Query (TanStack Query) do zarządzania stanem:

### React Query (TanStack Query)

- **useQuery dla talii:**
  ```typescript
  const { data: deck, isLoading: isDeckLoading, error: deckError } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => fetchDeck(deckId),
    enabled: !!deckId,
  });
  ```

- **useQuery dla fiszek:**
  ```typescript
  const { data: flashcards, isLoading: isFlashcardsLoading, error: flashcardsError } = useQuery({
    queryKey: ['flashcards', deckId, statusFilter],
    queryFn: () => fetchFlashcards(deckId, statusFilter),
    enabled: !!deckId,
  });
  ```

### Lokalny stan (useState)

- **Stan nawigacji:**
  ```typescript
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  ```

- **Stan filtra i sidebara:**
  ```typescript
  const [statusFilter, setStatusFilter] = useState<FlashcardStatusFilter>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  ```

- **Stan gestów swipe:**
  ```typescript
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeStartY, setSwipeStartY] = useState<number | null>(null);
  ```

### Custom Hook (useStudyMode)

Ze względu na złożoność logiki nawigacji, filtrowania i gestów, zalecane jest utworzenie custom hook `useStudyMode`:

```typescript
function useStudyMode(deckId: number) {
  // Wszystkie query
  const { data: deck, isLoading: isDeckLoading } = useQuery(...);
  const { data: flashcards, isLoading: isFlashcardsLoading } = useQuery(...);
  
  // Lokalny stan
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FlashcardStatusFilter>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Filtrowanie fiszek
  const filteredFlashcards = useMemo(() => {
    if (!flashcards) return [];
    if (statusFilter === 'all') return flashcards;
    return flashcards.filter(f => f.status === statusFilter);
  }, [flashcards, statusFilter]);
  
  // Aktualna fiszka
  const currentFlashcard = useMemo(() => {
    return filteredFlashcards[currentIndex] || null;
  }, [filteredFlashcards, currentIndex]);
  
  // Handlery nawigacji
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false); // reset flip przy zmianie fiszki
    }
  }, [currentIndex]);
  
  const handleNext = useCallback(() => {
    if (currentIndex < filteredFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false); // reset flip przy zmianie fiszki
    }
  }, [currentIndex, filteredFlashcards.length]);
  
  const handleFlashcardSelect = useCallback((index: number) => {
    if (index >= 0 && index < filteredFlashcards.length) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  }, [filteredFlashcards.length]);
  
  // Handler flip
  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);
  
  // Handlery gestów swipe
  const handleSwipeStart = useCallback((e: TouchEvent | MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setSwipeStartX(clientX);
    setSwipeStartY(clientY);
  }, []);
  
  const handleSwipeEnd = useCallback((e: TouchEvent | MouseEvent) => {
    if (swipeStartX === null || swipeStartY === null) return;
    
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
    
    const deltaX = clientX - swipeStartX;
    const deltaY = clientY - swipeStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Uznaj gest tylko jeśli ruch poziomy jest większy niż pionowy
    if (absDeltaX > absDeltaY && absDeltaX > 50) {
      if (deltaX > 0) {
        handlePrevious(); // swipe w prawo = poprzednia
      } else {
        handleNext(); // swipe w lewo = następna
      }
    }
    
    setSwipeStartX(null);
    setSwipeStartY(null);
  }, [swipeStartX, swipeStartY, handlePrevious, handleNext]);
  
  // Obsługa klawiatury
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, handleFlip]);
  
  // Reset flip przy zmianie filtra
  useEffect(() => {
    setIsFlipped(false);
    setCurrentIndex(0);
  }, [statusFilter]);
  
  return {
    deck,
    flashcards: filteredFlashcards,
    currentFlashcard,
    currentIndex,
    totalCount: filteredFlashcards.length,
    isFlipped,
    statusFilter,
    isSidebarOpen,
    isLoading: isDeckLoading || isFlashcardsLoading,
    handlePrevious,
    handleNext,
    handleFlashcardSelect,
    handleFlip,
    handleFilterChange: setStatusFilter,
    handleSidebarToggle: () => setIsSidebarOpen(prev => !prev),
    handleSwipeStart,
    handleSwipeEnd,
  };
}
```

## 7. Integracja API

### Endpointy wykorzystywane w widoku

#### Pobranie talii
- **Method:** `GET`
- **Path:** `/rest/v1/decks?id=eq.{deck_id}&select=*`
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Response:** `DeckResponse[]` (tablica z jednym elementem)
- **Obsługa błędów:**
  - `401` - Przekierowanie na `/login`
  - `404` - Przekierowanie na `/deck/[id]` z toast notification

#### Pobranie fiszek w talii
- **Method:** `GET`
- **Path:** `/rest/v1/flashcards?deck_id=eq.{deck_id}&select=*&order=created_at.desc`
- **Query Parameters:**
  - `deck_id` - identyfikator talii
  - `status` - opcjonalny filtr (`eq.learning` lub `eq.mastered`)
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Response:** `FlashcardResponse[]`
- **Obsługa błędów:**
  - `401` - Przekierowanie na `/login`
  - `404` - Toast notification z błędem

**Uwaga:** Filtrowanie po statusie może być wykonane po stronie klienta (filtrowanie już pobranych fiszek) lub po stronie serwera (dodanie parametru `status` do query). Zalecane jest filtrowanie po stronie klienta dla lepszej responsywności UI, ale można również użyć filtrowania serwerowego dla większych talii.

### Funkcje pomocnicze API

```typescript
// src/lib/api/deck.ts (współdzielone z widokiem listy fiszek)
export async function fetchDeck(deckId: number): Promise<DeckResponse> {
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function fetchFlashcards(
  deckId: number,
  statusFilter?: FlashcardStatusFilter
): Promise<FlashcardResponse[]> {
  let query = supabase
    .from('flashcards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: false });
  
  // Opcjonalnie: filtrowanie po stronie serwera
  // if (statusFilter === 'learning') {
  //   query = query.eq('status', 'learning');
  // } else if (statusFilter === 'mastered') {
  //   query = query.eq('status', 'mastered');
  // }
  
  const { data, error } = await query;
  if (error) throw error;
  
  // Filtrowanie po stronie klienta (jeśli nie użyto filtrowania serwerowego)
  if (statusFilter && statusFilter !== 'all') {
    return (data || []).filter(f => f.status === statusFilter);
  }
  
  return data || [];
}
```

## 8. Interakcje użytkownika

### Przeglądanie fiszek

1. **Wejście na widok:**
   - Użytkownik klika przycisk "Tryb nauki" w widoku talii lub wchodzi bezpośrednio na `/deck/[id]/study`
   - Widok ładuje dane talii i fiszek (skeleton loader)
   - Po załadowaniu wyświetla się pierwsza fiszka ze stroną przednią (pytanie)

2. **Odwrócenie karty:**
   - Użytkownik klika na kartę lub przycisk "Pokaż odpowiedź"
   - Karta odwraca się z animacją flip (CSS transform)
   - Wyświetla się strona tylna z odpowiedzią
   - Możliwość ponownego kliknięcia aby wrócić do strony przedniej

3. **Nawigacja przyciskami:**
   - Użytkownik klika przycisk "Następna" → przejście do następnej fiszki, karta resetuje się do strony przedniej
   - Użytkownik klika przycisk "Poprzednia" → przejście do poprzedniej fiszki, karta resetuje się do strony przedniej
   - Przyciski są automatycznie wyłączone na pierwszej/ostatniej fiszce

4. **Nawigacja klawiaturą:**
   - Strzałka w prawo → następna fiszka
   - Strzałka w lewo → poprzednia fiszka
   - Enter lub Spacja → odwrócenie karty
   - Escape → zamknięcie sidebara (jeśli otwarty)

5. **Nawigacja gestami swipe (mobile):**
   - Swipe w lewo → następna fiszka
   - Swipe w prawo → poprzednia fiszka
   - Minimalna odległość dla uznania gestu: 50px
   - Gesty działają tylko na głównej karcie

### Filtrowanie po statusie

1. **Zmiana filtra:**
   - Użytkownik wybiera filtr z dropdown (Wszystkie/W trakcie nauki/Opanowane)
   - Lista fiszek jest natychmiast filtrowana (bez przeładowania strony)
   - Pozycja resetuje się do pierwszej fiszki
   - Karta resetuje się do strony przedniej

2. **Aktualizacja wskaźnika pozycji:**
   - Wskaźnik pozycji (X / Y) aktualizuje się automatycznie po zmianie filtra
   - Pokazuje aktualną pozycję w przefiltrowanej liście

### Sidebar z listą fiszek

1. **Otwarcie sidebara:**
   - Użytkownik klika przycisk "Pokaż sidebar" w nagłówku
   - Sidebar wysuwa się z boku ekranu (animacja slide)
   - Wyświetla listę wszystkich fiszek z aktualnie wyświetlaną wyróżnioną

2. **Wybór fiszki z sidebara:**
   - Użytkownik klika na element listy w sidebarze
   - Widok przechodzi do wybranej fiszki
   - Karta resetuje się do strony przedniej
   - Sidebar może pozostać otwarty lub zamknąć się automatycznie (opcjonalnie)

3. **Zamknięcie sidebara:**
   - Użytkownik klika przycisk "Zamknij" w sidebarze lub przycisk "Ukryj sidebar" w nagłówku
   - Sidebar chowa się z animacją slide
   - Możliwość zamknięcia klawiszem Escape

### Pusta talia

1. **Brak fiszek:**
   - Jeśli talia jest pusta lub filtr nie zwraca żadnych fiszek, wyświetla się empty state
   - Komunikat: "Ta talia jest pusta. Dodaj fiszki lub wygeneruj je z tekstu."
   - Przycisk "Wróć do listy fiszek" przekierowujący do `/deck/[id]`

## 9. Warunki i walidacja

### Warunki weryfikowane przez interfejs

#### Walidacja przed wyświetleniem widoku

1. **Autoryzacja użytkownika:**
   - Sprawdzenie sesji w middleware Astro
   - Jeśli brak sesji → przekierowanie na `/login?redirect=/deck/[id]/study`

2. **Istnienie talii:**
   - Sprawdzenie, czy talia o podanym ID istnieje
   - Jeśli nie istnieje → przekierowanie na `/deck/[id]` z toast notification "Talia nie została znaleziona"

3. **Własność talii:**
   - Sprawdzenie, czy talia należy do zalogowanego użytkownika (RLS w Supabase)
   - Jeśli nie → przekierowanie na `/deck/[id]` z toast notification "Brak dostępu do tej talii"

#### Warunki wpływające na stan interfejsu

1. **Przycisk "Poprzednia":**
   - Aktywny: gdy `currentIndex > 0`
   - Nieaktywny: gdy `currentIndex === 0` (pierwsza fiszka)
   - Tooltip: "Brak poprzedniej fiszki" (gdy nieaktywny)

2. **Przycisk "Następna":**
   - Aktywny: gdy `currentIndex < totalCount - 1`
   - Nieaktywny: gdy `currentIndex === totalCount - 1` (ostatnia fiszka)
   - Tooltip: "Brak następnej fiszki" (gdy nieaktywny)

3. **Filtr statusu:**
   - Wpływa na wyświetlaną listę fiszek (`filteredFlashcards`)
   - Resetuje pozycję do pierwszej fiszki (`currentIndex = 0`)
   - Resetuje stan flip (`isFlipped = false`)

4. **Empty state:**
   - Wyświetlany gdy `filteredFlashcards.length === 0`
   - Komunikat: "Ta talia jest pusta. Dodaj fiszki lub wygeneruj je z tekstu." (gdy brak fiszek w talii)
   - Komunikat: "Brak fiszek z wybranym statusem." (gdy filtr nie zwraca wyników)

5. **Skeleton loaders:**
   - Wyświetlane podczas `isLoading === true`
   - Zastępowane kartą fiszki po załadowaniu

6. **Wskaźnik pozycji:**
   - Format: "X / Y" (np. "5 / 20")
   - X = `currentIndex + 1` (1-based dla użytkownika)
   - Y = `totalCount`
   - Aktualizuje się automatycznie przy zmianie pozycji lub filtra

7. **Animacja flip:**
   - Karta może być odwrócona tylko jeśli `currentFlashcard !== null`
   - Stan `isFlipped` resetuje się przy zmianie fiszki (`currentIndex`)

8. **Gesty swipe:**
   - Uznawane tylko jeśli różnica pozioma (`absDeltaX`) jest większa niż różnica pionowa (`absDeltaY`)
   - Minimalna odległość: 50px
   - Działają tylko na głównej karcie (nie w sidebarze)

## 10. Obsługa błędów

### Scenariusze błędów i ich obsługa

#### Błędy ładowania danych

1. **Błąd pobierania talii:**
   - **Scenariusz:** API zwraca 404 lub 500 podczas pobierania talii
   - **Obsługa:**
     - Toast notification: "Nie udało się załadować talii. Spróbuj ponownie."
     - Przekierowanie na `/deck/[id]` (lista fiszek)
     - Możliwość ręcznego odświeżenia (React Query retry)

2. **Błąd pobierania fiszek:**
   - **Scenariusz:** API zwraca błąd podczas pobierania listy fiszek
   - **Obsługa:**
     - Toast notification: "Nie udało się załadować fiszek. Spróbuj ponownie."
     - Wyświetlenie pustego stanu z przyciskiem "Spróbuj ponownie"
     - Możliwość ręcznego odświeżenia

3. **Błąd autoryzacji (401):**
   - **Scenariusz:** Token wygasł lub użytkownik nie jest zalogowany
   - **Obsługa:**
     - Przekierowanie na `/login?redirect=/deck/[id]/study`
     - Toast notification: "Sesja wygasła. Zaloguj się ponownie."

#### Przypadki brzegowe

1. **Brak fiszek w talii:**
   - **Scenariusz:** Talia istnieje, ale nie ma w niej żadnych fiszek
   - **Obsługa:**
     - Wyświetlenie empty state z komunikatem: "Ta talia jest pusta. Dodaj fiszki lub wygeneruj je z tekstu."
     - Przycisk "Wróć do listy fiszek" przekierowujący do `/deck/[id]`

2. **Brak fiszek po filtrowaniu:**
   - **Scenariusz:** Filtr statusu nie zwraca żadnych fiszek
   - **Obsługa:**
     - Wyświetlenie empty state z komunikatem: "Brak fiszek z wybranym statusem."
     - Możliwość zmiany filtra lub powrotu do listy fiszek

3. **Próba nawigacji poza zakres:**
   - **Scenariusz:** Użytkownik próbuje przejść do fiszki poza zakresem (np. przez manipulację stanem)
   - **Obsługa:**
     - Walidacja w handlerach nawigacji (`handlePrevious`, `handleNext`)
     - Automatyczne ograniczenie do zakresu `[0, totalCount - 1]`
     - Przyciski automatycznie wyłączone na granicach

4. **Błąd ładowania obrazka:**
   - **Scenariusz:** Obrazek z `image_url` nie może być załadowany
   - **Obsługa:**
     - Wyświetlenie placeholder lub ukrycie obrazka
     - Obsługa zdarzenia `onError` na elemencie `<img>`
     - Fallback do tekstu bez obrazka

#### Błędy sieci

1. **Brak połączenia z internetem:**
   - **Scenariusz:** Request fails z powodu braku połączenia
   - **Obsługa:**
     - Toast notification: "Brak połączenia z internetem. Sprawdź swoje połączenie."
     - React Query automatycznie retry po przywróceniu połączenia
     - Możliwość ręcznego odświeżenia

2. **Timeout:**
   - **Scenariusz:** Request przekracza limit czasu
   - **Obsługa:**
     - Toast notification: "Żądanie trwa zbyt długo. Spróbuj ponownie."
     - Możliwość ręcznego ponowienia

#### Błędy animacji

1. **Błąd animacji flip:**
   - **Scenariusz:** CSS transform nie działa (stara przeglądarka)
   - **Obsługa:**
     - Fallback: natychmiastowa zmiana widoczności bez animacji
     - Sprawdzenie wsparcia dla CSS transforms
     - Graceful degradation

## 11. Kroki implementacji

### Faza 1: Podstawowa struktura i routing

1. **Utworzenie strony Astro:**
   - Utworzenie pliku `src/pages/deck/[id]/study.astro`
   - Konfiguracja dynamicznego routingu z zagnieżdżonym parametrem
   - Dodanie middleware autoryzacji
   - Podstawowy layout z Topbar

2. **Utworzenie głównego komponentu React:**
   - Utworzenie `src/components/study/StudyMode.tsx`
   - Podstawowa struktura komponentu z placeholderami
   - Integracja z React Query (QueryClient setup)

3. **Routing i przekierowania:**
   - Obsługa parametru `id` z URL
   - Walidacja parametru (musi być liczbą)
   - Przekierowania dla błędów autoryzacji i pustej talii

### Faza 2: Pobieranie i wyświetlanie danych

4. **Funkcje API:**
   - Wykorzystanie istniejących funkcji z `src/lib/api/deck.ts`:
     - `fetchDeck`
     - `fetchFlashcards`
   - Ewentualne rozszerzenie o filtrowanie po stronie klienta

5. **Komponenty wyświetlania:**
   - Utworzenie `StudyHeader.tsx` - nagłówek z kontrolkami
   - Utworzenie `FlashcardFlip.tsx` - karta z animacją flip
   - Utworzenie `FlashcardFront.tsx` - strona przednia
   - Utworzenie `FlashcardBack.tsx` - strona tylna
   - Dodanie skeleton loaders podczas ładowania

6. **Integracja z React Query:**
   - Użycie `useQuery` dla talii i fiszek
   - Obsługa stanów ładowania i błędów
   - Cache'owanie danych

### Faza 3: Animacja flip karty

7. **Implementacja animacji CSS:**
   - Utworzenie stylów dla animacji flip (CSS transform, perspective)
   - Implementacja `FlashcardFlip.tsx` z animacją 3D flip
   - Testowanie animacji w różnych przeglądarkach

8. **Logika odwracania karty:**
   - Stan `isFlipped` w komponencie głównym
   - Handler `handleFlip` dołączony do karty i przycisku
   - Reset flip przy zmianie fiszki

9. **Przycisk "Pokaż odpowiedź":**
   - Dodanie przycisku jako alternatywy dla kliknięcia na kartę
   - Pozycjonowanie przycisku (np. pod kartą)
   - Obsługa kliknięcia (wywołanie `handleFlip`)

### Faza 4: Nawigacja między fiszkami

10. **Komponenty nawigacji:**
    - Utworzenie `NavigationControls.tsx` z przyciskami "Poprzednia" i "Następna"
    - Implementacja logiki wyłączania przycisków na granicach
    - Dodanie ikon strzałek (lucide-react lub podobne)

11. **Handlery nawigacji:**
    - Implementacja `handlePrevious` i `handleNext` w custom hook
    - Reset flip przy zmianie fiszki
    - Aktualizacja wskaźnika pozycji

12. **Wskaźnik pozycji:**
    - Wyświetlenie "X / Y" w nagłówku
    - Automatyczna aktualizacja przy zmianie pozycji lub filtra

### Faza 5: Obsługa klawiatury

13. **Event listener dla klawiatury:**
    - Dodanie `useEffect` z `keydown` listener w custom hook
    - Obsługa strzałek (← →), Enter, Spacja, Escape
    - Cleanup listenera przy unmount

14. **Focus management:**
    - Upewnienie się, że focus jest na głównej karcie
    - Zapobieganie scrollowaniu przy użyciu strzałek (preventDefault)

### Faza 6: Gesty swipe (mobile)

15. **Implementacja gestów touch:**
    - Dodanie event listenerów `touchstart`, `touchend` na głównej karcie
    - Implementacja logiki wykrywania gestu swipe
    - Minimalna odległość 50px dla uznania gestu

16. **Obsługa gestów myszy (opcjonalnie):**
    - Dodanie obsługi `mousedown` i `mouseup` dla desktop
    - Ta sama logika co dla touch events

17. **Integracja z nawigacją:**
    - Połączenie gestów z handlerami `handlePrevious` i `handleNext`
    - Wizualny feedback podczas gestu (opcjonalnie: przesunięcie karty)

### Faza 7: Filtrowanie po statusie

18. **Komponent filtra:**
    - Dodanie Select (Shadcn/ui) w `StudyHeader`
    - Opcje: "Wszystkie", "W trakcie nauki", "Opanowane"
    - Handler `handleFilterChange`

19. **Logika filtrowania:**
    - Implementacja filtrowania w custom hook (`useMemo` dla `filteredFlashcards`)
    - Reset pozycji i flip przy zmianie filtra
    - Aktualizacja wskaźnika pozycji

### Faza 8: Sidebar z listą fiszek

20. **Komponent sidebara:**
    - Utworzenie `StudySidebar.tsx`
    - Pozycjonowanie (fixed lub absolute) z boku ekranu
    - Animacja slide przy otwieraniu/zamykaniu

21. **Lista fiszek w sidebarze:**
    - Utworzenie `FlashcardListItem.tsx`
    - Wyświetlanie skróconego pytania i statusu
    - Wyróżnienie aktualnie wyświetlanej fiszki

22. **Integracja sidebara:**
    - Przełącznik widoczności w nagłówku
    - Handler `handleFlashcardSelect` do przejścia do wybranej fiszki
    - Zamknięcie sidebara klawiszem Escape

### Faza 9: Empty state i przypadki brzegowe

23. **Komponent empty state:**
    - Utworzenie lub użycie istniejącego `EmptyState.tsx`
    - Komunikaty dla pustej talii i braku wyników filtra
    - Przycisk "Wróć do listy fiszek"

24. **Obsługa przypadków brzegowych:**
    - Walidacja zakresu indeksów w handlerach nawigacji
    - Obsługa błędów ładowania obrazków
    - Fallback dla animacji flip (graceful degradation)

### Faza 10: Breadcrumbs i nawigacja

25. **Breadcrumbs:**
    - Dodanie komponentu Breadcrumb (Shadcn/ui)
    - Nawigacja: Dashboard > [Nazwa talii] > Tryb nauki
    - Linki do poprzednich poziomów

26. **Przycisk powrotu:**
    - Dodanie przycisku "Wróć do listy fiszek" w nagłówku lub breadcrumbs
    - Przekierowanie do `/deck/[id]`

### Faza 11: Obsługa błędów

27. **Obsługa błędów API:**
    - Toast notifications dla wszystkich błędów
    - Przekierowania dla błędów autoryzacji
    - Przyciski "Spróbuj ponownie" w empty state

28. **Obsługa błędów animacji:**
    - Fallback dla przeglądarek bez wsparcia CSS transforms
    - Testowanie w różnych przeglądarkach

### Faza 12: Dostępność i optymalizacja

29. **Dostępność (WCAG AA):**
    - Semantyczny HTML (`<main>`, `<section>`, `<nav>`, `<aside>`)
    - ARIA labels dla przycisków i kontrolek
    - Keyboard navigation (strzałki, Enter, Space, Escape)
    - aria-live regions dla dynamicznych aktualizacji (pozycja, filtr)
    - Focus management (focus na karcie po załadowaniu)

30. **Optymalizacja:**
    - Memoization komponentów (React.memo)
    - Optymalizacja zapytań React Query (staleTime, cacheTime)
    - Lazy loading obrazków (loading="lazy")
    - Debouncing gestów swipe (opcjonalnie)

### Faza 13: Testowanie i poprawki

31. **Testowanie funkcjonalności:**
    - Testowanie wszystkich interakcji użytkownika
    - Testowanie nawigacji (przyciski, klawiatura, gesty)
    - Testowanie filtrowania
    - Testowanie animacji flip
    - Testowanie sidebara

32. **Testowanie dostępności:**
    - Testowanie z screen readerem
    - Testowanie nawigacji klawiaturą
    - Testowanie kontrastów kolorów

33. **Testowanie responsywności:**
    - Testowanie na różnych rozdzielczościach ekranu
    - Testowanie gestów swipe na urządzeniach dotykowych
    - Testowanie sidebara na mobile

34. **Poprawki i optymalizacje:**
    - Naprawa znalezionych błędów
    - Optymalizacja wydajności
    - Poprawki UX na podstawie testów

