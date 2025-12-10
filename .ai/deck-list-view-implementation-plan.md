# Plan implementacji widoku Lista fiszek (/deck/[id])

## 1. Przegląd

Widok "Lista fiszek" (`/deck/[id]`) jest głównym widokiem zarządzania fiszkami w wybranej talii. Umożliwia użytkownikowi przeglądanie wszystkich fiszek w talii, filtrowanie ich po statusie (wszystkie/w trakcie nauki/opanowane), edycję i usuwanie pojedynczych fiszek oraz zarządzanie talią (edycja nazwy, usunięcie). Widok zapewnia również szybki dostęp do trybów nauki: "Rozpocznij powtórkę" (tryb treningu) i "Tryb nauki" (swobodne przeglądanie).

Główny cel widoku to umożliwienie użytkownikowi efektywnego zarządzania fiszkami w talii oraz łatwego dostępu do nauki. Widok jest kluczowym elementem przepływu nauki, łączącym dashboard z trybami nauki.

## 2. Routing widoku

- **Ścieżka:** `/deck/[id]`
- **Parametr dynamiczny:** `id` - identyfikator talii (number)
- **Typ routingu:** Astro dynamic route z React komponentem
- **Middleware:** Wymaga autoryzacji (sprawdzenie sesji przed renderowaniem)
- **Przekierowania:**
  - Jeśli użytkownik nie jest zalogowany → `/login?redirect=/deck/[id]`
  - Jeśli talia nie istnieje lub nie należy do użytkownika → `/` (dashboard) z toast notification

## 3. Struktura komponentów

```
DeckView (React)
├── Breadcrumb (Shadcn/ui)
├── DeckHeader
│   ├── DeckInfo
│   │   ├── DeckName (edytowalne)
│   │   └── DeckStats (liczba fiszek, liczba do powtórki)
│   └── DeckActions
│       ├── Button "Rozpocznij powtórkę"
│       ├── Button "Tryb nauki"
│       ├── Button "Dodaj fiszkę"
│       ├── Button "Edytuj talię"
│       └── Button "Usuń talię"
├── FlashcardFilters
│   └── Select (filtr statusu: wszystkie/learning/mastered)
├── FlashcardList
│   ├── Skeleton (podczas ładowania)
│   ├── EmptyState (gdy brak fiszek)
│   └── FlashcardCard[] (dla każdej fiszki)
│       ├── FlashcardContent
│       │   ├── Question (skrócony z możliwością rozwinięcia)
│       │   ├── StatusBadge (learning/mastered)
│       │   └── ImagePreview (jeśli image_url)
│       └── FlashcardActions
│           ├── Button "Edytuj"
│           └── Button "Usuń"
├── FlashcardModal (edycja fiszki)
│   ├── FlashcardForm
│   │   ├── Input "Pytanie"
│   │   ├── Textarea "Poprawna odpowiedź"
│   │   ├── Input "URL obrazka"
│   │   └── Button "Zapisz zmiany"
│   └── Button "Anuluj"
└── DeleteConfirmDialog (potwierdzenie usunięcia)
    ├── DialogContent
    └── DialogActions
```

## 4. Szczegóły komponentów

### DeckView

- **Opis komponentu:** Główny komponent widoku talii. Zarządza stanem talii, listą fiszek, filtrowaniem i modalami. Integruje się z API do pobierania i aktualizacji danych.

- **Główne elementy:**
  - `<main>` - główny kontener z semantycznym HTML
  - `<section>` - sekcja nagłówka talii
  - `<section>` - sekcja listy fiszek
  - Breadcrumb - nawigacja: Dashboard > [Nazwa talii]
  - DeckHeader - nagłówek z informacjami o talii i akcjami
  - FlashcardFilters - filtr statusu fiszek
  - FlashcardList - lista fiszek z możliwością scrollowania

- **Obsługiwane zdarzenia:**
  - `onMount` - pobranie danych talii i fiszek przy załadowaniu komponentu
  - `onFilterChange` - zmiana filtra statusu (aktualizacja listy)
  - `onDeckUpdate` - aktualizacja nazwy talii
  - `onDeckDelete` - usunięcie talii (z potwierdzeniem)
  - `onFlashcardEdit` - otwarcie modalu edycji fiszki
  - `onFlashcardDelete` - usunięcie fiszki (z potwierdzeniem)
  - `onStartReview` - przekierowanie do `/deck/[id]/review`
  - `onStartStudy` - przekierowanie do `/deck/[id]/study`
  - `onAddFlashcard` - otwarcie modalu dodawania fiszki

