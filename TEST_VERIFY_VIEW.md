# Test Plan - Widok Weryfikacji Propozycji (/verify/[session_id])

## Testy do wykonania

### 1. Testy strukturalne (Code Review)

#### ✅ Struktura komponentów
- [x] Strona Astro (`verify/[session_id].astro`) istnieje i jest poprawnie skonfigurowana
- [x] Komponent `VerificationView` istnieje i jest poprawnie zaimportowany
- [x] Komponent `FlashcardProposalCard` istnieje i jest poprawnie zaimportowany
- [x] Komponent `EditProposalModal` istnieje i jest poprawnie zaimportowany
- [x] Wszystkie komponenty Shadcn/ui są poprawnie zaimportowane
- [x] Toaster (Sonner) jest poprawnie zintegrowany

#### ✅ Funkcje API
- [x] `fetchProposalsBySession()` - pobieranie propozycji z sesji
- [x] `fetchDecks()` - pobieranie listy talii
- [x] `acceptProposalsBySession()` - akceptacja wszystkich propozycji
- [x] `acceptProposals()` - akceptacja wybranych propozycji
- [x] `rejectProposals()` - odrzucenie propozycji
- [x] `updateProposal()` - aktualizacja propozycji
- [x] `createDeck()` - tworzenie nowej talii
- [x] `updateDomainForSession()` - aktualizacja domeny dla wszystkich propozycji

#### ✅ Obsługa błędów
- [x] Timeout (30 sekund) jest zaimplementowany we wszystkich funkcjach API
- [x] Offline detection jest zaimplementowany
- [x] Obsługa błędów 401 (Unauthorized) z przekierowaniem
- [x] Obsługa błędów 404 (Not Found)
- [x] Obsługa błędów 500 (Server Error)

#### ✅ Dostępność (WCAG AA)
- [x] Semantyczny HTML (`<main>`, `<header>`, `<section>`, `<footer>`)
- [x] ARIA labels dla wszystkich przycisków
- [x] ARIA describedby dla pól formularza
- [x] ARIA live regions dla dynamicznych aktualizacji
- [x] Role attributes (`role="main"`, `role="toolbar"`, `role="list"`, etc.)
- [x] Labels dla wszystkich pól formularza

#### ✅ Optymalizacja
- [x] `React.memo()` dla `FlashcardProposalCard`
- [x] `useMemo()` dla obliczonych wartości (`stats`, `canSave`)
- [x] `useCallback()` dla wszystkich handlerów
- [x] Lazy loading dla obrazków

### 2. Testy funkcjonalne (wymagają manualnego testowania)

#### ⏳ Podstawowa funkcjonalność
- [ ] Strona `/verify/[session_id]` ładuje się poprawnie
- [ ] Formularz jest widoczny z listą propozycji
- [ ] Loading state pokazuje się podczas pobierania danych
- [ ] Empty state pokazuje się gdy brak propozycji

#### ⏳ Pobieranie danych
- [ ] Propozycje są poprawnie pobierane z API
- [ ] Talie są poprawnie pobierane z API
- [ ] Wykryta domena jest poprawnie wyświetlana
- [ ] Wszystkie propozycje są domyślnie zaznaczone

#### ⏳ Zaznaczanie propozycji
- [ ] Checkbox zaznacza/odznacza pojedynczą propozycję
- [ ] Statystyki są aktualizowane po zmianie zaznaczenia
- [ ] Przyciski akcji są odpowiednio disabled/enabled

#### ⏳ Edycja domeny
- [ ] Przycisk "Zmień" otwiera tryb edycji
- [ ] Pole edycji domeny jest widoczne
- [ ] Przycisk "Zapisz" zapisuje domenę dla wszystkich propozycji
- [ ] Przycisk "Anuluj" anuluje edycję

#### ⏳ Edycja propozycji
- [ ] Przycisk "Edytuj" otwiera modal edycji
- [ ] Modal jest poprawnie wypełniony danymi propozycji
- [ ] Walidacja działa poprawnie (pytanie 1000-10000 znaków, odpowiedź max 500)
- [ ] Liczniki znaków działają poprawnie
- [ ] Przycisk "Zapisz zmiany" zapisuje zmiany
- [ ] Przycisk "Anuluj" zamyka modal bez zapisu

#### ⏳ Odrzucanie propozycji
- [ ] Przycisk "Odrzuć" odrzuca pojedynczą propozycję
- [ ] Przycisk "Odrzuć wszystkie" odrzuca wszystkie zaznaczone propozycje
- [ ] Odrzucone propozycje są usuwane z listy
- [ ] Toast notification jest wyświetlany po sukcesie

