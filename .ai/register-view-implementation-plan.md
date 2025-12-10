# Plan implementacji widoku Rejestracja

## 1. Przegląd

Widok rejestracji (`/register`) umożliwia nowym użytkownikom utworzenie konta w aplikacji 10xCards. Widok składa się z formularza zawierającego pola: email, hasło i potwierdzenie hasła, zintegrowanego z Supabase Auth API. Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowywany na ekran onboardingu, a następnie na dashboard (`/`). W przypadku błędów (np. email już istnieje, słabe hasło, niezgodność haseł) wyświetlane są odpowiednie komunikaty błędów inline pod polami formularza.

Widok jest zaimplementowany jako strona Astro z komponentem React `RegisterForm` do obsługi interakcji użytkownika. Wszystkie komponenty UI pochodzą z biblioteki Shadcn/ui, zapewniając spójność z resztą aplikacji. Widok implementuje wymagania z PRD (F-001) i user story US-001.

## 2. Routing widoku

**Ścieżka**: `/register`

**Plik**: `src/pages/register.astro`

**Middleware**: Widok jest publiczny (nie wymaga autoryzacji). Jeśli użytkownik jest już zalogowany i próbuje wejść na `/register`, powinien być przekierowany na dashboard (`/`).

**Query Parameters**: Brak (widok rejestracji nie obsługuje przekierowań, ponieważ nowy użytkownik nie ma jeszcze sesji).

**Przykład URL**: `/register`

## 3. Struktura komponentów

```
register.astro (Astro Page)
└── RegisterForm (React Component)
    ├── Form (HTML form element)
    │   ├── Input (Shadcn/ui) - Email
    │   │   └── Label (Shadcn/ui)
    │   ├── Input (Shadcn/ui) - Password
    │   │   └── Label (Shadcn/ui)
    │   │   └── PasswordStrengthIndicator (optional, custom component)
    │   ├── Input (Shadcn/ui) - Confirm Password
    │   │   └── Label (Shadcn/ui)
    │   ├── Alert (Shadcn/ui) - Error message (conditional)
    │   ├── Button (Shadcn/ui) - Submit ("Zarejestruj się")
    │   └── Link (HTML) - "Masz już konto? Zaloguj się"
    └── Toast (Shadcn/ui) - Network errors (conditional)
```

## 4. Szczegóły komponentów

### RegisterForm (React Component)

**Lokalizacja**: `src/components/forms/RegisterForm.tsx`

**Opis komponentu**: Główny komponent formularza rejestracji. Zarządza stanem formularza (email, hasło, potwierdzenie hasła), walidacją po stronie klienta (format email, siła hasła, zgodność haseł), integracją z Supabase Auth API oraz obsługą błędów. Komponent jest klient-side (React), co umożliwia interaktywność bez przeładowania strony. Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowywany na ekran onboardingu.

**Główne elementy HTML i komponenty dzieci**:
- `<form>` - główny element formularza z `onSubmit` handler
- `Input` (Shadcn/ui) - pole email z typem `email`
- `Input` (Shadcn/ui) - pole hasła z typem `password` i opcjonalnym wskaźnikiem siły hasła
- `Input` (Shadcn/ui) - pole potwierdzenia hasła z typem `password`
- `Label` (Shadcn/ui) - etykiety dla każdego pola
- `Alert` (Shadcn/ui) - wyświetlanie błędów walidacji inline pod polami
- `Button` (Shadcn/ui) - przycisk submit z stanem loading (spinner podczas rejestracji)
- `Link` (HTML) - link do strony logowania (`/login`)
- `Toast` (Shadcn/ui) - toast notifications dla błędów sieci

**Obsługiwane zdarzenia**:
- `onChange` - aktualizacja wartości pól formularza w stanie
- `onBlur` - walidacja pola po opuszczeniu (touched state)
- `onSubmit` - walidacja i wysłanie formularza do Supabase Auth API
- `onFocus` - czyszczenie błędów dla danego pola (opcjonalnie)

**Warunki walidacji** (szczegółowe, zgodnie z API):

