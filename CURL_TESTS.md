# Zapytania cURL do testowania Flashcards API w Postmanie

## Konfiguracja

Przed użyciem, ustaw następujące zmienne w Postmanie (lub zastąp w zapytaniach):

- `SUPABASE_URL` - URL Twojego projektu Supabase (np. `https://lfogeotxmdekvfstkais.supabase.co`)
- `SUPABASE_ANON_KEY` - Twój anon key z Supabase (z pliku `.env` lub Dashboard)
- `ACCESS_TOKEN` - Token JWT użytkownika (z Supabase Auth) - **jak uzyskać poniżej**
- `DECK_ID` - ID istniejącego decku (np. `1`)
- `FLASHCARD_ID` - ID istniejącej fiszki (np. `1`)

### Jak uzyskać ACCESS_TOKEN?

#### Opcja 1: Z przeglądarki (jeśli masz zalogowaną aplikację)
1. Otwórz aplikację w przeglądarce
2. Otwórz **DevTools** (F12)
3. Przejdź do zakładki **Application** (Chrome) lub **Storage** (Firefox)
4. Znajdź **Local Storage** → `http://localhost:3000` (lub Twój URL)
5. Szukaj klucza `sb-{project-ref}-auth-token`
6. Skopiuj wartość i wyciągnij z niej `access_token` (to jest JSON)

#### Opcja 2: Z Supabase Dashboard
1. Przejdź do **Authentication** → **Users**
2. Kliknij na użytkownika
3. W sekcji **User Metadata** znajdziesz token (lub wygeneruj nowy)

#### Opcja 3: Przez API (logowanie)
```bash
curl -X POST 'https://lfogeotxmdekvfstkais.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "userpassword"
  }'
```

W odpowiedzi znajdziesz `access_token`.

## 1. Lista wszystkich fiszek w decku

```bash
curl -X GET \
  '{{SUPABASE_URL}}/rest/v1/flashcards?deck_id=eq.{{DECK_ID}}&select=*&order=created_at.desc' \
  -H 'apikey: {{SUPABASE_ANON_KEY}}' \
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}' \
  -H 'Content-Type: application/json'
```

**Wersja z konkretnymi wartościami:**
```bash
curl -X GET \
  'https://lfogeotxmdekvfstkais.supabase.co/rest/v1/flashcards?deck_id=eq.1&select=*&order=created_at.desc' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json'
```

### Jak wykonać to zapytanie:

#### Metoda A: Postman (najprostsza)
1. Skopiuj zapytanie cURL (bez znaków ```bash i ```)
2. W Postmanie: kliknij **Import** (lewy górny róg)
3. Wybierz zakładkę **Raw text**
4. Wklej zapytanie cURL
5. Kliknij **Continue** → **Import**
6. Postman automatycznie przekształci zapytanie w żądanie HTTP
7. Zastąp zmienne (`YOUR_ANON_KEY`, `YOUR_ACCESS_TOKEN`) rzeczywistymi wartościami
8. Kliknij **Send**

#### Metoda B: PowerShell (Windows)
Zastąp wartości i uruchom w PowerShell:

```powershell
$supabaseUrl = "https://lfogeotxmdekvfstkais.supabase.co"
$supabaseAnonKey = "YOUR_ANON_KEY"
$accessToken = "YOUR_ACCESS_TOKEN"
$deckId = 1

$url = "$supabaseUrl/rest/v1/flashcards?deck_id=eq.$deckId&select=*&order=created_at.desc"

Invoke-RestMethod -Uri $url -Method Get -Headers @{
    "apikey" = $supabaseAnonKey
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}
```

**Lub użyj gotowego skryptu:**
```powershell
.\test-flashcards-api.ps1
```
(Edytuj plik `test-flashcards-api.ps1` i ustaw wartości na początku)

#### Metoda C: Bezpośrednio w terminalu (curl)
W PowerShell lub Git Bash:

```bash
curl -X GET "https://lfogeotxmdekvfstkais.supabase.co/rest/v1/flashcards?deck_id=eq.1&select=*&order=created_at.desc" -H "apikey: YOUR_ANON_KEY" -H "Authorization: Bearer YOUR_ACCESS_TOKEN" -H "Content-Type: application/json"
```

**Uwaga:** W PowerShell może być potrzebne użycie `curl.exe` zamiast `curl` (alias dla `Invoke-WebRequest`).

## 2. Pobierz pojedynczą fiszkę po ID

