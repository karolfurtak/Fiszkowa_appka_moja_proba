# Plan implementacji widoku Weryfikacja propozycji (/verify/[session_id])

## 1. Przegląd

Widok weryfikacji propozycji (`/verify/[session_id]`) umożliwia użytkownikowi przeglądanie, akceptowanie, odrzucanie i edytowanie propozycji fiszek wygenerowanych przez AI przed zapisaniem ich do talii. Widok pojawia się automatycznie po zakończeniu generowania fiszek (z widoku Ekran ładowania) i pozwala użytkownikowi na kontrolę jakości wygenerowanych propozycji.

Widok implementuje wymagania z PRD (F-005 - ekran weryfikacji) oraz user stories US-009 (proces weryfikacji fiszek), US-010 (korekta dziedziny wiedzy), US-011 (regeneracja błędnych odpowiedzi) i US-012 (zapisywanie fiszek do talii). Zapewnia intuicyjny interfejs do zarządzania propozycjami z możliwością akceptacji/odrzucenia pojedynczych lub wszystkich propozycji jednocześnie.

## 2. Routing widoku

**Ścieżka**: `/verify/[session_id]`

**Plik**: `src/pages/verify/[session_id].astro`

**Parametry routingu**:
- `session_id` (string) - identyfikator sesji generowania (`generation_session_id`) otrzymany z odpowiedzi endpointu `/api/generations`

**Middleware**: Widok wymaga autoryzacji (użytkownik musi być zalogowany). Jeśli użytkownik nie jest zalogowany, powinien być przekierowany na `/login?redirect=/verify/[session_id]`.

**Query Parameters**: Brak (wszystkie potrzebne dane są w `session_id`)

**Przykład URL**: `/verify/gen-1234567890-abc12345-xyz`

**Nawigacja**:
- **Wejście**: Automatyczne przekierowanie z Ekranu ładowania (`/loading/[session_id]`) po zakończeniu generowania
- **Wyjście**: Przekierowanie na Dashboard (`/`) lub Lista fiszek (`/deck/[deck_id]`) po zapisaniu propozycji do talii, lub powrót do Generatora (`/generate`) po anulowaniu

## 3. Struktura komponentów

```
verify/[session_id].astro (Astro Page)
└── VerificationView (React Component)
    ├── Container (div wrapper)
    │   ├── HeaderSection
    │   │   ├── Title (h1) - "Weryfikacja propozycji fiszek"
    │   │   ├── DomainSection
    │   │   │   ├── DomainDisplay (div) - "Wykryta dziedzina: [domain]"
    │   │   │   └── Button (Shadcn/ui) - "Zmień" (otwiera DomainEditor)
    │   │   ├── DomainEditor (conditional)
    │   │   │   ├── Input (Shadcn/ui) - pole edycji domeny
    │   │   │   └── Button (Shadcn/ui) - "Zapisz" / "Anuluj"
    │   │   └── StatsBar (div) - "X zaakceptowanych / Y odrzuconych / Z łącznie"
    │   ├── ActionBar
    │   │   ├── Button (Shadcn/ui) - "Akceptuj wszystkie"
    │   │   ├── Button (Shadcn/ui) - "Odrzuć wszystkie"
    │   │   └── Checkbox (Shadcn/ui) - "Zaznacz wszystkie" (toggle)
    │   ├── ProposalsList
    │   │   ├── FlashcardProposalCard[] - lista kart propozycji
    │   │   ├── Pagination (Shadcn/ui) - nawigacja stron (jeśli paginacja)
    │   │   └── InfiniteScroll - automatyczne ładowanie (jeśli infinite scroll)
    │   ├── FooterSection
    │   │   ├── DeckSelector
    │   │   │   ├── Select (Shadcn/ui) - dropdown wyboru talii
    │   │   │   │   ├── Option[] - istniejące talie
    │   │   │   │   └── Option - "Utwórz nową talię"
    │   │   │   └── Input (Shadcn/ui) - pole nazwy nowej talii (conditional)
    │   │   ├── Button (Shadcn/ui) - "Zapisz wszystkie"
    │   │   └── Button (Shadcn/ui) - "Zapisz zatwierdzone"
    │   └── ErrorSection (conditional)
    │       └── Alert (Shadcn/ui) - komunikaty błędów
    ├── EditProposalModal (Shadcn/ui Dialog)
    │   ├── DialogContent
    │   │   ├── DialogHeader - "Edytuj propozycję"
    │   │   ├── Form
    │   │   │   ├── Textarea (Shadcn/ui) - pole pytania
    │   │   │   ├── Input (Shadcn/ui) - pole odpowiedzi
    │   │   │   ├── Input (Shadcn/ui) - pole URL obrazka
    │   │   │   └── Input (Shadcn/ui) - pole domeny
    │   │   └── DialogFooter
    │   │       ├── Button (Shadcn/ui) - "Zapisz zmiany"
    │   │       └── Button (Shadcn/ui) - "Anuluj"
    └── Toast (Shadcn/ui) - toast notifications (sukces, błędy)
```

## 4. Szczegóły komponentów

### VerificationView (React Component)

**Lokalizacja**: `src/components/verify/VerificationView.tsx`

**Opis komponentu**: Główny komponent widoku weryfikacji odpowiedzialny za zarządzanie stanem propozycji, wyświetlanie listy propozycji, obsługę akcji akceptacji/odrzucenia oraz zapisywanie propozycji do talii. Komponent komunikuje się z API Supabase w celu pobrania propozycji, aktualizacji ich statusu oraz konwersji do fiszek.

**Główne elementy HTML i komponenty dzieci**:
- `<div className="container">` - główny kontener z maksymalną szerokością
- `<header>` - sekcja nagłówkowa z tytułem i informacjami o domenie
- `<div className="action-bar">` - pasek akcji z przyciskami bulk operations
- `<div className="proposals-list">` - kontener listy propozycji
- `FlashcardProposalCard[]` - karty propozycji (renderowane w pętli)
- `Pagination` lub `InfiniteScroll` - nawigacja stron (w zależności od preferencji użytkownika)
- `<footer>` - sekcja stopki z selektorem talii i przyciskami zapisu
- `EditProposalModal` - modal edycji propozycji (warunkowo renderowany)
- `Toast` - toast notifications

**Obsługiwane zdarzenia**:
- `onMount` (useEffect) - pobranie propozycji i talii po zamontowaniu komponentu
- `onClick` - kliknięcie przycisku "Akceptuj wszystkie" (akceptacja wszystkich propozycji)
- `onClick` - kliknięcie przycisku "Odrzuć wszystkie" (odrzucenie wszystkich propozycji)
- `onClick` - kliknięcie przycisku "Zapisz wszystkie" (zapis wszystkich propozycji do talii)
- `onClick` - kliknięcie przycisku "Zapisz zatwierdzone" (zapis tylko zaznaczonych propozycji)
- `onChange` - zmiana wybranej talii w dropdown
- `onChange` - zmiana nazwy nowej talii
- `onCheck` - zaznaczenie/odznaczenie checkboxa "Zaznacz wszystkie"
- Automatyczne odświeżanie listy propozycji po akceptacji/odrzuceniu (React Query invalidation)

**Warunki walidacji** (szczegółowe, zgodnie z API):

