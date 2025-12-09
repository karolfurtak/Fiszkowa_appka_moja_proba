# Instrukcje Instalacji i Konfiguracji - 10xCards

Ten dokument zawiera szczegółowe instrukcje dotyczące instalacji i konfiguracji wszystkich narzędzi potrzebnych do pracy nad projektem 10xCards.

**Informacje o projekcie Supabase:**
- **Nazwa projektu:** Fiszki_Game
- **Project REF:** `lfogeotxmdekvfstkais`
- **Dashboard:** https://supabase.com/dashboard/project/lfogeotxmdekvfstkais

## Wymagania Wstępne

- **Node.js**: Wersja `24.11.1` (sprawdź plik `.nvmrc`)
- **npm**: Zainstalowany wraz z Node.js
- **Git**: Do zarządzania wersjami kodu

## Instalacja Narzędzi

### 1. Node.js i npm

Projekt wymaga Node.js w wersji `24.11.1`. Zalecamy użycie menedżera wersji `nvm` (Node Version Manager).

**Windows (nvm-windows):**
```powershell
# Pobierz i zainstaluj z: https://github.com/coreybutler/nvm-windows/releases
# Następnie zainstaluj odpowiednią wersję:
nvm install 24.11.1
nvm use 24.11.1
```

**Weryfikacja:**
```powershell
node --version  # Powinno zwrócić: v24.11.1
npm --version
```

### 2. Supabase CLI

Supabase CLI jest dostępne przez `npx` i nie wymaga globalnej instalacji. Wszystkie polecenia należy uruchamiać z prefiksem `npx`:

```powershell
# Przykład użycia:
npx supabase --version
npx supabase status
npx supabase migration up
```

**Uwaga:** Supabase CLI nie wspiera instalacji globalnej przez `npm install -g`. Używaj zawsze `npx supabase`.

### 3. Docker Desktop (Opcjonalne - dla lokalnego środowiska)

Lokalne środowisko Supabase wymaga Dockera. Jeśli Docker nie działa, możesz używać zdalnej bazy danych Supabase.

**Instalacja Docker Desktop:**
1. Pobierz Docker Desktop z: https://www.docker.com/products/docker-desktop
2. Zainstaluj i uruchom Docker Desktop
3. W Settings → Resources → WSL Integration włącz integrację z Twoją dystrybucją WSL (jeśli używasz)

**Weryfikacja:**
```powershell
docker --version
docker ps
```

## Konfiguracja Projektu

### 1. Instalacja Zależności

```powershell
npm install
```

### 2. Konfiguracja Zmiennych Środowiskowych

Utwórz plik `.env` w katalogu głównym projektu (jeśli jeszcze nie istnieje) i dodaj następujące zmienne:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://lfogeotxmdekvfstkais.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenRouter API Configuration
OPENROUTER_API_KEY=your-openrouter-api-key

# Default User ID for Edge Functions (before auth is implemented)
# Get this UUID from: Supabase Dashboard → Authentication → Users → Copy User ID
DEFAULT_USER_ID=your-user-uuid-here
```

**Gdzie znaleźć te wartości:**
- **PUBLIC_SUPABASE_URL** i **PUBLIC_SUPABASE_ANON_KEY**: Supabase Dashboard → Project Settings → API
- **OPENROUTER_API_KEY**: [OpenRouter.ai Dashboard](https://openrouter.ai/keys)
- **DEFAULT_USER_ID**: Supabase Dashboard → Authentication → Users → Copy User ID (zobacz `CREATE_TEST_USER.md` jeśli potrzebujesz utworzyć użytkownika testowego)

### 3. Inicjalizacja Supabase (jeśli jeszcze nie wykonane)

Jeśli projekt Supabase nie został jeszcze zainicjalizowany:

```powershell
npx supabase init
```

## Uruchomienie Projektu

### Lokalne Środowisko Deweloperskie

**1. Uruchomienie aplikacji Astro (frontend):**

```powershell
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:4321`

**2. Uruchomienie Supabase Edge Functions (backend API):**

Edge Functions są osobnym serwerem i muszą być uruchamiane osobno.

**Opcja A: Lokalne środowisko (wymaga Dockera):**

```powershell
# Uruchomienie lokalnego Supabase (wymaga Dockera)
npx supabase start

# Uruchomienie Edge Function lokalnie
npm run functions:serve
# lub bezpośrednio:
npx supabase functions serve generate-flashcards --no-verify-jwt
```

Edge Function będzie dostępna pod adresem: `http://localhost:54321/functions/v1/generate-flashcards`

**Opcja B: Zdalne środowisko (bez Dockera):**

Jeśli Docker nie działa, możesz używać zdalnego Supabase:

