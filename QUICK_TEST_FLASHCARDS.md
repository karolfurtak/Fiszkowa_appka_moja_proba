# Szybki test endpointu /api/flashcards

## 🚀 Szybki start

### 1. Uruchom serwer Astro
```bash
npm run dev
```

### 2. Uruchom skrypt testowy
```powershell
.\test-flashcards-endpoint.ps1
```

## 📋 Co sprawdza skrypt?

✅ **Walidacja** (12 testów):
- Brak autoryzacji
- Puste/nieprawidłowe body
- Nieprawidłowe długości (pytanie 2-10000, odpowiedź max 500)
- Nieprawidłowe wartości (`source`, `deck_id`)

✅ **Integracja** (6 testów z autoryzacją):
- Utworzenie pojedynczej fiszki
- Bulk insert (wiele fiszek)
- Obsługa błędów (nieistniejący deck, RLS)

## 🔍 Ręczne testowanie

### Test 1: Walidacja (bez tokenu)
```bash
curl -X POST http://localhost:3000/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{"deck_id": 1, "flashcards": [{"front": "cat", "back": "kot", "source": "manual"}]}'
```
**Oczekiwany wynik**: `401 Unauthorized`

### Test 2: Sukces (z tokenem)
```bash
curl -X POST http://localhost:3000/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"deck_id": 1, "flashcards": [{"front": "cat", "back": "kot", "source": "manual"}]}'
```
**Oczekiwany wynik**: `201 Created` z utworzoną fiszką

## 🔗 Korelacje z innymi API

### Zależności:
1. **Supabase REST API** (`/rest/v1/flashcards`)
   - Endpoint wywołuje bezpośrednio ten endpoint
   - Wymaga: `Authorization`, `apikey`, `Prefer: return=representation`

2. **Supabase Auth**
   - Wymaga ważnego JWT tokenu
   - Token musi być w nagłówku `Authorization: Bearer {token}`

3. **Baza danych**
   - Wymaga istniejącego `deck_id` w tabeli `decks`
   - RLS (Row Level Security) kontroluje dostęp

### Powiązane endpointy:
- ✅ `POST /api/generations` - Generowanie przez AI (inny format)
- ✅ `GET /rest/v1/decks` - Sprawdzenie czy talia istnieje
- ✅ `POST /rest/v1/flashcards` - Bezpośredni dostęp (bez mapowania)

## ⚠️ Najczęstsze problemy

### Problem: 401 Unauthorized
**Rozwiązanie**: 
- Sprawdź czy token jest w formacie `Bearer {token}`
- Odśwież token przez Supabase Auth

### Problem: 404 Not Found dla deck_id
**Rozwiązanie**:
- Sprawdź czy talia istnieje: `GET /rest/v1/decks?id=eq.1`
- Upewnij się, że talia należy do zalogowanego użytkownika

### Problem: Błąd walidacji długości
**Rozwiązanie**:
- Zastosuj migrację: `20251209234523_update_question_length_min_to_2.sql`
- Sprawdź constraint w bazie: pytanie 2-10000 znaków

## 📊 Status endpointów

| Endpoint | Status | Testy |
|----------|--------|-------|
| `POST /api/flashcards` | ✅ Działa | ✅ 18 testów |
| `POST /api/generations` | ✅ Działa | ⚠️ Osobny skrypt |
| `POST /rest/v1/flashcards` | ✅ Działa | ⚠️ Bezpośrednio Supabase |

## 📝 Checklist przed wdrożeniem

- [ ] Wszystkie testy walidacji przechodzą
- [ ] Testy z autoryzacją przechodzą
- [ ] Fiszki są zapisywane w bazie danych
- [ ] Format odpowiedzi jest zgodny z oczekiwaniami
- [ ] RLS działa poprawnie (użytkownik może tworzyć tylko w swoich taliach)
- [ ] Constraint długości pytania (2-10000) działa w bazie
- [ ] Constraint długości odpowiedzi (max 500) działa w bazie

## 🔧 Debugowanie

### Sprawdź logi serwera Astro
```bash
# W terminalu gdzie działa `npm run dev`
# Zobaczysz logi błędów i requestów
```

### Sprawdź w Supabase Dashboard
1. **SQL Editor**:
```sql
SELECT * FROM flashcards ORDER BY created_at DESC LIMIT 5;
```

2. **Table Editor**:
- Przejdź do tabeli `flashcards`
- Sprawdź czy nowe rekordy są widoczne

### Sprawdź bezpośrednio Supabase REST API
```bash
curl -X GET "{SUPABASE_URL}/rest/v1/flashcards?deck_id=eq.1" \
  -H "apikey: {anon_key}" \
  -H "Authorization: Bearer {token}"
```

## 📚 Więcej informacji

- **Szczegółowy plan testowania**: `FLASHCARDS_ENDPOINT_TESTING.md`
- **Przykłady cURL**: `CURL_TESTS.md`
- **Status wszystkich endpointów**: `API_ENDPOINTS_STATUS.md`