**Session ID**:
- Wymagane (nie może być puste)
- Format: string (UUID lub podobny identyfikator sesji)
- Walidacja: sprawdzanie czy `session_id` jest prawidłowym stringiem przed pobraniem propozycji
- Komunikaty błędów:
  - Brak session_id: przekierowanie z powrotem do generatora z komunikatem błędu
  - Nieprawidłowy format: przekierowanie z powrotem do generatora z komunikatem błędu

**Propozycje**:
- Tylko propozycje ze statusem `'pending'` są wyświetlane
- Propozycje muszą należeć do zalogowanego użytkownika (RLS)
- Propozycje muszą mieć ten sam `generation_session_id` co parametr URL

**Domena wiedzy**:
- Opcjonalna (może być `null`)
- Maksymalna długość: 100 znaków
- Walidacja przy edycji: sprawdzanie długości przed zapisaniem

**Talia**:
- Wymagana przed zapisaniem propozycji
- Talia musi należeć do zalogowanego użytkownika (RLS)
- Nazwa nowej talii: wymagana jeśli wybrano "Utwórz nową talię", maksymalna długość 200 znaków, nie może być pusta

**Typy (DTO i ViewModel)**:

**Props komponentu**:
```typescript
interface VerificationViewProps {
  sessionId: string; // generation_session_id z URL
}
```

**Stan komponentu (ViewModel)**:
```typescript
interface VerificationViewState {
  proposals: FlashcardProposalResponse[]; // Lista propozycji z API
  selectedProposalIds: Set<number>; // Zaznaczone propozycje (domyślnie wszystkie)
  detectedDomain: string | null; // Wykryta domena z pierwszej propozycji
  editedDomain: string | null; // Edytowana domena (jeśli użytkownik zmienia)
  isDomainEditing: boolean; // Czy tryb edycji domeny jest aktywny
  selectedDeckId: number | null; // Wybrana talia (ID lub null)
  newDeckName: string; // Nazwa nowej talii (jeśli tworzenie)
  isCreatingNewDeck: boolean; // Czy tworzenie nowej talii
  editingProposal: FlashcardProposalResponse | null; // Propozycja w trakcie edycji
  isEditModalOpen: boolean; // Czy modal edycji jest otwarty
  paginationMode: 'pagination' | 'infinite-scroll'; // Tryb wyświetlania (z preferencji)
  currentPage: number; // Aktualna strona (jeśli paginacja)
  pageSize: number; // Rozmiar strony (domyślnie 10)
  isLoading: boolean; // Stan ładowania propozycji
  error: string | null; // Komunikat błędu
}
```

**Typy DTO używane przez komponent**:
- `FlashcardProposalResponse` - typ propozycji z API
- `DeckResponse` - typ talii z API
- `AcceptProposalsBySessionRequest` - żądanie akceptacji wszystkich propozycji z sesji
- `AcceptProposalsRequest` - żądanie akceptacji wybranych propozycji
- `RejectProposalsRequest` - żądanie odrzucenia propozycji
- `UpdateProposalRequest` - żądanie aktualizacji propozycji
- `CreateDeckRequest` - żądanie utworzenia talii

### FlashcardProposalCard (React Component)

**Lokalizacja**: `src/components/verify/FlashcardProposalCard.tsx`

**Opis komponentu**: Komponent karty propozycji fiszki wyświetlający pytanie, odpowiedź, domenę oraz przyciski akcji. Obsługuje zaznaczanie propozycji, akceptację, odrzucenie, edycję i regenerację dystraktorów.

**Główne elementy HTML i komponenty dzieci**:
- `<article>` - semantyczny kontener karty
- `<div className="card-header">` - nagłówek karty z checkboxem i domeną
- `Checkbox` (Shadcn/ui) - checkbox akceptacji propozycji
- `<div className="domain-badge">` - badge z domeną wiedzy
- `<div className="card-content">` - zawartość karty
- `<div className="question-section">` - sekcja pytania
- `<p className="question-text">` - tekst pytania (pełny lub skrócony z możliwością rozwinięcia)
- `<div className="answer-section">` - sekcja odpowiedzi
- `<p className="answer-text">` - tekst poprawnej odpowiedzi
- `<img>` (conditional) - obrazek (jeśli `image_url` jest ustawiony)
- `<div className="card-actions">` - sekcja przycisków akcji
- `Button` (Shadcn/ui) - "Edytuj" (otwiera modal edycji)
- `Button` (Shadcn/ui) - "Regeneruj" (regeneruje dystraktory)
- `Button` (Shadcn/ui) - "Odrzuć" (odrzuca propozycję)

**Obsługiwane zdarzenia**:
- `onChange` - zmiana stanu checkboxa (akceptacja/odrzucenie propozycji)
- `onClick` - kliknięcie przycisku "Edytuj" (otwarcie modala edycji)
- `onClick` - kliknięcie przycisku "Regeneruj" (regeneracja dystraktorów przez AI)
- `onClick` - kliknięcie przycisku "Odrzuć" (odrzucenie propozycji)
- `onClick` - kliknięcie na pytanie/odpowiedź (rozwinięcie/zwinięcie długiego tekstu)

**Warunki walidacji**:
- Checkbox akceptacji: propozycja musi mieć status `'pending'` aby mogła być zaznaczona
- Przycisk "Regeneruj": dostępny tylko dla propozycji ze statusem `'pending'`
- Przycisk "Odrzuć": dostępny tylko dla propozycji ze statusem `'pending'`

**Typy**:

**Props komponentu**:
```typescript
interface FlashcardProposalCardProps {
  proposal: FlashcardProposalResponse; // Propozycja do wyświetlenia
  isSelected: boolean; // Czy propozycja jest zaznaczona
  onSelectChange: (proposalId: number, isSelected: boolean) => void; // Callback zmiany zaznaczenia
  onEdit: (proposal: FlashcardProposalResponse) => void; // Callback edycji
  onRegenerate: (proposalId: number) => void; // Callback regeneracji
  onReject: (proposalId: number) => void; // Callback odrzucenia
}
```

### EditProposalModal (React Component)

**Lokalizacja**: `src/components/verify/EditProposalModal.tsx`

**Opis komponentu**: Modal edycji propozycji umożliwiający zmianę pytania, odpowiedzi, URL obrazka i domeny wiedzy. Zawiera walidację pól przed zapisaniem zmian.

**Główne elementy HTML i komponenty dzieci**:
- `Dialog` (Shadcn/ui) - kontener modala
- `DialogContent` - zawartość modala
- `DialogHeader` - nagłówek z tytułem "Edytuj propozycję"
- `DialogTitle` - tytuł modala
- `Form` - formularz edycji
- `Label` (Shadcn/ui) - etykiety pól
- `Textarea` (Shadcn/ui) - pole pytania (z licznikiem znaków)
- `Input` (Shadcn/ui) - pole odpowiedzi (z licznikiem znaków)
- `Input` (Shadcn/ui) - pole URL obrazka
- `Input` (Shadcn/ui) - pole domeny wiedzy
- `DialogFooter` - stopka modala
- `Button` (Shadcn/ui) - "Zapisz zmiany"
- `Button` (Shadcn/ui) - "Anuluj"
- `Alert` (Shadcn/ui) - komunikaty błędów walidacji

**Obsługiwane zdarzenia**:
- `onChange` - zmiana wartości pól formularza
- `onSubmit` - wysłanie formularza (zapis zmian)
- `onClick` - kliknięcie przycisku "Anuluj" (zamknięcie modala bez zapisu)
- `onOpenChange` - zmiana stanu otwarcia modala (zamknięcie przez kliknięcie poza modalem)

