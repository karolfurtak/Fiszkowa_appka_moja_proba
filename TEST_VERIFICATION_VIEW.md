# Test Plan - Widok Weryfikacji propozycji

## 1. Testy strukturalne

### 1.1. Weryfikacja komponentów
- [x] Strona Astro `src/pages/verify/[session_id].astro` istnieje i jest poprawnie skonfigurowana
- [x] Komponent React `VerificationView` istnieje w `src/components/verify/VerificationView.tsx`
- [x] Komponent `DeckSelector` istnieje w `src/components/verify/DeckSelector.tsx`
- [x] Komponent `FlashcardProposalCard` istnieje w `src/components/verify/FlashcardProposalCard.tsx`
- [x] Komponent `EditProposalModal` istnieje w `src/components/verify/EditProposalModal.tsx`
- [x] Wszystkie importy są poprawne (używają względnych ścieżek)
- [x] Komponenty używają `supabaseClient` z `src/db/supabase.client.ts`

### 1.2. Weryfikacja struktury widoku
- [x] Sekcja nagłówkowa z tytułem i domeną wiedzy
- [x] Edytor domeny (warunkowo renderowany)
- [x] Statystyki propozycji
- [x] Pasek akcji z checkboxem "Zaznacz wszystkie" i przyciskami bulk
- [x] Lista propozycji (`FlashcardProposalCard[]`)
- [x] Stopka z `DeckSelector` i przyciskami zapisu
- [x] Modal edycji propozycji (`EditProposalModal`)

### 1.3. Weryfikacja funkcji API
- [x] `fetchProposalsBySession` - pobieranie propozycji z sesji
- [x] `fetchDecks` - pobieranie listy talii
- [x] `acceptProposalsBySession` - akceptacja wszystkich propozycji z sesji
- [x] `acceptProposals` - akceptacja wybranych propozycji
- [x] `rejectProposals` - odrzucenie propozycji
- [x] `updateProposal` - aktualizacja propozycji
- [x] `createDeck` - tworzenie nowej talii
- [x] `updateDomainForSession` - aktualizacja domeny dla sesji

## 2. Testy funkcjonalne

### 2.1. Pobieranie danych

#### Pobieranie propozycji
- [ ] Po załadowaniu widoku → propozycje są pobierane z API
- [ ] Domyślnie wszystkie propozycje są zaznaczone
- [ ] Wykryta domena jest ustawiana z pierwszej propozycji
- [ ] Jeśli brak propozycji → wyświetlenie empty state

#### Pobieranie talii
- [ ] Po załadowaniu widoku → talie są pobierane z API
- [ ] Talie są wyświetlane w dropdown `DeckSelector`
- [ ] Talie są posortowane alfabetycznie

### 2.2. Zaznaczanie propozycji

#### Checkbox "Zaznacz wszystkie"
- [ ] Kliknięcie checkboxa → zaznaczenie wszystkich propozycji ze statusem 'pending'
- [ ] Kliknięcie checkboxa gdy wszystkie zaznaczone → odznaczenie wszystkich
- [ ] Checkbox pokazuje stan zaznaczenia (checked/unchecked)
- [ ] Label jest klikalny i działa tak samo jak checkbox

#### Zaznaczanie pojedynczych propozycji
- [ ] Kliknięcie checkboxa przy propozycji → zaznaczenie/odznaczenie
- [ ] Statystyki są aktualizowane po zmianie zaznaczenia
- [ ] Przyciski "Zapisz zatwierdzone" są disabled gdy brak zaznaczonych propozycji

### 2.3. Edycja domeny wiedzy

#### Wyświetlanie domeny
- [ ] Wykryta domena jest wyświetlana w nagłówku
- [ ] Jeśli brak domeny → wyświetlenie "Brak"
- [ ] Przycisk "Zmień" otwiera tryb edycji

#### Edycja domeny
- [ ] Kliknięcie "Zmień" → pojawia się pole Input z aktualną domeną
- [ ] Licznik znaków pokazuje aktualną długość / 100
- [ ] Walidacja: domena max 100 znaków
- [ ] Kliknięcie "Zapisz" → wywołanie API `updateDomainForSession`
- [ ] Po sukcesie → domena jest zaktualizowana, tryb edycji zamknięty
- [ ] Kliknięcie "Anuluj" → zamknięcie trybu edycji, przywrócenie poprzedniej wartości

