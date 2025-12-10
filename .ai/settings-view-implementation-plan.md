# Plan implementacji widoku Ustawienia (/settings)

## 1. Przegląd

Widok ustawień (`/settings`) umożliwia użytkownikowi zarządzanie kontem, zmianę hasła, konfigurację preferencji użytkownika oraz ustawień aplikacji. Widok jest podzielony na sekcje tematyczne: zmiana hasła, preferencje użytkownika (dla AI), ustawienia aplikacji (dark mode, paginacja/infinite scroll) oraz zarządzanie kontem (usunięcie konta).

Widok implementuje wymagania z PRD (F-013 - podstawowe zarządzanie kontem) oraz user stories US-004 (zmiana hasła) i US-005 (usunięcie konta). Zapewnia bezpieczny interfejs do zarządzania kontem z walidacją po stronie klienta i serwera oraz potwierdzeniem dla destrukcyjnych akcji.

## 2. Routing widoku

**Ścieżka**: `/settings`

**Plik**: `src/pages/settings.astro`

**Parametry routingu**: Brak (widok nie wymaga parametrów)

**Middleware**: Widok wymaga autoryzacji (użytkownik musi być zalogowany). Jeśli użytkownik nie jest zalogowany, powinien być przekierowany na `/login?redirect=/settings`.

**Query Parameters**: Brak

**Przykład URL**: `/settings`

**Nawigacja**:
- **Wejście**: Kliknięcie linku "Ustawienia" w topbarze lub bezpośrednie wejście na URL
- **Wyjście**: Powrót na Dashboard (`/`) po zapisaniu zmian lub anulowaniu, przekierowanie na stronę główną po usunięciu konta

## 3. Struktura komponentów

```
settings.astro (Astro Page)
└── SettingsView (React Component)
    ├── Container (div wrapper)
    │   ├── HeaderSection
    │   │   └── Title (h1) - "Ustawienia"
    │   ├── PasswordChangeSection
    │   │   ├── SectionHeader (h2) - "Zmiana hasła"
    │   │   ├── PasswordChangeForm
    │   │   │   ├── Input (Shadcn/ui) - pole starego hasła (type="password")
    │   │   │   ├── Input (Shadcn/ui) - pole nowego hasła (type="password")
    │   │   │   ├── Input (Shadcn/ui) - pole potwierdzenia hasła (type="password")
    │   │   │   ├── Button (Shadcn/ui) - "Zmień hasło"
    │   │   │   └── Alert (Shadcn/ui) - komunikaty błędów walidacji (conditional)
    │   │   └── SuccessMessage (div) - komunikat sukcesu (conditional)
    │   ├── UserPreferencesSection
    │   │   ├── SectionHeader (h2) - "Preferencje użytkownika"
    │   │   ├── Description (p) - opis preferencji
    │   │   ├── UserPreferencesForm
    │   │   │   ├── Textarea (Shadcn/ui) - pole preferencji (max 1500 znaków, z licznikiem)
    │   │   │   ├── Button (Shadcn/ui) - "Zapisz preferencje"
    │   │   │   └── Alert (Shadcn/ui) - komunikaty błędów walidacji (conditional)
    │   │   └── SuccessMessage (div) - komunikat sukcesu (conditional)
    │   ├── AppSettingsSection
    │   │   ├── SectionHeader (h2) - "Ustawienia aplikacji"
    │   │   ├── AppSettingsForm
    │   │   │   ├── SettingItem (div)
    │   │   │   │   ├── Label (Shadcn/ui) - "Tryb ciemny"
    │   │   │   │   ├── Switch (Shadcn/ui) - przełącznik dark mode
    │   │   │   │   └── Description (p) - opis ustawienia
    │   │   │   ├── SettingItem (div)
    │   │   │   │   ├── Label (Shadcn/ui) - "Tryb wyświetlania weryfikacji"
    │   │   │   │   ├── Select (Shadcn/ui) - dropdown (Paginacja / Infinite Scroll)
    │   │   │   │   └── Description (p) - opis ustawienia
    │   │   │   └── SuccessMessage (div) - komunikat sukcesu (conditional, auto-save)
    │   ├── AccountSection
    │   │   ├── SectionHeader (h2) - "Konto"
    │   │   ├── AccountInfo (div) - informacje o koncie (email, data rejestracji)
    │   │   └── DeleteAccountButton (Shadcn/ui Button) - "Usuń konto" (destrukcyjny styl)
    │   └── DeleteAccountDialog (Shadcn/ui Dialog, conditional)
    │       ├── DialogContent
    │       │   ├── DialogHeader - "Usunięcie konta"
    │       │   ├── WarningMessage (Alert) - ostrzeżenie o trwałym usunięciu danych
    │       │   ├── ConfirmationInput (Input) - pole potwierdzenia (wpisanie "USUŃ")
    │       │   └── DialogFooter
    │       │       ├── Button (Shadcn/ui) - "Usuń konto" (destrukcyjny styl, disabled jeśli nie potwierdzono)
    │       │       └── Button (Shadcn/ui) - "Anuluj"
    └── Toast (Shadcn/ui) - toast notifications (sukces, błędy)
```

## 4. Szczegóły komponentów

### SettingsView (React Component)

**Lokalizacja**: `src/components/settings/SettingsView.tsx`

**Opis komponentu**: Główny komponent widoku ustawień odpowiedzialny za zarządzanie stanem wszystkich sekcji, obsługę formularzy oraz komunikację z API. Komponent integruje się z Supabase Auth API dla zmiany hasła i usunięcia konta oraz z REST API dla aktualizacji profilu i preferencji użytkownika.

**Główne elementy HTML i komponenty dzieci**:
- `<div className="settings-container">` - główny kontener z maksymalną szerokością
- `<header className="settings-header">` - sekcja nagłówkowa z tytułem
- `<section className="password-change-section">` - sekcja zmiany hasła
- `PasswordChangeForm` - formularz zmiany hasła
- `<section className="user-preferences-section">` - sekcja preferencji użytkownika
- `UserPreferencesForm` - formularz preferencji użytkownika
- `<section className="app-settings-section">` - sekcja ustawień aplikacji
- `AppSettingsForm` - formularz ustawień aplikacji
- `<section className="account-section">` - sekcja konta
- `DeleteAccountDialog` - modal potwierdzenia usunięcia konta (warunkowo renderowany)
- `Toast` (Shadcn/ui) - toast notifications