**Email**:
- Wymagane (nie może być puste)
- Format email: musi spełniać regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Unikalność: sprawdzana przez API (błąd 422 - Email already registered)
- Komunikaty błędów:
  - Puste pole: "Email jest wymagany"
  - Nieprawidłowy format: "Nieprawidłowy format email"
  - Email już istnieje: "Ten email jest już zarejestrowany" (z API)

**Hasło**:
- Wymagane (nie może być puste)
- Minimalna długość: 6 znaków (zgodnie z konfiguracją Supabase `minimum_password_length = 6`)
- Rekomendowana długość: 8+ znaków dla lepszego bezpieczeństwa
- Siła hasła: opcjonalnie można dodać wskaźnik siły hasła (słabe/średnie/silne)
- Komunikaty błędów:
  - Puste pole: "Hasło jest wymagane"
  - Za krótkie (< 6 znaków): "Hasło musi zawierać co najmniej 6 znaków"
  - Za słabe (< 8 znaków): "Hasło powinno zawierać co najmniej 8 znaków dla lepszego bezpieczeństwa"

**Potwierdzenie hasła**:
- Wymagane (nie może być puste)
- Zgodność z hasłem: musi być identyczne z polem "Hasło"
- Komunikaty błędów:
  - Puste pole: "Potwierdzenie hasła jest wymagane"
  - Niezgodność: "Hasła nie są identyczne"

**Walidacja po stronie serwera (API)**:
- Supabase Auth API automatycznie weryfikuje format email i siłę hasła
- Błędy z API są mapowane na komunikaty w języku polskim:
  - `400` - Invalid email format or password too weak → "Nieprawidłowy format email lub zbyt słabe hasło"
  - `422` - Email already registered → "Ten email jest już zarejestrowany"

**Typy (DTO i ViewModel)**:

**Props komponentu**:
```typescript
interface RegisterFormProps {
  // Brak props - komponent jest samowystarczalny
}
```

**Stan komponentu (ViewModel)**:
```typescript
interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string; // Dla błędów API
  };
  touched: {
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  };
  isSubmitting: boolean;
  passwordStrength?: 'weak' | 'medium' | 'strong'; // Opcjonalnie
}
```

**Typy Request/Response (z `src/types.ts`)**:
- Request: `RegisterUserRequest` - `{ email: string, password: string, data?: { username: string } }`
- Response: `RegisterUserResponse` - `{ user: { id: string, email: string, created_at: string }, session: { access_token: string, refresh_token: string, expires_in: number } }`

**Props**: Brak props - komponent jest samowystarczalny i nie przyjmuje żadnych props od rodzica.

### PasswordStrengthIndicator (Opcjonalny komponent)

**Lokalizacja**: `src/components/forms/PasswordStrengthIndicator.tsx`

**Opis komponentu**: Opcjonalny komponent wyświetlający wizualny wskaźnik siły hasła. Pomaga użytkownikowi stworzyć silne hasło.

**Główne elementy**: 
- Pasek postępu lub kolory wskaźników (czerwony/żółty/zielony)
- Tekst opisowy: "Słabe" / "Średnie" / "Silne"

**Props**:
```typescript
interface PasswordStrengthIndicatorProps {
  password: string;
}
```

**Logika siły hasła**:
- Słabe: < 6 znaków lub tylko litery lub tylko cyfry
- Średnie: 6-7 znaków z literami i cyframi, lub 8+ znaków z tylko literami/cyframi
- Silne: 8+ znaków z literami i cyframi (opcjonalnie z symbolami)

## 5. Typy

### Typy Request/Response (z `src/types.ts`)

**RegisterUserRequest**:
```typescript
interface RegisterUserRequest {
  email: string;           // Wymagane, format email
  password: string;         // Wymagane, min 6 znaków (Supabase), rekomendowane 8+
  data?: {                 // Opcjonalne metadane użytkownika
    username: string;       // Opcjonalna nazwa użytkownika (nie używana w MVP)
  };
}
```

**RegisterUserResponse**:
```typescript
interface RegisterUserResponse {
  user: {
    id: string;            // UUID użytkownika
    email: string;         // Email użytkownika
    created_at: string;     // Data utworzenia konta (ISO 8601)
  };
  session: {
    access_token: string;   // JWT token dostępu
    refresh_token: string;  // Token odświeżania
    expires_in: number;     // Czas wygaśnięcia w sekundach (domyślnie 3600)
  };
}
```

