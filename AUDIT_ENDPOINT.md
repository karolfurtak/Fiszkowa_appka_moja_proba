# Audyt Endpointu - Raport

**Data audytu:** 2025-12-08  
**Projekt:** 10xCards  
**Endpoint:** `/api/generations` (Astro API Proxy → Supabase Edge Function)

---

## 1. Podsumowanie Wykonawcze

### Odpowiedzi na pytania:

1. **Czy mogę zmienić bez konsekwencji localhost na port 3000?**
   - ⚠️ **TAK, ALE** - wymaga to zmian w wielu miejscach (~15 plików)
   - ✅ Port 3000 jest już zdefiniowany w `supabase/config.toml` dla auth redirect URLs, ale to **NIE jest port serwera** - to tylko konfiguracja, do którego URL Supabase Auth będzie przekierowywać po logowaniu
   - ✅ Możesz bezpiecznie użyć portu 3000 dla Astro - konfiguracja w `config.toml` będzie działać poprawnie
   - Port 4321 jest domyślnym portem Astro i jest używany w wielu miejscach

2. **Czy jest tylko jeden localhost zdefiniowany w tym repo?**
   - ❌ **NIE** - są **dwa różne porty serwerów** używane dla localhost:
     - `localhost:4321` - Astro dev server (frontend) - **PORT SERWERA**
     - `localhost:54321` - Supabase local API (backend) - **PORT SERWERA**
   - Dodatkowo `127.0.0.1:3000` jest zdefiniowany w `supabase/config.toml` jako **redirect URL** (nie port serwera)

---

## 2. Szczegółowa Analiza Portów

### Porty w projekcie:

| Port | Serwis | Konfiguracja | Użycie |
|------|--------|--------------|--------|
| **4321** | Astro Dev Server | Domyślny (nie skonfigurowany w `astro.config.mjs`) | Frontend aplikacji |
| **54321** | Supabase Local API | `supabase/config.toml` linia 10 | Edge Functions, API |
| **54322** | PostgreSQL Database | `supabase/config.toml` linia 29 | Baza danych |
| **54323** | Supabase Studio | `supabase/config.toml` linia 85 | Panel administracyjny |
| **54324** | Inbucket (Email) | `supabase/config.toml` linia 96 | Testowanie emaili |
| **3000** | Auth Redirect URLs | `supabase/config.toml` linia 123 | ⚠️ **NIE jest portem serwera** - tylko URL dla redirectów po autentykacji |

---

## 3. Miejsca z Definicjami localhost

### 3.1. `localhost:4321` (Astro Frontend) - 15 wystąpień

**Pliki z `localhost:4321`:**

1. **`src/pages/api/generations.ts`** (linia 16)
   - Fallback URL dla Supabase (ale używa 54321, nie 4321)
   - ⚠️ **Błąd w komentarzu** - komentarz mówi o localhost:54321, ale kod jest poprawny

2. **`test-openrouter.ps1`** (linia 6)
   ```powershell
   $localAstroUrl = "http://localhost:4321/api/generations"
   ```

3. **`check-status.ps1`** (linie 8, 9, 57)
   ```powershell
   $response = Invoke-WebRequest -Uri "http://localhost:4321"
   Write-Host "Endpoint: http://localhost:4321/api/generations"
   ```

4. **`ARCHITECTURE.md`** (wielokrotnie - dokumentacja)
   - Linia 257: Przykład request
   - Linia 1024: URL w dokumentacji
   - Linia 1125: Przykład kodu

5. **`SETUP.md`** (linia 107)
   - Instrukcje uruchomienia

6. **`supabase/functions/generate-flashcards/README.md`** (linie 14, 15, 156)
   - Dokumentacja różnicy między portami

7. **`README.md`** (linia 91)
   - Instrukcje uruchomienia

8. **`rules/Supabase Astro Initialization.mdc`** (linie 151, 159)
   - Dokumentacja inicjalizacji