**Obsługiwane zdarzenia**:
- `onMount` (useEffect) - pobranie profilu użytkownika i preferencji po zamontowaniu komponentu
- `onSubmit` - wysłanie formularza zmiany hasła
- `onSubmit` - wysłanie formularza preferencji użytkownika
- `onChange` - zmiana wartości przełączników ustawień aplikacji (auto-save)
- `onClick` - kliknięcie przycisku "Usuń konto" (otwarcie modala)
- `onClick` - kliknięcie przycisku "Usuń konto" w modalu (potwierdzenie usunięcia)
- `onClick` - kliknięcie przycisku "Anuluj" w modalu (zamknięcie modala)
- Automatyczne zapisywanie ustawień aplikacji przy zmianie (debouncing)

**Warunki walidacji** (szczegółowe, zgodnie z API):

**Stare hasło:**
- Wymagane (nie może być puste)
- Musi być zgodne z aktualnym hasłem użytkownika (walidacja po stronie serwera)
- Komunikaty błędów:
  - Puste pole: "Stare hasło jest wymagane"
  - Nieprawidłowe hasło: "Nieprawidłowe stare hasło" (po próbie zmiany)

**Nowe hasło:**
- Wymagane (nie może być puste)
- Minimalna długość: 8 znaków
- Musi zawierać litery i cyfry (walidacja po stronie klienta)
- Komunikaty błędów:
  - Puste pole: "Nowe hasło jest wymagane"
  - Za krótkie: "Hasło musi zawierać co najmniej 8 znaków"
  - Za słabe: "Hasło musi zawierać litery i cyfry"

**Potwierdzenie hasła:**
- Wymagane (nie może być puste)
- Musi być identyczne z nowym hasłem
- Komunikaty błędów:
  - Puste pole: "Potwierdzenie hasła jest wymagane"
  - Niezgodne: "Hasła nie są identyczne"

**Preferencje użytkownika:**
- Opcjonalne (może być puste)
- Maksymalna długość: 1500 znaków
- Komunikaty błędów:
  - Za długie: "Preferencje nie mogą przekraczać 1500 znaków (obecnie: X znaków)"

**Potwierdzenie usunięcia konta:**
- Wymagane wpisanie "USUŃ" w polu potwierdzenia
- Komunikaty błędów:
  - Nieprawidłowe potwierdzenie: "Wpisz 'USUŃ' aby potwierdzić usunięcie konta"

**Typy (DTO i ViewModel)**:

**Props komponentu**:
```typescript
interface SettingsViewProps {
  // Brak props (wszystkie dane pobierane z API)
}
```

**Stan komponentu (ViewModel)**:
```typescript
interface SettingsViewState {
  // Sekcja zmiany hasła
  oldPassword: string; // Wartość pola starego hasła
  newPassword: string; // Wartość pola nowego hasła
  confirmPassword: string; // Wartość pola potwierdzenia hasła
  passwordErrors: {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }; // Błędy walidacji dla każdego pola
  isChangingPassword: boolean; // Stan zmiany hasła (loading)
  passwordChangeSuccess: boolean; // Czy zmiana hasła zakończyła się sukcesem
  
  // Sekcja preferencji użytkownika
  userPreferences: string; // Wartość pola preferencji (max 1500 znaków)
  isSavingPreferences: boolean; // Stan zapisywania preferencji (loading)
  preferencesSaveSuccess: boolean; // Czy zapis preferencji zakończył się sukcesem
  
  // Sekcja ustawień aplikacji
  darkMode: boolean; // Stan przełącznika dark mode
  verificationViewMode: 'pagination' | 'infinite-scroll'; // Tryb wyświetlania weryfikacji
  isSavingAppSettings: boolean; // Stan zapisywania ustawień aplikacji (loading)
  
  // Sekcja konta
  userProfile: ProfileResponse | null; // Profil użytkownika (email, username, data rejestracji)
  deleteAccountConfirmation: string; // Wartość pola potwierdzenia usunięcia konta
  isDeleteAccountDialogOpen: boolean; // Czy modal usunięcia konta jest otwarty
  isDeletingAccount: boolean; // Stan usuwania konta (loading)
  
  // Ogólne
  isLoading: boolean; // Stan ładowania profilu
  error: string | null; // Komunikat błędu
}
```

**Typy DTO używane przez komponent**:
- `ProfileResponse` - typ profilu z API
- `UpdatePasswordRequest` - żądanie zmiany hasła
- `UpdatePasswordResponse` - odpowiedź z API po zmianie hasła
- `UpdateProfileRequest` - żądanie aktualizacji profilu (dla preferencji)
- `DeleteAccountRequest` - żądanie usunięcia konta
- `DeleteAccountResponse` - odpowiedź z API po usunięciu konta

### PasswordChangeForm (React Component)

**Lokalizacja**: `src/components/settings/PasswordChangeForm.tsx`

**Opis komponentu**: Komponent formularza zmiany hasła zawierający pola starego hasła, nowego hasła i potwierdzenia hasła. Obsługuje walidację inline oraz wysyłanie żądania zmiany hasła do API.

**Główne elementy HTML i komponenty dzieci**:
- `<form>` - formularz zmiany hasła
- `Label` (Shadcn/ui) - etykiety pól
- `Input` (Shadcn/ui) - pole starego hasła (type="password")
- `Input` (Shadcn/ui) - pole nowego hasła (type="password")
- `Input` (Shadcn/ui) - pole potwierdzenia hasła (type="password")
- `Button` (Shadcn/ui) - "Zmień hasło" (disabled podczas wysyłania)
- `Alert` (Shadcn/ui) - komunikaty błędów walidacji (conditional)
- `<div className="success-message">` - komunikat sukcesu (conditional)

**Obsługiwane zdarzenia**:
- `onChange` - zmiana wartości pól formularza
- `onSubmit` - wysłanie formularza (zmiana hasła)
- `onBlur` - utrata focusu pola (walidacja inline)

**Warunki walidacji**:
- Stare hasło: wymagane, nie może być puste
- Nowe hasło: wymagane, min 8 znaków, musi zawierać litery i cyfry
- Potwierdzenie hasła: wymagane, musi być identyczne z nowym hasłem
- Walidacja po stronie serwera: sprawdzanie czy stare hasło jest poprawne

**Typy**:

**Props komponentu**:
```typescript
interface PasswordChangeFormProps {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  errors: {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  isChanging: boolean;
  success: boolean;
  onOldPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onSuccessReset: () => void; // Reset komunikatu sukcesu po zamknięciu
}
```

### UserPreferencesForm (React Component)

**Lokalizacja**: `src/components/settings/UserPreferencesForm.tsx`

