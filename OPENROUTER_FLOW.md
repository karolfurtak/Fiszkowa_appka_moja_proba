# Przepływ Zapytania i Diagnostyka OpenRouter

## 1. Przepływ Zapytania

```
Postman (localhost:3000/api/generations)
    ↓ POST z source_text
Astro API Proxy (src/pages/api/generations.ts)
    ↓ Mapowanie: source_text → text
    ↓ POST do Supabase Edge Function
Supabase Edge Function (localhost:54321/functions/v1/generate-flashcards)
    ↓ Walidacja danych
    ↓ Konstrukcja promptu dla AI
    ↓ POST do OpenRouter.ai
OpenRouter.ai API (https://openrouter.ai/api/v1/chat/completions)
    ↓ Model: amazon/nova-2-lite-v1:free
    ↓ Generacja flashcards
    ↓ Response z JSON
Supabase Edge Function
    ↓ Parsowanie odpowiedzi AI
    ↓ Walidacja flashcards
    ↓ INSERT do PostgreSQL
    ↓ Response z proposals
Astro API Proxy
    ↓ Response
Postman
```

## 2. Analiza Błędu 404

**Status:** ❌ **Zapytanie NIE dociera do OpenRouter**

**Dlaczego?**
- Błąd 404 z Astro oznacza, że endpoint `/api/generations` nie został znaleziony
- Zapytanie **nie dociera** nawet do Astro API Proxy
- Zapytanie **nie dociera** do Supabase Edge Function
- Zapytanie **nie dociera** do OpenRouter

**Co to oznacza?**
- Problem jest na poziomie routingu Astro
- Endpoint nie jest rozpoznawany przez Astro
- Możliwe przyczyny:
  1. Serwer dev nie został zrestartowany po zmianach
  2. Konfiguracja `output: 'hybrid'` nie została zastosowana
  3. Plik `src/pages/api/generations.ts` nie jest poprawnie rozpoznawany

## 3. Model Językowy

**Model używany:** `amazon/nova-2-lite-v1:free`

**Czy model jest dostępny na OpenRouter?**
- ✅ Model `amazon/nova-2-lite-v1:free` jest dostępny na OpenRouter
- ⚠️ **WAŻNE:** Nawet modele oznaczone jako `:free` mogą wymagać sfinansowanego konta na OpenRouter
- OpenRouter wymaga minimalnego salda (np. $1-5) nawet dla darmowych modeli

**Sprawdź dostępność modelu:**
- Przejdź do: https://openrouter.ai/models
- Wyszukaj: `amazon/nova-2-lite-v1:free`
- Sprawdź wymagania dotyczące finansowania

## 4. Czy Połączenie z OpenRouter Nastąpiło?

**Odpowiedź:** ❌ **NIE**

**Dlaczego?**
- Błąd 404 z Astro oznacza, że zapytanie nie dotarło nawet do Edge Function
- Gdyby zapytanie dotarło do OpenRouter, otrzymałbyś:
  - ✅ **200 OK** - Sukces (z flashcards)
  - ✅ **401 Unauthorized** - Nieprawidłowy API key
  - ✅ **402 Payment Required** - Brak środków na koncie
  - ✅ **429 Too Many Requests** - Rate limit
  - ✅ **500 Internal Server Error** - Błąd OpenRouter
  - ❌ **404 Not Found** - Endpoint nie istnieje (to jest błąd Astro, nie OpenRouter)

**Jak sprawdzić, czy połączenie nastąpiło?**