### 2.4. Akcje bulk

#### Akceptacja wszystkich propozycji
- [ ] Kliknięcie "Akceptuj wszystkie" → walidacja (czy wybrano talię)
- [ ] Jeśli tworzenie nowej talii → walidacja nazwy talii
- [ ] Jeśli walidacja OK → wywołanie API `acceptProposalsBySession`
- [ ] Po sukcesie → przekierowanie na `/deck/{deck_id}`
- [ ] Toast notification: "Wszystkie propozycje zostały zaakceptowane"

#### Odrzucenie wszystkich propozycji
- [ ] Kliknięcie "Odrzuć wszystkie" → walidacja (czy są zaznaczone propozycje)
- [ ] Wywołanie API `rejectProposals` z zaznaczonymi ID
- [ ] Po sukcesie → odświeżenie listy propozycji
- [ ] Toast notification: "Wszystkie zaznaczone propozycje zostały odrzucone"

### 2.5. Zapisywanie propozycji do talii

#### Wybór talii
- [ ] Dropdown `DeckSelector` wyświetla listę talii
- [ ] Wybór talii → ustawienie `selectedDeckId`
- [ ] Wybór "Utwórz nową talię" → pojawia się pole nazwy talii

#### Tworzenie nowej talii
- [ ] Wybór "Utwórz nową talię" → pole Input jest widoczne
- [ ] Walidacja nazwy: wymagana, max 200 znaków
- [ ] Licznik znaków pokazuje aktualną długość / 200
- [ ] Błędy walidacji są wyświetlane pod polem

#### Zapisywanie zaznaczonych propozycji
- [ ] Kliknięcie "Zapisz zatwierdzone" → walidacja (talia + zaznaczone propozycje)
- [ ] Jeśli tworzenie nowej talii → najpierw utworzenie talii, potem akceptacja propozycji
- [ ] Wywołanie API `acceptProposals` z zaznaczonymi ID i deck_id
- [ ] Po sukcesie → przekierowanie na `/deck/{deck_id}`
- [ ] Toast notification: "Propozycje zostały zapisane do talii"

### 2.6. Edycja propozycji

#### Otwarcie modala edycji
- [ ] Kliknięcie "Edytuj" przy propozycji → otwarcie `EditProposalModal`
- [ ] Modal zawiera wstępnie wypełnione pola (pytanie, odpowiedź, URL obrazka, domena)
- [ ] Modal ma focus trap (nie można wyjść poza modal klawiaturą)

#### Walidacja w modalu
- [ ] Pytanie: wymagane, 1000-10000 znaków
- [ ] Odpowiedź: wymagana, max 500 znaków
- [ ] URL obrazka: opcjonalny, prawidłowy format URL
- [ ] Domena: opcjonalna, max 100 znaków
- [ ] Komunikaty błędów są wyświetlane pod odpowiednimi polami
- [ ] Przycisk "Zapisz zmiany" jest disabled gdy są błędy walidacji

#### Zapis zmian
- [ ] Kliknięcie "Zapisz zmiany" → walidacja wszystkich pól
- [ ] Jeśli walidacja OK → wywołanie API `updateProposal`
- [ ] Po sukcesie → zamknięcie modala, odświeżenie listy propozycji
- [ ] Toast notification: "Propozycja została zaktualizowana"

### 2.7. Odrzucenie pojedynczej propozycji
- [ ] Kliknięcie "Odrzuć" przy propozycji → wywołanie API `rejectProposals`
- [ ] Po sukcesie → odświeżenie listy propozycji
- [ ] Toast notification: "Propozycja została odrzucona"

### 2.8. Regeneracja dystraktorów
- [ ] Kliknięcie "Regeneruj" → toast notification: "Funkcja regeneracji dystraktorów jest w trakcie implementacji"

## 3. Testy walidacji

### 3.1. Walidacja nazwy nowej talii
- [ ] Puste pole → komunikat: "Nazwa talii jest wymagana"
- [ ] Nazwa > 200 znaków → komunikat: "Nazwa talii nie może przekraczać 200 znaków"
- [ ] Nazwa 1-200 znaków → brak błędu
- [ ] Walidacja wykonuje się przy `onBlur`
- [ ] Błędy są wyświetlane w `DeckSelector`