**Warunki walidacji** (szczegółowe, zgodnie z API):

**Pytanie**:
- Wymagane (nie może być puste)
- Minimalna długość: 1000 znaków
- Maksymalna długość: 10000 znaków
- Komunikaty błędów:
  - Puste pole: "Pytanie jest wymagane"
  - Za krótkie: "Pytanie musi zawierać co najmniej 1000 znaków (obecnie: X znaków)"
  - Za długie: "Pytanie nie może przekraczać 10000 znaków (obecnie: X znaków)"

**Odpowiedź**:
- Wymagana (nie może być pusta)
- Maksymalna długość: 500 znaków
- Komunikaty błędów:
  - Puste pole: "Odpowiedź jest wymagana"
  - Za długa: "Odpowiedź nie może przekraczać 500 znaków (obecnie: X znaków)"

**URL obrazka**:
- Opcjonalna (może być pusta)
- Format: prawidłowy URL (http:// lub https://)
- Walidacja regex: `^https?://[^\s/$.?#].[^\s]*$`
- Komunikaty błędów:
  - Nieprawidłowy format: "URL obrazka musi być prawidłowym adresem HTTP/HTTPS"

**Domena wiedzy**:
- Opcjonalna (może być pusta)
- Maksymalna długość: 100 znaków
- Komunikaty błędów:
  - Za długa: "Domena nie może przekraczać 100 znaków (obecnie: X znaków)"

**Typy**:

**Props komponentu**:
```typescript
interface EditProposalModalProps {
  proposal: FlashcardProposalResponse | null; // Propozycja do edycji (null = zamknięty)
  isOpen: boolean; // Czy modal jest otwarty
  onClose: () => void; // Callback zamknięcia modala
  onSave: (proposalId: number, updates: UpdateProposalRequest) => Promise<void>; // Callback zapisu zmian
}
```

**Stan komponentu**:
```typescript
interface EditProposalModalState {
  question: string; // Wartość pola pytania
  correctAnswer: string; // Wartość pola odpowiedzi
  imageUrl: string; // Wartość pola URL obrazka
  domain: string; // Wartość pola domeny
  errors: {
    question?: string;
    correctAnswer?: string;
    imageUrl?: string;
    domain?: string;
  }; // Błędy walidacji dla każdego pola
  isSaving: boolean; // Stan zapisywania zmian
}
```

### DeckSelector (React Component)

**Lokalizacja**: `src/components/verify/DeckSelector.tsx`

**Opis komponentu**: Komponent selektora talii umożliwiający wybór istniejącej talii lub utworzenie nowej. Wyświetla dropdown z listą talii oraz pole tekstowe dla nazwy nowej talii (jeśli wybrano opcję tworzenia).

**Główne elementy HTML i komponenty dzieci**:
- `<div className="deck-selector">` - kontener selektora
- `Label` (Shadcn/ui) - etykieta "Wybierz talię"
- `Select` (Shadcn/ui) - dropdown wyboru talii
- `SelectTrigger` - trigger dropdown
- `SelectValue` - wyświetlana wartość
- `SelectContent` - zawartość dropdown
- `SelectItem[]` - opcje talii (renderowane w pętli)
- `SelectItem` - opcja "Utwórz nową talię"
- `Input` (Shadcn/ui) - pole nazwy nowej talii (warunkowo renderowane)
- `Alert` (Shadcn/ui) - komunikaty błędów walidacji

**Obsługiwane zdarzenia**:
- `onValueChange` - zmiana wybranej talii w dropdown
- `onChange` - zmiana nazwy nowej talii
- `onBlur` - utrata focusu pola nazwy (walidacja)

**Warunki walidacji**:

**Wybór talii**:
- Wymagany przed zapisaniem propozycji
- Talia musi należeć do zalogowanego użytkownika (RLS)
- Komunikaty błędów:
  - Brak wybranej talii: "Musisz wybrać talię przed zapisaniem"

**Nazwa nowej talii**:
- Wymagana jeśli wybrano "Utwórz nową talię"
- Nie może być pusta (po trim)
- Maksymalna długość: 200 znaków
- Komunikaty błędów:
  - Pusta: "Nazwa talii jest wymagana"
  - Za długa: "Nazwa talii nie może przekraczać 200 znaków"

**Typy**:

**Props komponentu**:
```typescript
interface DeckSelectorProps {
  decks: DeckResponse[]; // Lista dostępnych talii
  selectedDeckId: number | null; // Wybrana talia (ID lub null)
  isCreatingNewDeck: boolean; // Czy tworzenie nowej talii
  newDeckName: string; // Nazwa nowej talii
  onDeckChange: (deckId: number | null) => void; // Callback zmiany talii
  onNewDeckToggle: (isCreating: boolean) => void; // Callback przełączenia trybu tworzenia
  onNewDeckNameChange: (name: string) => void; // Callback zmiany nazwy nowej talii
  error?: string | null; // Komunikat błędu walidacji
}
```

## 5. Typy

### Typy DTO z API

**FlashcardProposalResponse** (z `src/types.ts`):
```typescript
export type FlashcardProposalResponse = FlashcardProposal;

// FlashcardProposal pochodzi z database.types.ts:
interface FlashcardProposal {
  id: number;
  user_id: string;
  question: string; // 1000-10000 znaków
  correct_answer: string; // max 500 znaków
  image_url: string | null; // Opcjonalny URL obrazka
  domain: string | null; // Opcjonalna domena wiedzy (max 100 znaków)
  generation_session_id: string | null; // ID sesji generowania
  status: ProposalStatus; // 'pending' | 'accepted' | 'rejected'
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

**DeckResponse** (z `src/types.ts`):
```typescript
export type DeckResponse = Deck;

// Deck pochodzi z database.types.ts:
interface Deck {
  id: number;
  user_id: string;
  name: string; // max 200 znaków
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

**AcceptProposalsBySessionRequest** (z `src/types.ts`):
```typescript
export interface AcceptProposalsBySessionRequest {
  generation_session_id: string;
  deck_id: number;
}
```

**AcceptProposalsRequest** (z `src/types.ts`):
```typescript
export interface AcceptProposalsRequest {
  proposal_ids: number[];
  deck_id: number;
}
```

**RejectProposalsRequest** (z `src/types.ts`):
```typescript
export interface RejectProposalsRequest {
  proposal_ids: number[];
  delete?: boolean; // Opcjonalnie: czy usunąć trwale (domyślnie false)
}
```

**UpdateProposalRequest** (z `src/types.ts`):
```typescript
export type UpdateProposalRequest = Omit<
  TablesUpdate<'flashcard_proposals'>,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

// Oznacza to, że można aktualizować:
interface UpdateProposalRequest {
  question?: string; // 1000-10000 znaków
  correct_answer?: string; // max 500 znaków
  image_url?: string | null; // Prawidłowy URL lub null
  domain?: string | null; // max 100 znaków lub null
  generation_session_id?: string | null;
  status?: ProposalStatus; // 'pending' | 'accepted' | 'rejected'
}
```

**CreateDeckRequest** (z `src/types.ts`):
```typescript
export type CreateDeckRequest = Omit<TablesInsert<'decks'>, 'id' | 'created_at' | 'updated_at'>;

// Oznacza to:
interface CreateDeckRequest {
  user_id: string;
  name: string; // max 200 znaków, wymagane
}
```

### Typy ViewModel dla komponentów

**ProposalViewModel** (rozszerzenie FlashcardProposalResponse dla UI):
```typescript
interface ProposalViewModel extends FlashcardProposalResponse {
  isSelected: boolean; // Czy propozycja jest zaznaczona
  isExpanded: boolean; // Czy długi tekst jest rozwinięty (dla pytań > 500 znaków)
}
```

**VerificationStatsViewModel**:
```typescript
interface VerificationStatsViewModel {
  totalCount: number; // Całkowita liczba propozycji
  acceptedCount: number; // Liczba zaakceptowanych propozycji
  rejectedCount: number; // Liczba odrzuconych propozycji
  pendingCount: number; // Liczba propozycji ze statusem 'pending'
}
```

## 6. Zarządzanie stanem

Widok weryfikacji używa kombinacji React hooks oraz React Query (TanStack Query) do zarządzania stanem i cache'owania danych.

### React Hooks

**useState:**
- `selectedProposalIds` - Set<number> - zbiór ID zaznaczonych propozycji (domyślnie wszystkie)
- `detectedDomain` - string | null - wykryta domena z pierwszej propozycji
- `editedDomain` - string | null - edytowana domena (jeśli użytkownik zmienia)
- `isDomainEditing` - boolean - czy tryb edycji domeny jest aktywny
- `selectedDeckId` - number | null - wybrana talia (ID lub null)
- `newDeckName` - string - nazwa nowej talii
- `isCreatingNewDeck` - boolean - czy tworzenie nowej talii
- `editingProposal` - FlashcardProposalResponse | null - propozycja w trakcie edycji
- `isEditModalOpen` - boolean - czy modal edycji jest otwarty
- `paginationMode` - 'pagination' | 'infinite-scroll' - tryb wyświetlania (z localStorage lub domyślnie 'pagination')
- `currentPage` - number - aktualna strona (jeśli paginacja, domyślnie 1)
- `pageSize` - number - rozmiar strony (domyślnie 10)

**useMemo:**
- `filteredProposals` - przefiltrowane propozycje na podstawie `currentPage` i `pageSize` (jeśli paginacja)
- `stats` - VerificationStatsViewModel - obliczone statystyki propozycji
- `canSave` - boolean - czy można zapisać propozycje (czy wybrano talię i czy są zaznaczone propozycje)

### React Query (TanStack Query)

**useQuery - pobieranie propozycji:**
```typescript
const { data: proposals, isLoading, error, refetch } = useQuery({
  queryKey: ['proposals', sessionId],
  queryFn: () => fetchProposalsBySession(sessionId),
  enabled: !!sessionId,
  staleTime: 30000, // 30 sekund
});
```

**useQuery - pobieranie talii:**
```typescript
const { data: decks, isLoading: isLoadingDecks } = useQuery({
  queryKey: ['decks', userId],
  queryFn: () => fetchDecks(userId),
  enabled: !!userId,
  staleTime: 60000, // 1 minuta
});
```

**useMutation - akceptacja wszystkich propozycji z sesji:**
```typescript
const acceptAllMutation = useMutation({
  mutationFn: (deckId: number) => acceptProposalsBySession(sessionId, deckId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['proposals', sessionId] });
    toast.success('Wszystkie propozycje zostały zaakceptowane');
    // Przekierowanie na dashboard lub listę fiszek
  },
  onError: (error) => {
    toast.error('Nie udało się zaakceptować propozycji');
  },
});
```

**useMutation - akceptacja wybranych propozycji:**
```typescript
const acceptSelectedMutation = useMutation({
  mutationFn: ({ proposalIds, deckId }: { proposalIds: number[], deckId: number }) =>
    acceptProposals(proposalIds, deckId),
  onMutate: async ({ proposalIds }) => {
    // Optimistic update: natychmiastowa aktualizacja UI
    await queryClient.cancelQueries({ queryKey: ['proposals', sessionId] });
    const previousProposals = queryClient.getQueryData(['proposals', sessionId]);
    queryClient.setQueryData(['proposals', sessionId], (old: FlashcardProposalResponse[]) =>
      old.map(p => proposalIds.includes(p.id) ? { ...p, status: 'accepted' } : p)
    );
    return { previousProposals };
  },
  onError: (err, variables, context) => {
    // Rollback w przypadku błędu
    queryClient.setQueryData(['proposals', sessionId], context.previousProposals);
    toast.error('Nie udało się zaakceptować propozycji');
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['proposals', sessionId] });
    toast.success('Propozycje zostały zaakceptowane');
  },
});
```

**useMutation - odrzucenie propozycji:**
```typescript
const rejectProposalsMutation = useMutation({
  mutationFn: ({ proposalIds, delete: shouldDelete }: { proposalIds: number[], delete?: boolean }) =>
    rejectProposals(proposalIds, shouldDelete),
  onMutate: async ({ proposalIds }) => {
    // Optimistic update
    await queryClient.cancelQueries({ queryKey: ['proposals', sessionId] });
    const previousProposals = queryClient.getQueryData(['proposals', sessionId]);
    queryClient.setQueryData(['proposals', sessionId], (old: FlashcardProposalResponse[]) =>
      old.filter(p => !proposalIds.includes(p.id))
    );
    return { previousProposals };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['proposals', sessionId], context.previousProposals);
    toast.error('Nie udało się odrzucić propozycji');
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['proposals', sessionId] });
    toast.success('Propozycje zostały odrzucone');
  },
});
```

**useMutation - aktualizacja propozycji:**
```typescript
const updateProposalMutation = useMutation({
  mutationFn: ({ proposalId, updates }: { proposalId: number, updates: UpdateProposalRequest }) =>
    updateProposal(proposalId, updates),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['proposals', sessionId] });
    toast.success('Propozycja została zaktualizowana');
  },
  onError: () => {
    toast.error('Nie udało się zaktualizować propozycji');
  },
});
```

**useMutation - tworzenie talii:**
```typescript
const createDeckMutation = useMutation({
  mutationFn: (name: string) => createDeck(userId, name),
  onSuccess: (newDeck) => {
    queryClient.invalidateQueries({ queryKey: ['decks', userId] });
    setSelectedDeckId(newDeck.id);
    setNewDeckName('');
    setCreatingNewDeck(false);
    toast.success('Talia została utworzona');
  },
  onError: () => {
    toast.error('Nie udało się utworzyć talii');
  },
});
```

### Custom Hook: useVerification

Dla lepszej organizacji kodu można stworzyć custom hook `useVerification`:

```typescript
export function useVerification(sessionId: string, userId: string) {
  // Queries
  const proposalsQuery = useQuery({ ... });
  const decksQuery = useQuery({ ... });
  
  // Mutations
  const acceptAllMutation = useMutation({ ... });
  const acceptSelectedMutation = useMutation({ ... });
  const rejectProposalsMutation = useMutation({ ... });
  const updateProposalMutation = useMutation({ ... });
  const createDeckMutation = useMutation({ ... });
  
  // Local state
  const [selectedProposalIds, setSelectedProposalIds] = useState<Set<number>>(new Set());
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  // ... pozostałe stany
  
  // Computed values
  const stats = useMemo(() => {
    const proposals = proposalsQuery.data || [];
    return {
      totalCount: proposals.length,
      acceptedCount: proposals.filter(p => p.status === 'accepted').length,
      rejectedCount: proposals.filter(p => p.status === 'rejected').length,
      pendingCount: proposals.filter(p => p.status === 'pending').length,
    };
  }, [proposalsQuery.data]);
  
  const canSave = useMemo(() => {
    return selectedDeckId !== null && selectedProposalIds.size > 0;
  }, [selectedDeckId, selectedProposalIds]);
  
  // Helper functions
  const toggleSelectAll = () => {
    const proposals = proposalsQuery.data || [];
    const pendingProposals = proposals.filter(p => p.status === 'pending');
    if (selectedProposalIds.size === pendingProposals.length) {
      setSelectedProposalIds(new Set());
    } else {
      setSelectedProposalIds(new Set(pendingProposals.map(p => p.id)));
    }
  };
  
  const handleSaveAll = async () => {
    if (!selectedDeckId) return;
    await acceptAllMutation.mutateAsync(selectedDeckId);
  };
  
  const handleSaveSelected = async () => {
    if (!selectedDeckId || selectedProposalIds.size === 0) return;
    await acceptSelectedMutation.mutateAsync({
      proposalIds: Array.from(selectedProposalIds),
      deckId: selectedDeckId,
    });
  };
  
  return {
    proposals: proposalsQuery.data || [],
    decks: decksQuery.data || [],
    isLoading: proposalsQuery.isLoading || decksQuery.isLoading,
    error: proposalsQuery.error || decksQuery.error,
    stats,
    selectedProposalIds,
    setSelectedProposalIds,
    selectedDeckId,
    setSelectedDeckId,
    canSave,
    toggleSelectAll,
    handleSaveAll,
    handleSaveSelected,
    // ... pozostałe wartości i funkcje
  };
}
```

## 7. Integracja API

### Pobieranie propozycji z sesji

**Endpoint:** `GET /rest/v1/flashcard_proposals?generation_session_id=eq.{session_id}&status=eq.pending&select=*&order=created_at.asc`

**Typ żądania:** Brak (GET request)

**Typ odpowiedzi:** `FlashcardProposalResponse[]`

**Implementacja:**
```typescript
async function fetchProposalsBySession(sessionId: string): Promise<FlashcardProposalResponse[]> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(
    `${supabaseUrl}/rest/v1/flashcard_proposals?generation_session_id=eq.${sessionId}&status=eq.pending&select=*&order=created_at.asc`,
    {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch proposals');
  }
  
  return await response.json();
}
```

### Pobieranie listy talii

**Endpoint:** `GET /rest/v1/decks?user_id=eq.{user_id}&select=*&order=name.asc`

**Typ żądania:** Brak (GET request)

**Typ odpowiedzi:** `DeckResponse[]`

**Implementacja:**
```typescript
async function fetchDecks(userId: string): Promise<DeckResponse[]> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(
    `${supabaseUrl}/rest/v1/decks?user_id=eq.${userId}&select=*&order=name.asc`,
    {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch decks');
  }
  
  return await response.json();
}
```

### Akceptacja wszystkich propozycji z sesji

**Endpoint:** `POST /functions/v1/accept-proposals-by-session`

**Typ żądania:** `AcceptProposalsBySessionRequest`

**Typ odpowiedzi:** `AcceptProposalsBySessionResponse`

**Implementacja:**
```typescript
async function acceptProposalsBySession(
  sessionId: string,
  deckId: number
): Promise<AcceptProposalsBySessionResponse> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(`${supabaseUrl}/functions/v1/accept-proposals-by-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      generation_session_id: sessionId,
      deck_id: deckId,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to accept proposals');
  }
  
  return await response.json();
}
```

### Akceptacja wybranych propozycji

**Endpoint:** `POST /functions/v1/accept-proposals`

**Typ żądania:** `AcceptProposalsRequest`

**Typ odpowiedzi:** `AcceptProposalsResponse`

**Implementacja:**
```typescript
async function acceptProposals(
  proposalIds: number[],
  deckId: number
): Promise<AcceptProposalsResponse> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(`${supabaseUrl}/functions/v1/accept-proposals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      proposal_ids: proposalIds,
      deck_id: deckId,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to accept proposals');
  }
  
  return await response.json();
}
```

### Odrzucenie propozycji

**Endpoint:** `POST /functions/v1/reject-proposals`

**Typ żądania:** `RejectProposalsRequest`

**Typ odpowiedzi:** `RejectProposalsResponse`

**Implementacja:**
```typescript
async function rejectProposals(
  proposalIds: number[],
  shouldDelete: boolean = false
): Promise<RejectProposalsResponse> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(`${supabaseUrl}/functions/v1/reject-proposals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      proposal_ids: proposalIds,
      delete: shouldDelete,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to reject proposals');
  }
  
  return await response.json();
}
```

### Aktualizacja propozycji

**Endpoint:** `PATCH /rest/v1/flashcard_proposals?id=eq.{proposal_id}`

**Typ żądania:** `UpdateProposalRequest`

**Typ odpowiedzi:** `FlashcardProposalResponse[]` (z `Prefer: return=representation`)

**Implementacja:**
```typescript
async function updateProposal(
  proposalId: number,
  updates: UpdateProposalRequest
): Promise<FlashcardProposalResponse> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(
    `${supabaseUrl}/rest/v1/flashcard_proposals?id=eq.${proposalId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(updates),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update proposal');
  }
  
  const data = await response.json();
  return data[0];
}
```

### Tworzenie talii

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

## 8. Interakcje użytkownika

### Akceptacja wszystkich propozycji

1. Użytkownik klika przycisk "Akceptuj wszystkie"
2. System zaznacza wszystkie propozycje ze statusem `'pending'` (jeśli nie były zaznaczone)
3. Wyświetla się toast notification: "Akceptowanie wszystkich propozycji..."
4. Wywołanie API `accept-proposals-by-session` z `generation_session_id` i `deck_id`
5. Po sukcesie:
   - Toast notification: "Wszystkie propozycje zostały zaakceptowane"
   - Aktualizacja UI (propozycje zmieniają status na `'accepted'`)
   - Przekierowanie na Dashboard lub Lista fiszek (`/deck/[deck_id]`)
6. Po błędzie:
   - Toast notification z komunikatem błędu
   - Rollback zmian w UI (jeśli użyto optimistic update)

### Akceptacja wybranych propozycji

1. Użytkownik zaznacza checkboxy przy wybranych propozycjach
2. Użytkownik wybiera talię z dropdown (lub tworzy nową)
3. Użytkownik klika przycisk "Zapisz zatwierdzone"
4. Walidacja: sprawdzenie czy wybrano talię i czy są zaznaczone propozycje
5. Wyświetla się toast notification: "Zapisywanie propozycji..."
6. Jeśli tworzenie nowej talii: najpierw utworzenie talii, potem akceptacja propozycji
7. Wywołanie API `accept-proposals` z tablicą `proposal_ids` i `deck_id`
8. Po sukcesie:
   - Toast notification: "Propozycje zostały zapisane do talii"
   - Aktualizacja UI (zaznaczone propozycje zmieniają status na `'accepted'`)
   - Przekierowanie na Lista fiszek (`/deck/[deck_id]`)
9. Po błędzie:
   - Toast notification z komunikatem błędu
   - Rollback zmian w UI

### Odrzucenie propozycji

1. Użytkownik klika przycisk "Odrzuć" przy pojedynczej propozycji lub "Odrzuć wszystkie"
2. Jeśli "Odrzuć wszystkie": wyświetlenie modala potwierdzenia (opcjonalnie)
3. Wywołanie API `reject-proposals` z tablicą `proposal_ids` i `delete=false` (domyślnie)
4. Optimistic update: natychmiastowe usunięcie propozycji z listy
5. Po sukcesie:
   - Toast notification: "Propozycje zostały odrzucone"
   - Aktualizacja UI (propozycje są usuwane z listy)
6. Po błędzie:
   - Toast notification z komunikatem błędu
   - Rollback zmian w UI (przywrócenie propozycji na listę)

### Edycja propozycji

1. Użytkownik klika przycisk "Edytuj" przy propozycji
2. Otwiera się modal `EditProposalModal` z wstępnie wypełnionymi polami
3. Użytkownik edytuje pola (pytanie, odpowiedź, URL obrazka, domena)
4. Walidacja inline: sprawdzanie długości pól i formatu URL
5. Użytkownik klika przycisk "Zapisz zmiany"
6. Wywołanie API `PATCH /rest/v1/flashcard_proposals` z zaktualizowanymi danymi
7. Po sukcesie:
   - Toast notification: "Propozycja została zaktualizowana"
   - Zamknięcie modala
   - Aktualizacja UI (propozycja w liście jest zaktualizowana)
8. Po błędzie:
   - Komunikaty błędów walidacji wyświetlane inline w modalu
   - Toast notification z komunikatem błędu API

### Zmiana domeny wiedzy

1. Użytkownik klika przycisk "Zmień" obok wykrytej domeny
2. Tryb edycji domeny jest aktywowany (pole tekstowe zamiast wyświetlania)
3. Użytkownik wprowadza nową domenę
4. Walidacja: sprawdzanie długości (max 100 znaków)
5. Użytkownik klika "Zapisz" lub "Anuluj"
6. Jeśli "Zapisz": wywołanie API `PATCH /rest/v1/flashcard_proposals` dla wszystkich propozycji z sesji z nową domeną
7. Po sukcesie:
   - Toast notification: "Domena została zaktualizowana"
   - Aktualizacja UI (wszystkie propozycje mają nową domenę)
8. Po błędzie:
   - Toast notification z komunikatem błędu

### Regeneracja dystraktorów

1. Użytkownik klika przycisk "Regeneruj" przy propozycji
2. Wyświetla się loading state (spinner na przycisku)
3. Wywołanie API Edge Function do regeneracji dystraktorów (jeśli dostępne) lub wyświetlenie komunikatu "Funkcja w trakcie implementacji"
4. Po sukcesie:
   - Toast notification: "Dystraktory zostały zregenerowane"
   - Aktualizacja UI (propozycja ma nowe dystraktory)
5. Po błędzie:
   - Toast notification z komunikatem błędu

### Tworzenie nowej talii

1. Użytkownik wybiera opcję "Utwórz nową talię" z dropdown
2. Pojawia się pole tekstowe dla nazwy nowej talii
3. Użytkownik wprowadza nazwę talii
4. Walidacja inline: sprawdzanie czy nazwa nie jest pusta i nie przekracza 200 znaków
5. Po kliknięciu "Zapisz zatwierdzone" lub "Zapisz wszystkie":
   - Najpierw utworzenie talii przez API `POST /rest/v1/decks`
   - Po sukcesie: użycie nowo utworzonej talii do akceptacji propozycji
6. Po sukcesie:
   - Toast notification: "Talia została utworzona"
   - Dropdown automatycznie wybiera nowo utworzoną talię
7. Po błędzie:
   - Toast notification z komunikatem błędu
   - Pole nazwy talii pozostaje widoczne z komunikatem błędu

## 9. Warunki i walidacja

### Walidacja po stronie klienta

**Session ID:**
- Wymagane, nie może być puste
- Format: string (UUID lub podobny identyfikator)
- Walidacja przy ładowaniu widoku: jeśli brak lub nieprawidłowy format → przekierowanie do generatora

**Propozycje:**
- Tylko propozycje ze statusem `'pending'` są wyświetlane i mogą być akceptowane/odrzucone
- Propozycje muszą należeć do zalogowanego użytkownika (RLS w Supabase)
- Propozycje muszą mieć ten sam `generation_session_id` co parametr URL

**Pytanie (w edycji):**
- Wymagane, nie może być puste
- Minimalna długość: 1000 znaków
- Maksymalna długość: 10000 znaków
- Walidacja inline w modalu edycji z komunikatem błędu pod polem

**Odpowiedź (w edycji):**
- Wymagana, nie może być pusta
- Maksymalna długość: 500 znaków
- Walidacja inline w modalu edycji z komunikatem błędu pod polem

**URL obrazka (w edycji):**
- Opcjonalna, może być pusta
- Format: prawidłowy URL (http:// lub https://)
- Regex walidacja: `^https?://[^\s/$.?#].[^\s]*$`
- Walidacja inline w modalu edycji z komunikatem błędu pod polem

**Domena wiedzy (w edycji):**
- Opcjonalna, może być pusta
- Maksymalna długość: 100 znaków
- Walidacja inline w modalu edycji z komunikatem błędu pod polem

**Talia:**
- Wymagana przed zapisaniem propozycji
- Talia musi należeć do zalogowanego użytkownika (RLS w Supabase)
- Walidacja przed kliknięciem "Zapisz": sprawdzenie czy wybrano talię

**Nazwa nowej talii:**
- Wymagana jeśli wybrano "Utwórz nową talię"
- Nie może być pusta (po trim)
- Maksymalna długość: 200 znaków
- Walidacja inline z komunikatem błędu pod polem

### Walidacja po stronie serwera

Wszystkie warunki walidacji po stronie klienta są również weryfikowane po stronie serwera przez API Supabase:

- **Propozycje:** RLS policy zapewnia, że użytkownik może tylko odczytywać/aktualizować swoje własne propozycje
- **Pytanie:** CHECK constraint w bazie danych: `length(question) >= 1000 AND length(question) <= 10000`
- **Odpowiedź:** CHECK constraint w bazie danych: `length(correct_answer) <= 500`
- **URL obrazka:** CHECK constraint w bazie danych: `image_url ~* '^https?://[^\s/$.?#].[^\s]*$'`
- **Domena:** CHECK constraint w bazie danych: `length(domain) <= 100` (jeśli nie null)
- **Talia:** RLS policy zapewnia, że użytkownik może tylko używać swoich własnych talii
- **Nazwa talii:** CHECK constraint w bazie danych: `length(name) <= 200` i `name IS NOT NULL`

### Wpływ walidacji na stan interfejsu

**Błędy walidacji pól formularza:**
- Komunikaty błędów wyświetlane inline pod odpowiednimi polami
- Przycisk "Zapisz" jest nieaktywny (disabled) jeśli są błędy walidacji
- Pola z błędami mają czerwony border i ikonę błędu

**Brak wybranej talii:**
- Przyciski "Zapisz wszystkie" i "Zapisz zatwierdzone" są nieaktywne (disabled)
- Tooltip wyjaśniający: "Wybierz talię przed zapisaniem"

**Brak zaznaczonych propozycji:**
- Przycisk "Zapisz zatwierdzone" jest nieaktywny (disabled)
- Tooltip wyjaśniający: "Zaznacz przynajmniej jedną propozycję"

**Brak propozycji do wyświetlenia:**
- Wyświetlenie empty state: "Nie znaleziono propozycji dla tej sesji"
- Przycisk "Wróć do generatora" umożliwiający powrót

## 10. Obsługa błędów

### Błędy sieciowe

**Brak połączenia z internetem:**
- Toast notification: "Brak połączenia z internetem. Sprawdź swoje połączenie."
- Przycisk "Spróbuj ponownie" w toast notification
- Możliwość ponowienia operacji po przywróceniu połączenia

**Timeout żądania:**
- Toast notification: "Żądanie trwa zbyt długo. Spróbuj ponownie."
- Przycisk "Spróbuj ponownie" w toast notification

### Błędy autoryzacji (401)

**Sesja wygasła:**
- Toast notification: "Sesja wygasła. Zaloguj się ponownie."
- Przekierowanie na `/login?redirect=/verify/[session_id]`
- Zachowanie stanu URL dla powrotu po zalogowaniu

**Brak autoryzacji:**
- Przekierowanie na `/login?redirect=/verify/[session_id]`
- Toast notification: "Musisz być zalogowany, aby zobaczyć tę stronę."

### Błędy walidacji (400)

**Nieprawidłowe dane w żądaniu:**
- Komunikaty błędów wyświetlane inline pod odpowiednimi polami formularza
- Toast notification z ogólnym komunikatem: "Nieprawidłowe dane. Sprawdź wprowadzone wartości."
- Szczegółowe komunikaty błędów z API wyświetlane w modalu edycji lub pod odpowiednimi polami

**Propozycja już zaakceptowana/odrzucona:**
- Toast notification: "Ta propozycja została już przetworzona."
- Automatyczne odświeżenie listy propozycji (React Query invalidation)
- Usunięcie propozycji z listy (jeśli została odrzucona) lub zmiana statusu (jeśli została zaakceptowana)

### Błędy nie znaleziono (404)

**Sesja nie istnieje:**
- Toast notification: "Nie znaleziono sesji generowania."
- Przekierowanie na Dashboard (`/`) z komunikatem błędu

**Talia nie istnieje:**
- Toast notification: "Wybrana talia nie istnieje."
- Reset wyboru talii w dropdown
- Możliwość wyboru innej talii lub utworzenia nowej

**Propozycja nie istnieje:**
- Toast notification: "Propozycja nie istnieje."
- Automatyczne odświeżenie listy propozycji
- Usunięcie propozycji z listy (jeśli została usunięta)

### Błędy serwera (500)

**Błąd serwera podczas akceptacji:**
- Toast notification: "Wystąpił błąd serwera podczas akceptacji propozycji. Spróbuj ponownie."
- Rollback optimistic update (przywrócenie poprzedniego stanu UI)
- Możliwość ponowienia operacji

**Błąd serwera podczas odrzucenia:**
- Toast notification: "Wystąpił błąd serwera podczas odrzucania propozycji. Spróbuj ponownie."
- Rollback optimistic update
- Możliwość ponowienia operacji

**Błąd serwera podczas aktualizacji:**
- Toast notification: "Wystąpił błąd serwera podczas aktualizacji propozycji. Spróbuj ponownie."
- Modal edycji pozostaje otwarty z możliwością ponowienia zapisu

### Błędy Edge Function

**Błąd akceptacji propozycji (Edge Function):**
- Toast notification z komunikatem błędu z API: `error.error.message`
- Szczegółowe informacje o błędzie (np. "Nie wszystkie propozycje mogły zostać zaakceptowane")
- Lista propozycji, które nie zostały zaakceptowane (jeśli dostępne w odpowiedzi)

**Błąd odrzucenia propozycji (Edge Function):**
- Toast notification z komunikatem błędu z API
- Rollback optimistic update

### Przypadki brzegowe

**Brak propozycji do wyświetlenia:**
- Empty state: "Nie znaleziono propozycji dla tej sesji."
- Przycisk "Wróć do generatora" umożliwiający powrót
- Możliwe przyczyny: wszystkie propozycje zostały już przetworzone, sesja nie istnieje, błąd podczas generowania

**Wszystkie propozycje już przetworzone:**
- Komunikat: "Wszystkie propozycje z tej sesji zostały już przetworzone."
- Przycisk "Wróć do dashboardu"
- Opcjonalnie: wyświetlenie statystyk (ile zaakceptowanych, ile odrzuconych)

**Częściowa akceptacja (niektóre propozycje nie mogły zostać zaakceptowane):**
- Toast notification: "Niektóre propozycje nie mogły zostać zaakceptowane."
- Wyświetlenie listy propozycji, które nie zostały zaakceptowane (z komunikatem błędu dla każdej)
- Możliwość ponowienia akceptacji dla nieudanych propozycji

**Konflikt podczas edycji (propozycja została zmieniona przez innego użytkownika):**
- Toast notification: "Propozycja została zmieniona. Odśwież stronę, aby zobaczyć najnowsze zmiany."
- Automatyczne odświeżenie listy propozycji
- Zamknięcie modala edycji

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury plików

1. Utworzenie pliku strony Astro: `src/pages/verify/[session_id].astro`
2. Utworzenie katalogu komponentów: `src/components/verify/`
3. Utworzenie plików komponentów:
   - `src/components/verify/VerificationView.tsx`
   - `src/components/verify/FlashcardProposalCard.tsx`
   - `src/components/verify/EditProposalModal.tsx`
   - `src/components/verify/DeckSelector.tsx`
4. Utworzenie pliku funkcji API: `src/lib/api/proposals.ts`
5. Utworzenie custom hook: `src/hooks/useVerification.ts` (opcjonalnie)

### Krok 2: Implementacja funkcji API

1. Utworzenie funkcji `fetchProposalsBySession(sessionId: string): Promise<FlashcardProposalResponse[]>`
2. Utworzenie funkcji `fetchDecks(userId: string): Promise<DeckResponse[]>`
3. Utworzenie funkcji `acceptProposalsBySession(sessionId: string, deckId: number): Promise<AcceptProposalsBySessionResponse>`
4. Utworzenie funkcji `acceptProposals(proposalIds: number[], deckId: number): Promise<AcceptProposalsResponse>`
5. Utworzenie funkcji `rejectProposals(proposalIds: number[], shouldDelete?: boolean): Promise<RejectProposalsResponse>`
6. Utworzenie funkcji `updateProposal(proposalId: number, updates: UpdateProposalRequest): Promise<FlashcardProposalResponse>`
7. Utworzenie funkcji `createDeck(userId: string, name: string): Promise<DeckResponse>`
8. Integracja z Supabase client (`src/lib/supabase.ts`) dla pobrania sesji użytkownika

### Krok 3: Implementacja komponentu DeckSelector

1. Użycie `Select` z Shadcn/ui dla dropdown wyboru talii
2. Renderowanie opcji talii w pętli
3. Dodanie opcji "Utwórz nową talię"
4. Warunkowe renderowanie pola `Input` dla nazwy nowej talii
5. Walidacja nazwy nowej talii (nie pusta, max 200 znaków)
6. Obsługa zdarzeń onChange dla dropdown i pola nazwy
7. Wyświetlanie komunikatów błędów walidacji

### Krok 4: Implementacja komponentu FlashcardProposalCard

1. Użycie `Card` z Shadcn/ui jako kontener
2. Sekcja nagłówkowa z checkboxem akceptacji i domeną wiedzy
3. Sekcja pytania z możliwością rozwinięcia/zwinięcia długiego tekstu
4. Sekcja odpowiedzi
5. Wyświetlanie obrazka (jeśli `image_url` jest ustawiony)
6. Sekcja przycisków akcji: "Edytuj", "Regeneruj", "Odrzuć"
7. Obsługa zdarzeń: onChange checkboxa, onClick przycisków
8. Styling zgodny z design system (Tailwind CSS)

### Krok 5: Implementacja komponentu EditProposalModal

1. Użycie `Dialog` z Shadcn/ui jako kontener modala
2. Formularz z polami:
   - `Textarea` dla pytania (z licznikiem znaków)
   - `Input` dla odpowiedzi (z licznikiem znaków)
   - `Input` dla URL obrazka
   - `Input` dla domeny wiedzy
3. Walidacja inline dla każdego pola:
   - Pytanie: 1000-10000 znaków
   - Odpowiedź: max 500 znaków
   - URL obrazka: prawidłowy format URL
   - Domena: max 100 znaków
4. Wyświetlanie komunikatów błędów pod odpowiednimi polami
5. Przyciski "Zapisz zmiany" i "Anuluj"
6. Obsługa zamknięcia modala (kliknięcie poza modalem, Escape, przycisk Anuluj)
7. Focus trap w modalu (dostępność)

### Krok 6: Implementacja komponentu VerificationView

1. Integracja z React Query:
   - `useQuery` dla pobrania propozycji (`queryKey: ['proposals', sessionId]`)
   - `useQuery` dla pobrania talii (`queryKey: ['decks', userId]`)
   - `useMutation` dla akceptacji wszystkich propozycji
   - `useMutation` dla akceptacji wybranych propozycji
   - `useMutation` dla odrzucenia propozycji
   - `useMutation` dla aktualizacji propozycji
   - `useMutation` dla tworzenia talii
2. Stan lokalny:
   - `selectedProposalIds` - Set<number> (domyślnie wszystkie propozycje ze statusem 'pending')
   - `detectedDomain` - string | null (z pierwszej propozycji)
   - `editedDomain` - string | null
   - `isDomainEditing` - boolean
   - `selectedDeckId` - number | null
   - `newDeckName` - string
   - `isCreatingNewDeck` - boolean
   - `editingProposal` - FlashcardProposalResponse | null
   - `isEditModalOpen` - boolean
   - `paginationMode` - 'pagination' | 'infinite-scroll' (z localStorage)
   - `currentPage` - number (domyślnie 1)
3. Obliczone wartości (useMemo):
   - `stats` - VerificationStatsViewModel
   - `canSave` - boolean (czy można zapisać propozycje)
   - `filteredProposals` - przefiltrowane propozycje (jeśli paginacja)
4. Funkcje pomocnicze:
   - `toggleSelectAll()` - zaznaczenie/odznaczenie wszystkich propozycji
   - `handleAcceptAll()` - akceptacja wszystkich propozycji
   - `handleRejectAll()` - odrzucenie wszystkich propozycji
   - `handleSaveAll()` - zapis wszystkich propozycji do talii
   - `handleSaveSelected()` - zapis wybranych propozycji do talii
   - `handleEditProposal()` - otwarcie modala edycji
   - `handleUpdateProposal()` - zapis zmian w propozycji
   - `handleDomainChange()` - zmiana domeny wiedzy
5. Renderowanie:
   - Sekcja nagłówkowa z tytułem i domeną wiedzy
   - Pasek akcji z przyciskami bulk operations
   - Lista propozycji (FlashcardProposalCard[])
   - Paginacja lub InfiniteScroll (w zależności od `paginationMode`)
   - Sekcja stopki z DeckSelector i przyciskami zapisu
   - EditProposalModal (warunkowo renderowany)
   - Toast notifications

### Krok 7: Implementacja strony Astro

1. Pobranie `session_id` z parametrów routingu (`Astro.params.session_id`)
2. Sprawdzenie autoryzacji (middleware lub w komponencie)
3. Przekazanie `sessionId` do komponentu `VerificationView`
4. Dodanie meta tagów dla SEO
5. Importowanie komponentu `VerificationView` jako React component (client-side)

### Krok 8: Implementacja optimistic updates

1. W `useMutation` dla akceptacji wybranych propozycji:
   - `onMutate`: natychmiastowa aktualizacja UI (zmiana statusu na 'accepted')
   - `onError`: rollback zmian w przypadku błędu
   - `onSuccess`: invalidation query dla odświeżenia danych
2. W `useMutation` dla odrzucenia propozycji:
   - `onMutate`: natychmiastowe usunięcie propozycji z listy
   - `onError`: rollback zmian w przypadku błędu
   - `onSuccess`: invalidation query dla odświeżenia danych

### Krok 9: Implementacja walidacji

1. Walidacja session_id przy ładowaniu widoku
2. Walidacja pól w EditProposalModal (inline, przed wysłaniem)
3. Walidacja nazwy nowej talii w DeckSelector
4. Walidacja wyboru talii przed zapisaniem propozycji
5. Wyświetlanie komunikatów błędów w odpowiednich miejscach

### Krok 10: Implementacja obsługi błędów

1. Obsługa błędów sieciowych (toast notifications)
2. Obsługa błędów autoryzacji (przekierowanie na login)
3. Obsługa błędów walidacji (komunikaty inline)
4. Obsługa błędów serwera (toast notifications z możliwością ponowienia)
5. Obsługa przypadków brzegowych (empty state, wszystkie propozycje przetworzone)

### Krok 11: Implementacja dostępności (WCAG AA)

1. Semantyczny HTML (`<article>`, `<header>`, `<footer>`, `<main>`)
2. ARIA labels dla przycisków bez widocznego tekstu
3. ARIA describedby dla komunikatów błędów
4. ARIA live regions dla dynamicznych aktualizacji (statystyki, toast notifications)
5. Keyboard navigation (Tab, Enter, Space, Escape)
6. Focus trap w modalu
7. Widoczne focus states (outline)
8. Kontrast kolorów zgodny z WCAG AA (4.5:1 dla tekstu)

### Krok 12: Testowanie

1. Testowanie pobierania propozycji (różne scenariusze: brak propozycji, wiele propozycji, błąd API)
2. Testowanie akceptacji propozycji (pojedyncza, wiele, wszystkie)
3. Testowanie odrzucenia propozycji (pojedyncza, wiele, wszystkie)
4. Testowanie edycji propozycji (walidacja, zapis, błędy)
5. Testowanie tworzenia talii i zapisywania propozycji
6. Testowanie walidacji (wszystkie pola, wszystkie scenariusze błędów)
7. Testowanie obsługi błędów (sieć, autoryzacja, walidacja, serwer)
8. Testowanie dostępności (keyboard navigation, screen reader, kontrast)
9. Testowanie responsive design (desktop-first, adaptacja mobile)

### Krok 13: Optymalizacja i poprawki

1. Optymalizacja renderowania (React.memo dla FlashcardProposalCard)
2. Lazy loading dla modala edycji (jeśli potrzebne)
3. Debouncing dla walidacji pól formularza (opcjonalnie)
4. Cache'owanie danych (React Query staleTime)
5. Optymalizacja obrazków (lazy loading, placeholder)
6. Poprawki zgodnie z feedbackiem z testów