### Jeśli zapytanie dotrze do Edge Function:
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "OpenRouter API key not configured"
  }
}
```

### Jeśli zapytanie dotrze do OpenRouter bez środków:
```json
{
  "error": {
    "code": "AI_API_ERROR",
    "message": "OpenRouter.ai API returned error: 402",
    "details": {
      "status": 402,
      "body": "Insufficient credits"
    }
  }
}
```

### Jeśli zapytanie dotrze do OpenRouter z nieprawidłowym modelem:
```json
{
  "error": {
    "code": "AI_API_ERROR",
    "message": "OpenRouter.ai API returned error: 400",
    "details": {
      "status": 400,
      "body": "Model not found"
    }
  }
}
```

## 5. Kroki Diagnostyczne

### Krok 1: Sprawdź, czy endpoint Astro działa
```powershell
# Sprawdź w terminalu, czy serwer działa na porcie 3000
# Powinieneś zobaczyć:
# ┃ Local    http://localhost:3000/
```

### Krok 2: Sprawdź routing Astro
```powershell
# W terminalu Astro powinny być logi:
# [router] Route: /api/generations -> POST handler found
```

### Krok 3: Sprawdź, czy Edge Function jest dostępna
```powershell
# Uruchom lokalny Supabase (jeśli używasz lokalnego):
npx supabase start

# Sprawdź status:
npx supabase status
```

### Krok 4: Sprawdź logi Edge Function
```powershell
# Jeśli Edge Function działa lokalnie:
npx supabase functions logs generate-flashcards

# Powinieneś zobaczyć logi, gdy zapytanie dotrze do Edge Function
```

### Krok 5: Sprawdź konfigurację OpenRouter
1. Przejdź do: https://openrouter.ai/keys
2. Sprawdź, czy masz aktywny API key
3. Sprawdź saldo konta (nawet dla darmowych modeli może być wymagane minimalne saldo)

## 6. Rozwiązanie Problemu 404

### Rozwiązanie 1: Zrestartuj serwer dev
```powershell
# Zatrzymaj serwer (Ctrl+C)
# Uruchom ponownie:
npm run dev
```

### Rozwiązanie 2: Sprawdź konfigurację Astro
```javascript
// astro.config.mjs powinien zawierać:
export default defineConfig({
  server: {
    port: 3000,
    host: true
  },
  output: 'hybrid', // Ważne dla API routes
  integrations: [tailwind(), react()]
});
```

### Rozwiązanie 3: Sprawdź strukturę plików
```
src/
  pages/
    api/
      generations.ts  ← Ten plik musi istnieć
```

### Rozwiązanie 4: Sprawdź metodę HTTP w Postmanie
- ✅ Metoda: **POST** (nie GET)
- ✅ URL: `http://localhost:3000/api/generations`
- ✅ Headers: `Content-Type: application/json`
- ✅ Body: Raw JSON z `source_text`

## 7. Co Zrobić Po Naprawieniu 404

Gdy zapytanie dotrze do Edge Function, sprawdź:

1. **Czy API key jest skonfigurowany?**
   - Lokalnie: `.env` + `supabase/config.toml`
   - Produkcyjnie: Supabase Dashboard → Secrets

2. **Czy masz środki na OpenRouter?**
   - Nawet darmowe modele mogą wymagać minimalnego salda
   - Sprawdź: https://openrouter.ai/account/credits

3. **Czy model jest dostępny?**
   - Sprawdź: https://openrouter.ai/models
   - Wyszukaj: `amazon/nova-2-lite-v1:free`

4. **Sprawdź logi Edge Function:**
   ```powershell
   npx supabase functions logs generate-flashcards
   ```
   - Powinieneś zobaczyć logi z OpenRouter
   - Sprawdź błędy związane z API key lub środkami

## 8. Podsumowanie

**Aktualny stan:**
- ❌ Zapytanie NIE dociera do OpenRouter (błąd 404 z Astro)
- ❌ Endpoint Astro nie jest rozpoznawany
- ⚠️ Nie można sprawdzić, czy model jest dostępny (zapytanie nie dociera)
- ⚠️ Nie można sprawdzić, czy są środki na OpenRouter (zapytanie nie dociera)

**Następne kroki:**
1. Napraw błąd 404 (zrestartuj serwer, sprawdź konfigurację)
2. Gdy zapytanie dotrze do Edge Function, sprawdź logi
3. Sprawdź konfigurację OpenRouter API key
4. Sprawdź saldo konta OpenRouter
5. Sprawdź dostępność modelu na OpenRouter

---

**Ostatnia aktualizacja:** 2025-12-08