### 3.2. Walidacja domeny wiedzy
- [ ] Domena > 100 znaków → komunikat: "Domena nie może przekraczać 100 znaków"
- [ ] Domena 0-100 znaków → brak błędu
- [ ] Puste pole → brak błędu (domena jest opcjonalna)
- [ ] Walidacja wykonuje się przed zapisaniem

### 3.3. Walidacja przed zapisaniem
- [ ] Brak wybranej talii → przyciski "Zapisz" są disabled
- [ ] Brak zaznaczonych propozycji → przycisk "Zapisz zatwierdzone" jest disabled
- [ ] Nieprawidłowa nazwa talii → przyciski "Zapisz" są disabled
- [ ] Wszystkie warunki spełnione → przyciski "Zapisz" są enabled

## 4. Testy dostępności (WCAG AA)

### 4.1. Nawigacja klawiaturą
- [ ] Tab przechodzi przez wszystkie interaktywne elementy w logicznej kolejności
- [ ] Enter w checkboxie zaznacza/odznacza
- [ ] Enter w przyciskach wyzwala akcję
- [ ] Escape zamyka modal edycji
- [ ] Focus trap w modalu działa poprawnie

### 4.2. Screen reader
- [ ] Wszystkie pola mają poprawne `aria-label` lub są powiązane z `<Label>`
- [ ] Komunikaty błędów są czytane przez screen reader (`aria-live="polite"`)
- [ ] Statystyki są czytane przez screen reader (`aria-live="polite"`)
- [ ] Checkbox "Zaznacz wszystkie" ma `aria-label`
- [ ] Przyciski mają opisowe `aria-label`

### 4.3. Kontrast i wizualne wskaźniki
- [ ] Czerwone obramowanie pól z błędami jest widoczne
- [ ] Komunikaty błędów mają odpowiedni kontrast
- [ ] Liczniki znaków mają odpowiedni kontrast
- [ ] Disabled przyciski są wyraźnie oznaczone

## 5. Testy wydajności

### 5.1. Optymalizacja React
- [x] `DeckSelector` używa `React.memo`
- [x] Handlerów używają `React.useCallback`
- [x] Obliczone wartości używają `React.useMemo`
- [x] `FlashcardProposalCard` używa `React.memo`

### 5.2. Renderowanie
- [ ] Widok renderuje się szybko (< 200ms)
- [ ] Zmiany zaznaczenia nie powodują niepotrzebnych re-renderów
- [ ] Modal otwiera się płynnie

## 6. Testy integracyjne

### 6.1. Integracja z API
- [ ] Request body jest poprawnie sformatowany zgodnie z typami
- [ ] Nagłówek `Authorization` zawiera poprawny token
- [ ] Response jest poprawnie przetwarzany
- [ ] Błędy API są poprawnie mapowane na komunikaty po polsku

### 6.2. Integracja z routingiem
- [ ] Przekierowanie na `/deck/{deck_id}` działa poprawnie po zapisaniu
- [ ] Przekierowanie na `/login?redirect=/verify/{session_id}` działa poprawnie (gdy brak autoryzacji)
- [ ] Przekierowanie na `/generate` działa poprawnie (przycisk Anuluj)

## 7. Testy przypadków brzegowych

### 7.1. Sesja wygasła
- [ ] Podczas operacji → przekierowanie na login z odpowiednim redirect URL
- [ ] Toast notification: "Sesja wygasła. Zaloguj się ponownie."

### 7.2. Brak propozycji
- [ ] Jeśli brak propozycji → wyświetlenie empty state
- [ ] Przycisk "Wróć do generatora" działa poprawnie

### 7.3. Wielokrotne kliknięcia
- [ ] Wielokrotne kliknięcia "Zapisz" → tylko jedno żądanie jest wysyłane (przycisk disabled)
- [ ] Wielokrotne kliknięcia checkboxa → działa poprawnie

### 7.4. Błąd podczas zapisu
- [ ] Jeśli API zwraca błąd → toast notification z komunikatem błędu
- [ ] Użytkownik może spróbować ponownie
- [ ] Stan nie jest resetowany (zaznaczone propozycje pozostają zaznaczone)