**Opis komponentu**: Komponent formularza preferencji użytkownika zawierający pole tekstowe do wpisania wymagań w języku naturalnym (max 1500 znaków). Preferencje są przekazywane do AI podczas generowania fiszek jako dodatkowy kontekst.

**Główne elementy HTML i komponenty dzieci**:
- `<form>` - formularz preferencji
- `Label` (Shadcn/ui) - etykieta pola
- `Textarea` (Shadcn/ui) - pole preferencji (max 1500 znaków, z licznikiem znaków)
- `<div className="character-count">` - licznik znaków "X / 1500"
- `Button` (Shadcn/ui) - "Zapisz preferencje" (disabled podczas zapisywania)
- `Alert` (Shadcn/ui) - komunikaty błędów walidacji (conditional)
- `<div className="success-message">` - komunikat sukcesu (conditional)

**Obsługiwane zdarzenia**:
- `onChange` - zmiana wartości pola tekstowego
- `onSubmit` - wysłanie formularza (zapis preferencji)
- `onBlur` - utrata focusu pola (walidacja inline)

**Warunki walidacji**:
- Preferencje: opcjonalne, max 1500 znaków
- Komunikaty błędów:
  - Za długie: "Preferencje nie mogą przekraczać 1500 znaków"

**Typy**:

**Props komponentu**:
```typescript
interface UserPreferencesFormProps {
  preferences: string;
  error?: string | null;
  isSaving: boolean;
  success: boolean;
  onPreferencesChange: (value: string) => void;
  onSubmit: () => void;
  onSuccessReset: () => void; // Reset komunikatu sukcesu po zamknięciu
}
```

### AppSettingsForm (React Component)

**Lokalizacja**: `src/components/settings/AppSettingsForm.tsx`

**Opis komponentu**: Komponent formularza ustawień aplikacji zawierający przełączniki dla dark mode i trybu wyświetlania weryfikacji. Ustawienia są zapisywane automatycznie przy zmianie (auto-save z debouncing) do localStorage lub bazy danych.

**Główne elementy HTML i komponenty dzieci**:
- `<form>` - formularz ustawień
- `SettingItem[]` - elementy ustawień (renderowane w pętli)
- `Label` (Shadcn/ui) - etykiety ustawień
- `Switch` (Shadcn/ui) - przełącznik dark mode
- `Select` (Shadcn/ui) - dropdown trybu wyświetlania weryfikacji
- `<p className="description">` - opisy ustawień
- `<div className="success-message">` - komunikat sukcesu auto-save (conditional, auto-ukrywany)

**Obsługiwane zdarzenia**:
- `onCheckedChange` - zmiana stanu przełącznika dark mode (auto-save)
- `onValueChange` - zmiana wartości dropdown trybu wyświetlania (auto-save)
- Automatyczne zapisywanie przy zmianie (debouncing 500ms)

**Warunki walidacji**: Brak (ustawienia są zawsze prawidłowe)

**Typy**:

**Props komponentu**:
```typescript
interface AppSettingsFormProps {
  darkMode: boolean;
  verificationViewMode: 'pagination' | 'infinite-scroll';
  isSaving: boolean;
  onDarkModeChange: (enabled: boolean) => void;
  onVerificationViewModeChange: (mode: 'pagination' | 'infinite-scroll') => void;
}
```

### DeleteAccountDialog (React Component)

**Lokalizacja**: `src/components/settings/DeleteAccountDialog.tsx`

**Opis komponentu**: Komponent modala potwierdzenia usunięcia konta zawierający ostrzeżenie o trwałym usunięciu danych oraz pole potwierdzenia wymagające wpisania "USUŃ". Przycisk usunięcia jest nieaktywny dopóki użytkownik nie wpisze poprawnego potwierdzenia.

**Główne elementy HTML i komponenty dzieci**:
- `Dialog` (Shadcn/ui) - kontener modala
- `DialogContent` - zawartość modala
- `DialogHeader` - nagłówek z tytułem "Usunięcie konta"
- `DialogTitle` - tytuł modala
- `Alert` (Shadcn/ui) - ostrzeżenie o trwałym usunięciu danych (destrukcyjny styl)
- `<p className="warning-text">` - tekst ostrzeżenia
- `Label` (Shadcn/ui) - etykieta pola potwierdzenia
- `Input` (Shadcn/ui) - pole potwierdzenia (wymaga wpisania "USUŃ")
- `DialogFooter` - stopka modala
- `Button` (Shadcn/ui) - "Usuń konto" (destrukcyjny styl, disabled jeśli nie potwierdzono)
- `Button` (Shadcn/ui) - "Anuluj"

**Obsługiwane zdarzenia**:
- `onOpenChange` - zmiana stanu otwarcia modala (zamknięcie przez kliknięcie poza modalem lub Escape)
- `onChange` - zmiana wartości pola potwierdzenia
- `onClick` - kliknięcie przycisku "Usuń konto" (potwierdzenie usunięcia)
- `onClick` - kliknięcie przycisku "Anuluj" (zamknięcie modala bez zmian)

**Warunki walidacji**:
- Potwierdzenie: wymagane wpisanie dokładnie "USUŃ" (case-sensitive)
- Przycisk "Usuń konto" jest nieaktywny (disabled) dopóki potwierdzenie nie jest poprawne
- Komunikaty błędów:
  - Nieprawidłowe potwierdzenie: "Wpisz 'USUŃ' aby potwierdzić usunięcie konta"

**Typy**:

**Props komponentu**:
```typescript
interface DeleteAccountDialogProps {
  isOpen: boolean;
  confirmation: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirmationChange: (value: string) => void;
  onConfirm: () => void;
}
```

## 5. Typy

### Typy DTO z API

