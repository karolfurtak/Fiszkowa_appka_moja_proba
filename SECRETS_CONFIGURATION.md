# Konfiguracja Secrets dla Edge Functions

## Różnica między `.env` a Supabase Secrets

### `.env` (lokalne środowisko)
- ✅ Działa tylko dla **lokalnego Supabase** (`npx supabase start`)
- ✅ Używane przez `supabase/config.toml` w sekcji `[edge_runtime.secrets]`
- ❌ **NIE działa** dla zdalnego Supabase (hostowanego przez Supabase)

### Supabase Dashboard Secrets (zdalne środowisko)
- ✅ Działa tylko dla **zdalnego Supabase** (hostowanego)
- ✅ Konfigurowane w: **Settings → Edge Functions → Secrets**
- ❌ **NIE działa** dla lokalnego Supabase

## Co MUSI być w Settings → Edge Functions → Secrets

### Wymagane Secrets:

**1. OPENROUTER_API_KEY**  
**Nazwa:** `OPENROUTER_API_KEY`  
**Wartość:** Twój klucz API z OpenRouter.ai

**2. DEFAULT_USER_ID** (opcjonalne, ale zalecane)  
**Nazwa:** `DEFAULT_USER_ID`  
**Wartość:** UUID użytkownika testowego (zobacz `CREATE_TEST_USER.md` jeśli potrzebujesz utworzyć użytkownika)

### Jak skonfigurować:

1. Przejdź do: https://app.supabase.com
2. Wybierz projekt: **"Fiszki_Game"** (REF: `lfogeotxmdekvfstkais`)
3. Przejdź do: **Project Settings** → **Edge Functions** → **Secrets**
4. Kliknij **"Add new secret"** lub **"New secret"**
5. Dodaj `OPENROUTER_API_KEY`:
   - **Name:** `OPENROUTER_API_KEY` (dokładnie tak, bez spacji, wielkie litery)
   - **Value:** Twój klucz API z OpenRouter.ai
   - Kliknij **"Save"** lub **"Add"**
6. (Opcjonalnie) Dodaj `DEFAULT_USER_ID`:
   - **Name:** `DEFAULT_USER_ID`
   - **Value:** UUID użytkownika testowego (zobacz `CREATE_TEST_USER.md`)
   - Kliknij **"Save"** lub **"Add"**

### Automatyczne Secrets (nie trzeba dodawać)

Supabase automatycznie dostarcza te zmienne do Edge Functions:
- ✅ `SUPABASE_URL` - URL projektu
- ✅ `SUPABASE_ANON_KEY` - Anonimowy klucz
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key (dla operacji DB)

**Nie musisz ich dodawać ręcznie!**

## Sprawdzenie, czy Secret jest skonfigurowany

### W Dashboard:
1. Przejdź do: **Settings → Edge Functions → Secrets**
2. Powinieneś zobaczyć listę secrets
3. Sprawdź, czy `OPENROUTER_API_KEY` jest na liście

### Test w Edge Function:
Gdy Edge Function jest wdrożona, możesz sprawdzić logi:
```powershell
# Sprawdź logi Edge Function
npx supabase functions logs generate-flashcards --project-ref lfogeotxmdekvfstkais
```

Jeśli zobaczysz błąd:
```
OpenRouter API key not configured
```

To oznacza, że secret nie jest ustawiony lub ma błędną nazwę.

## Podsumowanie

### Dla lokalnego Supabase:
- ✅ `.env` z `OPENROUTER_API_KEY` i `DEFAULT_USER_ID`
- ✅ `supabase/config.toml` z:
  - `OPENROUTER_API_KEY = "env(OPENROUTER_API_KEY)"`
  - `DEFAULT_USER_ID = "env(DEFAULT_USER_ID)"`

### Dla zdalnego Supabase:
- ✅ **Settings → Edge Functions → Secrets** z `OPENROUTER_API_KEY` i `DEFAULT_USER_ID`
- ❌ `.env` **NIE działa** dla zdalnego Supabase

---

**Ważne:** Jeśli używasz zdalnego Supabase (co robisz), **MUSISZ** dodać `OPENROUTER_API_KEY` w Dashboard Secrets, nawet jeśli masz go w `.env`!

