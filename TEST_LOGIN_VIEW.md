# Test Plan - Widok Logowania (/login)

## Testy do wykonania

### 1. Testy podstawowej funkcjonalności

#### 1.1. Ładowanie strony
- [ ] Strona `/login` ładuje się poprawnie
- [ ] Tytuł strony to "Logowanie - 10xCards"
- [ ] Formularz jest widoczny
- [ ] Pole email jest automatycznie fokusowane po załadowaniu
- [ ] Spinner pokazuje się podczas sprawdzania sesji (jeśli użytkownik nie jest zalogowany)

#### 1.2. Przekierowanie dla zalogowanych użytkowników
- [ ] Jeśli użytkownik jest już zalogowany, przekierowuje na `/` (dashboard)
- [ ] Jeśli użytkownik jest zalogowany i jest parametr `?redirect=/generate`, przekierowuje na `/generate`

### 2. Testy walidacji

#### 2.1. Walidacja pola Email
- [ ] Puste pole email → komunikat "Email jest wymagany" po blur
- [ ] Nieprawidłowy format email (np. "test") → komunikat "Nieprawidłowy format email" po blur
- [ ] Nieprawidłowy format email (np. "test@") → komunikat "Nieprawidłowy format email" po blur
- [ ] Nieprawidłowy format email (np. "@test.com") → komunikat "Nieprawidłowy format email" po blur
- [ ] Poprawny format email (np. "test@example.com") → brak błędu
- [ ] Błąd znika po poprawieniu wartości

#### 2.2. Walidacja pola Hasło
- [ ] Puste pole hasło → komunikat "Hasło jest wymagane" po blur
- [ ] Wypełnione pole hasło → brak błędu
- [ ] Błąd znika po poprawieniu wartości

#### 2.3. Walidacja przed wysłaniem
- [ ] Przycisk "Zaloguj się" jest disabled gdy pola są puste
- [ ] Przycisk "Zaloguj się" jest disabled gdy są błędy walidacji
- [ ] Przycisk "Zaloguj się" jest aktywny gdy wszystkie pola są poprawne

### 3. Testy UI/UX

#### 3.1. Przełączanie widoczności hasła
- [ ] Ikona oka jest widoczna obok pola hasła
- [ ] Kliknięcie ikony oka pokazuje hasło (typ zmienia się na "text")
- [ ] Kliknięcie ikony oka ponownie ukrywa hasło (typ zmienia się na "password")
- [ ] Ikona zmienia się z Eye na EyeOff i odwrotnie
- [ ] Przycisk ma odpowiedni aria-label

#### 3.2. Stany przycisku Submit
- [ ] Podczas ładowania (`isSubmitting`) przycisk pokazuje spinner i tekst "Logowanie..."
- [ ] Przycisk jest disabled podczas ładowania
- [ ] Przycisk jest disabled podczas sprawdzania sesji

#### 3.3. Komunikaty błędów
- [ ] Błędy walidacji są wyświetlane pod odpowiednimi polami
- [ ] Błędy mają czerwony kolor (text-destructive)
- [ ] Błędy mają font-medium
- [ ] Ogólny komunikat błędu (Alert) jest wyświetlany pod polami formularza
- [ ] Alert ma variant="destructive"

### 4. Testy integracji z API

#### 4.1. Pomyślne logowanie
- [ ] Wprowadzenie poprawnego email i hasła → sukces
- [ ] Po sukcesie użytkownik jest przekierowany na `/` (dashboard)
- [ ] Po sukcesie z parametrem `?redirect=/generate` użytkownik jest przekierowany na `/generate`
- [ ] Sesja jest zapisana w Supabase