1. **Wdróż Edge Function do zdalnego Supabase:**
   ```powershell
   npx supabase functions deploy generate-flashcards
   ```

2. **Użyj zdalnego URL w Postmanie:**
   - URL: `https://lfogeotxmdekvfstkais.supabase.co/functions/v1/generate-flashcards`

3. **Skonfiguruj `OPENROUTER_API_KEY` w Supabase Secrets:**
   - Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Dodaj: `OPENROUTER_API_KEY` = `your-api-key`

**Uwaga:** 
- `npm run dev` uruchamia tylko frontend (Astro)
- Edge Functions muszą być uruchamiane osobno przez Supabase CLI
- Edge Functions NIE są częścią Astro - to osobne serwery Deno
- Jeśli Docker nie działa, użyj zdalnego Supabase (Opcja B)

### Uruchomienie Lokalnego Supabase (wymaga Dockera)

Jeśli Docker działa poprawnie, możesz uruchomić lokalne środowisko Supabase:

```powershell
# Uruchomienie lokalnego Supabase
npx supabase start

# Zatrzymanie lokalnego Supabase
npx supabase stop

# Sprawdzenie statusu
npx supabase status
```

**Uwaga:** Jeśli Docker nie działa, możesz używać zdalnej bazy danych Supabase. W takim przypadku upewnij się, że zmienne środowiskowe w `.env` wskazują na zdalny projekt.

### Zastosowanie Migracji Bazy Danych

**Opcja 1: Przez Supabase Dashboard (Zalecane, jeśli Docker nie działa)**
1. Zaloguj się do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz swój projekt
3. Przejdź do SQL Editor
4. Skopiuj zawartość pliku `supabase/migrations/20241118000000_initial_schema.sql`
5. Wklej i uruchom w SQL Editor

**Opcja 2: Przez Supabase CLI (wymaga Dockera)**
```powershell
# Jeśli używasz lokalnego środowiska:
npx supabase migration up

# Jeśli używasz zdalnego projektu (po połączeniu):
npx supabase db push
```

**Połączenie ze zdalnym projektem:**
```powershell
npx supabase link --project-ref lfogeotxmdekvfstkais
```

## Przydatne Polecenia

### Supabase CLI

```powershell
# Sprawdzenie wersji
npx supabase --version

# Status lokalnego środowiska
npx supabase status

# Generowanie typów TypeScript z bazy danych
# Dla projektu Fiszki_Game użyj: --project-id lfogeotxmdekvfstkais
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/db/database.types.ts

# Tworzenie nowej migracji
npx supabase migration new migration_name

# Reset lokalnej bazy danych
npx supabase db reset
```

### Projekt Astro

```powershell
# Uruchomienie serwera deweloperskiego
npm run dev

# Budowanie projektu produkcyjnego
npm run build

# Podgląd zbudowanego projektu
npm run preview
```

## Rozwiązywanie Problemów

### Problem: "supabase: command not found"

**Rozwiązanie:** Używaj zawsze `npx supabase` zamiast `supabase`.

### Problem: Docker nie działa / "failed to connect to postgres"

**Rozwiązanie:** 
- Upewnij się, że Docker Desktop jest uruchomiony
- Lub użyj zdalnej bazy danych Supabase (zaktualizuj `.env` z danymi zdalnego projektu)

### Problem: "Access token not provided" przy generowaniu typów

**Rozwiązanie:** 
- Zaloguj się do Supabase CLI: `npx supabase login`
- Lub użyj `--db-url` z connection stringiem zamiast `--project-id`

### Problem: Zmienne środowiskowe nie są wczytywane

**Rozwiązanie:**
- Upewnij się, że plik `.env` znajduje się w katalogu głównym projektu
- Zmienne muszą zaczynać się od `PUBLIC_` aby były dostępne w przeglądarce
- Zrestartuj serwer deweloperski po zmianie `.env`

## Struktura Projektu

```
10xCards/
├── .env                    # Zmienne środowiskowe (nie commituj do git!)
├── supabase/
│   ├── config.toml         # Konfiguracja Supabase
│   └── migrations/         # Migracje bazy danych
│       └── 20241118000000_initial_schema.sql
├── src/
│   ├── lib/                # Biblioteki i narzędzia
│   ├── pages/              # Strony Astro
│   └── components/         # Komponenty React
└── package.json
```

## Dodatkowe Zasoby

- [Dokumentacja Astro](https://docs.astro.build)
- [Dokumentacja Supabase](https://supabase.com/docs)
- [Dokumentacja Supabase CLI](https://supabase.com/docs/reference/cli)
- [Dokumentacja React](https://react.dev)

