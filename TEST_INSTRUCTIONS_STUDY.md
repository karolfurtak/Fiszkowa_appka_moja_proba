# Instrukcje testów manualnych - Widok Tryb nauki (`/deck/[id]/study`)

## Przygotowanie środowiska testowego

1. **Upewnij się, że aplikacja działa:**
   ```bash
   npm run dev
   ```

2. **Zaloguj się do aplikacji** (użyj istniejącego konta lub utwórz nowe)

3. **Utwórz talię z fiszkami** (jeśli nie masz):
   - Przejdź do Dashboard (`/`)
   - Utwórz nową talię lub użyj istniejącej
   - Upewnij się, że talia ma co najmniej 3-5 fiszek
   - Upewnij się, że masz fiszki z różnymi statusami (learning, mastered)

## Scenariusze testowe

### Scenariusz 1: Nawigacja do widoku

**Cel:** Sprawdzenie poprawności nawigacji do widoku trybu nauki

**Kroki:**
1. Zaloguj się do aplikacji
2. Przejdź do Dashboard (`/`)
3. Kliknij przycisk "Tryb nauki" na karcie talii
4. Sprawdź czy URL zmienił się na `/deck/[id]/study`
5. Sprawdź czy widok się załadował

**Oczekiwany wynik:**
- ✅ Przekierowanie na `/deck/[id]/study`
- ✅ Widok się załadował bez błędów
- ✅ Wyświetla się pierwsza fiszka ze stroną przednią (pytanie)

**Alternatywny scenariusz:**
1. Przejdź bezpośrednio na `/deck/[id]/study` (podstawiając prawdziwe ID talii)
2. Sprawdź czy widok się załadował

**Oczekiwany wynik:**
- ✅ Widok się załadował (jeśli użytkownik jest zalogowany)
- ✅ Przekierowanie na `/login` (jeśli użytkownik nie jest zalogowany)

---

### Scenariusz 2: Wyświetlanie danych

**Cel:** Sprawdzenie poprawności wyświetlania danych talii i fiszek

**Kroki:**
1. Przejdź do widoku trybu nauki (`/deck/[id]/study`)
2. Sprawdź czy wyświetlają się breadcrumbs: Dashboard > [Nazwa talii] > Tryb nauki
3. Sprawdź czy wyświetla się nazwa talii w nagłówku
4. Sprawdź czy wyświetla się wskaźnik pozycji (np. "1 / 5")
5. Sprawdź czy wyświetla się pierwsza fiszka ze stroną przednią (pytanie)
6. Jeśli fiszka ma obrazek, sprawdź czy się wyświetla

**Oczekiwany wynik:**
- ✅ Wszystkie elementy są widoczne i poprawnie wyświetlone
- ✅ Wskaźnik pozycji pokazuje "1 / X" gdzie X to liczba fiszek
- ✅ Pytanie jest czytelne i wyśrodkowane

---

### Scenariusz 3: Animacja flip karty

**Cel:** Sprawdzenie poprawności animacji odwracania karty

**Kroki:**
1. Przejdź do widoku trybu nauki
2. Sprawdź czy karta pokazuje stronę przednią (pytanie)
3. Kliknij na kartę
4. Sprawdź czy karta odwróciła się z animacją
5. Sprawdź czy wyświetla się strona tylna (odpowiedź)
6. Kliknij na kartę ponownie
7. Sprawdź czy karta odwróciła się z powrotem do strony przedniej
8. Kliknij przycisk "Pokaż odpowiedź"
9. Sprawdź czy karta odwróciła się

**Oczekiwany wynik:**
- ✅ Animacja jest płynna (bez szarpnięć)
- ✅ Karta odwraca się poprawnie (pytanie ↔ odpowiedź)
- ✅ Przycisk "Pokaż odpowiedź" działa tak samo jak kliknięcie na kartę
- ✅ Przycisk "Pokaż odpowiedź" znika gdy karta jest odwrócona

---

### Scenariusz 4: Nawigacja przyciskami

**Cel:** Sprawdzenie poprawności nawigacji między fiszkami przy użyciu przycisków