**ProfileResponse** (z `src/types.ts`):
```typescript
export type ProfileResponse = Profile;

// Profile pochodzi z database.types.ts:
interface Profile {
  id: string; // UUID użytkownika
  username: string; // Nazwa użytkownika (max 50 znaków, unique)
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

**UpdatePasswordRequest** (z `src/types.ts`):
```typescript
export interface UpdatePasswordRequest {
  password: string; // Nowe hasło (min 8 znaków, litery i cyfry)
}
```

**UpdatePasswordResponse** (z `src/types.ts`):
```typescript
export interface UpdatePasswordResponse {
  id: string;
  email: string;
  updated_at: string; // ISO timestamp
}
```

**UpdateProfileRequest** (z `src/types.ts`):
```typescript
export interface UpdateProfileRequest {
  username: string; // Nazwa użytkownika (max 50 znaków, unique)
}
```

**DeleteAccountRequest** (z `src/types.ts`):
```typescript
export interface DeleteAccountRequest {
  user_id: string; // UUID użytkownika
}
```

**DeleteAccountResponse** (z `src/types.ts`):
```typescript
export interface DeleteAccountResponse {
  message: string; // Komunikat potwierdzający usunięcie
}
```

### Typy ViewModel dla komponentów

**UserPreferencesViewModel**:
```typescript
interface UserPreferencesViewModel {
  preferences: string; // Preferencje użytkownika (max 1500 znaków, język naturalny)
  characterCount: number; // Liczba znaków (obliczana)
  maxLength: number; // Maksymalna długość (1500)
}
```

**AppSettingsViewModel**:
```typescript
interface AppSettingsViewModel {
  darkMode: boolean; // Czy tryb ciemny jest włączony
  verificationViewMode: 'pagination' | 'infinite-scroll'; // Tryb wyświetlania weryfikacji
}
```

**AccountInfoViewModel**:
```typescript
interface AccountInfoViewModel {
  email: string; // Email użytkownika (z Supabase Auth)
  username: string; // Nazwa użytkownika (z profilu)
  createdAt: string; // Data rejestracji (ISO timestamp)
  formattedCreatedAt: string; // Sformatowana data rejestracji (np. "1 stycznia 2024")
}
```

**PasswordChangeFormViewModel**:
```typescript
interface PasswordChangeFormViewModel {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  errors: {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  isChanging: boolean;
  success: boolean;
}
```

## 6. Zarządzanie stanem

Widok ustawień używa kombinacji React hooks oraz React Query (TanStack Query) do zarządzania stanem i komunikacji z API.

### React Hooks

**useState:**
- `oldPassword` - string - wartość pola starego hasła
- `newPassword` - string - wartość pola nowego hasła
- `confirmPassword` - string - wartość pola potwierdzenia hasła
- `passwordErrors` - object - błędy walidacji dla każdego pola hasła
- `isChangingPassword` - boolean - stan zmiany hasła (loading)
- `passwordChangeSuccess` - boolean - czy zmiana hasła zakończyła się sukcesem
- `userPreferences` - string - wartość pola preferencji użytkownika
- `isSavingPreferences` - boolean - stan zapisywania preferencji (loading)
- `preferencesSaveSuccess` - boolean - czy zapis preferencji zakończył się sukcesem
- `darkMode` - boolean - stan przełącznika dark mode (z localStorage lub domyślnie false)
- `verificationViewMode` - 'pagination' | 'infinite-scroll' - tryb wyświetlania weryfikacji (z localStorage lub domyślnie 'pagination')
- `isSavingAppSettings` - boolean - stan zapisywania ustawień aplikacji (loading)
- `deleteAccountConfirmation` - string - wartość pola potwierdzenia usunięcia konta
- `isDeleteAccountDialogOpen` - boolean - czy modal usunięcia konta jest otwarty
- `isDeletingAccount` - boolean - stan usuwania konta (loading)

**useMemo:**
- `canDeleteAccount` - boolean - czy można usunąć konto (czy potwierdzenie jest poprawne)
- `passwordFormValid` - boolean - czy formularz zmiany hasła jest prawidłowy
- `preferencesCharacterCount` - number - liczba znaków w preferencjach
- `accountInfo` - AccountInfoViewModel - obliczone informacje o koncie

**useEffect:**
- Pobranie profilu użytkownika po zamontowaniu komponentu
- Pobranie preferencji użytkownika z localStorage lub bazy danych
- Pobranie ustawień aplikacji z localStorage
- Automatyczne zapisywanie ustawień aplikacji przy zmianie (debouncing)
- Automatyczne ukrywanie komunikatów sukcesu po 3 sekundach
- Synchronizacja dark mode z localStorage i `<html>` elementem

### React Query (TanStack Query)

**useQuery - pobieranie profilu użytkownika:**
```typescript
const { data: profile, isLoading, error, refetch } = useQuery({
  queryKey: ['profile', userId],
  queryFn: () => fetchUserProfile(userId),
  enabled: !!userId,
  staleTime: 300000, // 5 minut (profil zmienia się rzadko)
});
```

**useMutation - zmiana hasła:**
```typescript
const changePasswordMutation = useMutation({
  mutationFn: ({ oldPassword, newPassword }: { oldPassword: string, newPassword: string }) =>
    updatePassword(newPassword), // Supabase Auth wymaga tylko nowego hasła
  onSuccess: () => {
    // Najpierw weryfikacja starego hasła przez próbę logowania
    // Jeśli sukces, zmiana hasła
    toast.success('Hasło zostało zmienione pomyślnie');
    setPasswordChangeSuccess(true);
    // Reset formularza po 3 sekundach
  },
  onError: (error) => {
    toast.error('Nie udało się zmienić hasła');
    // Ustawienie błędów walidacji
  },
});
```

**useMutation - zapis preferencji użytkownika:**
```typescript
const savePreferencesMutation = useMutation({
  mutationFn: (preferences: string) => saveUserPreferences(userId, preferences),
  onSuccess: () => {
    toast.success('Preferencje zostały zapisane');
    setPreferencesSaveSuccess(true);
  },
  onError: (error) => {
    toast.error('Nie udało się zapisać preferencji');
  },
});
```

**useMutation - zapis ustawień aplikacji:**
```typescript
const saveAppSettingsMutation = useMutation({
  mutationFn: (settings: AppSettingsViewModel) => saveAppSettings(settings),
  onSuccess: () => {
    // Toast notification (auto-ukrywany po 2 sekundach)
    toast.success('Ustawienia zostały zapisane', { duration: 2000 });
  },
  onError: (error) => {
    toast.error('Nie udało się zapisać ustawień');
  },
});
```

**useMutation - usunięcie konta:**
```typescript
const deleteAccountMutation = useMutation({
  mutationFn: (userId: string) => deleteAccount(userId),
  onSuccess: () => {
    toast.success('Konto zostało usunięte');
    // Wylogowanie użytkownika
    // Przekierowanie na stronę główną
  },
  onError: (error) => {
    toast.error('Nie udało się usunąć konta');
  },
});
```

### Custom Hook: useSettings

Dla lepszej organizacji kodu można stworzyć custom hook `useSettings`:

```typescript
export function useSettings(userId: string) {
  // Query - pobieranie profilu
  const profileQuery = useQuery({ ... });
  
  // Mutations
  const changePasswordMutation = useMutation({ ... });
  const savePreferencesMutation = useMutation({ ... });
  const saveAppSettingsMutation = useMutation({ ... });
  const deleteAccountMutation = useMutation({ ... });
  
  // Local state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userPreferences, setUserPreferences] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [verificationViewMode, setVerificationViewMode] = useState<'pagination' | 'infinite-scroll'>('pagination');
  // ... pozostałe stany
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedViewMode = localStorage.getItem('verificationViewMode') as 'pagination' | 'infinite-scroll' | null;
    setDarkMode(savedDarkMode);
    setVerificationViewMode(savedViewMode || 'pagination');
  }, []);
  
  // Auto-save app settings with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      saveAppSettingsMutation.mutate({
        darkMode,
        verificationViewMode,
      });
      localStorage.setItem('darkMode', darkMode.toString());
      localStorage.setItem('verificationViewMode', verificationViewMode);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [darkMode, verificationViewMode]);
  
  // Computed values
  const passwordFormValid = useMemo(() => {
    return oldPassword.length > 0 &&
           newPassword.length >= 8 &&
           /[a-zA-Z]/.test(newPassword) &&
           /\d/.test(newPassword) &&
           newPassword === confirmPassword;
  }, [oldPassword, newPassword, confirmPassword]);
  
  const canDeleteAccount = useMemo(() => {
    return deleteAccountConfirmation === 'USUŃ';
  }, [deleteAccountConfirmation]);
  
  // Helper functions
  const handleChangePassword = async () => {
    // Najpierw weryfikacja starego hasła przez próbę logowania
    // Jeśli sukces, zmiana hasła
  };
  
  const handleSavePreferences = () => {
    savePreferencesMutation.mutate(userPreferences);
  };
  
  const handleDeleteAccount = () => {
    if (canDeleteAccount && userId) {
      deleteAccountMutation.mutate(userId);
    }
  };
  
  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordFormValid,
    handleChangePassword,
    // ... pozostałe wartości i funkcje
  };
}
```

### Przechowywanie preferencji i ustawień

**Preferencje użytkownika:**
- Przechowywane w localStorage jako backup
- Opcjonalnie w bazie danych (jeśli dodano pole `user_preferences` do tabeli `profiles`)
- Format: string (max 1500 znaków, język naturalny)

**Ustawienia aplikacji:**
- Przechowywane w localStorage:
  - `darkMode`: boolean (string "true"/"false")
  - `verificationViewMode`: 'pagination' | 'infinite-scroll'
- Synchronizacja z `<html>` elementem dla dark mode (dodanie/usunięcie klasy `dark`)

## 7. Integracja API

### Pobieranie profilu użytkownika

**Endpoint:** `GET /rest/v1/profiles?id=eq.{user_id}&select=*`

**Typ żądania:** Brak (GET request)

**Typ odpowiedzi:** `ProfileResponse[]`

**Implementacja:**
```typescript
async function fetchUserProfile(userId: string): Promise<ProfileResponse> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`,
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
    throw new Error(error.message || 'Failed to fetch profile');
  }
  
  const data = await response.json();
  return data[0];
}
```

