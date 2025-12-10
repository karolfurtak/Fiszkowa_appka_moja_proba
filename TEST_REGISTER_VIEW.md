# Test Plan - Widok Rejestracji (/register)

## Testy do wykonania

### 1. Testy podstawowej funkcjonalności

#### 1.1. Ładowanie strony
- [ ] Strona `/register` ładuje się poprawnie
- [ ] Tytuł strony to "Rejestracja - 10xCards"
- [ ] Formularz jest widoczny z trzema polami: Email, Hasło, Potwierdzenie hasła
- [ ] Pole email jest automatycznie fokusowane po załadowaniu
- [ ] Spinner pokazuje się podczas sprawdzania sesji (jeśli użytkownik nie jest zalogowany)

#### 1.2. Przekierowanie dla zalogowanych użytkowników
- [ ] Jeśli użytkownik jest już zalogowany, przekierowuje na `/` (dashboard)

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
- [ ] Hasło < 6 znaków → komunikat "Hasło musi zawierać co najmniej 6 znaków"
- [ ] Hasło 6-7 znaków → brak błędu, ale ostrzeżenie "Hasło powinno zawierać co najmniej 8 znaków"
- [ ] Hasło >= 8 znaków → brak błędu i brak ostrzeżenia
- [ ] Błąd znika po poprawieniu wartości
- [ ] Wskaźnik siły hasła pokazuje się gdy hasło jest wypełnione i pole było dotknięte

#### 2.3. Wskaźnik siły hasła
- [ ] Hasło < 6 znaków → wskaźnik pokazuje "Słabe" (czerwony, 1/3 szerokości)
- [ ] Hasło tylko litery (np. "password") → wskaźnik pokazuje "Słabe"
- [ ] Hasło tylko cyfry (np. "123456") → wskaźnik pokazuje "Słabe"
- [ ] Hasło 6-7 znaków z literami i cyframi → wskaźnik pokazuje "Średnie" (żółty, 2/3 szerokości)
- [ ] Hasło 8+ znaków z tylko literami → wskaźnik pokazuje "Średnie"
- [ ] Hasło 8+ znaków z literami i cyframi → wskaźnik pokazuje "Silne" (zielony, pełna szerokość)
- [ ] Wskaźnik nie pokazuje się gdy hasło jest puste
- [ ] Wskaźnik nie pokazuje się gdy pole nie było dotknięte

#### 2.4. Walidacja pola Potwierdzenie Hasła
- [ ] Puste pole potwierdzenie hasła → komunikat "Potwierdzenie hasła jest wymagane" po blur
- [ ] Hasła nie są zgodne → komunikat "Hasła nie są identyczne"
- [ ] Hasła są zgodne → brak błędu
- [ ] Walidacja zgodności działa w czasie rzeczywistym (gdy zmienia się hasło)
- [ ] Błąd znika po poprawieniu wartości

#### 2.5. Walidacja przed wysłaniem
- [ ] Przycisk "Zarejestruj się" jest disabled gdy pola są puste
- [ ] Przycisk "Zarejestruj się" jest disabled gdy są błędy walidacji
- [ ] Przycisk "Zarejestruj się" jest aktywny gdy wszystkie pola są poprawne

### 3. Testy UI/UX

#### 3.1. Przełączanie widoczności hasła
- [ ] Ikona oka jest widoczna obok pola hasła
- [ ] Kliknięcie ikony oka pokazuje hasło (typ zmienia się na "text")
- [ ] Kliknięcie ikony oka ponownie ukrywa hasło (typ zmienia się na "password")
- [ ] Ikona zmienia się z Eye na EyeOff i odwrotnie
- [ ] Przycisk ma odpowiedni aria-label

#### 3.2. Przełączanie widoczności potwierdzenia hasła
- [ ] Ikona oka jest widoczna obok pola potwierdzenia hasła
- [ ] Kliknięcie ikony oka pokazuje potwierdzenie hasła
- [ ] Kliknięcie ikony oka ponownie ukrywa potwierdzenie hasła
- [ ] Ikona zmienia się z Eye na EyeOff i odwrotnie
- [ ] Przycisk ma odpowiedni aria-label

#### 3.3. Stany przycisku Submit
- [ ] Podczas ładowania (`isSubmitting`) przycisk pokazuje spinner i tekst "Rejestrowanie..."
- [ ] Przycisk jest disabled podczas ładowania
- [ ] Przycisk jest disabled podczas sprawdzania sesji

#### 3.4. Komunikaty błędów
- [ ] Błędy walidacji są wyświetlane pod odpowiednimi polami
- [ ] Błędy mają czerwony kolor (text-destructive)
- [ ] Błędy mają font-medium
- [ ] Ogólny komunikat błędu (Alert) jest wyświetlany pod polami formularza
- [ ] Alert ma variant="destructive"

### 4. Testy integracji z API

#### 4.1. Pomyślna rejestracja
- [ ] Wprowadzenie poprawnego email i hasła → sukces
- [ ] Po sukcesie użytkownik jest przekierowany na `/` (dashboard)
- [ ] Sesja jest zapisana w Supabase
- [ ] Użytkownik jest automatycznie zalogowany