### Typy stanu komponentu (ViewModel)

**RegisterFormState**:
```typescript
interface RegisterFormState {
  // Wartości pól formularza
  email: string;
  password: string;
  confirmPassword: string;
  
  // Błędy walidacji (klucz = nazwa pola)
  errors: {
    email?: string;           // Błąd walidacji email
    password?: string;         // Błąd walidacji hasła
    confirmPassword?: string;  // Błąd walidacji potwierdzenia hasła
    general?: string;         // Ogólny błąd (np. z API)
  };
  
  // Flagi "dotkniętych" pól (dla walidacji onBlur)
  touched: {
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  };
  
  // Stan ładowania podczas rejestracji
  isSubmitting: boolean;
  
  // Opcjonalny wskaźnik siły hasła
  passwordStrength?: 'weak' | 'medium' | 'strong';
}
```

### Typy błędów API

**AuthError** (z Supabase):
```typescript
interface AuthError {
  message: string;         // Komunikat błędu
  status?: number;         // Kod statusu HTTP
  name?: string;           // Nazwa błędu (np. "AuthApiError")
}
```

**Mapowanie błędów na komunikaty**:
- `invalid_email` → "Nieprawidłowy format email"
- `weak_password` → "Hasło jest zbyt słabe"
- `email_already_registered` lub `422` → "Ten email jest już zarejestrowany"
- `signup_disabled` → "Rejestracja jest obecnie wyłączona"
- Inne błędy → "Wystąpił błąd podczas rejestracji. Spróbuj ponownie."

## 6. Zarządzanie stanem

Widok rejestracji używa lokalnego stanu React (`useState`) do zarządzania wartościami formularza, błędami walidacji i stanem ładowania. Nie wymaga custom hooka ani globalnego stanu, ponieważ:

1. **Stan formularza**: Zarządzany lokalnie przez `useState` w komponencie `RegisterForm`
2. **Walidacja**: Wykonywana synchronicznie po stronie klienta przed wysłaniem do API
3. **Sesja**: Po pomyślnej rejestracji sesja jest automatycznie zarządzana przez Supabase (localStorage/cookies)
4. **Przekierowanie**: Wykonywane przez `window.location.href` po sukcesie (pełne przeładowanie strony)

**Struktura stanu**:
```typescript
const [formState, setFormState] = useState<RegisterFormState>({
  email: '',
  password: '',
  confirmPassword: '',
  errors: {},
  touched: {
    email: false,
    password: false,
    confirmPassword: false,
  },
  isSubmitting: false,
});
```

**Funkcje pomocnicze do zarządzania stanem**:
- `setEmail(value: string)` - aktualizacja email i czyszczenie błędu
- `setPassword(value: string)` - aktualizacja hasła, obliczenie siły hasła, czyszczenie błędu
- `setConfirmPassword(value: string)` - aktualizacja potwierdzenia hasła i walidacja zgodności
- `validateField(fieldName: string, value: string)` - walidacja pojedynczego pola
- `validateForm()` - walidacja całego formularza przed wysłaniem
- `setFieldError(fieldName: string, error: string | null)` - ustawienie błędu dla pola
- `setFieldTouched(fieldName: string)` - oznaczenie pola jako "dotknięte"

## 7. Integracja API

Widok rejestracji integruje się bezpośrednio z **Supabase Auth API** przez klienta Supabase (`@supabase/supabase-js`).

**Endpoint**: `POST /auth/v1/signup` (wewnętrznie przez `supabase.auth.signUp()`)

**Klient Supabase**: Użycie klienta z `src/lib/supabase.ts`:
```typescript
import { supabase } from '@/lib/supabase';
```

**Wywołanie API**:
```typescript
const { data, error } = await supabase.auth.signUp({
  email: formState.email,
  password: formState.password,
  // Opcjonalnie: data: { username: '...' } - nie używane w MVP
});
```

**Typy Request**:
- `email: string` - adres email użytkownika
- `password: string` - hasło użytkownika (min 6 znaków)
- `options?: { data?: { username?: string } }` - opcjonalne metadane (nie używane w MVP)