### 3.2. `localhost:54321` (Supabase Local API) - 10 wystąpień

**Pliki z `localhost:54321`:**

1. **`src/pages/api/generations.ts`** (linia 16)
   ```typescript
   const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:54321';
   ```
   - ⚠️ **KRYTYCZNE** - fallback URL dla lokalnego developmentu

2. **`test-openrouter.ps1`** (linia 10)
   ```powershell
   $localSupabaseUrl = "http://localhost:54321/functions/v1/generate-flashcards"
   ```

3. **`check-status.ps1`** (linie 20, 21)
   ```powershell
   $response = Invoke-WebRequest -Uri "http://localhost:54321"
   ```

4. **`supabase/config.toml`** (linia 10)
   ```toml
   port = 54321
   ```
   - ⚠️ **KRYTYCZNE** - konfiguracja portu Supabase API

5. **`ARCHITECTURE.md`** (wielokrotnie - dokumentacja)
   - Dokumentacja architektury

6. **`SETUP.md`** (linia 125)
   - Instrukcje uruchomienia

7. **`supabase/functions/generate-flashcards/README.md`** (linie 14, 143)
   - Dokumentacja Edge Function

### 3.3. `127.0.0.1:3000` (Supabase Auth Redirect URLs) - 2 wystąpienia

**Pliki z `127.0.0.1:3000`:**

1. **`supabase/config.toml`** (linie 123, 125)
   ```toml
   site_url = "http://127.0.0.1:3000"
   additional_redirect_urls = ["https://127.0.0.1:3000"]
   ```
   - ⚠️ **WAŻNE:** To **NIE jest port serwera** - to tylko konfiguracja redirect URLs
   - Supabase Auth będzie przekierowywać użytkowników na ten URL **PO** autentykacji
   - Jeśli zmienisz port Astro na 3000, ta konfiguracja będzie działać poprawnie
   - Jeśli zostawisz port 4321, musisz zaktualizować te wartości na `http://127.0.0.1:4321`

---

## 4. Analiza Endpointu `/api/generations`

### 4.1. Przepływ Requestu

```
Frontend (localhost:4321)
    ↓ POST /api/generations
Astro API Proxy (src/pages/api/generations.ts)
    ↓ POST /functions/v1/generate-flashcards
Supabase Edge Function (localhost:54321)
    ↓ POST https://openrouter.ai/api/v1/chat/completions
OpenRouter.ai API
    ↓ Response
Supabase Edge Function
    ↓ INSERT INTO flashcard_proposals
PostgreSQL Database (localhost:54322)
    ↓ Response
Astro API Proxy
    ↓ Response
Frontend
```

### 4.2. Konfiguracja Portów w Endpoint

**Plik:** `src/pages/api/generations.ts`

```typescript
// Linia 16
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:54321';
```

**Analiza:**
- ✅ Używa zmiennej środowiskowej `PUBLIC_SUPABASE_URL` (priorytet)
- ✅ Fallback do `localhost:54321` (lokalny Supabase)
- ⚠️ Port jest hardcoded w fallback - jeśli zmienisz port Supabase, musisz zaktualizować ten kod

### 4.3. Potencjalne Problemy

1. **Hardcoded fallback URL**
   - Jeśli zmienisz port Supabase w `config.toml`, endpoint nie zadziała bez aktualizacji kodu
   - **Rozwiązanie:** Użyj zmiennej środowiskowej zamiast hardcoded fallback

2. **Brak walidacji portu**
   - Endpoint nie sprawdza, czy Supabase jest dostępny
   - **Rozwiązanie:** Dodaj health check przed proxy

3. **CORS**
   - Edge Function ma CORS headers, ale Astro proxy może potrzebować własnych
   - **Status:** Do sprawdzenia

---

## 5. Czy Można Zmienić Port na 3000?

### 5.1. Zmiana Portu Astro z 4321 na 3000

**Wymagane zmiany:**