- **Obsługiwana walidacja:**
  - Sprawdzenie, czy talia istnieje i należy do użytkownika (przed wyświetleniem)
  - Walidacja parametru `id` z URL (musi być liczbą)

- **Typy:**
  - Props: `{ deckId: number }`
  - State: `DeckViewState` (zobacz sekcję Typy)

- **Props:**
  - `deckId: number` - identyfikator talii z parametru URL

### DeckHeader

- **Opis komponentu:** Nagłówek widoku talii wyświetlający informacje o talii (nazwa, statystyki) oraz przyciski akcji głównych.

- **Główne elementy:**
  - `<div>` - kontener nagłówka
  - `<h1>` - nazwa talii (edytowalna inline lub przez modal)
  - `<div>` - statystyki talii (liczba fiszek, liczba do powtórki)
  - `<div>` - kontener przycisków akcji
  - Button[] - przyciski akcji

- **Obsługiwane zdarzenia:**
  - `onDeckNameEdit` - rozpoczęcie edycji nazwy talii
  - `onDeckNameSave` - zapisanie nowej nazwy talii
  - `onStartReview` - przekierowanie do trybu treningu
  - `onStartStudy` - przekierowanie do trybu nauki
  - `onAddFlashcard` - otwarcie modalu dodawania fiszki
  - `onDeckEdit` - otwarcie modalu edycji talii
  - `onDeckDelete` - otwarcie dialogu potwierdzenia usunięcia

- **Obsługiwana walidacja:**
  - Nazwa talii: wymagana, min 1 znak, max 255 znaków (zgodnie z API)

- **Typy:**
  - Props: `DeckHeaderProps`
  - State: lokalny stan dla edycji nazwy

- **Props:**
  ```typescript
  interface DeckHeaderProps {
    deck: DeckResponse;
    dueCount: number;
    totalCount: number;
    onStartReview: () => void;
    onStartStudy: () => void;
    onAddFlashcard: () => void;
    onDeckEdit: () => void;
    onDeckDelete: () => void;
    onDeckNameUpdate: (name: string) => Promise<void>;
  }
  ```

### FlashcardFilters

- **Opis komponentu:** Komponent filtrowania fiszek po statusie. Umożliwia wybór między "Wszystkie", "W trakcie nauki" (learning) i "Opanowane" (mastered).

- **Główne elementy:**
  - `<div>` - kontener filtra
  - Select (Shadcn/ui) - dropdown wyboru statusu
  - Label - etykieta filtra

- **Obsługiwane zdarzenia:**
  - `onFilterChange` - zmiana wybranego filtra (callback do rodzica)

- **Obsługiwana walidacja:**
  - Wartość filtra musi być jedną z: "all", "learning", "mastered"

- **Typy:**
  - Props: `FlashcardFiltersProps`

- **Props:**
  ```typescript
  interface FlashcardFiltersProps {
    currentFilter: FlashcardStatusFilter;
    onFilterChange: (filter: FlashcardStatusFilter) => void;
  }
  ```

### FlashcardList

- **Opis komponentu:** Lista fiszek w talii. Wyświetla fiszki w formie kart z możliwością scrollowania. Obsługuje stany ładowania i pusty stan.

- **Główne elementy:**
  - `<ul>` - semantyczna lista fiszek
  - `<li>` - każda fiszka jako element listy
  - Skeleton (Shadcn/ui) - podczas ładowania
  - EmptyState - gdy brak fiszek
  - FlashcardCard[] - karty fiszek

- **Obsługiwane zdarzenia:**
  - `onFlashcardEdit` - edycja fiszki (callback)
  - `onFlashcardDelete` - usunięcie fiszki (callback)

- **Obsługiwana walidacja:**
  - Brak walidacji (tylko wyświetlanie)

- **Typy:**
  - Props: `FlashcardListProps`

- **Props:**
  ```typescript
  interface FlashcardListProps {
    flashcards: FlashcardResponse[];
    isLoading: boolean;
    onFlashcardEdit: (flashcard: FlashcardResponse) => void;
    onFlashcardDelete: (flashcardId: number) => void;
  }
  ```

### FlashcardCard

- **Opis komponentu:** Karta pojedynczej fiszki w liście. Wyświetla pytanie (skrócone z możliwością rozwinięcia), status i przyciski akcji.

- **Główne elementy:**
  - `<article>` - semantyczny element karty
  - `<div>` - kontener treści fiszki
  - `<h3>` lub `<p>` - pytanie (skrócone/pełne)
  - Badge (Shadcn/ui) - status fiszki (learning/mastered)
  - `<img>` - podgląd obrazka (jeśli image_url)
  - `<div>` - kontener przycisków akcji
  - Button[] - przyciski "Edytuj" i "Usuń"