**Typy Response**:

**Sukces (200)**:
```typescript
{
  data: {
    user: {
      id: string;           // UUID użytkownika
      email: string;         // Email użytkownika
      created_at: string;     // Data utworzenia (ISO 8601)
      // ... inne pola Supabase User
    },
    session: {
      access_token: string;  // JWT token
      refresh_token: string; // Token odświeżania
      expires_in: number;    // 3600 sekund (1 godzina)
      // ... inne pola Supabase Session
    }
  },
  error: null
}
```

**Błąd (400, 422)**:
```typescript
{
  data: {
    user: null,
    session: null
  },
  error: {
    message: string;         // Komunikat błędu
    status?: number;         // Kod HTTP (400, 422)
    name?: string;           // "AuthApiError"
  }
}
```

**Obsługa odpowiedzi**:
1. **Sukces**: 
   - Sesja jest automatycznie zapisana przez Supabase
   - Przekierowanie na ekran onboardingu (lub dashboard, jeśli onboarding pominięty)
   - Użycie `window.location.href` dla pełnego przeładowania strony

2. **Błąd**:
   - Mapowanie kodu błędu na komunikat w języku polskim
   - Wyświetlenie komunikatu błędu inline pod odpowiednim polem lub jako ogólny błąd
   - Ustawienie `isSubmitting = false` aby umożliwić ponowną próbę

**Tworzenie profilu użytkownika**: Po pomyślnej rejestracji, Supabase automatycznie wywołuje trigger w bazie danych, który tworzy rekord w tabeli `profiles` (jeśli skonfigurowany). W przeciwnym razie profil może być utworzony przez Edge Function lub ręcznie przez użytkownika w ustawieniach.

## 8. Interakcje użytkownika

### 8.1. Wprowadzanie danych

**Akcja**: Użytkownik wprowadza email w pole email.

**Reakcja**:
- Wartość pola jest aktualizowana w stanie (`setEmail`)
- Jeśli pole było dotknięte i miał błąd, błąd jest czyszczony
- Walidacja formatu email jest wykonywana przy `onBlur` (opuszczenie pola)
- Jeśli format jest nieprawidłowy → wyświetlenie komunikatu błędu inline pod polem

**Akcja**: Użytkownik wprowadza hasło w pole hasła.

**Reakcja**:
- Wartość pola jest aktualizowana w stanie (`setPassword`)
- Jeśli pole było dotknięte i miał błąd, błąd jest czyszczony
- Hasło jest domyślnie ukryte (typ `password`)
- Opcjonalnie: obliczenie siły hasła i wyświetlenie wskaźnika siły hasła
- Jeśli hasło jest za krótkie (< 6 znaków) → wyświetlenie komunikatu błędu inline

**Akcja**: Użytkownik wprowadza potwierdzenie hasła.

**Reakcja**:
- Wartość pola jest aktualizowana w stanie (`setConfirmPassword`)
- Jeśli pole było dotknięte i miał błąd, błąd jest czyszczony
- Walidacja zgodności z hasłem jest wykonywana w czasie rzeczywistym
- Jeśli hasła nie są zgodne → wyświetlenie komunikatu błędu inline pod polem potwierdzenia

### 8.2. Walidacja

**Akcja**: Użytkownik opuszcza pole email (`onBlur`).

**Reakcja**:
- Ustawienie `touched.email = true`
- Walidacja formatu email (regex)
- Jeśli błąd → wyświetlenie komunikatu błędu inline pod polem
- Jeśli poprawny → usunięcie komunikatu błędu (jeśli był)

**Akcja**: Użytkownik opuszcza pole hasła (`onBlur`).

**Reakcja**:
- Ustawienie `touched.password = true`
- Walidacja czy pole nie jest puste i czy spełnia minimalne wymagania (6 znaków)
- Jeśli błąd → wyświetlenie komunikatu błędu inline pod polem
- Jeśli poprawny → usunięcie komunikatu błędu

**Akcja**: Użytkownik opuszcza pole potwierdzenia hasła (`onBlur`).