### Zmiana hasła

**Endpoint:** `PUT /auth/v1/user`

**Typ żądania:** `UpdatePasswordRequest`

**Typ odpowiedzi:** `UpdatePasswordResponse`

**Uwaga:** Supabase Auth wymaga tylko nowego hasła w żądaniu. Weryfikacja starego hasła musi być wykonana po stronie klienta przez próbę logowania przed zmianą hasła.

**Implementacja:**
```typescript
async function updatePassword(newPassword: string): Promise<UpdatePasswordResponse> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  // Najpierw weryfikacja starego hasła przez próbę logowania
  // (musi być wykonana przed wywołaniem tej funkcji)
  
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      password: newPassword,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update password');
  }
  
  return await response.json();
}
```

**Weryfikacja starego hasła:**
```typescript
async function verifyOldPassword(email: string, password: string): Promise<boolean> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  // Próba logowania z starym hasłem
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  
  return response.ok;
}
```

### Zapis preferencji użytkownika

**Endpoint:** `PATCH /rest/v1/profiles?id=eq.{user_id}` (jeśli preferencje są w tabeli profiles)

**Lub:** Przechowywanie w localStorage (jeśli preferencje nie są jeszcze w bazie danych)

**Typ żądania:** `UpdateProfileRequest` (rozszerzony o `user_preferences`)

**Typ odpowiedzi:** `ProfileResponse[]` (z `Prefer: return=representation`)

**Implementacja:**
```typescript
async function saveUserPreferences(userId: string, preferences: string): Promise<void> {
  // Opcja 1: Jeśli preferencje są w bazie danych
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  // Jeśli tabela profiles ma pole user_preferences:
  const response = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_preferences: preferences,
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to save preferences');
  }
  
  // Opcja 2: Przechowywanie w localStorage (backup)
  localStorage.setItem('userPreferences', preferences);
}
```

### Zapis ustawień aplikacji

**Endpoint:** Brak (przechowywanie w localStorage)

**Typ żądania:** Brak (localStorage)

**Typ odpowiedzi:** Brak

**Implementacja:**
```typescript
function saveAppSettings(settings: AppSettingsViewModel): void {
  localStorage.setItem('darkMode', settings.darkMode.toString());
  localStorage.setItem('verificationViewMode', settings.verificationViewMode);
  
  // Synchronizacja dark mode z <html> elementem
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
```

### Usunięcie konta

**Endpoint:** `DELETE /auth/v1/admin/users/{user_id}` (przez Edge Function)

**Uwaga:** Zgodnie z API plan, usunięcie konta powinno być zaimplementowane jako Edge Function, aby obsłużyć cascade deletion poprawnie.

**Typ żądania:** `DeleteAccountRequest`

**Typ odpowiedzi:** `DeleteAccountResponse`

**Implementacja:**
```typescript
async function deleteAccount(userId: string): Promise<DeleteAccountResponse> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  // Wywołanie Edge Function (jeśli dostępna)
  // Lub bezpośrednie wywołanie Supabase Auth API (wymaga service_role_key - tylko po stronie serwera)
  const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      user_id: userId,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete account');
  }
  
  return await response.json();
}
```

**Alternatywnie (jeśli Edge Function nie jest dostępna):**
Usunięcie konta może być wykonane przez Supabase Auth API, ale wymaga service_role_key, który nie powinien być dostępny po stronie klienta. W takim przypadku należy użyć Edge Function lub API endpoint po stronie serwera.