- **Obsługiwane zdarzenia:**
  - `onClick` (na pytaniu) - rozwinięcie/zwinięcie pełnego tekstu pytania
  - `onEdit` - otwarcie modalu edycji
  - `onDelete` - otwarcie dialogu potwierdzenia usunięcia

- **Obsługiwana walidacja:**
  - Brak walidacji (tylko wyświetlanie)

- **Typy:**
  - Props: `FlashcardCardProps`

- **Props:**
  ```typescript
  interface FlashcardCardProps {
    flashcard: FlashcardResponse;
    onEdit: (flashcard: FlashcardResponse) => void;
    onDelete: (flashcardId: number) => void;
  }
  ```

### FlashcardModal

- **Opis komponentu:** Modal edycji fiszki. Zawiera formularz z polami: pytanie, poprawna odpowiedź, URL obrazka. Obsługuje walidację i zapis zmian.

- **Główne elementy:**
  - Dialog (Shadcn/ui) - kontener modala
  - DialogContent - zawartość modala
  - DialogHeader - nagłówek z tytułem
  - Form - formularz edycji
  - Input (Shadcn/ui) - pole pytania
  - Textarea (Shadcn/ui) - pole odpowiedzi
  - Input (Shadcn/ui) - pole URL obrazka
  - Alert (Shadcn/ui) - komunikaty błędów walidacji
  - Button[] - przyciski "Zapisz zmiany" i "Anuluj"

- **Obsługiwane zdarzenia:**
  - `onSubmit` - zapisanie zmian (walidacja + API call)
  - `onCancel` - anulowanie edycji (zamknięcie modala)
  - `onInputChange` - zmiana wartości pól (walidacja inline)

- **Obsługiwana walidacja:**
  - Pytanie: wymagane, 2-10000 znaków (zgodnie z API)
  - Poprawna odpowiedź: wymagana, max 500 znaków (zgodnie z API)
  - URL obrazka: opcjonalne, jeśli podane - musi być poprawnym URL (walidacja formatu URL)
  - Komunikaty błędów wyświetlane inline pod odpowiednimi polami

- **Typy:**
  - Props: `FlashcardModalProps`
  - State: lokalny stan formularza z walidacją

- **Props:**
  ```typescript
  interface FlashcardModalProps {
    flashcard: FlashcardResponse | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: UpdateFlashcardRequest) => Promise<void>;
  }
  ```

### DeleteConfirmDialog

- **Opis komponentu:** Dialog potwierdzenia usunięcia (fiszki lub talii). Wyświetla ostrzeżenie i przyciski potwierdzenia/anulowania.

- **Główne elementy:**
  - Dialog (Shadcn/ui) - kontener dialogu
  - DialogContent - zawartość dialogu
  - DialogHeader - nagłówek z tytułem
  - DialogDescription - opis akcji
  - DialogFooter - stopka z przyciskami
  - Button[] - przyciski "Usuń" i "Anuluj"

- **Obsługiwane zdarzenia:**
  - `onConfirm` - potwierdzenie usunięcia
  - `onCancel` - anulowanie (zamknięcie dialogu)

- **Obsługiwana walidacja:**
  - Brak walidacji (tylko potwierdzenie)

- **Typy:**
  - Props: `DeleteConfirmDialogProps`