**Reakcja**:
- Ustawienie `touched.confirmPassword = true`
- Walidacja zgodności z hasłem
- Jeśli błąd → wyświetlenie komunikatu błędu inline pod polem
- Jeśli poprawny → usunięcie komunikatu błędu

### 8.3. Wysłanie formularza

**Akcja**: Użytkownik klika przycisk "Zarejestruj się" lub naciska Enter w formularzu.

**Reakcja**:
1. `preventDefault()` na zdarzeniu submit
2. Walidacja wszystkich pól (email format, hasło niepuste i min 6 znaków, zgodność haseł)
3. Jeśli walidacja nie przechodzi:
   - Oznaczenie wszystkich pól jako "dotknięte" (`touched = true` dla wszystkich)
   - Wyświetlenie błędów inline pod odpowiednimi polami
   - Przycisk pozostaje aktywny
   - Formularz nie jest wysyłany
4. Jeśli walidacja przechodzi:
   - Ustawienie `isSubmitting = true`
   - Przycisk staje się nieaktywny (disabled) z spinnerem
   - Wywołanie `supabase.auth.signUp()` z danymi formularza
   - Oczekiwanie na odpowiedź API

### 8.4. Sukces rejestracji

**Akcja**: API zwraca sukces (użytkownik zarejestrowany, sesja utworzona).

**Reakcja**:
1. Sesja jest automatycznie zapisana przez Supabase (localStorage/cookies)
2. Ustawienie `isSubmitting = false`
3. Przekierowanie użytkownika:
   - Na ekran onboardingu (jeśli onboarding jest włączony)
   - Lub bezpośrednio na dashboard (`/`) jeśli onboarding jest pominięty
4. Użycie `window.location.href` dla pełnego przeładowania strony (aktualizacja stanu sesji w całej aplikacji)

### 8.5. Błąd rejestracji

**Akcja**: API zwraca błąd (email już istnieje, słabe hasło, itp.).

**Reakcja**:
1. Ustawienie `isSubmitting = false`
2. Mapowanie kodu błędu na komunikat w języku polskim:
   - `422` (Email already registered) → "Ten email jest już zarejestrowany" (wyświetlony pod polem email)
   - `400` (Invalid email or weak password) → odpowiedni komunikat pod odpowiednim polem
   - Inne błędy → ogólny komunikat błędu
3. Wyświetlenie komunikatu błędu inline pod odpowiednim polem lub jako ogólny błąd (Alert)
4. Przycisk staje się ponownie aktywny (użytkownik może poprawić dane i spróbować ponownie)

### 8.6. Błąd sieci

**Akcja**: Brak połączenia z internetem lub timeout żądania.

**Reakcja**:
1. Ustawienie `isSubmitting = false`
2. Wyświetlenie toast notification: "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
3. Przycisk staje się ponownie aktywny

### 8.7. Nawigacja do logowania

**Akcja**: Użytkownik klika link "Masz już konto? Zaloguj się".

**Reakcja**:
- Przekierowanie na `/login` (użycie `<a>` lub routera Astro)

## 9. Warunki i walidacja

### 9.1. Warunki wymagane przez API

**Email**:
- **Wymagane**: Tak
- **Format**: Musi spełniać regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Unikalność**: Sprawdzana przez API (błąd 422 jeśli email już istnieje)
- **Weryfikacja w komponencie**: Format email jest weryfikowany po stronie klienta przed wysłaniem (`onBlur` i przed submit)

**Hasło**:
- **Wymagane**: Tak
- **Minimalna długość**: 6 znaków (wymaganie Supabase `minimum_password_length = 6`)
- **Rekomendowana długość**: 8+ znaków dla lepszego bezpieczeństwa
- **Weryfikacja w komponencie**: Długość hasła jest weryfikowana po stronie klienta przed wysłaniem

**Potwierdzenie hasła**:
- **Wymagane**: Tak
- **Zgodność**: Musi być identyczne z polem "Hasło"
- **Weryfikacja w komponencie**: Zgodność jest weryfikowana w czasie rzeczywistym i przed wysłaniem

### 9.2. Wpływ warunków na stan interfejsu

