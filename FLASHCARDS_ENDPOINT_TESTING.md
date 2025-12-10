# Plan testowania endpointu /api/flashcards

## Przegląd endpointu

**Endpoint**: `POST /api/flashcards`

**Lokalizacja**: `src/pages/api/flashcards.ts`

**Funkcjonalność**: 
- Przyjmuje fiszki w formacie z kursu (`front`/`back`/`source`/`generation_id`)
- Mapuje do formatu Supabase (`question`/`correct_answer`/`deck_id`)
- Wywołuje Supabase REST API `/rest/v1/flashcards` dla bulk insert

## Zależności i integracje

### 1. Zmienne środowiskowe

**Wymagane**:
- `PUBLIC_SUPABASE_URL` - URL projektu Supabase
- `PUBLIC_SUPABASE_ANON_KEY` - Anon key z Supabase

**Sprawdzenie**:
```powershell
# W PowerShell
$env:PUBLIC_SUPABASE_URL
$env:PUBLIC_SUPABASE_ANON_KEY
```

### 2. Integracja z Supabase REST API

**Endpoint docelowy**: `POST {SUPABASE_URL}/rest/v1/flashcards`

**Wymagane nagłówki**:
- `Authorization: Bearer {access_token}` - Token JWT użytkownika
- `apikey: {anon_key}` - Anon key
- `Content-Type: application/json`
- `Prefer: return=representation` - Zwraca utworzone rekordy

**Format requestu do Supabase**:
```json
[
  {
    "deck_id": 1,
    "question": "cat",
    "correct_answer": "kot",
    "image_url": null
  }
]
```

### 3. Korelacje z innymi endpointami

**Brak bezpośrednich zależności**, ale endpoint:
- Wymaga istniejącego `deck_id` (talia musi istnieć w bazie)
- Wymaga autoryzacji (użytkownik musi być zalogowany)
- Używa RLS (Row Level Security) - użytkownik może tworzyć fiszki tylko w swoich taliach

**Powiązane endpointy**:
- `GET /rest/v1/decks` - Sprawdzenie czy talia istnieje
- `POST /api/generations` - Generowanie fiszek przez AI (inny format)
- `POST /rest/v1/flashcards` - Bezpośredni dostęp do Supabase REST API

## Checklist testowania

### Testy walidacji (bez autoryzacji)

- [ ] **Test 1**: Brak nagłówka Authorization → 401 Unauthorized
- [ ] **Test 2**: Puste body → 400 Bad Request
- [ ] **Test 3**: Brak pola `flashcards` → 400 Bad Request
- [ ] **Test 4**: Pusta tablica `flashcards` → 400 Bad Request
- [ ] **Test 5**: Brak `deck_id` → 400 Bad Request
- [ ] **Test 6**: `deck_id` nie jest liczbą → 400 Bad Request
- [ ] **Test 7**: Pytanie za krótkie (< 2 znaki) → 400 Bad Request
- [ ] **Test 8**: Pytanie za długie (> 10000 znaków) → 400 Bad Request
- [ ] **Test 9**: Odpowiedź za długa (> 500 znaków) → 400 Bad Request
- [ ] **Test 10**: Nieprawidłowa wartość `source` (nie "manual" lub "ai") → 400 Bad Request
- [ ] **Test 11**: Brak pola `front` → 400 Bad Request
- [ ] **Test 12**: Brak pola `back` → 400 Bad Request
- [ ] **Test 13**: `front` jest pustym stringiem → 400 Bad Request
- [ ] **Test 14**: `back` jest pustym stringiem → 400 Bad Request

### Testy z autoryzacją

