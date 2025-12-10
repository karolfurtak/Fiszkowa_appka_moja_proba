# Instrukcje testów manualnych - Widok Tryb treningu (`/deck/[id]/review`)

## Przygotowanie środowiska testowego

1. **Upewnij się, że aplikacja działa:**
   ```bash
   npm run dev
   ```

2. **Zaloguj się do aplikacji** (użyj istniejącego konta lub utwórz nowe)

3. **Przygotuj talię z fiszkami do powtórki:**
   - Przejdź do Dashboard (`/`)
   - Utwórz nową talię lub użyj istniejącej
   - Upewnij się, że talia ma co najmniej 4-5 fiszek ze statusem `'learning'`
   - Upewnij się, że fiszki mają `due_date <= now()` (lub zmień w bazie danych)
   - Upewnij się, że masz różne odpowiedzi w fiszkach (dla dystraktorów)

## Scenariusze testowe

### Scenariusz 1: Nawigacja do widoku

**Cel:** Sprawdzenie poprawności nawigacji do widoku trybu treningu

**Kroki:**
1. Zaloguj się do aplikacji
2. Przejdź do listy fiszek (`/deck/[id]`)
3. Kliknij przycisk "Rozpocznij powtórkę"
4. Sprawdź czy URL zmienił się na `/deck/[id]/review`
5. Sprawdź czy widok się załadował

**Oczekiwany wynik:**
- ✅ Przekierowanie na `/deck/[id]/review`
- ✅ Widok się załadował bez błędów
- ✅ Wyświetla się pierwsza fiszka z pytaniem i 4 odpowiedziami

**Alternatywny scenariusz:**
1. Przejdź bezpośrednio na `/deck/[id]/review` (podstawiając prawdziwe ID talii)
2. Sprawdź czy widok się załadował

**Oczekiwany wynik:**
- ✅ Widok się załadował (jeśli użytkownik jest zalogowany i są fiszki do powtórki)
- ✅ Przekierowanie na `/login` (jeśli użytkownik nie jest zalogowany)

---

### Scenariusz 2: Wyświetlanie danych

**Cel:** Sprawdzenie poprawności wyświetlania danych sesji treningowej

**Kroki:**
1. Przejdź do widoku trybu treningu (`/deck/[id]/review`)
2. Sprawdź czy wyświetla się pasek postępu (np. "1 / 5")
3. Sprawdź czy wyświetla się procent postępu
4. Sprawdź czy wyświetla się przycisk "Przerwij" w headerze
5. Sprawdź czy wyświetla się pytanie (duży tekst)
6. Sprawdź czy wyświetla się 4 losowo ułożone odpowiedzi
7. Jeśli fiszka ma obrazek, sprawdź czy się wyświetla

**Oczekiwany wynik:**
- ✅ Wszystkie elementy są widoczne i poprawnie wyświetlone
- ✅ Pasek postępu pokazuje "1 / X" gdzie X to liczba fiszek
- ✅ Odpowiedzi są losowo ułożone (kolejność różni się przy każdym odświeżeniu)

---

### Scenariusz 3: Wybór odpowiedzi (poprawna)

**Cel:** Sprawdzenie poprawności wyboru poprawnej odpowiedzi

**Kroki:**
1. Przejdź do widoku trybu treningu
2. Sprawdź czy wszystkie 4 odpowiedzi są dostępne
3. Kliknij na poprawną odpowiedź
4. Sprawdź czy przycisk zmienił kolor na zielony
5. Sprawdź czy wyświetla się ikona Check
6. Sprawdź czy wyświetla się komunikat "Poprawna odpowiedź!"
7. Sprawdź czy wszystkie przyciski są wyłączone
8. Poczekaj 1.5 sekundy
9. Sprawdź czy automatyczne przejście do następnej fiszki

**Oczekiwany wynik:**
- ✅ Natychmiastowa informacja zwrotna (zielony kolor)
- ✅ Komunikat sukcesu
- ✅ Przyciski są wyłączone po wyborze
- ✅ Automatyczne przejście po 1.5 sekundy