## 8. Interakcje użytkownika

### Zmiana hasła

1. Użytkownik wprowadza stare hasło, nowe hasło i potwierdzenie hasła
2. Walidacja inline: sprawdzanie długości nowego hasła, zgodności haseł
3. Użytkownik klika przycisk "Zmień hasło"
4. Walidacja przed wysłaniem: sprawdzanie czy wszystkie pola są wypełnione i prawidłowe
5. Weryfikacja starego hasła: próba logowania z starym hasłem (weryfikacja po stronie klienta)
6. Jeśli weryfikacja sukces: wywołanie API `PUT /auth/v1/user` z nowym hasłem
7. Po sukcesie:
   - Toast notification: "Hasło zostało zmienione pomyślnie"
   - Wyświetlenie komunikatu sukcesu w formularzu
   - Reset formularza (wyczyszczenie pól) po 3 sekundach
8. Po błędzie:
   - Komunikaty błędów wyświetlane inline pod odpowiednimi polami
   - Toast notification z komunikatem błędu

### Zapis preferencji użytkownika

1. Użytkownik wprowadza preferencje w polu tekstowym (max 1500 znaków)
2. Licznik znaków pokazuje "X / 1500"
3. Walidacja inline: sprawdzanie długości przy wprowadzaniu
4. Użytkownik klika przycisk "Zapisz preferencje"
5. Walidacja przed wysłaniem: sprawdzanie czy preferencje nie przekraczają 1500 znaków
6. Wywołanie API `PATCH /rest/v1/profiles` (jeśli preferencje są w bazie) lub zapis do localStorage
7. Po sukcesie:
   - Toast notification: "Preferencje zostały zapisane"
   - Wyświetlenie komunikatu sukcesu w formularzu
   - Ukrycie komunikatu sukcesu po 3 sekundach
8. Po błędzie:
   - Toast notification z komunikatem błędu
   - Komunikat błędu wyświetlany pod polem preferencji

### Zmiana ustawień aplikacji

1. Użytkownik przełącza przełącznik dark mode lub zmienia tryb wyświetlania weryfikacji
2. Automatyczne zapisywanie do localStorage (debouncing 500ms)
3. Synchronizacja dark mode z `<html>` elementem (dodanie/usunięcie klasy `dark`)
4. Toast notification: "Ustawienia zostały zapisane" (auto-ukrywany po 2 sekundach)
5. Jeśli błąd zapisu: toast notification z komunikatem błędu

### Usunięcie konta

1. Użytkownik klika przycisk "Usuń konto" w sekcji Konto
2. Otwiera się modal `DeleteAccountDialog` z ostrzeżeniem
3. Użytkownik czyta ostrzeżenie o trwałym usunięciu danych
4. Użytkownik wpisuje "USUŃ" w pole potwierdzenia
5. Walidacja: sprawdzanie czy potwierdzenie jest poprawne (dokładnie "USUŃ")
6. Przycisk "Usuń konto" staje się aktywny po wpisaniu poprawnego potwierdzenia
7. Użytkownik klika przycisk "Usuń konto"
8. Wywołanie API `DELETE /functions/v1/delete-account` (lub Edge Function)
9. Po sukcesie:
   - Toast notification: "Konto zostało usunięte"
   - Wylogowanie użytkownika
   - Przekierowanie na stronę główną (`/`)
10. Po błędzie:
    - Toast notification z komunikatem błędu
    - Modal pozostaje otwarty z możliwością ponowienia

### Anulowanie usunięcia konta

1. Użytkownik klika przycisk "Anuluj" w modalu lub kliknięcie poza modalem lub Escape
2. Modal zamyka się bez zmian
3. Pole potwierdzenia jest czyszczone
4. Brak zmian w koncie

## 9. Warunki i walidacja

### Walidacja po stronie klienta

**Stare hasło:**
- Wymagane, nie może być puste
- Walidacja po stronie serwera: sprawdzanie czy hasło jest poprawne przez próbę logowania
- Komunikaty błędów:
  - Puste pole: "Stare hasło jest wymagane"
  - Nieprawidłowe hasło: "Nieprawidłowe stare hasło" (po próbie zmiany)

**Nowe hasło:**
- Wymagane, nie może być puste
- Minimalna długość: 8 znaków
- Musi zawierać litery (a-z, A-Z) i cyfry (0-9)
- Walidacja regex: `/(?=.*[a-zA-Z])(?=.*\d)/`
- Komunikaty błędów:
  - Puste pole: "Nowe hasło jest wymagane"
  - Za krótkie: "Hasło musi zawierać co najmniej 8 znaków"
  - Za słabe: "Hasło musi zawierać litery i cyfry"

**Potwierdzenie hasła:**
- Wymagane, nie może być puste
- Musi być identyczne z nowym hasłem
- Komunikaty błędów:
  - Puste pole: "Potwierdzenie hasła jest wymagane"
  - Niezgodne: "Hasła nie są identyczne"

**Preferencje użytkownika:**
- Opcjonalne, może być puste
- Maksymalna długość: 1500 znaków
- Komunikaty błędów:
  - Za długie: "Preferencje nie mogą przekraczać 1500 znaków (obecnie: X znaków)"

**Potwierdzenie usunięcia konta:**
- Wymagane wpisanie dokładnie "USUŃ" (case-sensitive)
- Komunikaty błędów:
  - Nieprawidłowe potwierdzenie: "Wpisz 'USUŃ' aby potwierdzić usunięcie konta"

### Walidacja po stronie serwera

Wszystkie warunki walidacji po stronie klienta są również weryfikowane po stronie serwera przez API Supabase:

- **Stare hasło:** Weryfikacja przez próbę logowania przed zmianą hasła
- **Nowe hasło:** Supabase Auth wymaga min 8 znaków, litery i cyfry (walidacja po stronie serwera)
- **Preferencje:** Jeśli przechowywane w bazie, max 1500 znaków (CHECK constraint)
- **Usunięcie konta:** Sprawdzanie czy użytkownik istnieje i należy do zalogowanego użytkownika (RLS)

### Wpływ walidacji na stan interfejsu

**Błędy walidacji pól formularza:**
- Komunikaty błędów wyświetlane inline pod odpowiednimi polami
- Przycisk "Zmień hasło" / "Zapisz preferencje" jest nieaktywny (disabled) jeśli są błędy walidacji
- Pola z błędami mają czerwony border i ikonę błędu

**Brak potwierdzenia usunięcia konta:**
- Przycisk "Usuń konto" w modalu jest nieaktywny (disabled)
- Tooltip wyjaśniający: "Wpisz 'USUŃ' aby potwierdzić"