#### ⏳ Akceptacja propozycji
- [ ] Przycisk "Akceptuj wszystkie" akceptuje wszystkie propozycje
- [ ] Przycisk "Zapisz wszystkie" zapisuje wszystkie propozycje do talii
- [ ] Przycisk "Zapisz zatwierdzone" zapisuje tylko zaznaczone propozycje
- [ ] Walidacja wyboru talii działa poprawnie
- [ ] Tworzenie nowej talii działa poprawnie
- [ ] Przekierowanie na `/deck/[deck_id]` działa po zapisie

#### ⏳ Selektor talii
- [ ] Dropdown wyświetla listę talii
- [ ] Opcja "Utwórz nową talię" pokazuje pole nazwy
- [ ] Walidacja nazwy nowej talii działa poprawnie (max 200 znaków)
- [ ] Nowa talia jest tworzona i automatycznie wybierana

#### ⏳ Obsługa błędów
- [ ] Błąd 401 przekierowuje na `/login`
- [ ] Błąd 404 wyświetla odpowiedni komunikat
- [ ] Błąd 500 wyświetla odpowiedni komunikat
- [ ] Timeout wyświetla odpowiedni komunikat
- [ ] Offline detection wyświetla odpowiedni komunikat
- [ ] Przycisk "Spróbuj ponownie" działa poprawnie

### 3. Testy dostępności (WCAG AA)

#### ⏳ Keyboard navigation
- [ ] Tab przechodzi przez wszystkie interaktywne elementy
- [ ] Shift+Tab przechodzi wstecz
- [ ] Enter aktywuje przyciski
- [ ] Escape zamyka modal edycji
- [ ] Focus jest widoczny na wszystkich elementach

#### ⏳ Screen reader
- [ ] Wszystkie elementy są poprawnie odczytywane
- [ ] ARIA labels są poprawnie odczytywane
- [ ] Komunikaty błędów są poprawnie odczytywane
- [ ] Dynamiczne aktualizacje są poprawnie odczytywane

#### ⏳ Kontrast kolorów
- [ ] Tekst ma odpowiedni kontrast (min 4.5:1)
- [ ] Przyciski mają odpowiedni kontrast
- [ ] Komunikaty błędów mają odpowiedni kontrast

### 4. Testy responsywności

#### ⏳ Desktop (>1024px)
- [ ] Layout jest poprawnie wyświetlany
- [ ] Wszystkie elementy są widoczne
- [ ] Modal edycji jest poprawnie wyświetlany

#### ⏳ Tablet (768px - 1024px)
- [ ] Layout jest poprawnie wyświetlany
- [ ] Wszystkie elementy są widoczne
- [ ] Modal edycji jest poprawnie wyświetlany

#### ⏳ Mobile (<768px)
- [ ] Layout jest poprawnie wyświetlany
- [ ] Wszystkie elementy są widoczne
- [ ] Modal edycji jest poprawnie wyświetlany
- [ ] Przyciski są odpowiednio duże do kliknięcia

### 5. Testy wydajności

#### ⏳ Renderowanie
- [ ] Lista propozycji renderuje się szybko (<100ms dla 10 propozycji)
- [ ] Modal edycji otwiera się szybko (<50ms)
- [ ] Nie ma niepotrzebnych re-renderów

#### ⏳ API calls
- [ ] Pobieranie propozycji jest szybkie (<1s)
- [ ] Pobieranie talii jest szybkie (<500ms)
- [ ] Akceptacja propozycji jest szybka (<2s)

## Instrukcje testowania

1. Uruchom serwer deweloperski: `npm run dev`
2. Zaloguj się do aplikacji
3. Wygeneruj propozycje fiszek (przejdź przez `/generate`)
4. Po zakończeniu generowania, powinieneś zostać przekierowany na `/verify/[session_id]`
5. Wykonaj testy zgodnie z powyższą listą
6. Sprawdź konsolę przeglądarki pod kątem błędów
7. Sprawdź Network tab w DevTools pod kątem requestów do Supabase

## Oczekiwane zachowanie

- Widok powinien być responsywny i działać płynnie
- Wszystkie komunikaty błędów powinny być czytelne i pomocne
- Dostępność powinna być na poziomie WCAG AA
- Wszystkie operacje powinny być szybkie i responsywne