1. **Konfiguracja Astro** (`astro.config.mjs`)
   ```javascript
   export default defineConfig({
     server: {
       port: 3000,
       host: true
     },
     integrations: [tailwind(), react()]
   });
   ```

2. **Aktualizacja wszystkich plików z `localhost:4321`:**
   - `test-openrouter.ps1` (linia 6)
   - `check-status.ps1` (linie 8, 9, 57)
   - `ARCHITECTURE.md` (wielokrotnie)
   - `SETUP.md` (linia 107)
   - `README.md` (linia 91)
   - `supabase/functions/generate-flashcards/README.md` (linie 14, 15, 156)
   - `rules/Supabase Astro Initialization.mdc` (linie 151, 159)

3. **Konfiguracja Supabase Auth:**
   - Port 3000 jest już zdefiniowany w `supabase/config.toml` dla `site_url` i `additional_redirect_urls`
   - ✅ **To jest OK** - Supabase Auth używa tego URL dla redirectów PO autentykacji, nie jako port serwera
   - ✅ Jeśli zmienisz port Astro na 3000, ta konfiguracja będzie działać poprawnie (bez zmian)
   - ⚠️ Jeśli zostawisz port 4321, powinieneś zaktualizować `site_url` na `http://127.0.0.1:4321`

### 5.2. Konsekwencje Zmiany

**Pozytywne:**
- ✅ Standardowy port dla aplikacji webowych
- ✅ Zgodność z Supabase Auth redirect URLs (już skonfigurowane)
- ✅ Łatwiejsze do zapamiętania

**Negatywne:**
- ❌ Wymaga aktualizacji ~15 miejsc w kodzie i dokumentacji
- ❌ Możliwy konflikt z innymi aplikacjami na porcie 3000
- ❌ Port 4321 jest domyślny dla Astro i dobrze rozpoznawalny

### 5.3. Rekomendacja

**✅ MOŻNA zmienić, ale:**
1. Upewnij się, że port 3000 nie jest używany przez inne aplikacje
2. Zaktualizuj wszystkie pliki wymienione w sekcji 5.1
3. Zaktualizuj dokumentację
4. Przetestuj wszystkie endpointy po zmianie

**Alternatywnie:**
- Zostaw port 4321 (domyślny Astro, mniej konfliktów)
- Port 3000 jest już używany dla Supabase Auth redirects, ale to nie powoduje konfliktu

---

## 6. Lista Wszystkich Miejsc z localhost

### 6.1. Pliki Kodu (wymagają aktualizacji przy zmianie portu)

| Plik | Linia | Port | Typ | Priorytet |
|------|------|------|-----|-----------|
| `src/pages/api/generations.ts` | 16 | 54321 | Kod | 🔴 KRYTYCZNE |
| `test-openrouter.ps1` | 6, 10 | 4321, 54321 | Skrypt | 🟡 WYSOKI |
| `check-status.ps1` | 8, 9, 20, 21, 57 | 4321, 54321 | Skrypt | 🟡 WYSOKI |
| `supabase/config.toml` | 10, 123, 125 | 54321, 3000 | Konfig | 🔴 KRYTYCZNE |

### 6.2. Pliki Dokumentacji (wymagają aktualizacji dla spójności)

| Plik | Liczba wystąpień | Port | Priorytet |
|------|------------------|------|-----------|
| `ARCHITECTURE.md` | ~8 | 4321, 54321 | 🟢 ŚREDNI |
| `SETUP.md` | ~2 | 4321, 54321 | 🟢 ŚREDNI |
| `README.md` | ~1 | 4321 | 🟢 ŚREDNI |
| `supabase/functions/generate-flashcards/README.md` | ~3 | 4321, 54321 | 🟢 ŚREDNI |
| `rules/Supabase Astro Initialization.mdc` | ~2 | 4321 | 🟢 ŚREDNI |

---

## 7. Rekomendacje

### 7.1. Dla Zmiany Portu na 3000

**Kroki do wykonania:**

