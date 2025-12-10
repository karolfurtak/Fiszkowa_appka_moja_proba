# Plan implementacji widoku Dashboard

## 1. Przegląd

Dashboard (`/`) jest głównym punktem wejścia użytkownika do aplikacji 10xCards. Widok ten pełni funkcję centralnego hubu, z którego użytkownik może przeglądać wszystkie swoje talie, szybko identyfikować talie z fiszkami wymagającymi powtórki oraz uzyskać dostęp do kluczowych funkcjonalności aplikacji: generowania fiszek, tworzenia nowych talii i rozpoczęcia sesji nauki.

Głównym celem widoku jest minimalizacja czasu potrzebnego na znalezienie odpowiedniej talii do nauki oraz zapewnienie intuicyjnego dostępu do wszystkich funkcji aplikacji. Dashboard realizuje historyjkę użytkownika US-006 (Widok pulpitu z taliami) oraz wspiera przepływ nauki poprzez wyraźne wyróżnienie liczby fiszek do powtórki.

## 2. Routing widoku

**Ścieżka:** `/`

**Plik implementacji:** `src/pages/index.astro`

**Ochrona:** Widok wymaga autoryzacji. Użytkownicy nieautoryzowani powinni być przekierowani na `/login?redirect=/` przez middleware autoryzacji.

**Layout:** Widok używa wspólnego layoutu z komponentem `Topbar` (Navigation Menu od Shadcn/ui) na górze strony.

## 3. Struktura komponentów

```
Dashboard (index.astro)
├── Topbar (komponent layoutu)
├── DashboardView (React - główny komponent interaktywny)
│   ├── DashboardHeader
│   │   ├── SearchBar
│   │   └── ActionButtons (Nowa talia, Generuj fiszki)
│   ├── DecksGrid (lub DecksList na mobile)
│   │   └── DeckCard[] (dla każdej talii)
│   │       ├── DeckInfo (nazwa, statystyki)
│   │       ├── DeckActions (Rozpocznij powtórkę, Tryb nauki)
│   │       └── DeckMenu (DropdownMenu - edytuj, usuń)
│   └── EmptyState (gdy brak talii)
└── Footer (opcjonalnie)
```

## 4. Szczegóły komponentów

### DashboardView

**Opis komponentu:** Główny komponent React odpowiedzialny za zarządzanie stanem widoku Dashboard, pobieranie danych o taliach oraz renderowanie wszystkich sekcji widoku. Komponent koordynuje interakcje między wyszukiwarką, kartami talii i akcjami użytkownika.

**Główne elementy:**
- `<main>` - główny kontener z semantycznym HTML
- `<section>` - sekcja nagłówka z wyszukiwarką i przyciskami akcji
- `<section>` - sekcja z siatką kart talii (`grid` layout)
- `<section>` - sekcja empty state (warunkowo renderowana)

**Obsługiwane interakcje:**
- Wyszukiwanie talii w czasie rzeczywistym (filtrowanie po nazwie)
- Tworzenie nowej talii (otwarcie modala/dialogu)
- Przekierowanie do generatora fiszek (`/generate`)
- Nawigacja do widoku talii (`/deck/[id]`)
- Rozpoczęcie sesji treningowej (`/deck/[id]/review`)
- Przejście do trybu nauki (`/deck/[id]/study`)
- Edycja nazwy talii (modal/dialog)
- Usunięcie talii (z potwierdzeniem)

**Obsługiwana walidacja:**
- Sprawdzenie autoryzacji użytkownika przed pobraniem danych
- Walidacja nazwy talii przy tworzeniu/edycji (wymagane, max 200 znaków)
- Sprawdzenie czy talia ma fiszki do powtórki przed aktywacją przycisku "Rozpocznij powtórkę"

**Typy:**
- `DeckWithCountResponse` - typ odpowiedzi API z informacją o liczbie fiszek
- `DeckViewModel` - rozszerzony typ dla widoku z obliczoną liczbą fiszek do powtórki
- `DashboardState` - typ stanu komponentu

**Propsy:**
- Brak propsów (komponent pobiera dane bezpośrednio z API)

### DashboardHeader

**Opis komponentu:** Sekcja nagłówkowa Dashboard zawierająca wyszukiwarkę talii oraz główne przyciski akcji ("Nowa talia", "Generuj fiszki"). Komponent zapewnia szybki dostęp do kluczowych funkcjonalności aplikacji.

**Główne elementy:**
- `<div>` - kontener flex z wyrównaniem elementów
- `SearchBar` - komponent wyszukiwarki
- `Button[]` - przyciski akcji

**Obsługiwane interakcje:**
- Wprowadzanie tekstu wyszukiwania (onChange)
- Kliknięcie przycisku "Nowa talia" (otwarcie modala tworzenia talii)
- Kliknięcie przycisku "Generuj fiszki" (nawigacja do `/generate`)

**Obsługiwana walidacja:**
- Brak walidacji (komponent prezentacyjny)

**Typy:**
- `SearchBarProps` - props dla SearchBar (searchQuery, onSearchChange)
- Brak własnych typów ViewModel

**Propsy:**
- `searchQuery: string` - aktualne zapytanie wyszukiwania
- `onSearchChange: (query: string) => void` - callback zmiany zapytania
- `onCreateDeck: () => void` - callback tworzenia nowej talii
- `onGenerateFlashcards: () => void` - callback przejścia do generatora

### SearchBar