#### 4.2. Rejestracja wymagająca potwierdzenia email
- [ ] Jeśli Supabase wymaga potwierdzenia email → toast sukcesu z informacją o sprawdzeniu skrzynki
- [ ] Formularz jest czyszczony po sukcesie
- [ ] Użytkownik nie jest przekierowywany (pozostaje na stronie rejestracji)

#### 4.3. Błędy autoryzacji
- [ ] Email już zarejestrowany → komunikat "Ten email jest już zarejestrowany" pod polem email
- [ ] Nieprawidłowy format email (z API) → komunikat "Nieprawidłowy format email" pod polem email
- [ ] Słabe hasło (z API) → komunikat "Hasło jest zbyt słabe. Musi zawierać co najmniej 6 znaków" pod polem hasła
- [ ] Rejestracja wyłączona → komunikat "Rejestracja jest obecnie wyłączona" w Alert
- [ ] Inne błędy autoryzacji → komunikat "Wystąpił błąd podczas rejestracji. Spróbuj ponownie." w Alert
- [ ] Pola formularza pozostają wypełnione po błędzie
- [ ] Przycisk staje się ponownie aktywny po błędzie

#### 4.4. Błędy sieci
- [ ] Brak połączenia z internetem → toast "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
- [ ] Timeout (30 sekund) → toast "Żądanie przekroczyło limit czasu. Spróbuj ponownie."
- [ ] Inne błędy sieci → toast "Wystąpił nieoczekiwany błąd. Spróbuj ponownie."

#### 4.5. Wygaśnięcie sesji
- [ ] Jeśli sesja wygasła podczas rejestracji → toast "Sesja wygasła. Odśwież stronę i spróbuj ponownie."

### 5. Testy dostępności (WCAG AA)

#### 5.1. ARIA attributes
- [ ] Pole email ma `aria-label="Email"`
- [ ] Pole email ma `aria-describedby` wskazujące na komunikat błędu (jeśli istnieje)
- [ ] Pole email ma `aria-invalid="true"` gdy jest błąd
- [ ] Pole hasło ma `aria-label="Hasło"`
- [ ] Pole hasło ma `aria-describedby` wskazujące na komunikat błędu (jeśli istnieje)
- [ ] Pole hasło ma `aria-invalid="true"` gdy jest błąd
- [ ] Pole potwierdzenie hasła ma `aria-label="Potwierdzenie hasła"`
- [ ] Pole potwierdzenie hasła ma `aria-describedby` wskazujące na komunikat błędu (jeśli istnieje)
- [ ] Pole potwierdzenie hasła ma `aria-invalid="true"` gdy jest błąd
- [ ] Przycisk submit ma `aria-label="Zarejestruj się"`
- [ ] Alert ma `role="alert"` i `aria-live="assertive"`
- [ ] Komunikaty błędów mają `role="alert"` i `aria-live="polite"`
- [ ] Wskaźnik siły hasła ma `role="status"` i `aria-live="polite"`

#### 5.2. Keyboard navigation
- [ ] Tab przechodzi przez pola: email → hasło → potwierdzenie hasła → przycisk → link
- [ ] Shift+Tab przechodzi wstecz
- [ ] Enter w formularzu wysyła formularz (jeśli walidacja przechodzi)
- [ ] Escape nie powoduje zamknięcia formularza (nie ma modal)

#### 5.3. Focus management
- [ ] Pole email jest automatycznie fokusowane po załadowaniu
- [ ] Po błędzie walidacji, pierwsze pole z błędem jest fokusowane
- [ ] Pole z błędem jest przewijane do widoku (`scrollIntoView`)
- [ ] Focus jest widoczny (outline ring)

### 6. Testy przypadków brzegowych

#### 6.1. Wielokrotne kliknięcia
- [ ] Wielokrotne kliknięcia przycisku "Zarejestruj się" nie powodują wielokrotnych requestów
- [ ] Przycisk jest disabled podczas `isSubmitting`

#### 6.2. Zmiana wartości podczas ładowania
- [ ] Pola są disabled podczas `isSubmitting`
- [ ] Pola są disabled podczas `isCheckingSession`

#### 6.3. Walidacja w czasie rzeczywistym
- [ ] Zmiana hasła automatycznie waliduje zgodność z potwierdzeniem hasła
- [ ] Błędy są czyszczone gdy użytkownik poprawia wartość (jeśli pole było dotknięte)

#### 6.4. Czyszczenie formularza
- [ ] Po sukcesie z potwierdzeniem email, formularz jest czyszczony
- [ ] Po błędzie, formularz pozostaje wypełniony

### 7. Testy linku do logowania

- [ ] Link "Masz już konto? Zaloguj się" jest widoczny
- [ ] Kliknięcie linku przekierowuje na `/login`

## Instrukcje testowania

1. Uruchom serwer deweloperski: `npm run dev`
2. Otwórz przeglądarkę na `http://localhost:3000/register`
3. Wykonaj testy zgodnie z powyższą listą
4. Sprawdź konsolę przeglądarki pod kątem błędów
5. Sprawdź Network tab w DevTools pod kątem requestów do Supabase

## Oczekiwane zachowanie

- Formularz powinien być responsywny i działać płynnie
- Wszystkie komunikaty błędów powinny być czytelne i pomocne
- Wskaźnik siły hasła powinien być pomocny i dokładny
- Przekierowania powinny działać poprawnie
- Dostępność powinna być na poziomie WCAG AA