### 7.5. Konflikt podczas edycji
- [ ] Jeśli propozycja została zmieniona przez innego użytkownika → komunikat błędu
- [ ] Automatyczne odświeżenie listy propozycji

## 8. Instrukcje testowania manualnego

### Scenariusz 1: Pomyślne zapisanie wszystkich propozycji
1. Zaloguj się do aplikacji
2. Wygeneruj fiszki (przejdź przez `/generate` → `/loading/{session_id}` → `/verify/{session_id}`)
3. Wybierz talię z dropdown lub utwórz nową
4. Kliknij "Zapisz wszystkie"
5. **Oczekiwany rezultat**: Przekierowanie na `/deck/{deck_id}`, toast notification sukcesu

### Scenariusz 2: Zapisywanie zaznaczonych propozycji
1. Przejdź na `/verify/{session_id}`
2. Odznacz niektóre propozycje (kliknij checkboxy)
3. Wybierz talię
4. Kliknij "Zapisz zatwierdzone"
5. **Oczekiwany rezultat**: Tylko zaznaczone propozycje są zapisane, przekierowanie na `/deck/{deck_id}`

### Scenariusz 3: Tworzenie nowej talii
1. Przejdź na `/verify/{session_id}`
2. Wybierz "Utwórz nową talię" z dropdown
3. Wprowadź nazwę talii
4. Kliknij "Zapisz wszystkie" lub "Zapisz zatwierdzone"
5. **Oczekiwany rezultat**: Talia jest utworzona, propozycje są zapisane, przekierowanie na `/deck/{new_deck_id}`

### Scenariusz 4: Walidacja nazwy talii
1. Przejdź na `/verify/{session_id}`
2. Wybierz "Utwórz nową talię"
3. Zostaw pole nazwy puste
4. Opuść pole (Tab lub kliknij gdzie indziej)
5. **Oczekiwany rezultat**: Komunikat błędu: "Nazwa talii jest wymagana"
6. Wprowadź nazwę > 200 znaków
7. **Oczekiwany rezultat**: Komunikat błędu: "Nazwa talii nie może przekraczać 200 znaków"

### Scenariusz 5: Edycja domeny wiedzy
1. Przejdź na `/verify/{session_id}`
2. Kliknij "Zmień" obok wykrytej domeny
3. Wprowadź nową domenę (max 100 znaków)
4. Kliknij "Zapisz"
5. **Oczekiwany rezultat**: Domena jest zaktualizowana dla wszystkich propozycji, tryb edycji zamknięty

### Scenariusz 6: Checkbox "Zaznacz wszystkie"
1. Przejdź na `/verify/{session_id}`
2. Kliknij checkbox "Zaznacz wszystkie"
3. **Oczekiwany rezultat**: Wszystkie propozycje są zaznaczone
4. Kliknij ponownie checkbox "Zaznacz wszystkie"
5. **Oczekiwany rezultat**: Wszystkie propozycje są odznaczone

### Scenariusz 7: Edycja propozycji
1. Przejdź na `/verify/{session_id}`
2. Kliknij "Edytuj" przy propozycji
3. Zmień pytanie lub odpowiedź
4. Kliknij "Zapisz zmiany"
5. **Oczekiwany rezultat**: Propozycja jest zaktualizowana, modal zamknięty, lista odświeżona

### Scenariusz 8: Nawigacja klawiaturą
1. Przejdź na `/verify/{session_id}`
2. Użyj Tab do nawigacji przez elementy
3. **Oczekiwany rezultat**: Focus przechodzi przez wszystkie interaktywne elementy w logicznej kolejności
4. Naciśnij Enter na checkboxie "Zaznacz wszystkie"
5. **Oczekiwany rezultat**: Wszystkie propozycje są zaznaczone/odznaczone

## 9. Checklist finalizacji

- [x] Wszystkie komponenty są zaimplementowane
- [x] Wszystkie funkcjonalności są zaimplementowane
- [x] Optymalizacja wydajności jest zaimplementowana
- [x] Dostępność (WCAG AA) jest zaimplementowana
- [x] Obsługa błędów jest zaimplementowana
- [x] Integracja z API jest zaimplementowana
- [x] Walidacja jest zaimplementowana
- [ ] Testy manualne zostały wykonane
- [ ] Wszystkie scenariusze testowe zostały zweryfikowane