**Opis komponentu:** Komponent wyszukiwarki umożliwiający filtrowanie talii po nazwie w czasie rzeczywistym. Komponent używa komponentu `Input` z Shadcn/ui z ikoną wyszukiwania.

**Główne elementy:**
- `<div>` - kontener z pozycjonowaniem względnym
- `Input` (Shadcn/ui) - pole tekstowe wyszukiwania
- Ikona wyszukiwania (lucide-react lub podobna)

**Obsługiwane interakcje:**
- Wprowadzanie tekstu (onChange)
- Wyczyszczenie wyszukiwania (przycisk X lub Escape)
- Focus/blur pola wyszukiwania

**Obsługiwana walidacja:**
- Brak walidacji (filtrowanie po stronie klienta)

**Typy:**
- Brak własnych typów (używa standardowego `string` dla wartości)

**Propsy:**
- `value: string` - aktualna wartość wyszukiwania
- `onChange: (value: string) => void` - callback zmiany wartości
- `placeholder?: string` - opcjonalny placeholder (domyślnie: "Wyszukaj talie")

### DecksGrid

**Opis komponentu:** Kontener renderujący siatkę kart talii. Komponent używa CSS Grid layout z responsywnym dostosowaniem (grid na desktop, lista na mobile). Wyświetla skeleton loaders podczas ładowania danych.

**Główne elementy:**
- `<div>` - kontener grid z klasami Tailwind CSS
- `DeckCard[]` - karty talii
- `Skeleton` (Shadcn/ui) - placeholdery podczas ładowania

**Obsługiwane interakcje:**
- Renderowanie kart talii w siatce
- Wyświetlanie skeleton loaders podczas ładowania
- Renderowanie empty state gdy brak talii

**Obsługiwana walidacja:**
- Sprawdzenie czy lista talii jest pusta

**Typy:**
- `DeckViewModel[]` - tablica talii do wyświetlenia

**Propsy:**
- `decks: DeckViewModel[]` - lista talii do wyświetlenia
- `isLoading: boolean` - flaga stanu ładowania
- `searchQuery: string` - zapytanie wyszukiwania do filtrowania

### DeckCard

**Opis komponentu:** Karta talii wyświetlająca podstawowe informacje o talii (nazwa, statystyki) oraz przyciski akcji. Karta jest klikalna i prowadzi do widoku talii. Wyróżnia wizualnie liczbę fiszek do powtórki.

**Główne elementy:**
- `Card` (Shadcn/ui) - kontener karty
- `<div>` - sekcja z nazwą talii i statystykami
- `Badge` (Shadcn/ui) - badge z liczbą fiszek do powtórki (wyróżniony kolorem)
- `<div>` - sekcja z przyciskami akcji
- `Button[]` (Shadcn/ui) - przyciski "Rozpocznij powtórkę", "Tryb nauki"
- `DropdownMenu` (Shadcn/ui) - menu kontekstowe z opcjami edycji i usunięcia

**Obsługiwane interakcje:**
- Kliknięcie na kartę (nawigacja do `/deck/[id]`)
- Kliknięcie przycisku "Rozpocznij powtórkę" (nawigacja do `/deck/[id]/review`)
- Kliknięcie przycisku "Tryb nauki" (nawigacja do `/deck/[id]/study`)
- Otwarcie menu kontekstowego (DropdownMenu)
- Kliknięcie "Edytuj" w menu (otwarcie modala edycji)
- Kliknięcie "Usuń" w menu (otwarcie dialogu potwierdzenia)

**Obsługiwana walidacja:**
- Sprawdzenie czy `dueCount > 0` przed aktywacją przycisku "Rozpocznij powtórkę"
- Jeśli `dueCount === 0`, przycisk powinien być nieaktywny (disabled) z tooltipem: "Brak fiszek do powtórki"

**Typy:**
- `DeckViewModel` - typ talii z obliczoną liczbą fiszek do powtórki

**Propsy:**
- `deck: DeckViewModel` - dane talii do wyświetlenia
- `onClick: () => void` - callback kliknięcia na kartę
- `onStartReview: () => void` - callback rozpoczęcia powtórki
- `onStartStudy: () => void` - callback rozpoczęcia trybu nauki
- `onEdit: () => void` - callback edycji talii
- `onDelete: () => void` - callback usunięcia talii

### EmptyState

**Opis komponentu:** Komponent wyświetlany gdy użytkownik nie ma żadnych talii. Zawiera komunikat powitalny oraz przyciski CTA zachęcające do utworzenia pierwszej talii lub wygenerowania fiszek.

**Główne elementy:**
- `<div>` - kontener z wyśrodkowaniem i paddingiem
- `<h2>` - nagłówek z komunikatem powitalnym
- `<p>` - opis tekstowy
- `Button[]` (Shadcn/ui) - przyciski CTA ("Utwórz pierwszą talię", "Wygeneruj fiszki")

**Obsługiwane interakcje:**
- Kliknięcie przycisku "Utwórz pierwszą talię" (otwarcie modala tworzenia talii)
- Kliknięcie przycisku "Wygeneruj fiszki" (nawigacja do `/generate`)

**Obsługiwana walidacja:**
- Brak walidacji (komponent prezentacyjny)

**Typy:**
- Brak własnych typów

**Propsy:**
- `onCreateDeck: () => void` - callback tworzenia nowej talii
- `onGenerateFlashcards: () => void` - callback przejścia do generatora

### CreateDeckDialog