**Komunikaty sukcesu:**
- Wyświetlane w formularzu po pomyślnym zapisaniu
- Automatyczne ukrywanie po 3 sekundach
- Toast notifications dla wszystkich operacji

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
- Przekierowanie na `/login?redirect=/settings`
- Zachowanie stanu formularzy w localStorage dla powrotu po zalogowaniu

**Brak autoryzacji:**
- Przekierowanie na `/login?redirect=/settings`
- Toast notification: "Musisz być zalogowany, aby zobaczyć ustawienia."

### Błędy walidacji (400)

**Nieprawidłowe stare hasło:**
- Komunikat błędu inline pod polem starego hasła: "Nieprawidłowe stare hasło"
- Toast notification: "Nieprawidłowe stare hasło. Sprawdź wprowadzone dane."

**Nowe hasło za słabe:**
- Komunikat błędu inline pod polem nowego hasła: "Hasło musi zawierać co najmniej 8 znaków, w tym litery i cyfry"
- Toast notification z komunikatem błędu z API

**Preferencje za długie:**
- Komunikat błędu inline pod polem preferencji: "Preferencje nie mogą przekraczać 1500 znaków"
- Toast notification z komunikatem błędu

### Błędy nie znaleziono (404)

**Profil nie istnieje:**
- Toast notification: "Nie znaleziono profilu użytkownika."
- Przekierowanie na Dashboard (`/`) z komunikatem błędu

### Błędy serwera (500)

**Błąd serwera podczas zmiany hasła:**
- Toast notification: "Wystąpił błąd serwera podczas zmiany hasła. Spróbuj ponownie."
- Możliwość ponowienia operacji

**Błąd serwera podczas zapisu preferencji:**
- Toast notification: "Wystąpił błąd serwera podczas zapisu preferencji. Spróbuj ponownie."
- Zapis do localStorage jako backup
- Możliwość ponowienia operacji

**Błąd serwera podczas usunięcia konta:**
- Toast notification: "Wystąpił błąd serwera podczas usuwania konta. Spróbuj ponownie."
- Modal pozostaje otwarty z możliwością ponowienia

### Przypadki brzegowe

**Brak profilu użytkownika:**
- Wyświetlenie komunikatu: "Nie znaleziono profilu użytkownika."
- Przycisk "Wróć do dashboardu"
- Opcjonalnie: możliwość utworzenia profilu

**Preferencje nie są jeszcze w bazie danych:**
- Przechowywanie w localStorage jako backup
- Wyświetlenie informacji: "Preferencje są zapisywane lokalnie. Zostaną zsynchronizowane z serwerem po dodaniu wsparcia."
- Opcjonalnie: przycisk "Synchronizuj z serwerem" (jeśli wsparcie zostanie dodane)

**Usunięcie konta wymaga Edge Function:**
- Jeśli Edge Function nie jest dostępna, wyświetlenie komunikatu: "Usunięcie konta jest obecnie niedostępne. Skontaktuj się z supportem."
- Opcjonalnie: link do formularza kontaktowego

**Błąd podczas synchronizacji dark mode:**
- Fallback do localStorage
- Toast notification: "Nie udało się zsynchronizować ustawień. Zmiany są zapisane lokalnie."

**Konflikt podczas zapisu preferencji (preferencje zostały zmienione przez innego użytkownika):**
- Toast notification: "Preferencje zostały zmienione. Odśwież stronę, aby zobaczyć najnowsze zmiany."
- Automatyczne odświeżenie danych profilu

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury plików

1. Utworzenie pliku strony Astro: `src/pages/settings.astro`
2. Utworzenie katalogu komponentów: `src/components/settings/`
3. Utworzenie plików komponentów:
   - `src/components/settings/SettingsView.tsx`
   - `src/components/settings/PasswordChangeForm.tsx`
   - `src/components/settings/UserPreferencesForm.tsx`
   - `src/components/settings/AppSettingsForm.tsx`
   - `src/components/settings/DeleteAccountDialog.tsx`
4. Utworzenie pliku funkcji API: `src/lib/api/settings.ts`
5. Utworzenie custom hook: `src/hooks/useSettings.ts` (opcjonalnie)

### Krok 2: Implementacja funkcji API

1. Utworzenie funkcji `fetchUserProfile(userId: string): Promise<ProfileResponse>`
2. Utworzenie funkcji `verifyOldPassword(email: string, password: string): Promise<boolean>`
3. Utworzenie funkcji `updatePassword(newPassword: string): Promise<UpdatePasswordResponse>`
4. Utworzenie funkcji `saveUserPreferences(userId: string, preferences: string): Promise<void>`
5. Utworzenie funkcji `saveAppSettings(settings: AppSettingsViewModel): void` (localStorage)
6. Utworzenie funkcji `deleteAccount(userId: string): Promise<DeleteAccountResponse>`
7. Integracja z Supabase client (`src/lib/supabase.ts`) dla pobrania sesji użytkownika

### Krok 3: Implementacja komponentu PasswordChangeForm

1. Użycie `form` z Shadcn/ui jako kontener
2. Pola `Input` dla starego hasła, nowego hasła i potwierdzenia (type="password")
3. Walidacja inline dla każdego pola:
   - Stare hasło: wymagane
   - Nowe hasło: wymagane, min 8 znaków, litery i cyfry
   - Potwierdzenie: wymagane, zgodne z nowym hasłem
4. Wyświetlanie komunikatów błędów pod odpowiednimi polami
5. Przycisk "Zmień hasło" (disabled jeśli są błędy lub podczas wysyłania)
6. Komunikat sukcesu (conditional, auto-ukrywany)
7. Obsługa onSubmit (callback od rodzica)

### Krok 4: Implementacja komponentu UserPreferencesForm

1. Użycie `form` z Shadcn/ui jako kontener
2. Pole `Textarea` dla preferencji (max 1500 znaków)
3. Licznik znaków "X / 1500"
4. Walidacja inline: sprawdzanie długości przy wprowadzaniu
5. Wyświetlanie komunikatu błędu pod polem (jeśli za długie)
6. Przycisk "Zapisz preferencje" (disabled podczas zapisywania)
7. Komunikat sukcesu (conditional, auto-ukrywany)
8. Obsługa onSubmit (callback od rodzica)

### Krok 5: Implementacja komponentu AppSettingsForm

