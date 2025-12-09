# Przewodnik testowania endpointu generowania fiszek

## Szybki start

### Krok 1: Sprawdź status serwisów

```powershell
.\check-status.ps1
```

Skrypt sprawdzi:
- Czy Astro dev server działa na `http://localhost:3000`
- Czy lokalny Supabase działa (opcjonalne, jeśli używasz zdalnego)
- Czy plik `.env` istnieje i zawiera wymagane zmienne

### Krok 2: Uruchom Astro dev server (jeśli nie działa)

```powershell
npm run dev
```

Serwer powinien uruchomić się na `http://localhost:3000`

### Krok 3: Uruchom test

```powershell
.\test-openrouter.ps1
```

## Szczegółowe instrukcje

### Metoda 1: Skrypt PowerShell (Zalecane)

1. **Upewnij się, że Astro dev server działa:**
   ```powershell
   npm run dev
   ```

2. **Uruchom skrypt testowy:**
   ```powershell
   .\test-openrouter.ps1
   ```

3. **Skrypt automatycznie:**
   - Wyśle żądanie POST do `http://localhost:3000/api/generations`
   - Wyświetli odpowiedź z wygenerowanymi fiszkami
   - Pokaże podsumowanie (liczba propozycji, session ID, wykryta domena)

### Metoda 2: Postman

1. **Otwórz Postman**

2. **Skonfiguruj żądanie:**
   - **Method:** `POST`
   - **URL:** `http://localhost:3000/api/generations`
   - **Headers:**
     ```
     Content-Type: application/json
     ```

3. **Body (raw JSON):**
   ```json
   {
     "source_text": "Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that can later be released to fuel the organism's activities. This chemical energy is stored in carbohydrate molecules, such as sugars, which are synthesized from carbon dioxide and water.",
     "domain": "Biology"
   }
   ```

4. **Kliknij "Send"**

### Metoda 3: curl (PowerShell)

```powershell
$body = @{
    source_text = "Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy..."
    domain = "Biology"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/generations" -Method Post -Body $body -ContentType "application/json"
```

### Metoda 4: Bezpośrednie testowanie Edge Function

Jeśli chcesz testować bezpośrednio Supabase Edge Function (pomijając Astro proxy):

1. **Zmień URL w `test-openrouter.ps1`:**
   ```powershell
   $baseUrl = $localSupabaseUrl  # zamiast $localAstroUrl
   ```

2. **Lub użyj URL produkcyjnego:**
   ```powershell
   $baseUrl = $productionSupabaseUrl
   ```

3. **Upewnij się, że masz odpowiednie nagłówki autoryzacji:**
   - `apikey`: Twój `PUBLIC_SUPABASE_ANON_KEY`
   - `Authorization: Bearer {PUBLIC_SUPABASE_ANON_KEY}`

## Wymagane zmienne środowiskowe

Upewnij się, że plik `.env` zawiera:

```env
PUBLIC_SUPABASE_URL=https://lfogeotxmdekvfstkais.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DEFAULT_USER_ID=your-test-user-uuid-here
OPENROUTER_API_KEY=your-openrouter-api-key
```

## Oczekiwana odpowiedź

### Sukces (200 OK)

```json
{
  "generation_session_id": "gen-1234567890-abc12345-xyz",
  "proposals": [
    {
      "id": 1,
      "question": "What is photosynthesis?",
      "correct_answer": "The process by which plants convert light energy into chemical energy",
      "domain": "Biology",
      "status": "pending"
    }
  ],
  "detected_domain": "Biology",
  "total_generated": 5
}
```

### Błędy

- **400 Bad Request:** Nieprawidłowe dane wejściowe (brak tekstu, tekst za krótki)
- **500 Internal Server Error:** Błąd OpenRouter.ai API, błąd bazy danych, błąd konfiguracji

## Rozwiązywanie problemów

### Problem: "Astro dev server is NOT running"
**Rozwiązanie:** Uruchom `npm run dev` w terminalu

### Problem: "Connection refused" lub "Cannot connect"
**Rozwiązanie:** 
- Sprawdź, czy Astro działa na `http://localhost:3000`
- Sprawdź, czy `.env` zawiera poprawne wartości
- Sprawdź, czy Edge Function jest wdrożona (jeśli używasz zdalnego Supabase)

### Problem: "401 Unauthorized"
**Rozwiązanie:**
- Sprawdź, czy `PUBLIC_SUPABASE_ANON_KEY` jest poprawnie ustawiony w `.env`
- Sprawdź, czy Edge Function ma dostęp do `OPENROUTER_API_KEY` (w Supabase Secrets dla produkcji)

### Problem: "No valid flashcards could be generated"
**Rozwiązanie:**
- Upewnij się, że tekst źródłowy ma minimum 100 znaków
- Sprawdź logi Edge Function w Supabase Dashboard
- Sprawdź, czy OpenRouter API zwraca poprawne odpowiedzi

## Testowanie z różnymi konfiguracjami

### Test z własnym tekstem

Edytuj plik `test-openrouter.ps1` i zmień zmienną `$testText`:

```powershell
$testText = "Twój własny tekst tutaj..."
```

### Test bez domeny

Usuń lub zakomentuj linię z `domain` w `$bodyObject`:

```powershell
$bodyObject = @{
    source_text = $testText
    # domain = "Biology"  # AI wykryje domenę automatycznie
}
```

### Test z Edge Function bezpośrednio

W `test-openrouter.ps1` zmień:

```powershell
$baseUrl = $localSupabaseUrl  # lub $productionSupabaseUrl
```

Pamiętaj, że bezpośrednie wywołanie Edge Function wymaga nagłówków autoryzacji.