1. **Zaktualizuj `astro.config.mjs`:**
   ```javascript
   export default defineConfig({
     server: {
       port: 3000,
     },
     integrations: [tailwind(), react()]
   });
   ```

2. **Zaktualizuj wszystkie pliki z `localhost:4321` → `localhost:3000`:**
   - Użyj find & replace w całym projekcie
   - Sprawdź każdy plik ręcznie

3. **Przetestuj:**
   - Uruchom `npm run dev` i sprawdź, czy działa na porcie 3000
   - Przetestuj endpoint `/api/generations`
   - Sprawdź, czy Supabase Auth redirects działają

### 7.2. Dla Poprawy Endpoint

**Sugerowane ulepszenia:**

1. **Usuń hardcoded fallback:**
   ```typescript
   // Zamiast:
   const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:54321';
   
   // Użyj:
   const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
   if (!supabaseUrl) {
     return new Response(JSON.stringify({
       error: { code: 'CONFIGURATION_ERROR', message: 'PUBLIC_SUPABASE_URL not configured' }
     }), { status: 500 });
   }
   ```

2. **Dodaj health check:**
   ```typescript
   // Sprawdź, czy Supabase jest dostępny przed proxy
   try {
     const healthCheck = await fetch(`${supabaseUrl}/rest/v1/`, { method: 'HEAD' });
     if (!healthCheck.ok) {
       throw new Error('Supabase not available');
     }
   } catch (error) {
     return new Response(JSON.stringify({
       error: { code: 'SERVICE_UNAVAILABLE', message: 'Supabase service is not available' }
     }), { status: 503 });
   }
   ```

3. **Dodaj timeout dla proxy:**
   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund
   
   const response = await fetch(edgeFunctionUrl, {
     signal: controller.signal,
     // ... reszta konfiguracji
   });
   ```

---

## 8. Podsumowanie

### Odpowiedzi na pytania:

1. **Czy mogę zmienić bez konsekwencji localhost na port 3000?**
   - ✅ **TAK** - wymaga aktualizacji ~15 miejsc w kodzie i dokumentacji
   - ✅ Port 3000 jest już zdefiniowany w `supabase/config.toml` dla auth redirect URLs
   - ✅ **To jest zaleta** - jeśli zmienisz port Astro na 3000, konfiguracja Supabase Auth będzie już gotowa
   - ⚠️ Jeśli zostawisz port 4321, powinieneś zaktualizować `site_url` w `config.toml` na `http://127.0.0.1:4321`

2. **Czy jest tylko jeden localhost zdefiniowany w tym repo?**
   - ❌ **NIE** - są **dwa główne porty**:
     - `localhost:4321` - Astro dev server (15 wystąpień)
     - `localhost:54321` - Supabase local API (10 wystąpień)
   - Dodatkowo `127.0.0.1:3000` dla Supabase Auth redirect URLs (2 wystąpienia w `config.toml` - **NIE jest to port serwera**)

### Statystyki:

- **Łączna liczba wystąpień `localhost`:** ~27
- **Pliki kodu wymagające aktualizacji:** 4
- **Pliki dokumentacji wymagające aktualizacji:** 5
- **Krytyczne pliki konfiguracyjne:** 2 (`src/pages/api/generations.ts`, `supabase/config.toml`)

### Ważne Wyjaśnienie:

**Port 3000 w `supabase/config.toml`:**
- ✅ **JEST zdefiniowany** jako `site_url` i `additional_redirect_urls`
- ⚠️ **NIE jest portem serwera** - to tylko konfiguracja, do którego URL Supabase Auth przekieruje użytkownika PO autentykacji
- ✅ Jeśli zmienisz port Astro na 3000, ta konfiguracja będzie działać poprawnie (bez zmian)
- ⚠️ Jeśli zostawisz port 4321, powinieneś zaktualizować `site_url` na `http://127.0.0.1:4321`

---

**Ostatnia aktualizacja:** 2025-12-08  
**Wersja:** 1.0

