# Testy manualne widoku Ekran ładowania

Data testów: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Przygotowanie do testów

### 1. Uruchomienie serwera
- [x] Serwer deweloperski uruchomiony (`npm run dev`)
- [ ] Serwer dostępny na `http://localhost:4321` (lub inny port)

### 2. Wymagane dane testowe
- [ ] Zalogowany użytkownik w aplikacji
- [ ] Prawidłowy `session_id` z sesji generowania (można uzyskać przez GeneratorForm)

## Testy manualne

### Test 1: Wejście na widok z prawidłowym session_id

**Kroki:**
1. Zaloguj się do aplikacji
2. Przejdź na `/generate`
3. Wypełnij formularz i kliknij "Generuj"
4. Sprawdź czy nastąpiło przekierowanie na `/loading/[session_id]`

**Oczekiwane rezultaty:**
- [ ] Strona się ładuje bez błędów w konsoli
- [ ] Wyświetla się pasek postępu (0%)
- [ ] Wyświetla się komunikat "Inicjowanie generowania..."
- [ ] Wyświetla się spinner (animacja obracania)
- [ ] Wyświetla się przycisk "Anuluj"
- [ ] Nie ma błędów w konsoli przeglądarki

**Wynik:** ⏳ Do wykonania

---

### Test 2: Polling statusu generowania

**Kroki:**
1. Pozostaw stronę otwartą podczas generowania
2. Obserwuj zmiany w interfejsie

**Oczekiwane rezultaty:**
- [ ] Postęp aktualizuje się co sekundę (0-100%)
- [ ] Komunikaty statusu zmieniają się w zależności od postępu:
  - [ ] 0-30%: "Analizowanie tekstu..."
  - [ ] 30-70%: "Generowanie fiszek..."
  - [ ] 70-90%: "Kończenie generowania..."
  - [ ] 90-100%: "Prawie gotowe..."
- [ ] Szacowany czas pozostały jest wyświetlany (jeśli dostępny)
- [ ] W konsoli przeglądarki widoczne są zapytania do API co ~2.5 sekundy

**Wynik:** ⏳ Do wykonania

---

### Test 3: Zakończenie generowania

**Kroki:**
1. Poczekaj aż generowanie się zakończy (propozycje zostaną utworzone)
2. Obserwuj zachowanie interfejsu

**Oczekiwane rezultaty:**
- [ ] Postęp osiąga 100%
- [ ] Komunikat zmienia się na "Generowanie zakończone!"
- [ ] Po ~1 sekundzie następuje przekierowanie na `/verify/[session_id]`
- [ ] Na widoku weryfikacji są dostępne wygenerowane propozycje

**Wynik:** ⏳ Do wykonania

---

### Test 4: Anulowanie generowania

**Kroki:**
1. Wejdź na `/loading/[session_id]` podczas generowania
2. Kliknij przycisk "Anuluj"

**Oczekiwane rezultaty:**
- [ ] Przycisk "Anuluj" jest dostępny przez klawiaturę (Tab, Enter)
- [ ] Po kliknięciu następuje przekierowanie na `/generate`
- [ ] Polling jest zatrzymywany (brak dalszych zapytań do API w konsoli)
- [ ] Nie ma błędów w konsoli

**Wynik:** ⏳ Do wykonania

---

### Test 5: Obsługa błędów - Błąd autoryzacji (401)

**Kroki:**
1. Wyloguj się z aplikacji (w innym oknie)
2. Odśwież stronę `/loading/[session_id]` (lub wejdź bezpośrednio)

**Oczekiwane rezultaty:**
- [ ] Następuje przekierowanie na `/login?redirect=/loading/[session_id]`
- [ ] Po zalogowaniu użytkownik wraca na ekran ładowania

**Alternatywnie (jeśli przekierowanie nie działa):**
- [ ] Wyświetla się komunikat błędu "Sesja wygasła. Zaloguj się ponownie."
- [ ] Po ~2 sekundach następuje przekierowanie na `/login?redirect=/loading/[session_id]`

**Wynik:** ⏳ Do wykonania

---

### Test 6: Obsługa błędów - Błąd sieci (offline)

**Kroki:**
1. Wejdź na `/loading/[session_id]`
2. Wyłącz połączenie z internetem (lub użyj DevTools → Network → Offline)
3. Obserwuj zachowanie interfejsu

**Oczekiwane rezultaty:**
- [ ] Wyświetla się komunikat błędu "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
- [ ] Wyświetla się przycisk "Spróbuj ponownie"
- [ ] Alert ma odpowiedni styl (czerwony, ikona błędu)

**Wynik:** ⏳ Do wykonania

---

### Test 7: Obsługa błędów - Timeout (60 sekund)

**Kroki:**
1. Wejdź na `/loading/[session_id]` z nieprawidłowym session_id (który nie istnieje)
2. Poczekaj 60 sekund

**Oczekiwane rezultaty:**
- [ ] Po 60 sekundach wyświetla się komunikat "Generowanie trwa dłużej niż zwykle. Proszę czekać..."
- [ ] Wyświetla się przycisk "Spróbuj ponownie"
- [ ] Polling jest zatrzymywany

**Uwaga:** Ten test wymaga czekania 60 sekund. Można zmniejszyć `TIMEOUT_DURATION` w hooku dla testów.

**Wynik:** ⏳ Do wykonania

---

### Test 8: Przycisk "Spróbuj ponownie"