**Pole email**:
- Jeśli format jest nieprawidłowy → wyświetlenie komunikatu błędu pod polem, pole ma czerwone obramowanie (Shadcn/ui `error` variant)
- Jeśli email już istnieje (błąd 422 z API) → wyświetlenie komunikatu błędu pod polem email
- Jeśli pole jest poprawne → brak komunikatu błędu, pole ma normalne obramowanie

**Pole hasła**:
- Jeśli hasło jest za krótkie (< 6 znaków) → wyświetlenie komunikatu błędu pod polem, pole ma czerwone obramowanie
- Jeśli hasło jest poprawne → brak komunikatu błędu, opcjonalnie wyświetlenie wskaźnika siły hasła
- Jeśli hasło jest za słabe (błąd 400 z API) → wyświetlenie komunikatu błędu pod polem hasła

**Pole potwierdzenia hasła**:
- Jeśli hasła nie są zgodne → wyświetlenie komunikatu błędu pod polem, pole ma czerwone obramowanie
- Jeśli hasła są zgodne → brak komunikatu błędu, pole ma normalne obramowanie

**Przycisk "Zarejestruj się"**:
- Jeśli formularz ma błędy walidacji → przycisk pozostaje aktywny, ale formularz nie jest wysyłany
- Jeśli formularz jest w trakcie wysyłania (`isSubmitting = true`) → przycisk jest nieaktywny (disabled) z spinnerem
- Jeśli formularz jest poprawny i nie jest w trakcie wysyłania → przycisk jest aktywny

### 9.3. Walidacja po stronie klienta vs serwera

**Po stronie klienta** (przed wysłaniem):
- Format email (regex)
- Czy hasło nie jest puste
- Czy hasło ma min 6 znaków
- Czy potwierdzenie hasła nie jest puste
- Czy hasła są zgodne

**Po stronie serwera** (API):
- Format email (ponowna weryfikacja)
- Siła hasła (Supabase sprawdza wymagania)
- Unikalność email (sprawdzenie w bazie danych)
- Wszystkie błędy z API są mapowane na komunikaty w języku polskim i wyświetlane w interfejsie

## 10. Obsługa błędów

### 10.1. Błędy walidacji po stronie klienta

**Email - nieprawidłowy format**:
- **Komunikat**: "Nieprawidłowy format email"
- **Lokalizacja**: Inline pod polem email
- **Styl**: Czerwone obramowanie pola, komunikat w `<Alert>` lub `<span>` z klasą błędu

**Hasło - za krótkie**:
- **Komunikat**: "Hasło musi zawierać co najmniej 6 znaków"
- **Lokalizacja**: Inline pod polem hasła
- **Styl**: Czerwone obramowanie pola, komunikat w `<Alert>` lub `<span>` z klasą błędu

**Potwierdzenie hasła - niezgodność**:
- **Komunikat**: "Hasła nie są identyczne"
- **Lokalizacja**: Inline pod polem potwierdzenia hasła
- **Styl**: Czerwone obramowanie pola, komunikat w `<Alert>` lub `<span>` z klasą błędu

### 10.2. Błędy API

**422 - Email już zarejestrowany**:
- **Komunikat**: "Ten email jest już zarejestrowany"
- **Lokalizacja**: Inline pod polem email
- **Styl**: Czerwone obramowanie pola, komunikat w `<Alert>` lub `<span>` z klasą błędu
- **Akcja użytkownika**: Może kliknąć link "Masz już konto? Zaloguj się" aby przejść do logowania

**400 - Nieprawidłowy format email lub słabe hasło**:
- **Komunikat**: 
  - Jeśli dotyczy email: "Nieprawidłowy format email" (pod polem email)
  - Jeśli dotyczy hasła: "Hasło jest zbyt słabe" (pod polem hasła)
- **Lokalizacja**: Inline pod odpowiednim polem
- **Styl**: Czerwone obramowanie pola, komunikat w `<Alert>` lub `<span>` z klasą błędu

**Inne błędy API**:
- **Komunikat**: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie."
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

**Użytkownik już zalogowany próbuje wejść na `/register`**:
- **Obsługa**: Middleware w Astro sprawdza sesję przed renderowaniem strony
- **Akcja**: Przekierowanie na dashboard (`/`)
- **Komunikat**: Brak (ciche przekierowanie)