---

### Scenariusz 4: Wybór odpowiedzi (błędna)

**Cel:** Sprawdzenie poprawności wyboru błędnej odpowiedzi

**Kroki:**
1. Przejdź do widoku trybu treningu
2. Kliknij na błędną odpowiedź
3. Sprawdź czy przycisk zmienił kolor na czerwony
4. Sprawdź czy wyświetla się ikona X
5. Sprawdź czy wyświetla się komunikat "Błędna odpowiedź"
6. Sprawdź czy wyświetla się poprawna odpowiedź
7. Sprawdź czy wszystkie przyciski są wyłączone
8. Poczekaj 1.5 sekundy
9. Sprawdź czy automatyczne przejście do następnej fiszki

**Oczekiwany wynik:**
- ✅ Natychmiastowa informacja zwrotna (czerwony kolor)
- ✅ Komunikat błędu
- ✅ Wyświetlenie poprawnej odpowiedzi
- ✅ Przyciski są wyłączone po wyborze
- ✅ Automatyczne przejście po 1.5 sekundy

---

### Scenariusz 5: Nawigacja klawiaturą

**Cel:** Sprawdzenie poprawności nawigacji przy użyciu klawiatury

**Kroki:**
1. Przejdź do widoku trybu treningu
2. Upewnij się, że focus jest na stronie (kliknij gdziekolwiek na stronie)
3. Naciśnij klawisz 1
4. Sprawdź czy wybrano pierwszą odpowiedź
5. Poczekaj na przejście do następnej fiszki
6. Naciśnij klawisz 2
7. Sprawdź czy wybrano drugą odpowiedź
8. Naciśnij Escape
9. Sprawdź czy sesja została przerwana (przekierowanie do listy fiszek)

**Oczekiwany wynik:**
- ✅ Klawisze 1-4 działają poprawnie (wybór odpowiedzi)
- ✅ Escape przerywa sesję
- ✅ Nawigacja działa bez scrollowania strony

---

### Scenariusz 6: Przerwanie sesji

**Cel:** Sprawdzenie poprawności przerwania sesji

**Kroki:**
1. Przejdź do widoku trybu treningu
2. Odpowiedz na 2-3 fiszki
3. Kliknij przycisk "Przerwij" w headerze
4. Sprawdź czy przekierowanie do `/deck/[id]`
5. Wróć do widoku trybu treningu
6. Odpowiedz na 1 fiszkę
7. Naciśnij Escape
8. Sprawdź czy przekierowanie do `/deck/[id]`

**Oczekiwany wynik:**
- ✅ Przycisk "Przerwij" przerywa sesję
- ✅ Escape przerywa sesję
- ✅ Przekierowanie do listy fiszek działa poprawnie

---

### Scenariusz 7: Zakończenie sesji i podsumowanie

**Cel:** Sprawdzenie poprawności zakończenia sesji i wyświetlenia podsumowania

**Kroki:**
1. Przejdź do widoku trybu treningu
2. Odpowiedz na wszystkie fiszki (lub poczekaj na automatyczne przejścia)
3. Sprawdź czy automatyczne wyświetlenie ekranu podsumowania
4. Sprawdź czy wyświetla się wynik (X / Y poprawnych)
5. Sprawdź czy wyświetla się procent poprawnych odpowiedzi
6. Sprawdź czy wyświetla się lista błędnych odpowiedzi (jeśli są)
7. Sprawdź czy każda błędna odpowiedź pokazuje pytanie, odpowiedź użytkownika i poprawną odpowiedź
8. Kliknij przycisk "Zakończ"
9. Sprawdź czy przekierowanie do `/deck/[id]`
10. Wróć do widoku trybu treningu i zakończ sesję ponownie
11. Kliknij przycisk "Wróć do dashboardu"
12. Sprawdź czy przekierowanie do `/`