- [ ] **Test 15**: Utworzenie pojedynczej fiszki (2 znaki - minimum) → 201 Created
- [ ] **Test 16**: Utworzenie pojedynczej fiszki (normalna długość) → 201 Created
- [ ] **Test 17**: Utworzenie wielu fiszek (bulk insert) → 201 Created
- [ ] **Test 18**: Nieistniejący `deck_id` → 404 Not Found lub 400 Bad Request
- [ ] **Test 19**: `deck_id` należący do innego użytkownika → 403 Forbidden (RLS)
- [ ] **Test 20**: Nieprawidłowy token JWT → 401 Unauthorized
- [ ] **Test 21**: Wygaśnięty token JWT → 401 Unauthorized

### Testy integracji z bazą danych

- [ ] **Test 22**: Sprawdzenie czy fiszki zostały zapisane w bazie
- [ ] **Test 23**: Sprawdzenie czy `question` ma poprawną długość (2-10000)
- [ ] **Test 24**: Sprawdzenie czy `correct_answer` ma poprawną długość (max 500)
- [ ] **Test 25**: Sprawdzenie czy `deck_id` jest poprawny
- [ ] **Test 26**: Sprawdzenie czy domyślne wartości są ustawione (`status='learning'`, `due_date`, etc.)

### Testy formatu odpowiedzi

- [ ] **Test 27**: Sprawdzenie formatu odpowiedzi (course format)
- [ ] **Test 28**: Sprawdzenie czy `id` jest zwracane
- [ ] **Test 29**: Sprawdzenie czy `total_created` jest poprawne
- [ ] **Test 30**: Sprawdzenie czy `source` i `generation_id` są zachowane w odpowiedzi

## Instrukcje testowania

### Krok 1: Przygotowanie środowiska

1. **Uruchom serwer Astro**:
   ```bash
   npm run dev
   ```

2. **Sprawdź zmienne środowiskowe**:
   - Upewnij się, że `.env` zawiera `PUBLIC_SUPABASE_URL` i `PUBLIC_SUPABASE_ANON_KEY`
   - Sprawdź czy serwer działa na `http://localhost:3000`

3. **Uzyskaj access token**:
   - Zaloguj się przez Supabase Auth API
   - Skopiuj `access_token` z odpowiedzi

### Krok 2: Uruchomienie skryptu testowego

```powershell
# Uruchom skrypt testowy
.\test-flashcards-endpoint.ps1
```

### Krok 3: Testowanie ręczne (opcjonalnie)

#### Test 1: Walidacja - brak autoryzacji

```bash
curl -X POST http://localhost:3000/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
    "deck_id": 1,
    "flashcards": [
      {
        "front": "cat",
        "back": "kot",
        "source": "manual"
      }
    ]
  }'
```

**Oczekiwany wynik**: `401 Unauthorized`

#### Test 2: Walidacja - pytanie za krótkie

```bash
curl -X POST http://localhost:3000/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "deck_id": 1,
    "flashcards": [
      {
        "front": "a",
        "back": "kot",
        "source": "manual"
      }
    ]
  }'
```

**Oczekiwany wynik**: `400 Bad Request` z komunikatem o zbyt krótkim pytaniu

#### Test 3: Sukces - utworzenie fiszki

```bash
curl -X POST http://localhost:3000/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "deck_id": 1,
    "flashcards": [
      {
        "front": "cat",
        "back": "kot",
        "source": "manual",
        "generation_id": null
      }
    ]
  }'
```

**Oczekiwany wynik**: `201 Created` z odpowiedzią w formacie:
```json
{
  "flashcards": [
    {
      "id": 123,
      "front": "cat",
      "back": "kot",
      "source": "manual",
      "generation_id": null,
      "deck_id": 1,
      "created_at": "2024-12-09T..."
    }
  ],
  "total_created": 1
}
```

## Weryfikacja integracji z Supabase

### Sprawdzenie bezpośrednio w bazie danych

Po utworzeniu fiszki przez endpoint, sprawdź w Supabase Dashboard:

1. **SQL Editor**:
```sql
-- Sprawdź ostatnio utworzone fiszki
SELECT id, deck_id, question, correct_answer, status, created_at
FROM public.flashcards
ORDER BY created_at DESC
LIMIT 5;
```