**Sesja wygasła podczas rejestracji**:
- **Obsługa**: Supabase automatycznie obsługuje wygasłe sesje
- **Akcja**: Użytkownik może ponownie wypełnić formularz i spróbować zarejestrować się

**Wielokrotne kliknięcia przycisku "Zarejestruj się"**:
- **Obsługa**: Przycisk jest nieaktywny (`disabled`) podczas `isSubmitting = true`
- **Akcja**: Zapobiega wielokrotnym żądaniom do API

**Błąd podczas tworzenia profilu użytkownika** (jeśli trigger nie działa):
- **Obsługa**: Użytkownik jest zarejestrowany i zalogowany, ale profil może być utworzony później (np. w ustawieniach)
- **Akcja**: Aplikacja powinna obsługiwać brak profilu gracefully (np. przekierowanie do ustawień do uzupełnienia danych)

## 11. Kroki implementacji

### Krok 1: Utworzenie strony Astro

1. Utwórz plik `src/pages/register.astro`
2. Dodaj podstawową strukturę strony Astro z:
   - Importem komponentu `RegisterForm`
   - Layoutem strony (opcjonalnie wspólny layout dla stron autoryzacji)
   - Meta tagami (title, description)
3. Dodaj middleware sprawdzający, czy użytkownik jest już zalogowany (przekierowanie na `/`)

### Krok 2: Utworzenie komponentu RegisterForm

1. Utwórz plik `src/components/forms/RegisterForm.tsx`
2. Zainstaluj zależności React (jeśli nie są już zainstalowane)
3. Zaimportuj komponenty Shadcn/ui: `Input`, `Label`, `Button`, `Alert`, `Toast`
4. Zaimportuj klienta Supabase: `import { supabase } from '@/lib/supabase'`
5. Utwórz interfejs `RegisterFormState` dla stanu komponentu
6. Utwórz komponent funkcjonalny `RegisterForm` z podstawową strukturą JSX

### Krok 3: Implementacja stanu i logiki formularza

1. Dodaj `useState` dla stanu formularza (`email`, `password`, `confirmPassword`)
2. Dodaj `useState` dla błędów walidacji (`errors`)
3. Dodaj `useState` dla "dotkniętych" pól (`touched`)
4. Dodaj `useState` dla stanu ładowania (`isSubmitting`)
5. Utwórz funkcje pomocnicze:
   - `validateEmail(email: string): string | null`
   - `validatePassword(password: string): string | null`
   - `validateConfirmPassword(password: string, confirmPassword: string): string | null`
   - `validateForm(): boolean`

### Krok 4: Implementacja obsługi zdarzeń

1. Dodaj `onChange` handlery dla każdego pola:
   - `handleEmailChange(e: React.ChangeEvent<HTMLInputElement>)`
   - `handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>)`
   - `handleConfirmPasswordChange(e: React.ChangeEvent<HTMLInputElement>)`
2. Dodaj `onBlur` handlery dla każdego pola (walidacja po opuszczeniu):
   - `handleEmailBlur()`
   - `handlePasswordBlur()`
   - `handleConfirmPasswordBlur()`
3. Dodaj `onSubmit` handler dla formularza:
   - `handleSubmit(e: React.FormEvent)`

### Krok 5: Implementacja integracji z Supabase Auth API

1. W `handleSubmit`:
   - Wywołaj `validateForm()` przed wysłaniem
   - Jeśli walidacja przechodzi, ustaw `isSubmitting = true`
   - Wywołaj `supabase.auth.signUp({ email, password })`
   - Obsłuż odpowiedź:
     - Sukces: przekierowanie na onboarding/dashboard
     - Błąd: mapowanie błędu na komunikat i wyświetlenie w interfejsie
   - Ustaw `isSubmitting = false` w `finally`

### Krok 6: Implementacja UI komponentów

1. Dodaj `<form>` z `onSubmit={handleSubmit}`
2. Dodaj pole email:
   - `<Label>` dla email
   - `<Input>` z typem `email`, wartością `formState.email`, `onChange={handleEmailChange}`, `onBlur={handleEmailBlur}`
   - `<Alert>` lub `<span>` dla komunikatu błędu (jeśli `errors.email`)