```bash
curl -X GET \
  '{{SUPABASE_URL}}/rest/v1/flashcards?id=eq.{{FLASHCARD_ID}}&select=*' \
  -H 'apikey: {{SUPABASE_ANON_KEY}}' \
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}' \
  -H 'Content-Type: application/json'
```

## 3. Pobierz fiszki do powtórki (due for review)

```bash
curl -X GET \
  '{{SUPABASE_URL}}/rest/v1/flashcards?deck_id=eq.{{DECK_ID}}&due_date=lte.now()&status=eq.learning&select=*&order=due_date.asc' \
  -H 'apikey: {{SUPABASE_ANON_KEY}}' \
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}' \
  -H 'Content-Type: application/json'
```

## 4. Pobierz opanowane fiszki (mastered)

```bash
curl -X GET \
  '{{SUPABASE_URL}}/rest/v1/flashcards?status=eq.mastered&deck_id=eq.{{DECK_ID}}&select=*&order=created_at.desc' \
  -H 'apikey: {{SUPABASE_ANON_KEY}}' \
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}' \
  -H 'Content-Type: application/json'
```

## 5. Utwórz pojedynczą fiszkę

```bash
curl -X POST \
  '{{SUPABASE_URL}}/rest/v1/flashcards' \
  -H 'apikey: {{SUPABASE_ANON_KEY}}' \
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d '{
    "deck_id": {{DECK_ID}},
    "question": "What is photosynthesis?",
    "correct_answer": "The process by which plants convert light energy into chemical energy",
    "image_url": null
  }'
```

**Wersja z konkretnymi wartościami:**
```bash
curl -X POST \
  'https://lfogeotxmdekvfstkais.supabase.co/rest/v1/flashcards' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d '{
    "deck_id": 1,
    "question": "What is photosynthesis?",
    "correct_answer": "The process by which plants convert light energy into chemical energy",
    "image_url": null
  }'
```

## 6. Utwórz wiele fiszek jednocześnie (bulk insert)

```bash
curl -X POST \
  '{{SUPABASE_URL}}/rest/v1/flashcards' \
  -H 'apikey: {{SUPABASE_ANON_KEY}}' \
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d '[
    {
      "deck_id": {{DECK_ID}},
      "question": "What is photosynthesis?",
      "correct_answer": "The process by which plants convert light energy into chemical energy",
      "image_url": null
    },
    {
      "deck_id": {{DECK_ID}},
      "question": "What is the primary pigment in photosynthesis?",
      "correct_answer": "Chlorophyll",
      "image_url": null
    },
    {
      "deck_id": {{DECK_ID}},
      "question": "Where does photosynthesis occur?",
      "correct_answer": "In the chloroplasts",
      "image_url": null
    }
  ]'
```

## 7. Aktualizuj fiszkę

```bash
curl -X PATCH \
  '{{SUPABASE_URL}}/rest/v1/flashcards?id=eq.{{FLASHCARD_ID}}' \
  -H 'apikey: {{SUPABASE_ANON_KEY}}' \
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d '{
    "question": "Updated question?",
    "correct_answer": "Updated answer",
    "image_url": "https://example.com/new-image.jpg"
  }'
```

## 8. Usuń fiszkę

```bash
curl -X DELETE \
  '{{SUPABASE_URL}}/rest/v1/flashcards?id=eq.{{FLASHCARD_ID}}' \
  -H 'apikey: {{SUPABASE_ANON_KEY}}' \
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}' \
  -H 'Content-Type: application/json'
```

## 9. Filtruj fiszki po statusie (learning)

```bash
curl -X GET \
  '{{SUPABASE_URL}}/rest/v1/flashcards?deck_id=eq.{{DECK_ID}}&status=eq.learning&select=*&order=created_at.desc' \
  -H 'apikey: {{SUPABASE_ANON_KEY}}' \
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}' \
  -H 'Content-Type: application/json'
```

## 10. Pobierz fiszki z paginacją (limit i offset)

```bash
curl -X GET \
  '{{SUPABASE_URL}}/rest/v1/flashcards?deck_id=eq.{{DECK_ID}}&select=*&order=created_at.desc&limit=10&offset=0' \
  -H 'apikey: {{SUPABASE_ANON_KEY}}' \
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}' \
  -H 'Content-Type: application/json'
```

## 11. Aktualizuj status fiszki (np. na mastered)

```bash
curl -X PATCH \
  '{{SUPABASE_URL}}/rest/v1/flashcards?id=eq.{{FLASHCARD_ID}}' \
  -H 'apikey: {{SUPABASE_ANON_KEY}}' \
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d '{
    "status": "mastered",
    "consecutive_correct_answers": 3,
    "interval": 7
  }'
```