**Kroki:**
1. Wywołaj błąd (np. wyłącz internet)
2. Kliknij przycisk "Spróbuj ponownie"

**Oczekiwane rezultaty:**
- [ ] Strona się odświeża
- [ ] Polling restartuje się automatycznie
- [ ] Stan błędu jest resetowany

**Wynik:** ⏳ Do wykonania

---

### Test 9: Odświeżenie strony podczas generowania

**Kroki:**
1. Wejdź na `/loading/[session_id]` podczas generowania
2. Odśwież stronę (F5 lub Ctrl+R)

**Oczekiwane rezultaty:**
- [ ] Po odświeżeniu polling restartuje się automatycznie
- [ ] Jeśli propozycje już istnieją, następuje przekierowanie na `/verify/[session_id]`
- [ ] Jeśli generowanie jeszcze trwa, kontynuuje się polling

**Wynik:** ⏳ Do wykonania

---

### Test 10: Nieprawidłowy session_id

**Kroki:**
1. Wejdź na `/loading/invalid-session-id` (lub `/loading/` bez session_id)

**Oczekiwane rezultaty:**
- [ ] Następuje przekierowanie na `/generate?error=invalid_session`
- [ ] Nie ma błędów w konsoli

**Wynik:** ⏳ Do wykonania

---

### Test 11: Dostępność - Nawigacja klawiaturą

**Kroki:**
1. Wejdź na `/loading/[session_id]`
2. Użyj klawisza Tab do nawigacji

**Oczekiwane rezultaty:**
- [ ] Tab przechodzi przez wszystkie interaktywne elementy (przyciski)
- [ ] Enter aktywuje przyciski
- [ ] Focus jest widoczny na wszystkich elementach (outline)

**Wynik:** ⏳ Do wykonania

---

### Test 12: Dostępność - Screen Reader

**Kroki:**
1. Włącz screen reader (np. NVDA, JAWS, VoiceOver)
2. Wejdź na `/loading/[session_id]`
3. Obserwuj komunikaty screen readera

**Oczekiwane rezultaty:**
- [ ] Komunikaty statusu są czytane przez screen reader (`aria-live="polite"`)
- [ ] Błędy są czytane natychmiast (`aria-live="assertive"`)
- [ ] Postęp jest czytany jako "Postęp generowania: X%"
- [ ] Przyciski mają opisowe etykiety

**Wynik:** ⏳ Do wykonania

---

### Test 13: Responsywność - Desktop

**Kroki:**
1. Otwórz DevTools (F12)
2. Ustaw rozdzielczość Desktop (1920x1080)
3. Wejdź na `/loading/[session_id]`

**Oczekiwane rezultaty:**
- [ ] Layout jest wyśrodkowany
- [ ] Przyciski są w jednym rzędzie (`flex-row`)
- [ ] Tekst jest czytelny

**Wynik:** ⏳ Do wykonania

---

### Test 14: Responsywność - Tablet

**Kroki:**
1. Otwórz DevTools (F12)
2. Ustaw rozdzielczość Tablet (768x1024)
3. Wejdź na `/loading/[session_id]`

**Oczekiwane rezultaty:**
- [ ] Layout jest responsywny
- [ ] Przyciski mogą być w kolumnie (`flex-col`)

**Wynik:** ⏳ Do wykonania

---

### Test 15: Responsywność - Mobile

**Kroki:**
1. Otwórz DevTools (F12)
2. Ustaw rozdzielczość Mobile (375x667)
3. Wejdź na `/loading/[session_id]`

**Oczekiwane rezultaty:**
- [ ] Layout jest responsywny
- [ ] Przyciski są w kolumnie (`flex-col`)
- [ ] Tekst jest czytelny
- [ ] Wszystkie elementy są dostępne

**Wynik:** ⏳ Do wykonania

---

### Test 16: Integracja z GeneratorForm

**Kroki:**
1. Przejdź na `/generate`
2. Wypełnij formularz (tekst źródłowy min. 100 znaków)
3. Kliknij "Generuj"

**Oczekiwane rezultaty:**
- [ ] Po kliknięciu "Generuj" następuje przekierowanie na `/loading/[session_id]`
- [ ] Toast notification: "Rozpoczynam generowanie fiszek..."
- [ ] `session_id` jest przekazywany poprawnie w URL

**Wynik:** ⏳ Do wykonania

---

### Test 17: Integracja z VerificationView

**Kroki:**
1. Poczekaj aż generowanie się zakończy
2. Sprawdź przekierowanie na `/verify/[session_id]`

**Oczekiwane rezultaty:**
- [ ] Po zakończeniu generowania następuje przekierowanie na `/verify/[session_id]`
- [ ] Propozycje są dostępne na widoku weryfikacji
- [ ] Wszystkie propozycje mają status "pending"

**Wynik:** ⏳ Do wykonania

---

## Podsumowanie testów

### Testy wykonane: 0/17
### Testy przeszły: 0/17
### Testy nie przeszły: 0/17
### Testy do wykonania: 17/17

## Uwagi

- Większość testów wymaga prawidłowego `session_id` z sesji generowania
- Test timeout wymaga czekania 60 sekund (można zmniejszyć dla testów)
- Testy dostępności wymagają screen readera
- Testy responsywności wymagają DevTools

## Następne kroki

1. Wykonaj testy manualne zgodnie z powyższym planem
2. Zaznacz wykonane testy jako ✅ lub ❌
3. Zaktualizuj wyniki w sekcji "Podsumowanie testów"
4. Zgłoś znalezione problemy