- **Props:**
  ```typescript
  interface DeleteConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
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

- **UpdateFlashcardRequest** - żądanie aktualizacji fiszki
  ```typescript
  type UpdateFlashcardRequest = Omit<
    TablesUpdate<'flashcards'>,
    'id' | 'created_at' | 'updated_at'
  >;
  // Może zawierać: question, correct_answer, image_url
  ```

- **UpdateDeckRequest** - żądanie aktualizacji talii
  ```typescript
  interface UpdateDeckRequest {
    name: string;
  }
  ```

### Niestandardowe typy ViewModel

- **FlashcardStatusFilter** - filtr statusu fiszek
  ```typescript
  type FlashcardStatusFilter = 'all' | 'learning' | 'mastered';
  ```

- **DeckViewState** - stan głównego komponentu widoku
  ```typescript
  interface DeckViewState {
    deck: DeckResponse | null;
    flashcards: FlashcardResponse[];
    filteredFlashcards: FlashcardResponse[];
    statusFilter: FlashcardStatusFilter;
    isLoading: boolean;
    isDeckLoading: boolean;
    error: string | null;
    selectedFlashcard: FlashcardResponse | null;
    isEditModalOpen: boolean;
    isDeleteDialogOpen: boolean;
    deleteTarget: 'deck' | 'flashcard' | null;
    deleteTargetId: number | null;
  }
  ```

- **FlashcardCardViewModel** - model widoku karty fiszki (rozszerza FlashcardResponse)
  ```typescript
  interface FlashcardCardViewModel extends FlashcardResponse {
    isExpanded: boolean; // czy pytanie jest rozwinięte
    questionPreview: string; // skrócona wersja pytania (np. pierwsze 100 znaków)
  }
  ```

- **DeckStats** - statystyki talii
  ```typescript
  interface DeckStats {
    totalCount: number; // całkowita liczba fiszek
    learningCount: number; // liczba fiszek w trakcie nauki
    masteredCount: number; // liczba opanowanych fiszek
    dueCount: number; // liczba fiszek do powtórki (due_date <= now() && status === 'learning')
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

- **useMutation dla aktualizacji fiszki:**
  ```typescript
  const updateFlashcardMutation = useMutation({
    mutationFn: (data: UpdateFlashcardRequest) => updateFlashcard(flashcardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['flashcards', deckId]);
      toast.success('Fiszka została zaktualizowana');
    },
    onError: (error) => {
      toast.error('Błąd podczas aktualizacji fiszki');
    },
  });
  ```

- **useMutation dla usunięcia fiszki:**
  ```typescript
  const deleteFlashcardMutation = useMutation({
    mutationFn: (flashcardId: number) => deleteFlashcard(flashcardId),
    onSuccess: () => {
      queryClient.invalidateQueries(['flashcards', deckId]);
      queryClient.invalidateQueries(['deck', deckId]); // odświeżenie statystyk
      toast.success('Fiszka została usunięta');
    },
    onError: (error) => {
      toast.error('Błąd podczas usuwania fiszki');
    },
  });
  ```

- **useMutation dla aktualizacji talii:**
  ```typescript
  const updateDeckMutation = useMutation({
    mutationFn: (data: UpdateDeckRequest) => updateDeck(deckId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['deck', deckId]);
      toast.success('Nazwa talii została zaktualizowana');
    },
  });
  ```

- **useMutation dla usunięcia talii:**
  ```typescript
  const deleteDeckMutation = useMutation({
    mutationFn: (deckId: number) => deleteDeck(deckId),
    onSuccess: () => {
      queryClient.invalidateQueries(['decks']);
      router.push('/'); // przekierowanie na dashboard
      toast.success('Talia została usunięta');
    },
  });
  ```

### Lokalny stan (useState)

- **Stan modali i dialogów:**
  ```typescript
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardResponse | null>(null);
  ```

- **Stan filtra:**
  ```typescript
  const [statusFilter, setStatusFilter] = useState<FlashcardStatusFilter>('all');
  ```

- **Stan rozwinięcia kart fiszek:**
  ```typescript
  const [expandedFlashcards, setExpandedFlashcards] = useState<Set<number>>(new Set());
  ```

### Custom Hook (opcjonalnie)

Jeśli logika stanie się zbyt złożona, można utworzyć custom hook `useDeckView`:

```typescript
function useDeckView(deckId: number) {
  // Wszystkie query i mutations
  // Logika filtrowania
  // Obsługa modali
  // Zwraca: { deck, flashcards, filteredFlashcards, handlers, ... }
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
  - `404` - Przekierowanie na dashboard z toast notification

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

#### Aktualizacja fiszki
- **Method:** `PATCH`
- **Path:** `/rest/v1/flashcards?id=eq.{flashcard_id}`
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`, `Prefer: return=representation`
- **Request Body:** `UpdateFlashcardRequest`
- **Response:** `FlashcardResponse[]` (tablica z zaktualizowaną fiszką)
- **Obsługa błędów:**
  - `400` - Wyświetlenie błędów walidacji inline w formularzu
  - `401` - Przekierowanie na `/login`
  - `404` - Toast notification "Fiszka nie została znaleziona"

#### Usunięcie fiszki
- **Method:** `DELETE`
- **Path:** `/rest/v1/flashcards?id=eq.{flashcard_id}`
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Response:** `204 No Content`
- **Obsługa błędów:**
  - `401` - Przekierowanie na `/login`
  - `404` - Toast notification "Fiszka nie została znaleziona"

#### Aktualizacja talii
- **Method:** `PATCH`
- **Path:** `/rest/v1/decks?id=eq.{deck_id}`
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`, `Prefer: return=representation`
- **Request Body:** `UpdateDeckRequest`
- **Response:** `DeckResponse[]` (tablica z zaktualizowaną talią)
- **Obsługa błędów:**
  - `400` - Wyświetlenie błędów walidacji inline
  - `401` - Przekierowanie na `/login`
  - `404` - Toast notification "Talia nie została znaleziona"

#### Usunięcie talii
- **Method:** `DELETE`
- **Path:** `/rest/v1/decks?id=eq.{deck_id}`
- **Headers:** `Authorization: Bearer {access_token}`, `apikey: {anon_key}`
- **Response:** `204 No Content`
- **Obsługa błędów:**
  - `401` - Przekierowanie na `/login`
  - `404` - Toast notification "Talia nie została znaleziona"

### Funkcje pomocnicze API

```typescript
// src/lib/api/deck.ts
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
  
  if (statusFilter === 'learning') {
    query = query.eq('status', 'learning');
  } else if (statusFilter === 'mastered') {
    query = query.eq('status', 'mastered');
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateFlashcard(
  flashcardId: number,
  data: UpdateFlashcardRequest
): Promise<FlashcardResponse> {
  const { data: updated, error } = await supabase
    .from('flashcards')
    .update(data)
    .eq('id', flashcardId)
    .select()
    .single();
  
  if (error) throw error;
  return updated;
}

export async function deleteFlashcard(flashcardId: number): Promise<void> {
  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', flashcardId);
  
  if (error) throw error;
}

export async function updateDeck(
  deckId: number,
  data: UpdateDeckRequest
): Promise<DeckResponse> {
  const { data: updated, error } = await supabase
    .from('decks')
    .update(data)
    .eq('id', deckId)
    .select()
    .single();
  
  if (error) throw error;
  return updated;
}

export async function deleteDeck(deckId: number): Promise<void> {
  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId);
  
  if (error) throw error;
}

// Obliczanie liczby fiszek do powtórki
export async function getDueFlashcardsCount(deckId: number): Promise<number> {
  const now = new Date().toISOString();
  const { count, error } = await supabase
    .from('flashcards')
    .select('*', { count: 'exact', head: true })
    .eq('deck_id', deckId)
    .eq('status', 'learning')
    .lte('due_date', now);
  
  if (error) throw error;
  return count || 0;
}
```

## 8. Interakcje użytkownika

### Przeglądanie listy fiszek

1. **Wejście na widok:**
   - Użytkownik klika na kartę talii w dashboardzie lub wchodzi bezpośrednio na `/deck/[id]`
   - Widok ładuje dane talii i fiszek (skeleton loaders)
   - Po załadowaniu wyświetla się lista fiszek

2. **Filtrowanie po statusie:**
   - Użytkownik wybiera filtr z dropdown (Wszystkie/W trakcie nauki/Opanowane)
   - Lista fiszek jest natychmiast filtrowana (bez przeładowania strony)
   - URL może być zaktualizowany z parametrem query (`?status=learning`)

3. **Rozwinięcie pytania:**
   - Użytkownik klika na pytanie w karcie fiszki
   - Pytanie rozwija się pokazując pełny tekst
   - Możliwość ponownego kliknięcia aby zwinąć

### Edycja fiszki

1. **Otwarcie modalu edycji:**
   - Użytkownik klika przycisk "Edytuj" przy fiszce
   - Otwiera się modal z formularzem wypełnionym aktualnymi danymi

2. **Edycja pól:**
   - Użytkownik modyfikuje pytanie, odpowiedź lub URL obrazka
   - Walidacja inline pod polami (w czasie rzeczywistym)
   - Przycisk "Zapisz zmiany" aktywny tylko gdy formularz jest poprawny

3. **Zapis zmian:**
   - Użytkownik klika "Zapisz zmiany"
   - Wyświetla się spinner podczas zapisu
   - Po sukcesie: modal zamyka się, lista odświeża się, toast notification "Fiszka została zaktualizowana"
   - Po błędzie: komunikaty błędów wyświetlane inline w formularzu

### Usunięcie fiszki

1. **Inicjacja usunięcia:**
   - Użytkownik klika przycisk "Usuń" przy fiszce
   - Otwiera się dialog potwierdzenia z ostrzeżeniem

2. **Potwierdzenie:**
   - Użytkownik klika "Usuń" w dialogu
   - Wyświetla się spinner podczas usuwania
   - Po sukcesie: dialog zamyka się, fiszka znika z listy, toast notification "Fiszka została usunięta"
   - Po błędzie: dialog pozostaje otwarty, toast notification z błędem

### Zarządzanie talią

1. **Edycja nazwy talii:**
   - Użytkownik klika przycisk "Edytuj talię" lub klika na nazwę talii (jeśli edytowalna inline)
   - Otwiera się modal z polem nazwy
   - Użytkownik wprowadza nową nazwę i zapisuje
   - Nazwa talii aktualizuje się w nagłówku i breadcrumbs

2. **Usunięcie talii:**
   - Użytkownik klika przycisk "Usuń talię"
   - Otwiera się dialog potwierdzenia z ostrzeżeniem o usunięciu wszystkich fiszek
   - Po potwierdzeniu: talia i wszystkie fiszki są usuwane, przekierowanie na dashboard, toast notification "Talia została usunięta"

### Dostęp do trybów nauki

1. **Rozpoczęcie powtórki:**
   - Użytkownik klika przycisk "Rozpocznij powtórkę"
   - Sprawdzenie, czy są fiszki do powtórki (due_date <= now() && status === 'learning')
   - Jeśli są: przekierowanie do `/deck/[id]/review`
   - Jeśli nie ma: przycisk nieaktywny (disabled) z tooltipem "Brak fiszek do powtórki"

2. **Tryb nauki:**
   - Użytkownik klika przycisk "Tryb nauki"
   - Przekierowanie do `/deck/[id]/study`

3. **Dodanie fiszki:**
   - Użytkownik klika przycisk "Dodaj fiszkę"
   - Otwiera się modal dodawania fiszki (komponent ManualFlashcardForm - zobacz widok 11 w ui-plan.md)
   - Po zapisaniu: lista odświeża się z nową fiszką

## 9. Warunki i walidacja

### Warunki weryfikowane przez interfejs

#### Walidacja przed wyświetleniem widoku

1. **Autoryzacja użytkownika:**
   - Sprawdzenie sesji w middleware Astro
   - Jeśli brak sesji → przekierowanie na `/login?redirect=/deck/[id]`

2. **Istnienie talii:**
   - Sprawdzenie, czy talia o podanym ID istnieje
   - Jeśli nie istnieje → przekierowanie na dashboard z toast notification "Talia nie została znaleziona"

3. **Własność talii:**
   - Sprawdzenie, czy talia należy do zalogowanego użytkownika (RLS w Supabase)
   - Jeśli nie → przekierowanie na dashboard z toast notification "Brak dostępu do tej talii"

#### Walidacja formularza edycji fiszki

1. **Pytanie:**
   - Wymagane: tak
   - Długość: 2-10000 znaków
   - Komunikat błędu: "Pytanie musi zawierać od 2 do 10000 znaków"
   - Walidacja: w czasie rzeczywistym podczas wpisywania

2. **Poprawna odpowiedź:**
   - Wymagane: tak
   - Długość: max 500 znaków
   - Komunikat błędu: "Odpowiedź nie może przekraczać 500 znaków"
   - Walidacja: w czasie rzeczywistym podczas wpisywania

3. **URL obrazka:**
   - Wymagane: nie (opcjonalne)
   - Format: poprawny URL (walidacja regex lub URL constructor)
   - Komunikat błędu: "Nieprawidłowy format URL"
   - Walidacja: w czasie rzeczywistym podczas wpisywania

#### Walidacja formularza edycji talii

1. **Nazwa talii:**
   - Wymagane: tak
   - Długość: 1-255 znaków
   - Komunikat błędu: "Nazwa talii musi zawierać od 1 do 255 znaków"
   - Walidacja: przed zapisaniem

#### Warunki wpływające na stan interfejsu

1. **Przycisk "Rozpocznij powtórkę":**
   - Aktywny: gdy `dueCount > 0` (są fiszki do powtórki)
   - Nieaktywny: gdy `dueCount === 0` (brak fiszek do powtórki)
   - Tooltip: "Brak fiszek do powtórki" (gdy nieaktywny)

2. **Filtr statusu:**
   - Wpływa na wyświetlaną listę fiszek
   - Aktualizuje `filteredFlashcards` w stanie

3. **Empty state:**
   - Wyświetlany gdy `flashcards.length === 0`
   - Komunikat: "Ta talia jest pusta. Dodaj fiszki lub wygeneruj je z tekstu."

4. **Skeleton loaders:**
   - Wyświetlane podczas `isLoading === true`
   - Zastępowane listą fiszek po załadowaniu

## 10. Obsługa błędów

### Scenariusze błędów i ich obsługa

#### Błędy ładowania danych

1. **Błąd pobierania talii:**
   - **Scenariusz:** API zwraca 404 lub 500 podczas pobierania talii
   - **Obsługa:**
     - Toast notification: "Nie udało się załadować talii. Spróbuj ponownie."
     - Przycisk "Spróbuj ponownie" w widoku błędu
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
     - Przekierowanie na `/login?redirect=/deck/[id]`
     - Toast notification: "Sesja wygasła. Zaloguj się ponownie."

#### Błędy operacji CRUD

1. **Błąd aktualizacji fiszki:**
   - **Scenariusz:** API zwraca 400 (walidacja) lub 500 podczas aktualizacji
   - **Obsługa:**
     - Dla 400: komunikaty błędów wyświetlane inline pod odpowiednimi polami w formularzu
     - Dla 500: toast notification "Wystąpił błąd podczas aktualizacji fiszki. Spróbuj ponownie."
     - Modal pozostaje otwarty, użytkownik może poprawić dane i spróbować ponownie

2. **Błąd usunięcia fiszki:**
   - **Scenariusz:** API zwraca 404 lub 500 podczas usuwania
   - **Obsługa:**
     - Toast notification: "Nie udało się usunąć fiszki. Spróbuj ponownie."
     - Dialog zamyka się, fiszka pozostaje na liście
     - Możliwość ponowienia operacji

3. **Błąd aktualizacji talii:**
   - **Scenariusz:** API zwraca 400 (walidacja) lub 500 podczas aktualizacji nazwy
   - **Obsługa:**
     - Dla 400: komunikat błędu wyświetlany inline pod polem nazwy
     - Dla 500: toast notification "Nie udało się zaktualizować nazwy talii. Spróbuj ponownie."
     - Możliwość ponowienia operacji

4. **Błąd usunięcia talii:**
   - **Scenariusz:** API zwraca 404 lub 500 podczas usuwania
   - **Obsługa:**
     - Toast notification: "Nie udało się usunąć talii. Spróbuj ponownie."
     - Dialog pozostaje otwarty, możliwość ponowienia operacji

#### Błędy sieci

1. **Brak połączenia z internetem:**
   - **Scenariusz:** Request fails z powodu braku połączenia
   - **Obsługa:**
     - Toast notification: "Brak połączenia z internetem. Sprawdź swoje połączenie."
     - React Query automatycznie retry po przywróceniu połączenia

2. **Timeout:**
   - **Scenariusz:** Request przekracza limit czasu
   - **Obsługa:**
     - Toast notification: "Żądanie trwa zbyt długo. Spróbuj ponownie."
     - Możliwość ręcznego ponowienia

#### Przypadki brzegowe

1. **Talia została usunięta przez innego użytkownika:**
   - **Scenariusz:** Podczas edycji talia zostaje usunięta
   - **Obsługa:**
     - Toast notification: "Talia została usunięta."
     - Przekierowanie na dashboard

2. **Fiszka została usunięta przez innego użytkownika:**
   - **Scenariusz:** Podczas edycji fiszka zostaje usunięta
   - **Obsługa:**
     - Toast notification: "Fiszka została usunięta."
     - Modal zamyka się, lista odświeża się

3. **Równoczesna edycja:**
   - **Scenariusz:** Dwa okna przeglądarki edytują tę samą fiszkę
   - **Obsługa:**
     - Ostatnia zmiana wygrywa (standardowe zachowanie API)
     - Toast notification przy zapisie: "Fiszka została zaktualizowana przez innego użytkownika. Odśwież stronę, aby zobaczyć najnowsze zmiany."

## 11. Kroki implementacji

### Faza 1: Podstawowa struktura i routing

1. **Utworzenie strony Astro:**
   - Utworzenie pliku `src/pages/deck/[id].astro`
   - Konfiguracja dynamicznego routingu
   - Dodanie middleware autoryzacji
   - Podstawowy layout z Topbar

2. **Utworzenie głównego komponentu React:**
   - Utworzenie `src/components/deck/DeckView.tsx`
   - Podstawowa struktura komponentu z placeholderami
   - Integracja z React Query (QueryClient setup)

3. **Routing i przekierowania:**
   - Obsługa parametru `id` z URL
   - Walidacja parametru (musi być liczbą)
   - Przekierowania dla błędów autoryzacji

### Faza 2: Pobieranie i wyświetlanie danych

4. **Funkcje API:**
   - Utworzenie `src/lib/api/deck.ts` z funkcjami:
     - `fetchDeck`
     - `fetchFlashcards`
     - `getDueFlashcardsCount`
   - Integracja z Supabase client

5. **Komponenty wyświetlania:**
   - Utworzenie `DeckHeader.tsx` - nagłówek z informacjami o talii
   - Utworzenie `FlashcardList.tsx` - lista fiszek
   - Utworzenie `FlashcardCard.tsx` - karta pojedynczej fiszki
   - Dodanie skeleton loaders podczas ładowania

6. **Integracja z React Query:**
   - Użycie `useQuery` dla talii i fiszek
   - Obsługa stanów ładowania i błędów
   - Cache'owanie danych

### Faza 3: Filtrowanie i empty state

7. **Komponent filtrowania:**
   - Utworzenie `FlashcardFilters.tsx`
   - Implementacja dropdown z opcjami: Wszystkie/W trakcie nauki/Opanowane
   - Logika filtrowania w komponencie głównym

8. **Empty state:**
   - Utworzenie komponentu `EmptyState.tsx` lub użycie istniejącego
   - Wyświetlanie gdy brak fiszek
   - Komunikat z CTA do dodania fiszek

9. **Breadcrumbs:**
   - Dodanie komponentu Breadcrumb (Shadcn/ui)
   - Nawigacja: Dashboard > [Nazwa talii]

### Faza 4: Edycja fiszki

10. **Modal edycji:**
    - Utworzenie `FlashcardModal.tsx`
    - Formularz z polami: pytanie, odpowiedź, URL obrazka
    - Walidacja inline (użycie react-hook-form lub własna walidacja)

11. **Funkcje API dla edycji:**
    - Dodanie `updateFlashcard` do `src/lib/api/deck.ts`
    - Integracja z React Query `useMutation`

12. **Integracja modalu:**
    - Połączenie modalu z komponentem głównym
    - Obsługa otwierania/zamykania
    - Obsługa zapisu zmian z walidacją

### Faza 5: Usuwanie fiszek

13. **Dialog potwierdzenia:**
    - Utworzenie `DeleteConfirmDialog.tsx`
    - Komponent dialogu z Shadcn/ui
    - Obsługa potwierdzenia i anulowania

14. **Funkcje API dla usuwania:**
    - Dodanie `deleteFlashcard` do `src/lib/api/deck.ts`
    - Integracja z React Query `useMutation`

15. **Integracja usuwania:**
    - Połączenie dialogu z komponentem głównym
    - Obsługa usuwania z potwierdzeniem
    - Odświeżanie listy po usunięciu

### Faza 6: Zarządzanie talią

16. **Edycja nazwy talii:**
    - Dodanie funkcji `updateDeck` do API
    - Implementacja edycji inline lub przez modal
    - Aktualizacja breadcrumbs po zmianie nazwy

17. **Usunięcie talii:**
    - Dodanie funkcji `deleteDeck` do API
    - Dialog potwierdzenia z ostrzeżeniem
    - Przekierowanie na dashboard po usunięciu

### Faza 7: Przyciski akcji i nawigacja

18. **Przyciski główne:**
    - Implementacja przycisku "Rozpocznij powtórkę" (z warunkiem aktywności)
    - Implementacja przycisku "Tryb nauki"
    - Implementacja przycisku "Dodaj fiszkę" (otwarcie modalu - widok 11)
    - Implementacja przycisków "Edytuj talię" i "Usuń talię"

19. **Nawigacja:**
    - Przekierowania do `/deck/[id]/review` i `/deck/[id]/study`
    - Obsługa warunku dla przycisku "Rozpocznij powtórkę" (sprawdzenie dueCount)

### Faza 8: Obsługa błędów i przypadki brzegowe

20. **Obsługa błędów API:**
    - Toast notifications dla wszystkich błędów
    - Przekierowania dla błędów autoryzacji
    - Komunikaty błędów inline w formularzach

21. **Przypadki brzegowe:**
    - Obsługa pustej talii
    - Obsługa braku fiszek do powtórki
    - Obsługa błędów sieci i timeoutów
    - Obsługa równoczesnej edycji

### Faza 9: Dostępność i optymalizacja

22. **Dostępność (WCAG AA):**
    - Semantyczny HTML (`<main>`, `<section>`, `<article>`, `<ul>`, `<li>`)
    - ARIA labels dla przycisków i formularzy
    - Keyboard navigation (Tab, Enter, Escape)
    - Focus trap w modalach
    - aria-live regions dla dynamicznych aktualizacji

23. **Optymalizacja:**
    - Lazy loading komponentów (jeśli potrzebne)
    - Memoization komponentów (React.memo)
    - Optymalizacja zapytań React Query (staleTime, cacheTime)

### Faza 10: Testowanie i poprawki

24. **Testowanie funkcjonalności:**
    - Testowanie wszystkich interakcji użytkownika
    - Testowanie walidacji formularzy
    - Testowanie obsługi błędów
    - Testowanie przypadków brzegowych

25. **Testowanie dostępności:**
    - Testowanie z screen readerem
    - Testowanie nawigacji klawiaturą
    - Testowanie kontrastów kolorów

26. **Poprawki i optymalizacje:**
    - Naprawa znalezionych błędów
    - Optymalizacja wydajności
    - Poprawki UX na podstawie testów