## 12. Aktualizuj datę powtórki (due_date)

```bash
curl -X PATCH \
  '{{SUPABASE_URL}}/rest/v1/flashcards?id=eq.{{FLASHCARD_ID}}' \
  -H 'apikey: {{SUPABASE_ANON_KEY}}' \
  -H 'Authorization: Bearer {{ACCESS_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d '{
    "due_date": "2024-12-15T10:00:00Z",
    "interval": 3
  }'
```

## Endpointy Astro API (format z kursu)

**Uwaga:** Endpoint `/api/flashcards` może wymagać implementacji w projekcie. Jeśli nie istnieje, użyj bezpośrednio Supabase REST API (zapytania powyżej).

Jeśli Twój projekt używa Astro API routes z formatem z kursu (`/api/flashcards`), użyj poniższych zapytań:

### Utwórz fiszkę ręcznie (format z kursu)

```bash
curl -X POST http://localhost:3000/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
  "flashcards": [
    {
      "front": "What is the capital of France?",
      "back": "Paris",
      "source": "manual",
      "generation_id": null
    }
  ]
}'
```

**Uwaga:** Dla fiszek ręcznych `generation_id` powinno być `null`.

### Utwórz wiele fiszek ręcznie

```bash
curl -X POST http://localhost:3000/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
  "flashcards": [
    {
      "front": "What is photosynthesis?",
      "back": "The process by which plants convert light energy into chemical energy",
      "source": "manual",
      "generation_id": null
    },
    {
      "front": "What is the primary pigment in photosynthesis?",
      "back": "Chlorophyll",
      "source": "manual",
      "generation_id": null
    }
  ]
}'
```

### Utwórz fiszkę z AI (z generation_id)

```bash
curl -X POST http://localhost:3000/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
  "flashcards": [
    {
      "front": "What is the capital of France?",
      "back": "Paris",
      "source": "ai",
      "generation_id": "gen-1234567890-abc12345-xyz"
    }
  ]
}'
```

**Uwaga:** 
- `source` może być `"manual"` lub `"ai"`
- `generation_id` powinno być `null` dla fiszek ręcznych
- `generation_id` powinno zawierać ID sesji generowania dla fiszek z AI

## Jak używać w Postmanie - KROK PO KROKU

### Metoda 1: Import jako cURL (NAJPROSTSZA) ⭐

**Krok 1: Skopiuj zapytanie cURL**
- Otwórz plik `CURL_TESTS.md`
- Znajdź zapytanie, które chcesz użyć (np. "1. Lista wszystkich fiszek w decku")
- Skopiuj całe zapytanie cURL (od `curl -X GET` do końca)
- **Przykład do skopiowania:**
  ```bash
  curl -X GET \
    'https://lfogeotxmdekvfstkais.supabase.co/rest/v1/flashcards?deck_id=eq.1&select=*&order=created_at.desc' \
    -H 'apikey: YOUR_ANON_KEY' \
    -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
    -H 'Content-Type: application/json'
  ```

**Krok 2: Otwórz Postman**
- Uruchom aplikację Postman

**Krok 3: Import zapytania**
- W lewym górnym rogu kliknij przycisk **Import** (lub użyj skrótu `Ctrl+O`)
- W oknie importu wybierz zakładkę **Raw text** (na górze)
- Wklej skopiowane zapytanie cURL do pola tekstowego
- Kliknij przycisk **Continue** (lub **Import**)

**Krok 4: Postman automatycznie przekształci zapytanie**
- Postman utworzy nowe żądanie z:
  - ✅ Poprawną metodą HTTP (GET, POST, itp.)
  - ✅ Poprawnym URL
  - ✅ Wszystkimi nagłówkami
  - ✅ Body (jeśli jest)

**Krok 5: Zastąp wartości**
- W zakładce **Headers** znajdź:
  - `apikey` → zastąp `YOUR_ANON_KEY` swoim kluczem z `.env` (`PUBLIC_SUPABASE_ANON_KEY`)
  - `Authorization` → zastąp `YOUR_ACCESS_TOKEN` swoim tokenem JWT
- W zakładce **Params** (jeśli są parametry URL):
  - Zastąp wartości jak `{{DECK_ID}}` lub `1` rzeczywistym ID

**Krok 6: Wyślij zapytanie**
- Kliknij przycisk **Send** (niebieski przycisk po prawej)
- Zobaczysz odpowiedź w dolnej części okna