2. **Table Editor**:
- Przejdź do `flashcards` table
- Sprawdź czy nowe fiszki są widoczne
- Zweryfikuj wartości pól

### Sprawdzenie przez Supabase REST API

```bash
# Pobierz fiszki z talii (bezpośrednio z Supabase)
curl -X GET "{SUPABASE_URL}/rest/v1/flashcards?deck_id=eq.1&select=*" \
  -H "apikey: {anon_key}" \
  -H "Authorization: Bearer {access_token}"
```

## Potencjalne problemy i rozwiązania

### Problem 1: 401 Unauthorized mimo poprawnego tokenu

**Przyczyna**: Token wygasł lub jest nieprawidłowy

**Rozwiązanie**:
- Odśwież token przez Supabase Auth API
- Sprawdź czy token jest w formacie `Bearer {token}`

### Problem 2: 404 Not Found dla deck_id

**Przyczyna**: Talia nie istnieje lub należy do innego użytkownika

**Rozwiązanie**:
- Sprawdź czy talia istnieje: `GET /rest/v1/decks?id=eq.{deck_id}`
- Upewnij się, że talia należy do zalogowanego użytkownika

### Problem 3: 403 Forbidden

**Przyczyna**: RLS (Row Level Security) blokuje dostęp

**Rozwiązanie**:
- Sprawdź polityki RLS w Supabase Dashboard
- Upewnij się, że użytkownik jest właścicielem talii

### Problem 4: Błąd walidacji długości pytania

**Przyczyna**: Constraint w bazie danych nie został zaktualizowany

**Rozwiązanie**:
- Zastosuj migrację `20251209234523_update_question_length_min_to_2.sql`
- Sprawdź constraint: `SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'check_question_length';`

### Problem 5: Błąd konfiguracji

**Przyczyna**: Brak zmiennych środowiskowych

**Rozwiązanie**:
- Sprawdź plik `.env`
- Upewnij się, że zmienne zaczynają się od `PUBLIC_`
- Zrestartuj serwer Astro po zmianie `.env`

## Porównanie z innymi endpointami

### /api/generations vs /api/flashcards

| Aspekt | /api/generations | /api/flashcards |
|--------|------------------|-----------------|
| **Format** | `text`/`source_text` | `front`/`back` (course format) |
| **Cel** | Generowanie przez AI | Manualne tworzenie |
| **Backend** | Supabase Edge Function | Supabase REST API |
| **Autoryzacja** | Wymagana | Wymagana |
| **Walidacja** | Min 100 znaków tekstu | Min 2 znaki pytania |

### Supabase REST API vs /api/flashcards

| Aspekt | Supabase REST API | /api/flashcards |
|--------|-------------------|-----------------|
| **Format** | `question`/`correct_answer` | `front`/`back` (course format) |
| **Mapowanie** | Bezpośredni | Automatyczne mapowanie |
| **Walidacja** | Po stronie bazy | Po stronie endpointu + bazy |
| **Użycie** | Bezpośredni dostęp | Przez Astro proxy |

## Rekomendacje

1. **Testy automatyczne**: Rozważ dodanie testów jednostkowych dla walidacji
2. **Logowanie**: Dodaj więcej logów dla debugowania (dev mode)
3. **Rate limiting**: Rozważ dodanie rate limitingu dla endpointu
4. **Dokumentacja**: Zaktualizuj `CURL_TESTS.md` z przykładami użycia
5. **Error handling**: Sprawdź czy wszystkie błędy są odpowiednio obsłużone

## Następne kroki

1. ✅ Uruchom skrypt testowy `test-flashcards-endpoint.ps1`
2. ✅ Sprawdź logi serwera Astro podczas testów
3. ✅ Zweryfikuj dane w bazie danych po utworzeniu fiszek
4. ✅ Porównaj wyniki z bezpośrednim wywołaniem Supabase REST API
5. ✅ Zaktualizuj dokumentację jeśli znajdziesz problemy

