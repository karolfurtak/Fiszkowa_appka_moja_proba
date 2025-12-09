# Plan implementacji widoku Logowanie

## 1. Przegląd

Widok logowania (`/login`) umożliwia zalogowanym użytkownikom dostęp do aplikacji 10xCards. Widok składa się z prostego formularza zawierającego pola email i hasło, zintegrowanego z Supabase Auth API. Po pomyślnym zalogowaniu użytkownik jest przekierowywany na dashboard (`/`), a w przypadku błędnych danych wyświetlane są odpowiednie komunikaty błędów inline pod polami formularza.

Widok jest zaimplementowany jako strona Astro z komponentem React `LoginForm` do obsługi interakcji użytkownika. Wszystkie komponenty UI pochodzą z biblioteki Shadcn/ui, zapewniając spójność z resztą aplikacji.

## 2. Routing widoku

**Ścieżka**: `/login`

**Plik**: `src/pages/login.astro`

**Middleware**: Widok jest publiczny (nie wymaga autoryzacji). Jeśli użytkownik jest już zalogowany i próbuje wejść na `/login`, powinien być przekierowany na dashboard.

**Query Parameters**:
- `redirect` (opcjonalny) - ścieżka, na którą użytkownik powinien zostać przekierowany po zalogowaniu (domyślnie `/`)

**Przykład URL**: `/login?redirect=/deck/123`

## 3. Struktura komponentów

```
login.astro (Astro Page)
└── LoginForm (React Component)
    ├── Form (HTML form element)
    │   ├── Input (Shadcn/ui) - Email
    │   │   └── Label (Shadcn/ui)
    │   ├── Input (Shadcn/ui) - Password
    │   │   └── Label (Shadcn/ui)
    │   ├── Alert (Shadcn/ui) - Error message (conditional)
    │   ├── Button (Shadcn/ui) - Submit
    │   └── Link (HTML) - "Nie masz konta? Zarejestruj się"
    └── Toast (Shadcn/ui) - Network errors (conditional)
```

## 4. Szczegóły komponentów

### LoginForm (React Component)

**Lokalizacja**: `src/components/forms/LoginForm.tsx`

**Opis komponentu**: Główny komponent formularza logowania. Zarządza stanem formularza, walidacją, integracją z Supabase Auth API oraz obsługą błędów. Komponent jest klient-side (React), co umożliwia interaktywność bez przeładowania strony.

**Główne elementy**:
- `<form>` - element HTML formularza z obsługą `onSubmit`
- `Input` (Shadcn/ui) - pole email z typem `email`
- `Input` (Shadcn/ui) - pole hasła z typem `password` i możliwością pokazania/ukrycia hasła
- `Label` (Shadcn/ui) - etykiety dla pól formularza
- `Button` (Shadcn/ui) - przycisk "Zaloguj się" z typem `submit`
- `Alert` (Shadcn/ui) - wyświetlanie błędów autoryzacji (warunkowo)
- `Link` (HTML) - link do strony rejestracji (`/register`)
- `Toast` (Shadcn/ui) - toast notifications dla błędów sieci (warunkowo)

**Obsługiwane zdarzenia**:
- `onSubmit` (form) - obsługa wysłania formularza
- `onChange` (input email) - aktualizacja stanu email i czyszczenie błędów
- `onChange` (input password) - aktualizacja stanu hasła i czyszczenie błędów
- `onBlur` (input email) - walidacja formatu email po opuszczeniu pola
- `onKeyDown` (form) - obsługa Enter do wysłania formularza

**Obsługiwana walidacja**:

1. **Email**:
   - Wymagane pole (nie może być puste)
   - Format email (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
   - Błąd inline: "Email jest wymagany" lub "Nieprawidłowy format email"

2. **Hasło**:
   - Wymagane pole (nie może być puste)
   - Minimalna długość: 1 znak (walidacja po stronie klienta, szczegółowa walidacja po stronie serwera)
   - Błąd inline: "Hasło jest wymagane"

3. **Walidacja przed wysłaniem**:
   - Oba pola muszą być wypełnione
   - Email musi mieć poprawny format
   - Jeśli walidacja nie przejdzie, formularz nie jest wysyłany

**Typy**:
- `LoginFormProps` - propsy komponentu
- `LoginFormState` - stan wewnętrzny komponentu
- `LoginUserRequest` - DTO dla requestu do API (z `src/types.ts`)
- `LoginUserResponse` - DTO dla odpowiedzi z API (z `src/types.ts`)

**Propsy**:
```typescript
interface LoginFormProps {
  redirectUrl?: string; // Opcjonalna ścieżka przekierowania po zalogowaniu
}
```

### Input (Shadcn/ui) - Email

**Opis**: Pole tekstowe do wprowadzenia adresu email.

**Konfiguracja**:
- `type="email"` - automatyczna walidacja przeglądarki
- `required` - pole wymagane
- `autoComplete="email"` - autouzupełnianie przeglądarki
- `aria-label="Email"` - etykieta dla screen readerów
- `aria-describedby` - powiązanie z komunikatem błędu (jeśli istnieje)
- `aria-invalid` - ustawione na `true` gdy jest błąd walidacji

**Walidacja**:
- Sprawdzenie czy pole nie jest puste
- Sprawdzenie formatu email (regex)

### Input (Shadcn/ui) - Password

**Opis**: Pole tekstowe do wprowadzenia hasła z możliwością pokazania/ukrycia.

**Konfiguracja**:
- `type="password"` (lub `type="text"` gdy pokazane)
- `required` - pole wymagane
- `autoComplete="current-password"` - autouzupełnianie przeglądarki
- `aria-label="Hasło"` - etykieta dla screen readerów
- `aria-describedby` - powiązanie z komunikatem błędu (jeśli istnieje)
- `aria-invalid` - ustawione na `true` gdy jest błąd walidacji

**Dodatkowe funkcjonalności**:
- Przycisk "Pokaż/Ukryj hasło" (opcjonalnie, dla lepszego UX)
- Ikona oka (Shadcn/ui Icon) do przełączania widoczności

**Walidacja**:
- Sprawdzenie czy pole nie jest puste

### Button (Shadcn/ui) - Submit

**Opis**: Przycisk wysłania formularza.

**Konfiguracja**:
- `type="submit"` - wysyła formularz
- `disabled` - nieaktywny podczas ładowania lub gdy walidacja nie przechodzi
- `aria-label="Zaloguj się"` - etykieta dla screen readerów

**Stany**:
- Normalny - gotowy do użycia
- Loading - podczas wysyłania requestu (z spinnerem)
- Disabled - gdy walidacja nie przechodzi

### Alert (Shadcn/ui) - Error Message

**Opis**: Komponent wyświetlający błędy autoryzacji.

**Warunki wyświetlania**:
- Wyświetlany tylko gdy `errorMessage` w stanie komponentu nie jest pusty
- Pozycjonowany pod polami formularza, przed przyciskiem submit

**Typy błędów**:
- Błąd autoryzacji (401) - "Nieprawidłowy email lub hasło"
- Błąd walidacji (400) - "Nieprawidłowe dane logowania"
- Błąd sieci - wyświetlany jako toast zamiast Alert

**Konfiguracja**:
- `variant="destructive"` - czerwony styl dla błędów
- `role="alert"` - dla screen readerów
- `aria-live="assertive"` - natychmiastowe ogłoszenie dla screen readerów

### Link - Rejestracja

**Opis**: Link do strony rejestracji.

**Konfiguracja**:
- `href="/register"` - ścieżka do strony rejestracji
- Tekst: "Nie masz konta? Zarejestruj się"
- Styl jako link tekstowy (nie przycisk)

## 5. Typy

### LoginUserRequest

**Lokalizacja**: `src/types.ts` (już istnieje)

**Opis**: DTO dla requestu logowania do Supabase Auth API.

```typescript
export interface LoginUserRequest {
  email: string;      // Adres email użytkownika (wymagany, format email)
  password: string;   // Hasło użytkownika (wymagany, min 1 znak)
}
```

**Walidacja**:
- `email`: Wymagany, format email (walidacja po stronie klienta i serwera)
- `password`: Wymagany, min 1 znak (walidacja po stronie serwera)

### LoginUserResponse

**Lokalizacja**: `src/types.ts` (już istnieje)

**Opis**: DTO dla odpowiedzi z Supabase Auth API po pomyślnym zalogowaniu.

```typescript
export interface LoginUserResponse {
  access_token: string;      // JWT token do autoryzacji (ważny przez expires_in sekund)
  refresh_token: string;     // Token do odświeżania sesji
  expires_in: number;        // Czas ważności access_token w sekundach (domyślnie 3600)
  user: {
    id: string;              // UUID użytkownika
    email: string;           // Adres email użytkownika
  };
}
```

### LoginFormProps

**Lokalizacja**: `src/components/forms/LoginForm.tsx` (nowy typ)

**Opis**: Propsy komponentu LoginForm.

```typescript
interface LoginFormProps {
  redirectUrl?: string; // Opcjonalna ścieżka przekierowania po zalogowaniu (z query param ?redirect=)
}
```

### LoginFormState

**Lokalizacja**: `src/components/forms/LoginForm.tsx` (wewnętrzny stan)

**Opis**: Stan wewnętrzny komponentu LoginForm.

```typescript
interface LoginFormState {
  email: string;                    // Wartość pola email
  password: string;                 // Wartość pola hasło
  emailError: string | null;        // Błąd walidacji email (null jeśli brak błędu)
  passwordError: string | null;     // Błąd walidacji hasła (null jeśli brak błędu)
  errorMessage: string | null;      // Ogólny komunikat błędu (np. z API)
  isSubmitting: boolean;            // Flaga wskazująca czy formularz jest w trakcie wysyłania
  isEmailTouched: boolean;          // Flaga wskazująca czy pole email było dotknięte (dla walidacji onBlur)
  isPasswordTouched: boolean;       // Flaga wskazująca czy pole hasło było dotknięte (dla walidacji onBlur)
}
```

## 6. Zarządzanie stanem

**Strategia**: React hooks (`useState`, `useEffect`) dla lokalnego stanu komponentu.

**Custom Hook**: Nie jest wymagany dla podstawowej funkcjonalności, ale można rozważyć `useLogin` hook dla reużywalności w przyszłości.

**Stan komponentu**:
- `useState<LoginFormState>` - zarządzanie stanem formularza (email, password, błędy, loading)
- `useState<boolean>` dla `isSubmitting` - alternatywnie można użyć flagi w głównym stanie

**Efekty**:
- `useEffect` - sprawdzenie czy użytkownik jest już zalogowany przy mount (przekierowanie na dashboard jeśli tak)
- `useEffect` - czyszczenie błędów przy zmianie wartości pól (opcjonalnie)

**Integracja z Supabase**:
- Użycie `supabase.auth.signInWithPassword()` z Supabase client
- Sesja jest automatycznie zarządzana przez Supabase (przechowywana w localStorage/cookies)
- Po pomyślnym zalogowaniu, Supabase automatycznie aktualizuje stan sesji

**Przyszłe rozszerzenia**:
- `useLogin` hook - dla reużywalności i łatwiejszego testowania
- React Query - dla cache'owania i zarządzania stanem sesji (opcjonalnie, w późniejszym etapie)

## 7. Integracja API

**Endpoint**: Supabase Auth API - `supabase.auth.signInWithPassword()`

**Metoda**: Nie bezpośredni HTTP request, ale użycie Supabase client SDK.

**Lokalizacja kodu**: `src/components/forms/LoginForm.tsx`

**Implementacja**:

```typescript
import { supabaseClient } from '@/db/supabase.client';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Walidacja po stronie klienta
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  setErrorMessage(null);
  
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: formState.email,
      password: formState.password,
    });
    
    if (error) {
      // Obsługa błędów
      handleAuthError(error);
      return;
    }
    
    // Sukces - przekierowanie
    if (data.session) {
      const redirectUrl = props.redirectUrl || '/';
      window.location.href = redirectUrl;
    }
  } catch (error) {
    // Obsługa błędów sieci
    handleNetworkError(error);
  } finally {
    setIsSubmitting(false);
  }
};
```

**Typy Request**:
- `LoginUserRequest` - `{ email: string, password: string }`

**Typy Response**:
- **Sukces**: `{ data: { session: Session, user: User }, error: null }`
- **Błąd**: `{ data: { session: null, user: null }, error: AuthError }`

**Obsługa błędów API**:
- `AuthApiError` z kodem `invalid_credentials` (401) → "Nieprawidłowy email lub hasło"
- `AuthApiError` z kodem `email_not_confirmed` → "Email nie został potwierdzony"
- `AuthApiError` z innym kodem → "Wystąpił błąd podczas logowania"
- Błąd sieci → Toast notification: "Brak połączenia z internetem"

**Przekierowanie po sukcesie**:
- Jeśli `redirectUrl` w props → przekierowanie na tę ścieżkę
- Jeśli brak `redirectUrl` → przekierowanie na `/` (dashboard)
- Użycie `window.location.href` dla pełnego przeładowania strony (aktualizacja stanu sesji)

## 8. Interakcje użytkownika

### 8.1. Wprowadzanie danych

**Akcja**: Użytkownik wprowadza email w pole email.

**Reakcja**:
- Wartość pola jest aktualizowana w stanie (`setEmail`)
- Jeśli pole było dotknięte i miał błąd, błąd jest czyszczony
- Walidacja formatu email jest wykonywana przy `onBlur` (opuszczenie pola)

**Akcja**: Użytkownik wprowadza hasło w pole hasła.

**Reakcja**:
- Wartość pola jest aktualizowana w stanie (`setPassword`)
- Jeśli pole było dotknięte i miał błąd, błąd jest czyszczony
- Hasło jest domyślnie ukryte (typ `password`)

### 8.2. Walidacja

**Akcja**: Użytkownik opuszcza pole email (`onBlur`).

**Reakcja**:
- Ustawienie `isEmailTouched = true`
- Walidacja formatu email
- Jeśli błąd → wyświetlenie komunikatu błędu inline pod polem
- Jeśli poprawny → usunięcie komunikatu błędu

**Akcja**: Użytkownik opuszcza pole hasła (`onBlur`).

**Reakcja**:
- Ustawienie `isPasswordTouched = true`
- Walidacja czy pole nie jest puste
- Jeśli błąd → wyświetlenie komunikatu błędu inline pod polem
- Jeśli poprawny → usunięcie komunikatu błędu

### 8.3. Wysłanie formularza

**Akcja**: Użytkownik klika przycisk "Zaloguj się" lub naciska Enter w formularzu.

**Reakcja**:
1. `preventDefault()` na zdarzeniu submit
2. Walidacja wszystkich pól (email format, hasło niepuste)
3. Jeśli walidacja nie przechodzi:
   - Wyświetlenie błędów inline pod odpowiednimi polami
   - Przycisk pozostaje aktywny
   - Formularz nie jest wysyłany
4. Jeśli walidacja przechodzi:
   - Ustawienie `isSubmitting = true`
   - Przycisk staje się nieaktywny (disabled) z spinnerem
   - Wywołanie `supabase.auth.signInWithPassword()`
   - Oczekiwanie na odpowiedź

### 8.4. Sukces logowania

**Akcja**: API zwraca sukces (sesja utworzona).

**Reakcja**:
1. Sesja jest automatycznie zapisana przez Supabase (localStorage/cookies)
2. Przekierowanie użytkownika:
   - Jeśli `redirectUrl` w props → przekierowanie na tę ścieżkę
   - Jeśli brak → przekierowanie na `/` (dashboard)
3. Użycie `window.location.href` dla pełnego przeładowania (aktualizacja stanu sesji w całej aplikacji)

### 8.5. Błąd logowania

**Akcja**: API zwraca błąd (nieprawidłowe dane).

**Reakcja**:
1. Ustawienie `isSubmitting = false`
2. Przycisk staje się ponownie aktywny
3. Wyświetlenie komunikatu błędu w komponencie `Alert`:
   - "Nieprawidłowy email lub hasło" (dla 401)
   - Inne komunikaty w zależności od typu błędu
4. Pola formularza pozostają wypełnione (użytkownik może poprawić dane)

### 8.6. Błąd sieci

**Akcja**: Brak połączenia z internetem lub timeout.

**Reakcja**:
1. Ustawienie `isSubmitting = false`
2. Przycisk staje się ponownie aktywny
3. Wyświetlenie toast notification: "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
4. Pola formularza pozostają wypełnione

### 8.7. Nawigacja do rejestracji

**Akcja**: Użytkownik klika link "Nie masz konta? Zarejestruj się".

**Reakcja**:
- Przekierowanie na `/register`
- Jeśli był parametr `redirect`, można go przekazać dalej: `/register?redirect=/target-path`

### 8.8. Keyboard Navigation

**Akcja**: Użytkownik używa klawiatury do nawigacji.

**Reakcja**:
- Tab - przejście między polami (email → password → submit → link)
- Shift+Tab - przejście wstecz
- Enter w polu email/password - przejście do następnego pola
- Enter w formularzu - wysłanie formularza (jeśli walidacja przechodzi)
- Escape - opcjonalnie zamknięcie/oczyszczenie formularza

## 9. Warunki i walidacja

### 9.1. Walidacja po stronie klienta

**Email**:
- **Warunek 1**: Pole nie może być puste
  - Sprawdzenie: `email.trim().length > 0`
  - Komunikat: "Email jest wymagany"
  - Komponent: `Input` (email)
  - Wpływ na stan: `emailError = "Email jest wymagany"`

- **Warunek 2**: Email musi mieć poprawny format
  - Sprawdzenie: Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Komunikat: "Nieprawidłowy format email"
  - Komponent: `Input` (email)
  - Wpływ na stan: `emailError = "Nieprawidłowy format email"`
  - Wykonywane: Przy `onBlur` (opuszczenie pola) lub przy submit

**Hasło**:
- **Warunek 1**: Pole nie może być puste
  - Sprawdzenie: `password.length > 0`
  - Komunikat: "Hasło jest wymagane"
  - Komponent: `Input` (password)
  - Wpływ na stan: `passwordError = "Hasło jest wymagane"`

**Formularz**:
- **Warunek**: Wszystkie pola muszą być poprawne przed wysłaniem
  - Sprawdzenie: `emailError === null && passwordError === null && email.trim().length > 0 && password.length > 0`
  - Wpływ na stan: Przycisk submit jest disabled jeśli warunek nie jest spełniony
  - Komponent: `Button` (submit)

### 9.2. Walidacja po stronie serwera (Supabase Auth)

**Email**:
- Supabase sprawdza czy email istnieje w bazie danych
- Supabase sprawdza format email (dodatkowa walidacja)

**Hasło**:
- Supabase sprawdza czy hasło jest poprawne dla danego użytkownika
- Supabase może wymagać minimalnej długości hasła (konfiguracja w Supabase Dashboard)

**Obsługa błędów serwera**:
- Błąd 401 (invalid_credentials) → "Nieprawidłowy email lub hasło"
- Błąd 400 (bad_request) → "Nieprawidłowe dane logowania"
- Inne błędy → "Wystąpił błąd podczas logowania"

### 9.3. Warunki wyświetlania błędów

**Błędy inline**:
- Wyświetlane pod odpowiednim polem tylko gdy:
  - Pole było dotknięte (`isEmailTouched` lub `isPasswordTouched`) LUB
  - Formularz został wysłany (`isSubmitting === true`)

**Ogólny komunikat błędu (Alert)**:
- Wyświetlany tylko gdy `errorMessage !== null`
- Pozycjonowany pod polami formularza, przed przyciskiem submit
- Zastępuje błędy inline dla błędów API (ale nie dla błędów walidacji)

### 9.4. Warunki dla przycisku Submit

**Disabled gdy**:
- `isSubmitting === true` (podczas wysyłania)
- `emailError !== null` (błąd walidacji email)
- `passwordError !== null` (błąd walidacji hasła)
- `email.trim().length === 0` (puste pole email)
- `password.length === 0` (puste pole hasła)

**Loading state**:
- Gdy `isSubmitting === true` → przycisk wyświetla spinner i tekst "Logowanie..."

## 10. Obsługa błędów

### 10.1. Błędy walidacji (po stronie klienta)

**Email pusty**:
- Komunikat: "Email jest wymagany"
- Wyświetlanie: Inline pod polem email
- Komponent: `Input` (email) z `aria-describedby` wskazującym na komunikat błędu
- Stan: `emailError = "Email jest wymagany"`

**Email nieprawidłowy format**:
- Komunikat: "Nieprawidłowy format email"
- Wyświetlanie: Inline pod polem email
- Komponent: `Input` (email) z `aria-describedby` i `aria-invalid="true"`
- Stan: `emailError = "Nieprawidłowy format email"`

**Hasło puste**:
- Komunikat: "Hasło jest wymagane"
- Wyświetlanie: Inline pod polem hasła
- Komponent: `Input` (password) z `aria-describedby` wskazującym na komunikat błędu
- Stan: `passwordError = "Hasło jest wymagane"`

### 10.2. Błędy autoryzacji (po stronie serwera)

**401 - Invalid Credentials**:
- Komunikat: "Nieprawidłowy email lub hasło"
- Wyświetlanie: Komponent `Alert` pod polami formularza
- Stan: `errorMessage = "Nieprawidłowy email lub hasło"`
- Działanie: Pola pozostają wypełnione, użytkownik może spróbować ponownie

**400 - Bad Request**:
- Komunikat: "Nieprawidłowe dane logowania"
- Wyświetlanie: Komponent `Alert` pod polami formularza
- Stan: `errorMessage = "Nieprawidłowe dane logowania"`
- Działanie: Pola pozostają wypełnione, użytkownik może spróbować ponownie

**Email Not Confirmed**:
- Komunikat: "Email nie został potwierdzony. Sprawdź skrzynkę pocztową."
- Wyświetlanie: Komponent `Alert` pod polami formularza
- Stan: `errorMessage = "Email nie został potwierdzony. Sprawdź skrzynkę pocztową."`
- Działanie: Pola pozostają wypełnione, użytkownik może sprawdzić email

**Inne błędy Auth**:
- Komunikat: "Wystąpił błąd podczas logowania. Spróbuj ponownie."
- Wyświetlanie: Komponent `Alert` pod polami formularza
- Stan: `errorMessage = "Wystąpił błąd podczas logowania. Spróbuj ponownie."`
- Działanie: Pola pozostają wypełnione, użytkownik może spróbować ponownie

### 10.3. Błędy sieci

**Brak połączenia z internetem**:
- Komunikat: "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
- Wyświetlanie: Toast notification (Shadcn/ui Toast)
- Działanie: Pola pozostają wypełnione, użytkownik może spróbować ponownie po przywróceniu połączenia

**Timeout**:
- Komunikat: "Żądanie przekroczyło limit czasu. Spróbuj ponownie."
- Wyświetlanie: Toast notification
- Działanie: Pola pozostają wypełnione, użytkownik może spróbować ponownie

**Nieznany błąd**:
- Komunikat: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie."
- Wyświetlanie: Toast notification
- Działanie: Pola pozostają wypełnione, użytkownik może spróbować ponownie
- Logowanie: Błąd jest logowany do konsoli (dev mode)

### 10.4. Przypadki brzegowe

**Użytkownik już zalogowany**:
- Wykrycie: Sprawdzenie sesji przy mount komponentu (`supabase.auth.getSession()`)
- Działanie: Przekierowanie na dashboard (`/`) lub `redirectUrl` jeśli dostępny
- Implementacja: `useEffect` przy mount

**Wygaśnięcie sesji podczas logowania**:
- Wykrycie: Błąd z API wskazujący na wygasłą sesję
- Działanie: Wyświetlenie komunikatu: "Sesja wygasła. Zaloguj się ponownie."
- Przekierowanie: Pozostanie na stronie logowania

**Przekierowanie z chronionej trasy**:
- Wykrycie: Query parameter `redirect` w URL
- Działanie: Przekazanie `redirectUrl` do komponentu jako prop
- Po zalogowaniu: Przekierowanie na `redirectUrl` zamiast domyślnego `/`

## 11. Kroki implementacji

### Krok 1: Utworzenie strony Astro

1. Utworzyć plik `src/pages/login.astro`
2. Zaimportować komponent `LoginForm`
3. Dodać podstawowy layout strony (header, main, footer jeśli potrzebny)
4. Wyciągnąć query parameter `redirect` z URL
5. Przekazać `redirectUrl` do komponentu `LoginForm`
6. Dodać sprawdzenie czy użytkownik jest już zalogowany (przekierowanie na dashboard)

### Krok 2: Utworzenie komponentu LoginForm

1. Utworzyć plik `src/components/forms/LoginForm.tsx`
2. Zaimportować wymagane komponenty Shadcn/ui:
   - `Input`
   - `Label`
   - `Button`
   - `Alert`
   - `Toast` (lub `useToast` hook)
3. Zaimportować typy z `src/types.ts`:
   - `LoginUserRequest`
   - `LoginUserResponse`
4. Zaimportować Supabase client z `src/db/supabase.client.ts`

### Krok 3: Definicja typów i interfejsów

1. Zdefiniować `LoginFormProps` interface
2. Zdefiniować `LoginFormState` interface
3. Eksportować typy jeśli potrzebne w innych miejscach

### Krok 4: Implementacja stanu komponentu

1. Utworzyć `useState` dla stanu formularza (`LoginFormState`)
2. Utworzyć `useState` dla `isSubmitting` (lub dodać do głównego stanu)
3. Zaimplementować funkcje aktualizacji stanu:
   - `setEmail`
   - `setPassword`
   - `setEmailError`
   - `setPasswordError`
   - `setErrorMessage`

### Krok 5: Implementacja walidacji

1. Utworzyć funkcję `validateEmail(email: string): string | null`
   - Sprawdzenie czy email nie jest pusty
   - Sprawdzenie formatu email (regex)
   - Zwrócenie komunikatu błędu lub `null`
2. Utworzyć funkcję `validatePassword(password: string): string | null`
   - Sprawdzenie czy hasło nie jest puste
   - Zwrócenie komunikatu błędu lub `null`
3. Utworzyć funkcję `validateForm(): boolean`
   - Wywołanie `validateEmail` i `validatePassword`
   - Aktualizacja stanu błędów
   - Zwrócenie `true` jeśli walidacja przechodzi, `false` w przeciwnym razie

### Krok 6: Implementacja obsługi zdarzeń

1. Zaimplementować `handleEmailChange(e: React.ChangeEvent<HTMLInputElement>)`
   - Aktualizacja `email` w stanie
   - Czyszczenie `emailError` jeśli pole było dotknięte
2. Zaimplementować `handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>)`
   - Aktualizacja `password` w stanie
   - Czyszczenie `passwordError` jeśli pole było dotknięte
3. Zaimplementować `handleEmailBlur()`
   - Ustawienie `isEmailTouched = true`
   - Wywołanie `validateEmail` i aktualizacja `emailError`
4. Zaimplementować `handlePasswordBlur()`
   - Ustawienie `isPasswordTouched = true`
   - Wywołanie `validatePassword` i aktualizacja `passwordError`
5. Zaimplementować `handleSubmit(e: React.FormEvent<HTMLFormElement>)`
   - `preventDefault()`
   - Walidacja formularza
   - Jeśli walidacja przechodzi → wywołanie `handleLogin()`

### Krok 7: Implementacja integracji z API

1. Utworzyć funkcję `handleLogin()`
   - Ustawienie `isSubmitting = true`
   - Wywołanie `supabase.auth.signInWithPassword({ email, password })`
   - Obsługa odpowiedzi:
     - Sukces → przekierowanie
     - Błąd → wywołanie `handleAuthError(error)`
2. Utworzyć funkcję `handleAuthError(error: AuthError)`
   - Mapowanie kodów błędów na komunikaty
   - Aktualizacja `errorMessage` w stanie
   - Ustawienie `isSubmitting = false`
3. Utworzyć funkcję `handleNetworkError(error: Error)`
   - Wyświetlenie toast notification
   - Ustawienie `isSubmitting = false`

### Krok 8: Implementacja przekierowania

1. W funkcji `handleLogin()` po sukcesie:
   - Sprawdzenie `redirectUrl` z props
   - Użycie `window.location.href` dla przekierowania
   - Przekierowanie na `redirectUrl || '/'`

### Krok 9: Implementacja sprawdzenia sesji przy mount

1. Utworzyć `useEffect` przy mount komponentu
2. Wywołać `supabase.auth.getSession()`
3. Jeśli sesja istnieje → przekierowanie na dashboard lub `redirectUrl`

### Krok 10: Implementacja UI - Formularz

1. Utworzyć element `<form>` z `onSubmit={handleSubmit}`
2. Dodać `Input` dla email:
   - `type="email"`
   - `value={formState.email}`
   - `onChange={handleEmailChange}`
   - `onBlur={handleEmailBlur}`
   - `aria-label`, `aria-describedby`, `aria-invalid`
3. Dodać `Label` dla email
4. Dodać wyświetlanie `emailError` jeśli istnieje
5. Dodać `Input` dla hasła:
   - `type="password"` (lub `type="text"` gdy pokazane)
   - `value={formState.password}`
   - `onChange={handlePasswordChange}`
   - `onBlur={handlePasswordBlur}`
   - `aria-label`, `aria-describedby`, `aria-invalid`
6. Dodać `Label` dla hasła
7. Dodać przycisk "Pokaż/Ukryj hasło" (opcjonalnie)
8. Dodać wyświetlanie `passwordError` jeśli istnieje

### Krok 11: Implementacja UI - Komunikaty błędów

1. Dodać komponent `Alert` (warunkowo, gdy `errorMessage !== null`)
2. Skonfigurować `Alert`:
   - `variant="destructive"`
   - `role="alert"`
   - `aria-live="assertive"`
3. Wyświetlić `errorMessage` w `Alert`

### Krok 12: Implementacja UI - Przycisk Submit

1. Dodać komponent `Button` z typem `submit`
2. Skonfigurować `Button`:
   - `disabled={!canSubmit}` (gdy walidacja nie przechodzi lub `isSubmitting`)
   - `aria-label="Zaloguj się"`
3. Dodać spinner w przycisku gdy `isSubmitting === true`
4. Zmienić tekst przycisku na "Logowanie..." gdy `isSubmitting === true`

### Krok 13: Implementacja UI - Link do rejestracji

1. Dodać link `<a href="/register">Nie masz konta? Zarejestruj się</a>`
2. Opcjonalnie przekazać `redirect` parameter: `/register?redirect=${redirectUrl}`

### Krok 14: Implementacja Toast Notifications

1. Zaimportować `useToast` hook z Shadcn/ui
2. Utworzyć instancję toast: `const { toast } = useToast()`
3. W funkcji `handleNetworkError()` wywołać `toast()` z odpowiednim komunikatem

### Krok 15: Testowanie

1. Test walidacji email (puste, nieprawidłowy format)
2. Test walidacji hasła (puste)
3. Test poprawnego logowania (przekierowanie)
4. Test błędnych danych (401 - nieprawidłowy email/hasło)
5. Test błędu sieci (brak połączenia)
6. Test przekierowania z parametrem `redirect`
7. Test gdy użytkownik jest już zalogowany (przekierowanie)
8. Test keyboard navigation (Tab, Enter)
9. Test dostępności (screen reader, aria-labels)

### Krok 16: Dokumentacja i komentarze

1. Dodać komentarze JSDoc do funkcji
2. Dodać komentarze do złożonych logik
3. Zaktualizować dokumentację jeśli potrzebna

### Krok 17: Optymalizacja i refaktoryzacja

1. Sprawdzenie czy kod jest zgodny z zasadami projektu
2. Optymalizacja re-renderów (użycie `useCallback` jeśli potrzebne)
3. Refaktoryzacja jeśli kod można uprościć
4. Sprawdzenie czy wszystkie przypadki brzegowe są obsłużone