**Opis komponentu:** Modal/dialog (Dialog z Shadcn/ui) umożliwiający utworzenie nowej talii. Zawiera pole tekstowe na nazwę talii oraz przyciski "Utwórz" i "Anuluj".

**Główne elementy:**
- `Dialog` (Shadcn/ui) - kontener modala
- `DialogContent` (Shadcn/ui) - zawartość modala
- `DialogHeader` (Shadcn/ui) - nagłówek z tytułem
- `Input` (Shadcn/ui) - pole nazwy talii
- `Button[]` (Shadcn/ui) - przyciski akcji

**Obsługiwane interakcje:**
- Wprowadzanie nazwy talii (onChange)
- Kliknięcie przycisku "Utwórz" (walidacja i utworzenie talii)
- Kliknięcie przycisku "Anuluj" lub poza modalem (zamknięcie modala)
- Zamknięcie modala klawiszem Escape

**Obsługiwana walidacja:**
- Nazwa talii jest wymagana (nie może być pusta)
- Nazwa talii max 200 znaków (zgodnie z API)
- Wyświetlanie komunikatu błędu inline pod polem jeśli walidacja nie przejdzie

**Typy:**
- `CreateDeckRequest` - typ żądania utworzenia talii (z `src/types.ts`)

**Propsy:**
- `open: boolean` - flaga otwarcia modala
- `onOpenChange: (open: boolean) => void` - callback zmiany stanu otwarcia
- `onCreate: (name: string) => Promise<void>` - callback utworzenia talii

### EditDeckDialog

**Opis komponentu:** Modal/dialog umożliwiający edycję nazwy istniejącej talii. Podobny do CreateDeckDialog, ale z wstępnie wypełnionym polem nazwy.

**Główne elementy:**
- `Dialog` (Shadcn/ui) - kontener modala
- `DialogContent` (Shadcn/ui) - zawartość modala
- `DialogHeader` (Shadcn/ui) - nagłówek z tytułem
- `Input` (Shadcn/ui) - pole nazwy talii (z wartością początkową)
- `Button[]` (Shadcn/ui) - przyciski akcji

**Obsługiwane interakcje:**
- Wprowadzanie zmienionej nazwy talii (onChange)
- Kliknięcie przycisku "Zapisz" (walidacja i aktualizacja talii)
- Kliknięcie przycisku "Anuluj" lub poza modalem (zamknięcie modala)
- Zamknięcie modala klawiszem Escape

**Obsługiwana walidacja:**
- Nazwa talii jest wymagana (nie może być pusta)
- Nazwa talii max 200 znaków (zgodnie z API)
- Wyświetlanie komunikatu błędu inline pod polem jeśli walidacja nie przejdzie

**Typy:**
- `UpdateDeckRequest` - typ żądania aktualizacji talii (z `src/types.ts`)

**Propsy:**
- `open: boolean` - flaga otwarcia modala
- `onOpenChange: (open: boolean) => void` - callback zmiany stanu otwarcia
- `deck: DeckViewModel` - talia do edycji
- `onUpdate: (deckId: number, name: string) => Promise<void>` - callback aktualizacji talii

### DeleteDeckDialog

**Opis komponentu:** Modal/dialog potwierdzenia przed usunięciem talii. Zawiera ostrzeżenie o destrukcyjnej akcji oraz przyciski "Usuń" i "Anuluj".

**Główne elementy:**
- `Dialog` (Shadcn/ui) - kontener modala
- `DialogContent` (Shadcn/ui) - zawartość modala
- `DialogHeader` (Shadcn/ui) - nagłówek z tytułem
- `Alert` (Shadcn/ui) - alert z ostrzeżeniem
- `<p>` - komunikat ostrzegawczy
- `Button[]` (Shadcn/ui) - przyciski akcji (destrukcyjny styl dla "Usuń")

**Obsługiwane interakcje:**
- Kliknięcie przycisku "Usuń" (potwierdzenie i usunięcie talii)
- Kliknięcie przycisku "Anuluj" lub poza modalem (zamknięcie modala)
- Zamknięcie modala klawiszem Escape

**Obsługiwana walidacja:**
- Brak walidacji (tylko potwierdzenie użytkownika)

**Typy:**
- Brak własnych typów

**Propsy:**
- `open: boolean` - flaga otwarcia modala
- `onOpenChange: (open: boolean) => void` - callback zmiany stanu otwarcia
- `deck: DeckViewModel` - talia do usunięcia
- `onDelete: (deckId: number) => Promise<void>` - callback usunięcia talii

## 5. Typy

### DeckWithCountResponse

Typ odpowiedzi API dla talii z informacją o liczbie fiszek. Zdefiniowany w `src/types.ts`:

```typescript
export interface DeckWithCountResponse extends DeckResponse {
  flashcards: Array<{
    count: number;
  }>;
}
```

**Pola:**
- `id: number` - identyfikator talii
- `user_id: string` - identyfikator użytkownika (właściciela)
- `name: string` - nazwa talii
- `created_at: string` - data utworzenia (ISO 8601)
- `updated_at: string` - data ostatniej aktualizacji (ISO 8601)
- `flashcards: Array<{ count: number }>` - tablica z obiektem zawierającym całkowitą liczbę fiszek

### DeckViewModel

Rozszerzony typ dla widoku Dashboard zawierający dodatkowe obliczone pola potrzebne do wyświetlenia:

```typescript
export interface DeckViewModel extends DeckWithCountResponse {
  totalFlashcards: number;        // Całkowita liczba fiszek (z flashcards[0].count)
  dueFlashcards: number;           // Liczba fiszek do powtórki (obliczona z osobnego zapytania)
  hasDueFlashcards: boolean;       // Flaga czy talia ma fiszki do powtórki
}
```

**Pola:**
- Wszystkie pola z `DeckWithCountResponse`
- `totalFlashcards: number` - całkowita liczba fiszek w talii (wartość z `flashcards[0].count` lub `0` jeśli brak)
- `dueFlashcards: number` - liczba fiszek wymagających powtórki (fiszki z `due_date <= now()` i `status='learning'`)
- `hasDueFlashcards: boolean` - flaga pomocnicza (`dueFlashcards > 0`)

### DashboardState

Typ stanu komponentu DashboardView:

```typescript
export interface DashboardState {
  decks: DeckViewModel[];
  filteredDecks: DeckViewModel[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  createDeckDialogOpen: boolean;
  editDeckDialogOpen: boolean;
  deleteDeckDialogOpen: boolean;
  selectedDeck: DeckViewModel | null;
}
```

**Pola:**
- `decks: DeckViewModel[]` - lista wszystkich talii użytkownika
- `filteredDecks: DeckViewModel[]` - lista talii przefiltrowana według zapytania wyszukiwania
- `searchQuery: string` - aktualne zapytanie wyszukiwania
- `isLoading: boolean` - flaga stanu ładowania danych
- `error: string | null` - komunikat błędu (jeśli wystąpił)
- `createDeckDialogOpen: boolean` - flaga otwarcia modala tworzenia talii
- `editDeckDialogOpen: boolean` - flaga otwarcia modala edycji talii
- `deleteDeckDialogOpen: boolean` - flaga otwarcia modala usunięcia talii
- `selectedDeck: DeckViewModel | null` - wybrana talia do edycji/usunięcia

### CreateDeckRequest

Typ żądania utworzenia talii. Zdefiniowany w `src/types.ts`:

```typescript
export type CreateDeckRequest = Omit<TablesInsert<'decks'>, 'id' | 'created_at' | 'updated_at'>;
```

**Pola:**
- `user_id: string` - identyfikator użytkownika (wypełniany automatycznie z sesji)
- `name: string` - nazwa talii (wymagane, max 200 znaków)

### UpdateDeckRequest

Typ żądania aktualizacji talii. Zdefiniowany w `src/types.ts`:

```typescript
export interface UpdateDeckRequest {
  name: string;
}
```

**Pola:**
- `name: string` - nowa nazwa talii (wymagane, max 200 znaków)

## 6. Zarządzanie stanem

Widok Dashboard używa kombinacji React hooks oraz React Query (TanStack Query) do zarządzania stanem i cache'owania danych.

### React Hooks

**useState:**
- `searchQuery` - aktualne zapytanie wyszukiwania
- `createDeckDialogOpen` - stan otwarcia modala tworzenia talii
- `editDeckDialogOpen` - stan otwarcia modala edycji talii
- `deleteDeckDialogOpen` - stan otwarcia modala usunięcia talii
- `selectedDeck` - wybrana talia do edycji/usunięcia

**useMemo:**
- `filteredDecks` - przefiltrowana lista talii na podstawie `searchQuery` i `decks`

### React Query (TanStack Query)

**useQuery - pobieranie talii:**
```typescript
const { data: decks, isLoading, error, refetch } = useQuery({
  queryKey: ['decks', userId],
  queryFn: () => fetchDecksWithCounts(userId),
  enabled: !!userId,
  staleTime: 30000, // 30 sekund
});
```

**useQuery - pobieranie liczby fiszek do powtórki:**
Dla każdej talii osobne zapytanie lub jedno zapytanie dla wszystkich talii:
```typescript
const { data: dueCounts } = useQuery({
  queryKey: ['decks-due-counts', userId],
  queryFn: () => fetchDueFlashcardCounts(userId),
  enabled: !!userId,
  staleTime: 60000, // 1 minuta (dane zmieniają się rzadziej)
});
```

**useMutation - tworzenie talii:**
```typescript
const createDeckMutation = useMutation({
  mutationFn: (name: string) => createDeck(userId, name),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['decks', userId] });
    setCreateDeckDialogOpen(false);
    toast.success('Talia utworzona pomyślnie');
  },
  onError: (error) => {
    toast.error('Nie udało się utworzyć talii');
  },
});
```

**useMutation - aktualizacja talii:**
```typescript
const updateDeckMutation = useMutation({
  mutationFn: ({ deckId, name }: { deckId: number; name: string }) => 
    updateDeck(deckId, name),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['decks', userId] });
    setEditDeckDialogOpen(false);
    setSelectedDeck(null);
    toast.success('Talia zaktualizowana pomyślnie');
  },
  onError: (error) => {
    toast.error('Nie udało się zaktualizować talii');
  },
});
```

**useMutation - usunięcie talii:**
```typescript
const deleteDeckMutation = useMutation({
  mutationFn: (deckId: number) => deleteDeck(deckId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['decks', userId] });
    setDeleteDeckDialogOpen(false);
    setSelectedDeck(null);
    toast.success('Talia usunięta pomyślnie');
  },
  onError: (error) => {
    toast.error('Nie udało się usunąć talii');
  },
});
```

### Custom Hook: useDashboard

Opcjonalnie można stworzyć custom hook `useDashboard` do enkapsulacji logiki zarządzania stanem:

