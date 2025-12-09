# Jak Wdrożyć Edge Function do Zdalnego Supabase (bez Dockera)

## Krok 1: Sprawdź konfigurację `.env`

Upewnij się, że masz plik `.env` w katalogu głównym projektu z:

```env
# Supabase Configuration - ZDALNY projekt
PUBLIC_SUPABASE_URL=https://lfogeotxmdekvfstkais.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Gdzie znaleźć te wartości:**
1. Przejdź do: https://app.supabase.com
2. Wybierz projekt "Fiszki_Game" (REF: `lfogeotxmdekvfstkais`)
3. Przejdź do: **Project Settings** → **API**
4. Skopiuj:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon public** key → `PUBLIC_SUPABASE_ANON_KEY`

## Krok 2: Zaloguj się do Supabase CLI

```powershell
npx supabase login
```

To otworzy przeglądarkę, gdzie się zalogujesz. **Nie wpisuj emaila w terminalu** - po prostu naciśnij Enter, a przeglądarka się otworzy.

## Krok 3: Wdróż Edge Function bezpośrednio (bez linkowania)

**Opcja A: Bezpośrednie wdrożenie (zalecane, jeśli masz problemy z linkowaniem):**

```powershell
npx supabase functions deploy generate-flashcards --project-ref lfogeotxmdekvfstkais
```

**Opcja B: Połącz projekt najpierw (jeśli Opcja A nie działa):**

```powershell
# Połącz projekt (może wymagać hasła bazy danych)
npx supabase link --project-ref lfogeotxmdekvfstkais

# Jeśli linkowanie się nie powiedzie z powodu problemów z połączeniem do bazy,
# możesz spróbować wdrożyć bezpośrednio (Opcja A)
```

**Uwaga:** Jeśli masz problemy z połączeniem do bazy danych podczas `link`, użyj **Opcji A** - nie potrzebujesz linkowania do wdrożenia funkcji!

To wdroży funkcję `generate-flashcards` do zdalnego Supabase.

## Krok 5: Skonfiguruj Secret (OPENROUTER_API_KEY)

1. Przejdź do: https://app.supabase.com
2. Wybierz projekt "Fiszki_Game"
3. Przejdź do: **Project Settings** → **Edge Functions** → **Secrets**
4. Kliknij **Add new secret**
5. Wpisz:
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** Twój klucz API z OpenRouter.ai
6. Kliknij **Save**

## Krok 6: Sprawdź, czy działa

Teraz Twój endpoint Astro (`http://localhost:3000/api/generations`) powinien przekierowywać do zdalnej Edge Function.

**Sprawdź w terminalu Astro:**
Powinieneś zobaczyć log:
```
Proxying to Supabase Edge Function: https://lfogeotxmdekvfstkais.supabase.co/functions/v1/generate-flashcards
```

## Podsumowanie

✅ **Nie potrzebujesz:**
- Lokalnego Supabase (Docker)
- Instalacji Supabase CLI globalnie (używasz `npx`)

✅ **Potrzebujesz:**
- Plik `.env` z `PUBLIC_SUPABASE_URL` wskazującym na zdalny projekt
- Zalogowanie się do Supabase CLI (`npx supabase login`)
- Połączenie projektu (`npx supabase link`)
- Wdrożenie funkcji (`npx supabase functions deploy`)
- Skonfigurowanie secret w Dashboard

---

**Po wykonaniu tych kroków, endpoint powinien działać!**