**Kroki:**
1. Przejdź do widoku trybu nauki
2. Sprawdź czy przycisk "Poprzednia" jest wyłączony (pierwsza fiszka)
3. Kliknij przycisk "Następna"
4. Sprawdź czy przejście do następnej fiszki
5. Sprawdź czy wskaźnik pozycji się zaktualizował (np. "2 / 5")
6. Sprawdź czy karta resetowała się do strony przedniej
7. Kliknij przycisk "Poprzednia"
8. Sprawdź czy wróciłeś do poprzedniej fiszki
9. Przejdź do ostatniej fiszki (klikając "Następna" wielokrotnie)
10. Sprawdź czy przycisk "Następna" jest wyłączony

**Oczekiwany wynik:**
- ✅ Przyciski działają poprawnie
- ✅ Przyciski są wyłączone na granicach (pierwsza/ostatnia fiszka)
- ✅ Wskaźnik pozycji aktualizuje się poprawnie
- ✅ Karta resetuje się do strony przedniej przy zmianie fiszki

---

### Scenariusz 5: Nawigacja klawiaturą

**Cel:** Sprawdzenie poprawności nawigacji przy użyciu klawiatury

**Kroki:**
1. Przejdź do widoku trybu nauki
2. Upewnij się, że focus jest na stronie (kliknij gdziekolwiek na stronie)
3. Naciśnij strzałkę w prawo (→)
4. Sprawdź czy przejście do następnej fiszki
5. Naciśnij strzałkę w lewo (←)
6. Sprawdź czy wróciłeś do poprzedniej fiszki
7. Naciśnij Enter lub Spację
8. Sprawdź czy karta się odwróciła
9. Naciśnij Enter lub Spację ponownie
10. Sprawdź czy karta odwróciła się z powrotem

**Oczekiwany wynik:**
- ✅ Strzałki działają poprawnie (← poprzednia, → następna)
- ✅ Enter/Space odwraca kartę
- ✅ Nawigacja działa bez scrollowania strony

---

### Scenariusz 6: Gesty swipe (mobile/touch)

**Cel:** Sprawdzenie poprawności gestów swipe na urządzeniach dotykowych

**Kroki:**
1. Otwórz aplikację na urządzeniu mobilnym lub użyj DevTools (responsive mode)
2. Przejdź do widoku trybu nauki
3. Wykonaj gest swipe w lewo na karcie fiszki
4. Sprawdź czy przejście do następnej fiszki
5. Wykonaj gest swipe w prawo na karcie fiszki
6. Sprawdź czy wróciłeś do poprzedniej fiszki
7. Wykonaj krótki gest (mniej niż 50px)
8. Sprawdź czy nie nastąpiło przejście (gest za krótki)

**Oczekiwany wynik:**
- ✅ Swipe w lewo → następna fiszka
- ✅ Swipe w prawo → poprzednia fiszka
- ✅ Krótkie gesty (< 50px) są ignorowane
- ✅ Gesty działają tylko na głównej karcie (nie w sidebarze)

---

### Scenariusz 7: Filtrowanie po statusie

**Cel:** Sprawdzenie poprawności filtrowania fiszek po statusie

**Kroki:**
1. Przejdź do widoku trybu nauki
2. Sprawdź ile fiszek jest wyświetlonych (wskaźnik pozycji)
3. Otwórz dropdown z filtrem statusu
4. Wybierz "W trakcie nauki"
5. Sprawdź czy lista się przefiltrowała
6. Sprawdź czy wskaźnik pozycji się zaktualizował
7. Sprawdź czy pozycja resetowała się do pierwszej fiszki
8. Sprawdź czy karta resetowała się do strony przedniej
9. Wybierz "Opanowane"
10. Sprawdź czy lista się przefiltrowała ponownie
11. Wybierz "Wszystkie"
12. Sprawdź czy wszystkie fiszki są widoczne

**Oczekiwany wynik:**
- ✅ Filtr działa poprawnie dla wszystkich opcji
- ✅ Pozycja resetuje się do pierwszej fiszki przy zmianie filtra
- ✅ Karta resetuje się do strony przedniej przy zmianie filtra
- ✅ Wskaźnik pozycji aktualizuje się poprawnie

---

### Scenariusz 8: Sidebar z listą fiszek

**Cel:** Sprawdzenie poprawności działania sidebara