---

### Metoda 2: Ręczne utworzenie (jeśli import nie działa)

**Krok 1: Utwórz nowe żądanie**
- W Postmanie kliknij **New** → **HTTP Request**
- Lub kliknij **+** (plus) w zakładce żądań

**Krok 2: Ustaw metodę HTTP**
- Z listy rozwijanej wybierz metodę (GET, POST, PATCH, DELETE)
- Dla przykładu z kursu: wybierz **POST**

**Krok 3: Wpisz URL**
- W polu URL wpisz: `http://localhost:3000/api/flashcards`
- (lub URL z zapytania cURL)

**Krok 4: Dodaj nagłówki**
- Kliknij zakładkę **Headers** (pod URL)
- Dodaj nagłówki jeden po drugim:
  - **Key:** `Content-Type` | **Value:** `application/json`
  - **Key:** `apikey` | **Value:** `YOUR_ANON_KEY` (zastąp!)
  - **Key:** `Authorization` | **Value:** `Bearer YOUR_ACCESS_TOKEN` (zastąp!)

**Krok 5: Dodaj Body (dla POST/PATCH)**
- Kliknij zakładkę **Body**
- Wybierz **raw**
- Z listy rozwijanej wybierz **JSON**
- Wklej JSON z przykładu:
  ```json
  {
    "flashcards": [
      {
        "front": "What is the capital of France?",
        "back": "Paris",
        "source": "manual",
        "generation_id": null
      }
    ]
  }
  ```

**Krok 6: Wyślij**
- Kliknij **Send**

---

### Metoda 3: Użyj zmiennych środowiskowych (dla wielu zapytań)

**Krok 1: Utwórz środowisko**
- W Postmanie kliknij ikonę koła zębatego (⚙️) w prawym górnym rogu
- Kliknij **Add** (lub **+**)
- Nazwij środowisko (np. "Local Development")

**Krok 2: Dodaj zmienne**
- Kliknij **Add** w sekcji zmiennych
- Dodaj zmienne:
  - `supabase_url` = `https://lfogeotxmdekvfstkais.supabase.co`
  - `supabase_anon_key` = Twój anon key
  - `access_token` = Twój token JWT
  - `deck_id` = `1`
  - `flashcard_id` = `1`
- Kliknij **Save**

**Krok 3: Wybierz środowisko**
- W prawym górnym rogu kliknij listę rozwijaną środowisk
- Wybierz utworzone środowisko

**Krok 4: Użyj zmiennych w zapytaniach**
- W URL użyj: `{{supabase_url}}/rest/v1/flashcards`
- W nagłówkach użyj: `{{supabase_anon_key}}` i `{{access_token}}`
- Postman automatycznie zastąpi zmienne wartościami

---

## Przykład: Import zapytania z kursu

**1. Skopiuj to:**
```bash
curl -X POST http://localhost:3000/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
  "flashcards": [
    {
      "front": "What is the capital of France?",
      "back": "Paris",
      "source": "manual",
      "generation_id": null
    }
  ]
}'
```

**2. W Postmanie:**
- **Import** → **Raw text** → Wklej → **Import**

**3. Upewnij się, że:**
- Astro dev server działa (`npm run dev`)
- Serwer działa na `http://localhost:3000`

**4. Kliknij Send!**

## Przykładowe wartości do testów

### Pytanie (question)
- Minimum: 50 znaków
- Maximum: 10000 znaków
- Przykład krótkiego: "What is photosynthesis?"
- Przykład długiego: "Given the following scenario about photosynthesis: [detailed scenario with context, background, specific conditions, and multiple aspects to consider]... What are the key processes involved and how do they interact?"

### Odpowiedź (correct_answer)
- Maximum: 500 znaków
- Przykład: "The process by which plants convert light energy into chemical energy stored in carbohydrate molecules like sugars, releasing oxygen as a waste product."

### Status
- `learning` - Fiszka w trakcie nauki
- `mastered` - Fiszka opanowana

## Uwagi

- Wszystkie zapytania wymagają autoryzacji (token JWT)
- RLS (Row Level Security) zapewnia, że użytkownik widzi tylko swoje fiszki
- Domyślne wartości przy tworzeniu:
  - `status`: `learning`
  - `interval`: `1`
  - `due_date`: `now()`
  - `consecutive_correct_answers`: `0`
- Walidacja:
  - `question`: 50-10000 znaków
  - `correct_answer`: max 500 znaków
  - `image_url`: musi być poprawnym URL (jeśli podane)