1. Użycie `form` z Shadcn/ui jako kontener
2. Element `SettingItem` dla dark mode:
   - `Label` - "Tryb ciemny"
   - `Switch` - przełącznik dark mode
   - Opis ustawienia
3. Element `SettingItem` dla trybu wyświetlania:
   - `Label` - "Tryb wyświetlania weryfikacji"
   - `Select` - dropdown (Paginacja / Infinite Scroll)
   - Opis ustawienia
4. Komunikat sukcesu auto-save (conditional, auto-ukrywany po 2 sekundach)
5. Obsługa onChange dla przełączników (callback od rodzica z auto-save)

### Krok 6: Implementacja komponentu DeleteAccountDialog

1. Użycie `Dialog` z Shadcn/ui jako kontener
2. `DialogHeader` z tytułem "Usunięcie konta"
3. `Alert` z ostrzeżeniem o trwałym usunięciu danych (destrukcyjny styl)
4. Tekst ostrzeżenia wyjaśniający konsekwencje
5. Pole `Input` dla potwierdzenia (wymaga wpisania "USUŃ")
6. Walidacja: sprawdzanie czy potwierdzenie jest poprawne
7. Przycisk "Usuń konto" (destrukcyjny styl, disabled jeśli nie potwierdzono)
8. Przycisk "Anuluj"
9. Obsługa zamknięcia modala (kliknięcie poza modalem, Escape, przycisk Anuluj)
10. Focus trap w modalu (dostępność)

### Krok 7: Implementacja komponentu SettingsView

1. Integracja z React Query:
   - `useQuery` dla pobrania profilu (`queryKey: ['profile', userId]`)
   - `useMutation` dla zmiany hasła
   - `useMutation` dla zapisu preferencji
   - `useMutation` dla zapisu ustawień aplikacji
   - `useMutation` dla usunięcia konta
2. Stan lokalny:
   - Pola formularza zmiany hasła
   - Pole preferencji użytkownika
   - Ustawienia aplikacji (dark mode, tryb wyświetlania)
   - Stan modala usunięcia konta
3. Obliczone wartości (useMemo):
   - `passwordFormValid` - czy formularz zmiany hasła jest prawidłowy
   - `canDeleteAccount` - czy można usunąć konto
   - `accountInfo` - obliczone informacje o koncie
4. Funkcje pomocnicze:
   - `handleChangePassword()` - obsługa zmiany hasła (weryfikacja starego hasła + zmiana)
   - `handleSavePreferences()` - obsługa zapisu preferencji
   - `handleDeleteAccount()` - obsługa usunięcia konta
5. Renderowanie:
   - Sekcja nagłówkowa z tytułem
   - Sekcja zmiany hasła (PasswordChangeForm)
   - Sekcja preferencji użytkownika (UserPreferencesForm)
   - Sekcja ustawień aplikacji (AppSettingsForm)
   - Sekcja konta z informacjami i przyciskiem usunięcia
   - DeleteAccountDialog (warunkowo renderowany)
   - Toast notifications

### Krok 8: Implementacja automatycznego zapisywania ustawień

1. useEffect dla auto-save ustawień aplikacji z debouncing (500ms)
2. Synchronizacja dark mode z `<html>` elementem (dodanie/usunięcie klasy `dark`)
3. Zapis do localStorage przy każdej zmianie
4. Toast notification po zapisaniu (auto-ukrywany po 2 sekundach)

### Krok 9: Implementacja weryfikacji starego hasła

1. Funkcja `verifyOldPassword()` - próba logowania z starym hasłem
2. Wywołanie przed zmianą hasła w `handleChangePassword()`
3. Obsługa błędów: jeśli weryfikacja nie powiedzie się, wyświetlenie komunikatu błędu
4. Jeśli weryfikacja sukces: kontynuacja zmiany hasła

### Krok 10: Implementacja strony Astro

1. Pobranie userId z sesji użytkownika (Supabase Auth)
2. Sprawdzenie autoryzacji (middleware lub w komponencie)
3. Przekazanie userId do komponentu `SettingsView`
4. Dodanie meta tagów dla SEO
5. Importowanie komponentu `SettingsView` jako React component (client-side)

### Krok 11: Implementacja obsługi błędów

1. Obsługa błędów sieciowych (toast notifications)
2. Obsługa błędów autoryzacji (przekierowanie na login)
3. Obsługa błędów walidacji (komunikaty inline)
4. Obsługa błędów serwera (toast notifications z możliwością retry)
5. Obsługa przypadków brzegowych (brak profilu, preferencje w localStorage)

### Krok 12: Implementacja dostępności (WCAG AA)

1. Semantyczny HTML (`<main>`, `<section>`, `<form>`)
2. Właściwe nagłówki hierarchiczne (`<h1>`, `<h2>`)
3. ARIA labels dla przycisków i przełączników
4. ARIA describedby dla komunikatów błędów i opisów
5. Keyboard navigation (Tab, Enter, Space, Escape)
6. Focus trap w modalu
7. Widoczne focus states (outline)
8. Kontrast kolorów zgodny z WCAG AA (4.5:1 dla tekstu)

### Krok 13: Implementacja synchronizacji dark mode

1. useEffect dla synchronizacji dark mode z localStorage przy ładowaniu
2. useEffect dla synchronizacji dark mode z `<html>` elementem przy zmianie
3. Obsługa preferencji systemowych (opcjonalnie, `prefers-color-scheme`)

### Krok 14: Testowanie

1. Testowanie zmiany hasła (różne scenariusze: poprawne, błędne stare hasło, za słabe nowe hasło)
2. Testowanie zapisu preferencji (różne scenariusze: puste, max długość, za długie)
3. Testowanie ustawień aplikacji (dark mode, tryb wyświetlania, auto-save)
4. Testowanie usunięcia konta (modal, potwierdzenie, błędy)
5. Testowanie walidacji (wszystkie pola, wszystkie scenariusze błędów)
6. Testowanie obsługi błędów (sieć, autoryzacja, walidacja, serwer)
7. Testowanie dostępności (keyboard navigation, screen reader, kontrast)
8. Testowanie synchronizacji dark mode z localStorage i `<html>` elementem
9. Testowanie responsive design (desktop-first, adaptacja mobile)

### Krok 15: Optymalizacja i poprawki

1. Optymalizacja renderowania (React.memo dla formularzy, opcjonalnie)
2. Debouncing dla auto-save ustawień aplikacji
3. Cache'owanie danych profilu (React Query staleTime)
4. Poprawki zgodnie z feedbackiem z testów
5. Optymalizacja wydajności (unikanie niepotrzebnych re-renderów)