**Kroki:**
1. Przejdź do widoku trybu nauki
2. Kliknij przycisk "Pokaż sidebar" w nagłówku
3. Sprawdź czy sidebar wysunął się z prawej strony
4. Sprawdź czy pojawił się overlay (ciemne tło)
5. Sprawdź czy lista pokazuje wszystkie fiszki
6. Sprawdź czy aktualnie wyświetlana fiszka jest wyróżniona
7. Kliknij na inną fiszkę w sidebarze
8. Sprawdź czy przejście do wybranej fiszki
9. Sprawdź czy karta resetowała się do strony przedniej
10. Kliknij przycisk "Zamknij" w sidebarze
11. Sprawdź czy sidebar się zamknął
12. Otwórz sidebar ponownie
13. Kliknij na overlay
14. Sprawdź czy sidebar się zamknął
15. Otwórz sidebar ponownie
16. Naciśnij Escape
17. Sprawdź czy sidebar się zamknął

**Oczekiwany wynik:**
- ✅ Sidebar otwiera się i zamyka poprawnie
- ✅ Overlay pojawia się przy otwarciu
- ✅ Lista pokazuje wszystkie fiszki z przefiltrowanej listy
- ✅ Aktualna fiszka jest wyróżniona
- ✅ Kliknięcie na fiszkę przechodzi do niej
- ✅ Sidebar zamyka się przez przycisk, overlay i Escape

---

### Scenariusz 9: Empty state

**Cel:** Sprawdzenie poprawności wyświetlania empty state

**Kroki:**
1. Utwórz nową pustą talię (bez fiszek)
2. Przejdź do widoku trybu nauki dla pustej talii
3. Sprawdź czy wyświetla się komunikat "Ta talia jest pusta..."
4. Sprawdź czy wyświetla się przycisk "Wróć do listy fiszek"
5. Kliknij przycisk "Wróć do listy fiszek"
6. Sprawdź czy przekierowanie do `/deck/[id]`
7. Wróć do widoku trybu nauki
8. Ustaw filtr na "Opanowane" (jeśli nie masz opanowanych fiszek)
9. Sprawdź czy wyświetla się komunikat "Brak fiszek z wybranym statusem."
10. Sprawdź czy wyświetla się przycisk "Pokaż wszystkie fiszki"
11. Kliknij przycisk "Pokaż wszystkie fiszki"
12. Sprawdź czy filtr zmienił się na "Wszystkie"

**Oczekiwany wynik:**
- ✅ Empty state wyświetla się dla pustej talii
- ✅ Empty state wyświetla się gdy filtr nie zwraca wyników
- ✅ Przyciski działają poprawnie
- ✅ Breadcrumbs są widoczne w empty state

---

### Scenariusz 10: Obsługa błędów

**Cel:** Sprawdzenie poprawności obsługi błędów

**Kroki:**
1. Przejdź do widoku trybu nauki z nieistniejącym ID talii (np. `/deck/99999/study`)
2. Sprawdź czy wyświetla się błąd lub przekierowanie
3. Sprawdź czy pojawił się toast notification
4. Sprawdź czy przekierowanie do `/deck/[id]` lub Dashboard
5. Wyloguj się z aplikacji
6. Przejdź do widoku trybu nauki
7. Sprawdź czy przekierowanie na `/login`
8. Sprawdź czy URL zawiera parametr `redirect`

**Oczekiwany wynik:**
- ✅ Błędy są obsługiwane poprawnie
- ✅ Toast notifications pojawiają się dla błędów
- ✅ Przekierowania działają poprawnie
- ✅ Parametr `redirect` jest zachowany przy przekierowaniu na login

---

### Scenariusz 11: Responsywność

**Cel:** Sprawdzenie poprawności działania na różnych rozdzielczościach

**Kroki:**
1. Otwórz aplikację w DevTools (responsive mode)
2. Przejdź do widoku trybu nauki
3. Sprawdź widok na mobile (< 640px):
   - Czy nagłówek jest responsywny (flex-col)
   - Czy karta jest responsywna
   - Czy sidebar jest pełnej szerokości
4. Sprawdź widok na tablet (640px - 1024px)
5. Sprawdź widok na desktop (> 1024px)

**Oczekiwany wynik:**
- ✅ Widok działa poprawnie na wszystkich rozdzielczościach
- ✅ Elementy są czytelne i dostępne
- ✅ Sidebar jest responsywny

---

### Scenariusz 12: Dostępność (WCAG AA)

**Cel:** Sprawdzenie dostępności widoku

**Kroki:**
1. Przejdź do widoku trybu nauki
2. Użyj tylko klawiatury do nawigacji:
   - Tab - przejście między elementami
   - Enter/Space - aktywacja elementów
   - Strzałki - nawigacja między fiszkami
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
- [ ] Animacje są płynne (60 FPS)
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