```typescript
export function useDashboard(userId: string) {
  // Queries
  const decksQuery = useQuery({ ... });
  const dueCountsQuery = useQuery({ ... });
  
  // Mutations
  const createDeckMutation = useMutation({ ... });
  const updateDeckMutation = useMutation({ ... });
  const deleteDeckMutation = useMutation({ ... });
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [createDeckDialogOpen, setCreateDeckDialogOpen] = useState(false);
  // ... pozostałe stany
  
  // Computed values
  const filteredDecks = useMemo(() => {
    // Filtrowanie i łączenie z dueCounts
  }, [decksQuery.data, dueCountsQuery.data, searchQuery]);
  
  return {
    decks: filteredDecks,
    isLoading: decksQuery.isLoading || dueCountsQuery.isLoading,
    error: decksQuery.error || dueCountsQuery.error,
    searchQuery,
    setSearchQuery,
    createDeckDialogOpen,
    setCreateDeckDialogOpen,
    // ... pozostałe wartości i funkcje
  };
}
```

## 7. Integracja API

### Pobieranie listy talii z liczbą fiszek

**Endpoint:** `GET /rest/v1/decks?user_id=eq.{user_id}&select=*,flashcards(count)`

**Typ żądania:** Brak (GET request)

**Typ odpowiedzi:** `DeckWithCountResponse[]`

**Implementacja:**
```typescript
async function fetchDecksWithCounts(userId: string): Promise<DeckWithCountResponse[]> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(
    `${supabaseUrl}/rest/v1/decks?user_id=eq.${userId}&select=*,flashcards(count)&order=created_at.desc`,
    {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch decks');
  }
  
  return response.json();
}
```

### Pobieranie liczby fiszek do powtórki

**Endpoint:** `GET /rest/v1/flashcards?deck_id=eq.{deck_id}&due_date=lte.{current_timestamp}&status=eq.learning&select=id`

**Typ żądania:** Brak (GET request)

**Typ odpowiedzi:** `Array<{ id: number }>` (lub można użyć `count` jeśli Supabase to obsługuje)