**Oczekiwany wynik:**
- ✅ Automatyczne wyświetlenie podsumowania po ostatniej fiszce
- ✅ Wszystkie statystyki są poprawne
- ✅ Lista błędnych odpowiedzi jest kompletna
- ✅ Przyciski nawigacji działają poprawnie

---

### Scenariusz 8: Wszystkie odpowiedzi poprawne

**Cel:** Sprawdzenie wyświetlania komunikatu gratulacyjnego

**Kroki:**
1. Utwórz talię z łatwymi fiszkami (lub zmień odpowiedzi w bazie danych)
2. Przejdź do widoku trybu treningu
3. Odpowiedz poprawnie na wszystkie fiszki
4. Sprawdź czy wyświetla się komunikat gratulacyjny
5. Sprawdź czy wyświetla się ikona Trophy
6. Sprawdź czy nie wyświetla się lista błędnych odpowiedzi

**Oczekiwany wynik:**
- ✅ Komunikat gratulacyjny jest widoczny
- ✅ Ikona Trophy jest wyświetlona
- ✅ Lista błędnych odpowiedzi nie jest wyświetlana

---

### Scenariusz 9: Generowanie dystraktorów

**Cel:** Sprawdzenie poprawności generowania dystraktorów

**Kroki:**
1. Utwórz talię z co najmniej 5 fiszkami z różnymi odpowiedziami
2. Przejdź do widoku trybu treningu
3. Sprawdź czy każda fiszka ma 4 odpowiedzi (1 poprawna + 3 dystraktory)
4. Sprawdź czy dystraktory pochodzą z innych fiszek z talii
5. Sprawdź czy dystraktory są różne od poprawnej odpowiedzi
6. Sprawdź czy kolejność odpowiedzi jest losowa (odśwież stronę kilka razy)

**Oczekiwany wynik:**
- ✅ Każda fiszka ma 4 odpowiedzi
- ✅ Dystraktory pochodzą z innych fiszek
- ✅ Dystraktory są różne od poprawnej odpowiedzi
- ✅ Kolejność odpowiedzi jest losowa

---

### Scenariusz 10: Przypadek brzegowy - za mało fiszek

**Cel:** Sprawdzenie obsługi przypadku gdy jest za mało fiszek dla dystraktorów

**Kroki:**
1. Utwórz talię z tylko 2 fiszkami
2. Przejdź do widoku trybu treningu
3. Sprawdź czy pierwsza fiszka ma 4 odpowiedzi (możliwe powtórzenia dystraktorów)
4. Sprawdź czy odpowiedzi są różne od poprawnej odpowiedzi

**Oczekiwany wynik:**
- ✅ Fiszka ma 4 odpowiedzi (nawet jeśli niektóre dystraktory są powtórzone)
- ✅ Dystraktory są różne od poprawnej odpowiedzi

---

### Scenariusz 11: Empty state

**Cel:** Sprawdzenie poprawności wyświetlania empty state

**Kroki:**
1. Utwórz talię bez fiszek do powtórki (wszystkie opanowane lub due_date w przyszłości)
2. Przejdź do widoku trybu treningu
3. Sprawdź czy wyświetla się komunikat "Brak fiszek do powtórki..."
4. Sprawdź czy wyświetla się przycisk "Wróć do listy fiszek"
5. Sprawdź czy wyświetla się przycisk "Spróbuj ponownie"
6. Kliknij przycisk "Wróć do listy fiszek"
7. Sprawdź czy przekierowanie do `/deck/[id]`

**Oczekiwany wynik:**
- ✅ Empty state wyświetla się poprawnie
- ✅ Przyciski działają poprawnie
- ✅ Przekierowania działają poprawnie

---

### Scenariusz 12: Obsługa błędów

**Cel:** Sprawdzenie poprawności obsługi błędów

