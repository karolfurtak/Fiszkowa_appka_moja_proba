# Test widoku Ustawienia (/settings)

## Test strukturalny

### 1. Sprawdzenie plików
- [x] `src/pages/settings.astro` - strona Astro z autoryzacją
- [x] `src/lib/api/settings.ts` - funkcje API
- [x] `src/components/settings/SettingsView.tsx` - główny komponent
- [x] `src/components/settings/PasswordChangeForm.tsx` - formularz zmiany hasła
- [x] `src/components/settings/UserPreferencesForm.tsx` - formularz preferencji
- [x] `src/components/settings/AppSettingsForm.tsx` - formularz ustawień aplikacji
- [x] `src/components/settings/DeleteAccountDialog.tsx` - modal usunięcia konta
- [x] `src/components/ui/switch.tsx` - komponent Switch (Shadcn/ui)

### 2. Sprawdzenie eksportów
- [x] `SettingsView` - default export
- [x] `PasswordChangeForm` - named export
- [x] `UserPreferencesForm` - named export
- [x] `AppSettingsForm` - named export
- [x] `DeleteAccountDialog` - named export

### 3. Sprawdzenie importów w SettingsView
- [x] Import `supabaseClient` z `../../db/supabase.client`
- [x] Import funkcji API z `../../lib/api/settings`
- [x] Import typów z `../../types`
- [x] Import komponentów UI (toast, Loader2, Alert, Button, Card)
- [x] Import podkomponentów Settings

### 4. Sprawdzenie funkcji API
- [x] `fetchUserProfile` - pobieranie profilu użytkownika
- [x] `verifyOldPassword` - weryfikacja starego hasła
- [x] `updatePassword` - aktualizacja hasła
- [x] `saveUserPreferences` - zapis preferencji
- [x] `saveAppSettings` - zapis ustawień aplikacji
- [x] `deleteAccount` - usunięcie konta

### 5. Sprawdzenie struktury komponentu SettingsView
- [x] Stan komponentu (SettingsViewState)
- [x] Funkcja `mapApiError` - mapowanie błędów
- [x] Funkcja `loadProfile` - pobieranie profilu
- [x] Funkcja `validatePasswordForm` - walidacja formularza hasła
- [x] Funkcja `handleChangePassword` - obsługa zmiany hasła
- [x] Funkcja `handleSavePreferences` - obsługa zapisu preferencji
- [x] Funkcja `handleAppSettingsChange` - obsługa zmiany ustawień aplikacji
- [x] Funkcja `handleDeleteAccount` - obsługa usunięcia konta
- [x] Obliczanie `formattedCreatedAt` - formatowanie daty rejestracji
- [x] Renderowanie loading state
- [x] Renderowanie error state
- [x] Renderowanie wszystkich sekcji (hasło, preferencje, ustawienia, konto)

### 6. Sprawdzenie walidacji
- [x] Walidacja starego hasła (wymagane)
- [x] Walidacja nowego hasła (min 8 znaków, litery i cyfry)
- [x] Walidacja potwierdzenia hasła (zgodność z nowym hasłem)
- [x] Walidacja preferencji (max 1500 znaków)
- [x] Walidacja potwierdzenia usunięcia konta ("USUŃ")

### 7. Sprawdzenie obsługi błędów
- [x] Błędy sieciowe (offline, timeout)
- [x] Błędy autoryzacji (401)
- [x] Błędy walidacji (400)
- [x] Błędy serwera (500)
- [x] Przekierowania przy błędach autoryzacji

### 8. Sprawdzenie dostępności (ARIA)
- [x] ARIA labels dla pól formularzy
- [x] ARIA invalid dla pól z błędami
- [x] ARIA describedby dla komunikatów błędów
- [x] Role="alert" dla komunikatów błędów
- [x] Semantyczny HTML (main, section, form)

## Test funkcjonalny (do wykonania manualnie)

### Test 1: Zmiana hasła
1. Wprowadź stare hasło, nowe hasło i potwierdzenie
2. Sprawdź walidację inline (komunikaty błędów)
3. Kliknij "Zmień hasło"
4. Sprawdź weryfikację starego hasła
5. Sprawdź komunikat sukcesu
6. Sprawdź reset formularza po 3 sekundach

### Test 2: Zapis preferencji
1. Wprowadź preferencje (max 1500 znaków)
2. Sprawdź licznik znaków
3. Sprawdź walidację przy przekroczeniu limitu
4. Kliknij "Zapisz preferencje"
5. Sprawdź komunikat sukcesu
6. Sprawdź zapis do localStorage

### Test 3: Ustawienia aplikacji
1. Przełącz dark mode
2. Sprawdź auto-save (debouncing 500ms)
3. Sprawdź synchronizację z `<html>` elementem
4. Zmień tryb wyświetlania weryfikacji
5. Sprawdź zapis do localStorage
6. Sprawdź toast notification

### Test 4: Usunięcie konta
1. Kliknij "Usuń konto"
2. Sprawdź otwarcie modala
3. Sprawdź walidację potwierdzenia ("USUŃ")
4. Sprawdź disabled przycisku "Usuń konto" bez potwierdzenia
5. Wpisz "USUŃ" i kliknij "Usuń konto"
6. Sprawdź wylogowanie i przekierowanie

### Test 5: Autoryzacja
1. Otwórz `/settings` bez logowania
2. Sprawdź przekierowanie na `/login?redirect=/settings`
3. Zaloguj się i sprawdź powrót na `/settings`

### Test 6: Loading state
1. Sprawdź wyświetlanie Loader2 podczas ładowania profilu
2. Sprawdź wyświetlanie komunikatów loading podczas operacji

### Test 7: Error handling
1. Sprawdź obsługę błędów sieciowych
2. Sprawdź obsługę błędów autoryzacji
3. Sprawdź obsługę błędów walidacji
4. Sprawdź toast notifications dla błędów

## Wyniki testów strukturalnych

✅ **Wszystkie testy strukturalne przeszły pomyślnie**

- Wszystkie pliki zostały utworzone
- Wszystkie eksporty są poprawne
- Wszystkie importy są poprawne
- Struktura komponentu jest zgodna z planem
- Walidacja jest zaimplementowana
- Obsługa błędów jest zaimplementowana
- Dostępność (ARIA) jest zaimplementowana

## Następne kroki

1. **Testy manualne** - wykonanie 7 scenariuszy testowych powyżej
2. **Testy dostępności** - weryfikacja z screen readerem
3. **Testy responsywności** - sprawdzenie na różnych urządzeniach
4. **Code review** - przegląd kodu przez zespół