**Implementacja:**
```typescript
async function fetchDueFlashcardCounts(userId: string): Promise<Record<number, number>> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  // Najpierw pobierz wszystkie talie użytkownika
  const decksResponse = await fetch(
    `${supabaseUrl}/rest/v1/decks?user_id=eq.${userId}&select=id`,
    {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );
  
  const decks = await decksResponse.json();
  const deckIds = decks.map((d: { id: number }) => d.id);
  
  // Dla każdej talii pobierz liczbę fiszek do powtórki
  const now = new Date().toISOString();
  const counts: Record<number, number> = {};
  
  await Promise.all(
    deckIds.map(async (deckId: number) => {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/flashcards?deck_id=eq.${deckId}&due_date=lte.${now}&status=eq.learning&select=id`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
      
      const flashcards = await response.json();
      counts[deckId] = flashcards.length;
    })
  );
  
  return counts;
}
```

**Alternatywnie:** Można użyć jednego zapytania z filtrem dla wszystkich talii użytkownika (jeśli Supabase obsługuje złożone zapytania).

### Tworzenie nowej talii

**Endpoint:** `POST /rest/v1/decks`

**Typ żądania:** `CreateDeckRequest`

**Typ odpowiedzi:** `DeckResponse[]` (z `Prefer: return=representation`)

**Implementacja:**
```typescript
async function createDeck(userId: string, name: string): Promise<DeckResponse> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(`${supabaseUrl}/rest/v1/decks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${session.access_token}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      user_id: userId,
      name: name.trim(),
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create deck');
  }
  
  const data = await response.json();
  return data[0];
}
```

### Aktualizacja talii

**Endpoint:** `PATCH /rest/v1/decks?id=eq.{deck_id}`

**Typ żądania:** `UpdateDeckRequest`

**Typ odpowiedzi:** `DeckResponse[]` (z `Prefer: return=representation`)

**Implementacja:**
```typescript
async function updateDeck(deckId: number, name: string): Promise<DeckResponse> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(
    `${supabaseUrl}/rest/v1/decks?id=eq.${deckId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        name: name.trim(),
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update deck');
  }
  
  const data = await response.json();
  return data[0];
}
```

### Usunięcie talii

**Endpoint:** `DELETE /rest/v1/decks?id=eq.{deck_id}`

**Typ żądania:** Brak (DELETE request)

**Typ odpowiedzi:** `204 No Content`

**Implementacja:**
```typescript
async function deleteDeck(deckId: number): Promise<void> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(
    `${supabaseUrl}/rest/v1/decks?id=eq.${deckId}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete deck');
  }
}
```

## 8. Interakcje użytkownika

### Wyszukiwanie talii

**Akcja:** Użytkownik wprowadza tekst w polu wyszukiwania

**Obsługa:**
1. Wartość zapytania jest przechowywana w stanie `searchQuery`
2. Lista talii jest filtrowana w czasie rzeczywistym przez `useMemo` na podstawie `searchQuery`
3. Filtrowanie odbywa się po stronie klienta (case-insensitive, częściowe dopasowanie w nazwie talii)
4. Jeśli zapytanie jest puste, wyświetlane są wszystkie talie

**Rezultat:** Lista talii jest natychmiast aktualizowana, pokazując tylko talie pasujące do zapytania

### Tworzenie nowej talii

**Akcja:** Użytkownik klika przycisk "Nowa talia" w nagłówku Dashboard

**Obsługa:**
1. Otwiera się modal `CreateDeckDialog`
2. Użytkownik wprowadza nazwę talii
3. Po kliknięciu "Utwórz":
   - Walidacja nazwy (wymagane, max 200 znaków)
   - Jeśli walidacja przechodzi: wywołanie `createDeckMutation`
   - Po sukcesie: zamknięcie modala, odświeżenie listy talii (React Query invalidate), toast z komunikatem sukcesu
   - Po błędzie: wyświetlenie komunikatu błędu inline pod polem

**Rezultat:** Nowa talia pojawia się na liście, modal zamyka się, użytkownik widzi toast z potwierdzeniem

### Edycja nazwy talii

**Akcja:** Użytkownik klika "Edytuj" w menu kontekstowym karty talii

**Obsługa:**
1. Otwiera się modal `EditDeckDialog` z wstępnie wypełnioną nazwą talii
2. Użytkownik modyfikuje nazwę
3. Po kliknięciu "Zapisz":
   - Walidacja nazwy (wymagane, max 200 znaków)
   - Jeśli walidacja przechodzi: wywołanie `updateDeckMutation`
   - Po sukcesie: zamknięcie modala, odświeżenie listy talii, toast z komunikatem sukcesu
   - Po błędzie: wyświetlenie komunikatu błędu inline pod polem

**Rezultat:** Nazwa talii jest zaktualizowana na karcie, modal zamyka się, użytkownik widzi toast z potwierdzeniem

### Usunięcie talii

**Akcja:** Użytkownik klika "Usuń" w menu kontekstowym karty talii

**Obsługa:**
1. Otwiera się modal `DeleteDeckDialog` z ostrzeżeniem
2. Użytkownik potwierdza usunięcie klikając "Usuń"
3. Wywołanie `deleteDeckMutation`
4. Po sukcesie: zamknięcie modala, usunięcie talii z listy (odświeżenie przez React Query), toast z komunikatem sukcesu
5. Po błędzie: zamknięcie modala, toast z komunikatem błędu

**Rezultat:** Talia znika z listy, modal zamyka się, użytkownik widzi toast z potwierdzeniem

### Nawigacja do widoku talii

**Akcja:** Użytkownik klika na kartę talii lub przycisk "Rozpocznij powtórkę" / "Tryb nauki"

**Obsługa:**
1. Kliknięcie na kartę: nawigacja do `/deck/[id]` (Astro router)
2. Kliknięcie "Rozpocznij powtórkę": nawigacja do `/deck/[id]/review` (tylko jeśli `dueFlashcards > 0`)
3. Kliknięcie "Tryb nauki": nawigacja do `/deck/[id]/study`

**Rezultat:** Przekierowanie do odpowiedniego widoku talii

### Przejście do generatora fiszek

**Akcja:** Użytkownik klika przycisk "Generuj fiszki" w nagłówku Dashboard lub w EmptyState

**Obsługa:**
1. Nawigacja do `/generate` (Astro router)

**Rezultat:** Przekierowanie do widoku generatora fiszek

## 9. Warunki i walidacja

### Warunki wymagane przez API

**Tworzenie talii:**
- `name` jest wymagane (nie może być puste)
- `name` max 200 znaków
- `user_id` musi odpowiadać zalogowanemu użytkownikowi (wypełniane automatycznie)

**Aktualizacja talii:**
- `name` jest wymagane (nie może być puste)
- `name` max 200 znaków
- Talia musi należeć do zalogowanego użytkownika (weryfikowane przez RLS w Supabase)

**Usunięcie talii:**
- Talia musi należeć do zalogowanego użytkownika (weryfikowane przez RLS w Supabase)

### Walidacja po stronie klienta

**Pole nazwy talii (CreateDeckDialog, EditDeckDialog):**
- Sprawdzenie czy pole nie jest puste po trim()
- Sprawdzenie czy długość nie przekracza 200 znaków
- Wyświetlanie komunikatu błędu inline pod polem:
  - "Nazwa talii jest wymagana" (jeśli puste)
  - "Nazwa talii nie może przekraczać 200 znaków" (jeśli za długa)

**Przycisk "Rozpocznij powtórkę":**
- Sprawdzenie czy `dueFlashcards > 0`
- Jeśli `dueFlashcards === 0`: przycisk jest nieaktywny (disabled) z tooltipem "Brak fiszek do powtórki"

### Wpływ warunków na stan interfejsu

**Brak talii:**
- Wyświetlanie komponentu `EmptyState` zamiast siatki kart
- Ukrycie wyszukiwarki (lub pozostawienie jej widocznej, ale nieaktywnej)

**Brak wyników wyszukiwania:**
- Wyświetlanie komunikatu "Nie znaleziono talii pasujących do wyszukiwania" zamiast siatki kart
- Komunikat powinien być dostępny dla screen readerów (aria-live region)

**Brak fiszek do powtórki w talii:**
- Przycisk "Rozpocznij powtórkę" jest nieaktywny (disabled)
- Tooltip z komunikatem "Brak fiszek do powtórki" przy najechaniu na nieaktywny przycisk
- Badge z liczbą fiszek do powtórki wyświetla "0" (lub może być ukryty)

**Błąd ładowania danych:**
- Wyświetlanie komunikatu błędu z przyciskiem "Spróbuj ponownie"
- Komunikat powinien być dostępny dla screen readerów

## 10. Obsługa błędów

### Błędy autoryzacji (401 Unauthorized)

**Scenariusz:** Sesja użytkownika wygasła lub token jest nieprawidłowy

**Obsługa:**
1. Przekierowanie na `/login?redirect=/` przez middleware autoryzacji
2. Toast notification: "Sesja wygasła. Zaloguj się ponownie."

**Implementacja:** Middleware w Astro sprawdza sesję przed renderowaniem strony

### Błędy walidacji (400 Bad Request)

**Scenariusz:** Nieprawidłowe dane w żądaniu (np. nazwa talii za długa)

**Obsługa:**
1. Wyświetlenie komunikatu błędu inline pod odpowiednim polem formularza
2. Komunikat powinien być dostępny dla screen readerów (aria-describedby)

**Przykłady komunikatów:**
- "Nazwa talii jest wymagana"
- "Nazwa talii nie może przekraczać 200 znaków"

### Błędy serwera (500 Internal Server Error)

**Scenariusz:** Błąd po stronie serwera podczas operacji na taliach

**Obsługa:**
1. Toast notification z komunikatem błędu: "Wystąpił błąd serwera. Spróbuj ponownie."
2. Przycisk "Spróbuj ponownie" w toast notification (jeśli dotyczy)
3. Dla operacji mutacji: rollback optymistic update (jeśli zastosowano)

### Błędy sieciowe (brak połączenia)

**Scenariusz:** Brak połączenia z internetem

**Obsługa:**
1. Toast notification: "Brak połączenia z internetem. Sprawdź swoje połączenie."
2. Przycisk "Spróbuj ponownie" w toast notification
3. React Query automatycznie retry po przywróceniu połączenia (jeśli skonfigurowano)

### Błędy nieznalezienia zasobu (404 Not Found)

**Scenariusz:** Talia została usunięta przez innego użytkownika lub nie istnieje

**Obsługa:**
1. Toast notification: "Talia nie została znaleziona."
2. Automatyczne odświeżenie listy talii (React Query invalidate)
3. Talia znika z listy (jeśli była wyświetlana)

### Błędy podczas ładowania danych

**Scenariusz:** Błąd podczas pobierania listy talii

**Obsługa:**
1. Wyświetlanie komunikatu błędu zamiast siatki kart
2. Przycisk "Spróbuj ponownie" wywołujący `refetch()` z React Query
3. Komunikat powinien być dostępny dla screen readerów

### Obsługa błędów w modalach

**Scenariusz:** Błąd podczas tworzenia/edycji/usuwania talii

**Obsługa:**
1. Wyświetlanie komunikatu błędu inline w modalu (dla błędów walidacji)
2. Toast notification dla błędów serwera
3. Modal pozostaje otwarty (użytkownik może poprawić dane i spróbować ponownie)
4. Dla błędów krytycznych: zamknięcie modala i wyświetlenie toast notification

### Przypadki brzegowe

**Pusta odpowiedź API:**
- Jeśli API zwraca pustą tablicę `[]`, wyświetlany jest `EmptyState`

**Częściowa odpowiedź API:**
- Jeśli część talii nie została pobrana (np. timeout), wyświetlane są dostępne talie z komunikatem ostrzegawczym

**Równoczesne modyfikacje:**
- Jeśli użytkownik edytuje talię, która została usunięta przez innego użytkownika, wyświetlany jest komunikat błędu i modal zamyka się

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury plików

1. Utworzenie pliku `src/pages/index.astro` (jeśli nie istnieje)
2. Utworzenie folderu `src/components/dashboard/` dla komponentów Dashboard
3. Utworzenie plików komponentów:
   - `src/components/dashboard/DashboardView.tsx` - główny komponent
   - `src/components/dashboard/DashboardHeader.tsx` - nagłówek z wyszukiwarką
   - `src/components/dashboard/SearchBar.tsx` - komponent wyszukiwarki
   - `src/components/dashboard/DecksGrid.tsx` - siatka kart talii
   - `src/components/dashboard/DeckCard.tsx` - karta talii
   - `src/components/dashboard/EmptyState.tsx` - empty state
   - `src/components/dashboard/CreateDeckDialog.tsx` - modal tworzenia talii
   - `src/components/dashboard/EditDeckDialog.tsx` - modal edycji talii
   - `src/components/dashboard/DeleteDeckDialog.tsx` - modal usunięcia talii

### Krok 2: Rozszerzenie typów

1. Dodanie typu `DeckViewModel` do `src/types.ts`:
   ```typescript
   export interface DeckViewModel extends DeckWithCountResponse {
     totalFlashcards: number;
     dueFlashcards: number;
     hasDueFlashcards: boolean;
   }
   ```

2. Dodanie typu `DashboardState` (opcjonalnie, jeśli używamy custom hook)

### Krok 3: Implementacja funkcji API

1. Utworzenie pliku `src/lib/api/decks.ts` z funkcjami:
   - `fetchDecksWithCounts(userId: string): Promise<DeckWithCountResponse[]>`
   - `fetchDueFlashcardCounts(userId: string): Promise<Record<number, number>>`
   - `createDeck(userId: string, name: string): Promise<DeckResponse>`
   - `updateDeck(deckId: number, name: string): Promise<DeckResponse>`
   - `deleteDeck(deckId: number): Promise<void>`

2. Integracja z Supabase client (`src/lib/supabase.ts`)

### Krok 4: Implementacja komponentów pomocniczych

1. **SearchBar:**
   - Użycie `Input` z Shadcn/ui
   - Dodanie ikony wyszukiwania (lucide-react)
   - Obsługa onChange i wyczyszczenia

2. **EmptyState:**
   - Komunikat powitalny
   - Przyciski CTA ("Utwórz pierwszą talię", "Wygeneruj fiszki")
   - Styling zgodny z design system

### Krok 5: Implementacja komponentów dialogów

1. **CreateDeckDialog:**
   - Użycie `Dialog` z Shadcn/ui
   - Pole `Input` dla nazwy talii
   - Walidacja inline
   - Przyciski "Utwórz" i "Anuluj"

2. **EditDeckDialog:**
   - Podobny do CreateDeckDialog
   - Wstępnie wypełnione pole nazwy

3. **DeleteDeckDialog:**
   - Dialog potwierdzenia z ostrzeżeniem
   - Przycisk "Usuń" z destrukcyjnym stylem

### Krok 6: Implementacja DeckCard

1. Użycie `Card` z Shadcn/ui jako kontener
2. Sekcja z nazwą talii i statystykami:
   - Nazwa talii jako nagłówek
   - Badge z liczbą fiszek do powtórki (wyróżniony kolorem)
   - Całkowita liczba fiszek
3. Sekcja z przyciskami akcji:
   - "Rozpocznij powtórkę" (disabled jeśli brak fiszek do powtórki)
   - "Tryb nauki"
   - DropdownMenu z opcjami edycji i usunięcia
4. Obsługa kliknięcia na kartę (nawigacja do `/deck/[id]`)

### Krok 7: Implementacja DecksGrid

1. Użycie CSS Grid layout (Tailwind CSS)
2. Responsywne dostosowanie (grid na desktop, lista na mobile)
3. Renderowanie `DeckCard` dla każdej talii
4. Wyświetlanie skeleton loaders podczas ładowania
5. Filtrowanie talii na podstawie `searchQuery`

### Krok 8: Implementacja DashboardHeader

1. Kontener flex z wyrównaniem elementów
2. Integracja `SearchBar`
3. Przyciski "Nowa talia" i "Generuj fiszki"
4. Styling zgodny z design system

### Krok 9: Implementacja DashboardView z React Query

1. Konfiguracja React Query (QueryClient, QueryClientProvider w layout)
2. Implementacja `useQuery` dla talii:
   ```typescript
   const { data: decks, isLoading, error, refetch } = useQuery({
     queryKey: ['decks', userId],
     queryFn: () => fetchDecksWithCounts(userId),
   });
   ```
3. Implementacja `useQuery` dla liczby fiszek do powtórki
4. Implementacja `useMutation` dla operacji CRUD
5. Połączenie danych z talii i liczby fiszek do powtórki w `DeckViewModel`
6. Filtrowanie talii na podstawie `searchQuery` (useMemo)
7. Renderowanie wszystkich sekcji widoku

### Krok 10: Integracja z Astro

1. W pliku `src/pages/index.astro`:
   - Import komponentu `DashboardView`
   - Renderowanie `Topbar` (jeśli nie jest w layout)
   - Renderowanie `DashboardView` jako React component
   - Ustawienie `client:load` dla hydratacji

2. Middleware autoryzacji:
   - Sprawdzenie sesji przed renderowaniem
   - Przekierowanie na `/login?redirect=/` jeśli nieautoryzowany

### Krok 11: Styling i responsywność

1. Użycie Tailwind CSS dla stylowania
2. Responsywne breakpoints:
   - Desktop: grid layout (3-4 kolumny)
   - Tablet: grid layout (2 kolumny)
   - Mobile: lista (1 kolumna)
3. Styling kart talii zgodny z design system
4. Wyróżnienie liczby fiszek do powtórki (badge, kolor)

### Krok 12: Dostępność (WCAG AA)

1. Semantyczny HTML (`<main>`, `<section>`, `<h1>`, `<h2>`)
2. ARIA labels dla przycisków bez widocznego tekstu
3. ARIA describedby dla komunikatów błędów
4. ARIA live regions dla dynamicznych aktualizacji
5. Keyboard navigation (Tab, Enter, Space, Escape)
6. Focus management w modalach
7. Kontrast kolorów zgodny z WCAG AA

### Krok 13: Testowanie

1. Testowanie pobierania talii (happy path)
2. Testowanie tworzenia talii (walidacja, sukces, błędy)
3. Testowanie edycji talii (walidacja, sukces, błędy)
4. Testowanie usunięcia talii (potwierdzenie, sukces, błędy)
5. Testowanie wyszukiwania (filtrowanie w czasie rzeczywistym)
6. Testowanie empty state (brak talii)
7. Testowanie błędów (401, 400, 500, brak połączenia)
8. Testowanie dostępności (keyboard navigation, screen readers)
9. Testowanie responsywności (desktop, tablet, mobile)

### Krok 14: Optymalizacja

1. Debounce dla wyszukiwania (opcjonalnie, jeśli wydajność wymaga)
2. Optimistic updates dla operacji mutacji (opcjonalnie)
3. Cache'owanie danych przez React Query
4. Lazy loading komponentów (opcjonalnie)
5. Code splitting (opcjonalnie)

### Krok 15: Dokumentacja i code review

1. Dodanie komentarzy JSDoc do funkcji API
2. Dokumentacja komponentów (props, użycie)
3. Code review zgodności z PRD i UI plan
4. Sprawdzenie zgodności z API plan
5. Weryfikacja wszystkich historyjek użytkownika (US-006)