**Kroki:**
1. Przejdź do widoku trybu treningu z nieistniejącym ID talii (np. `/deck/99999/review`)
2. Sprawdź czy wyświetla się błąd lub przekierowanie
3. Sprawdź czy pojawił się toast notification
4. Wyloguj się z aplikacji
5. Przejdź do widoku trybu treningu
6. Sprawdź czy przekierowanie na `/login`
7. Sprawdź czy URL zawiera parametr `redirect`

**Oczekiwany wynik:**
- ✅ Błędy są obsługiwane poprawnie
- ✅ Toast notifications pojawiają się dla błędów
- ✅ Przekierowania działają poprawnie
- ✅ Parametr `redirect` jest zachowany przy przekierowaniu na login

---

### Scenariusz 13: Responsywność

**Cel:** Sprawdzenie poprawności działania na różnych rozdzielczościach

**Kroki:**
1. Otwórz aplikację w DevTools (responsive mode)
2. Przejdź do widoku trybu treningu
3. Sprawdź widok na mobile (< 640px):
   - Czy pasek postępu jest responsywny
   - Czy przyciski odpowiedzi są responsywne
   - Czy karta z pytaniem jest responsywna
4. Sprawdź widok na tablet (640px - 1024px)
5. Sprawdź widok na desktop (> 1024px)

**Oczekiwany wynik:**
- ✅ Widok działa poprawnie na wszystkich rozdzielczościach
- ✅ Elementy są czytelne i dostępne
- ✅ Layout jest responsywny

---

### Scenariusz 14: Wydajność

**Cel:** Sprawdzenie wydajności widoku

**Kroki:**
1. Otwórz konsolę przeglądarki (F12)
2. Przejdź do widoku trybu treningu
3. Sprawdź czy nie ma błędów w konsoli
4. Odpowiedz na kilka fiszek
5. Sprawdź czy przejścia są płynne
6. Sprawdź React DevTools (jeśli dostępne) - czy nie ma niepotrzebnych re-renderów

**Oczekiwany wynik:**
- ✅ Brak błędów w konsoli
- ✅ Płynne przejścia między fiszkami
- ✅ Brak problemów z wydajnością

---

### Scenariusz 15: Dostępność (WCAG AA)

**Cel:** Sprawdzenie dostępności widoku

**Kroki:**
1. Przejdź do widoku trybu treningu
2. Użyj tylko klawiatury do nawigacji:
   - Tab - przejście między elementami
   - 1-4 - wybór odpowiedzi
   - Escape - przerwanie sesji
   - Enter/Space - aktywacja przycisków
3. Sprawdź czy focus jest widoczny na wszystkich elementach
4. Użyj screen readera (jeśli dostępny):
   - Sprawdź czy wszystkie elementy są odczytywane
   - Sprawdź czy aria-labels są poprawne
5. Sprawdź kontrast kolorów (wizualnie)

**Oczekiwany wynik:**
- ✅ Wszystkie elementy są dostępne z klawiatury
- ✅ Focus jest widoczny
- ✅ Screen reader odczytuje elementy poprawnie
- ✅ Kontrast jest wystarczający

---

## Checklist końcowy

Po wykonaniu wszystkich scenariuszy, sprawdź:

- [ ] Wszystkie scenariusze przeszły pomyślnie
- [ ] Brak błędów w konsoli przeglądarki
- [ ] Przejścia są płynne
- [ ] Brak problemów z wydajnością
- [ ] Responsywność działa na wszystkich urządzeniach
- [ ] Dostępność jest na poziomie WCAG AA

## Raportowanie błędów

Jeśli znajdziesz błędy, zapisz:
1. **Scenariusz:** Który scenariusz testowy
2. **Kroki:** Jakie kroki wykonałeś
3. **Oczekiwany wynik:** Co powinno się stać
4. **Rzeczywisty wynik:** Co się faktycznie stało
5. **Zrzuty ekranu:** Jeśli możliwe
6. **Konsola przeglądarki:** Błędy w konsoli (jeśli występują)