#### 4.2. Błędy autoryzacji
- [ ] Nieprawidłowy email/hasło → komunikat "Nieprawidłowy email lub hasło" w Alert
- [ ] Email niepotwierdzony → komunikat "Email nie został potwierdzony. Sprawdź skrzynkę pocztową."
- [ ] Inne błędy autoryzacji → komunikat "Wystąpił błąd podczas logowania. Spróbuj ponownie."
- [ ] Pola formularza pozostają wypełnione po błędzie
- [ ] Przycisk staje się ponownie aktywny po błędzie

#### 4.3. Błędy sieci
- [ ] Brak połączenia z internetem → toast "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
- [ ] Timeout (30 sekund) → toast "Żądanie przekroczyło limit czasu. Spróbuj ponownie."
- [ ] Inne błędy sieci → toast "Wystąpił nieoczekiwany błąd. Spróbuj ponownie."

#### 4.4. Wygaśnięcie sesji
- [ ] Jeśli sesja wygasła podczas logowania → toast "Sesja wygasła. Zaloguj się ponownie."

### 5. Testy dostępności (WCAG AA)

#### 5.1. ARIA attributes
- [ ] Pole email ma `aria-label="Email"`
- [ ] Pole email ma `aria-describedby` wskazujące na komunikat błędu (jeśli istnieje)
- [ ] Pole email ma `aria-invalid="true"` gdy jest błąd
- [ ] Pole hasło ma `aria-label="Hasło"`
- [ ] Pole hasło ma `aria-describedby` wskazujące na komunikat błędu (jeśli istnieje)
- [ ] Pole hasło ma `aria-invalid="true"` gdy jest błąd
- [ ] Przycisk submit ma `aria-label="Zaloguj się"`
- [ ] Alert ma `role="alert"` i `aria-live="assertive"`
- [ ] Komunikaty błędów mają `role="alert"` i `aria-live="polite"`

#### 5.2. Keyboard navigation
- [ ] Tab przechodzi przez pola: email → hasło → przycisk → link
- [ ] Shift+Tab przechodzi wstecz
- [ ] Enter w formularzu wysyła formularz (jeśli walidacja przechodzi)
- [ ] Escape nie powoduje zamknięcia formularza (nie ma modal)

#### 5.3. Focus management
- [ ] Pole email jest automatycznie fokusowane po załadowaniu
- [ ] Po błędzie walidacji, pierwsze pole z błędem jest fokusowane
- [ ] Focus jest widoczny (outline ring)

### 6. Testy przypadków brzegowych

#### 6.1. Wielokrotne kliknięcia
- [ ] Wielokrotne kliknięcia przycisku "Zaloguj się" nie powodują wielokrotnych requestów
- [ ] Przycisk jest disabled podczas `isSubmitting`

#### 6.2. Zmiana wartości podczas ładowania
- [ ] Pola są disabled podczas `isSubmitting`
- [ ] Pola są disabled podczas `isCheckingSession`

#### 6.3. Przekierowanie z chronionej trasy
- [ ] Wejście na `/generate` bez logowania → przekierowanie na `/login?redirect=/generate`
- [ ] Po zalogowaniu z parametrem redirect → przekierowanie na właściwą stronę

### 7. Testy linku do rejestracji

- [ ] Link "Nie masz konta? Zarejestruj się" jest widoczny
- [ ] Kliknięcie linku przekierowuje na `/register`
- [ ] Jeśli jest parametr `redirect`, jest przekazywany do `/register?redirect=...`

## Instrukcje testowania

1. Uruchom serwer deweloperski: `npm run dev`
2. Otwórz przeglądarkę na `http://localhost:3000/login`
3. Wykonaj testy zgodnie z powyższą listą
4. Sprawdź konsolę przeglądarki pod kątem błędów
5. Sprawdź Network tab w DevTools pod kątem requestów do Supabase

## Oczekiwane zachowanie

- Formularz powinien być responsywny i działać płynnie
- Wszystkie komunikaty błędów powinny być czytelne i pomocne
- Przekierowania powinny działać poprawnie
- Dostępność powinna być na poziomie WCAG AA