3. Dodaj pole hasła:
   - `<Label>` dla hasła
   - `<Input>` z typem `password`, wartością `formState.password`, `onChange={handlePasswordChange}`, `onBlur={handlePasswordBlur}`
   - Opcjonalnie: `<PasswordStrengthIndicator>` (jeśli implementowany)
   - `<Alert>` lub `<span>` dla komunikatu błędu (jeśli `errors.password`)
4. Dodaj pole potwierdzenia hasła:
   - `<Label>` dla potwierdzenia hasła
   - `<Input>` z typem `password`, wartością `formState.confirmPassword`, `onChange={handleConfirmPasswordChange}`, `onBlur={handleConfirmPasswordBlur}`
   - `<Alert>` lub `<span>` dla komunikatu błędu (jeśli `errors.confirmPassword`)
5. Dodaj przycisk submit:
   - `<Button>` z typem `submit`, `disabled={isSubmitting}`
   - Tekst: "Zarejestruj się"
   - Spinner podczas `isSubmitting` (opcjonalnie)
6. Dodaj link do logowania:
   - `<a href="/login">` z tekstem "Masz już konto? Zaloguj się"

### Krok 7: Implementacja obsługi błędów

1. Utwórz funkcję `mapAuthError(error: AuthError): string` do mapowania błędów API na komunikaty w języku polskim
2. W `handleSubmit`, po otrzymaniu błędu z API:
   - Wywołaj `mapAuthError` aby uzyskać komunikat
   - Ustaw odpowiedni błąd w stanie (`setFieldError`)
3. Dodaj `<Alert>` dla ogólnych błędów (jeśli `errors.general`)
4. Dodaj toast notification dla błędów sieci (użyj Shadcn/ui `Toast`)

### Krok 8: Implementacja dostępności (WCAG AA)

1. Dodaj właściwe `<label>` dla każdego pola (Shadcn/ui `Label` automatycznie to obsługuje)
2. Dodaj `aria-describedby` dla komunikatów błędów (powiązanie z polami)
3. Dodaj `aria-live="polite"` dla dynamicznych komunikatów błędów
4. Upewnij się, że wszystkie interaktywne elementy są dostępne przez klawiaturę (Tab, Enter)
5. Dodaj właściwe `aria-labels` dla przycisków (jeśli tekst nie jest wystarczająco opisowy)

### Krok 9: Stylowanie i UX

1. Użyj komponentów Shadcn/ui dla spójności z resztą aplikacji
2. Dodaj odpowiednie marginesy i odstępy między polami
3. Dodaj wizualne wskaźniki błędów (czerwone obramowanie pól z błędami)
4. Opcjonalnie: dodaj wskaźnik siły hasła (`PasswordStrengthIndicator`)
5. Upewnij się, że formularz jest responsywny (desktop-first, ale działa na mobile)

### Krok 10: Testowanie

1. **Testy manualne**:
   - Rejestracja z poprawnymi danymi → sukces, przekierowanie
   - Rejestracja z nieprawidłowym formatem email → komunikat błędu
   - Rejestracja z za krótkim hasłem → komunikat błędu
   - Rejestracja z niezgodnymi hasłami → komunikat błędu
   - Rejestracja z emailem, który już istnieje → komunikat błędu 422
   - Nawigacja do logowania → przekierowanie na `/login`
   - Próba wejścia na `/register` gdy użytkownik jest już zalogowany → przekierowanie na `/`

2. **Testy dostępności**:
   - Nawigacja klawiaturą (Tab, Enter)
   - Screen reader (komunikaty błędów są czytane)
   - Kontrast kolorów (czerwone obramowania błędów)

3. **Testy integracyjne**:
   - Integracja z Supabase Auth API
   - Tworzenie sesji po rejestracji
   - Przekierowanie na onboarding/dashboard

### Krok 11: Dokumentacja i finalizacja

1. Dodaj komentarze w kodzie dla złożonych funkcji walidacji
2. Zaktualizuj dokumentację projektu (jeśli istnieje)
3. Upewnij się, że wszystkie typy są poprawnie zdefiniowane w `src/types.ts`
4. Sprawdź zgodność z PRD (F-001) i user story (US-001)

