# Instrukcje testów manualnych - Ekran ładowania

## Przygotowanie

### 1. Uruchom serwer deweloperski
```powershell
npm run dev
```

Serwer powinien być dostępny na `http://localhost:3000` (zgodnie z konfiguracją w `astro.config.mjs`).

### 2. Zaloguj się do aplikacji
- Przejdź na `http://localhost:3000/login`
- Zaloguj się używając istniejącego konta testowego

### 3. Przygotuj dane testowe
Aby przetestować ekran ładowania, potrzebujesz prawidłowego `session_id` z sesji generowania. Możesz go uzyskać na dwa sposoby:

**Sposób 1: Przez GeneratorForm (Rekomendowany)**
1. Przejdź na `http://localhost:3000/generate`
2. Wypełnij formularz:
   - Tekst źródłowy: min. 100 znaków (np. długi tekst o biologii, historii, itp.)
   - Język: wybierz z listy lub zostaw "auto"
   - Domena: opcjonalnie
3. Kliknij "Generuj"
4. Automatycznie nastąpi przekierowanie na `/loading/[session_id]`

**Sposób 2: Bezpośrednie wejście na URL**
- Jeśli masz już `session_id` z poprzedniej sesji, możesz wejść bezpośrednio na:
  `http://localhost:3000/loading/[session_id]`

## Testy do wykonania

### Test podstawowy - Przepływ generowania

1. **Wejście na widok**
   - Przejdź na `/generate`
   - Wypełnij formularz i kliknij "Generuj"
   - Sprawdź czy nastąpiło przekierowanie na `/loading/[session_id]`

2. **Obserwacja interfejsu**
   - Sprawdź czy wyświetla się:
     - Pasek postępu (0%)
     - Komunikat "Inicjowanie generowania..."
     - Spinner (animacja obracania)
     - Przycisk "Anuluj"
   - Otwórz konsolę przeglądarki (F12) i sprawdź czy są zapytania do API co ~2.5 sekundy

3. **Obserwacja postępu**
   - Sprawdź czy postęp aktualizuje się co sekundę
   - Sprawdź czy komunikaty zmieniają się:
     - 0-30%: "Analizowanie tekstu..."
     - 30-70%: "Generowanie fiszek..."
     - 70-90%: "Kończenie generowania..."
     - 90-100%: "Prawie gotowe..."

4. **Zakończenie generowania**
   - Poczekaj aż generowanie się zakończy (zwykle 10-30 sekund)
   - Sprawdź czy postęp osiąga 100%
   - Sprawdź czy komunikat zmienia się na "Generowanie zakończone!"
   - Sprawdź czy po ~1 sekundzie następuje przekierowanie na `/verify/[session_id]`

### Test anulowania

1. Wejdź na `/loading/[session_id]` podczas generowania
2. Kliknij przycisk "Anuluj"
3. Sprawdź czy nastąpiło przekierowanie na `/generate`
4. Sprawdź w konsoli czy polling został zatrzymany (brak dalszych zapytań)

### Test błędów

**Test błędu autoryzacji:**
1. Wyloguj się z aplikacji (w innym oknie)
2. Odśwież stronę `/loading/[session_id]` lub wejdź bezpośrednio
3. Sprawdź czy nastąpiło przekierowanie na `/login?redirect=/loading/[session_id]`

**Test błędu sieci:**
1. Wejdź na `/loading/[session_id]`
2. Otwórz DevTools (F12) → Network → zaznacz "Offline"
3. Sprawdź czy wyświetla się komunikat błędu "Brak połączenia z internetem..."
4. Sprawdź czy wyświetla się przycisk "Spróbuj ponownie"

**Test timeout (opcjonalnie - wymaga czekania 60 sekund):**
1. Wejdź na `/loading/[session_id]` z nieprawidłowym session_id
2. Poczekaj 60 sekund
3. Sprawdź czy wyświetla się komunikat "Generowanie trwa dłużej niż zwykle..."

### Test dostępności

**Nawigacja klawiaturą:**
1. Wejdź na `/loading/[session_id]`
2. Użyj Tab do nawigacji
3. Sprawdź czy focus przechodzi przez wszystkie przyciski
4. Sprawdź czy Enter aktywuje przyciski

**Screen Reader (jeśli dostępny):**
1. Włącz screen reader (NVDA, JAWS, VoiceOver)
2. Wejdź na `/loading/[session_id]`
3. Sprawdź czy komunikaty statusu są czytane
4. Sprawdź czy błędy są czytane natychmiast

### Test responsywności

1. Otwórz DevTools (F12)
2. Przełącz na tryb responsywny (Ctrl+Shift+M)
3. Przetestuj różne rozdzielczości:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
4. Sprawdź czy layout jest responsywny i czytelny

## Sprawdzanie konsoli przeglądarki

Podczas testów sprawdź konsolę przeglądarki (F12 → Console) pod kątem:

- ✅ Brak błędów JavaScript
- ✅ Zapytania do API co ~2.5 sekundy (Network tab)
- ✅ Brak wycieków pamięci (Memory tab)
- ✅ Poprawne komunikaty statusu

## Sprawdzanie Network tab

W DevTools → Network sprawdź:

- ✅ Zapytania do `/rest/v1/flashcard_proposals?generation_session_id=eq.{session_id}`
- ✅ Status odpowiedzi (200 OK gdy propozycje są gotowe, 200 OK z pustą tablicą gdy jeszcze nie)
- ✅ Nagłówki autoryzacji są obecne
- ✅ Brak błędów 401, 404, 500

## Znane problemy i rozwiązania

### Problem: "Cannot find module '@/hooks/useGenerationPolling'"
**Rozwiązanie:** Sprawdź czy plik istnieje w `src/hooks/useGenerationPolling.ts` i czy alias `@/*` jest skonfigurowany w `tsconfig.json`

### Problem: Polling nie działa
**Rozwiązanie:** 
- Sprawdź czy jesteś zalogowany
- Sprawdź czy `session_id` jest prawidłowy
- Sprawdź konsolę przeglądarki pod kątem błędów

### Problem: Przekierowanie nie działa
**Rozwiązanie:**
- Sprawdź czy `session_id` jest prawidłowy
- Sprawdź czy propozycje zostały utworzone w bazie danych
- Sprawdź konsolę przeglądarki pod kątem błędów

## Raportowanie wyników

Po wykonaniu testów, zaktualizuj plik `TEST_MANUAL_LOADING.md`:
- Zaznacz wykonane testy jako ✅ (przeszły) lub ❌ (nie przeszły)
- Dodaj uwagi do każdego testu
- Zgłoś znalezione problemy

## Następne kroki po testach

1. Jeśli wszystkie testy przeszły → widok jest gotowy do użycia
2. Jeśli są problemy → zgłoś je i napraw
3. Po naprawieniu problemów → wykonaj testy ponownie

