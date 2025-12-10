# Naprawa skryptów testowych

## Problem

Skrypt `test-flashcards-api.ps1` zwracał błąd **401 Unauthorized** z komunikatem "Invalid API key", ponieważ używał hardcoded wartości `"YOUR_ANON_KEY_HERE"` zamiast czytać z `.env`.

## Rozwiązanie

Zaktualizowano skrypt, aby automatycznie wczytywał wartości z pliku `.env` lub zmiennych środowiskowych.

### Co zostało zmienione:

1. **Dodano funkcję `Load-EnvFile`** - wczytuje zmienne z `.env`
2. **Automatyczne wczytywanie `PUBLIC_SUPABASE_URL`** z `.env`
3. **Automatyczne wczytywanie `PUBLIC_SUPABASE_ANON_KEY`** z `.env`
4. **Opcjonalne wczytywanie `SUPABASE_ACCESS_TOKEN`** z zmiennych środowiskowych

## Jak używać zaktualizowanego skryptu

### Opcja 1: Użyj .env (zalecane)

Upewnij się, że masz plik `.env` w katalogu głównym projektu:

```env
PUBLIC_SUPABASE_URL=https://lfogeotxmdekvfstkais.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Skrypt automatycznie wczyta te wartości.

### Opcja 2: Użyj zmiennych środowiskowych

```powershell
# Ustaw zmienne środowiskowe
$env:PUBLIC_SUPABASE_URL = "https://lfogeotxmdekvfstkais.supabase.co"
$env:PUBLIC_SUPABASE_ANON_KEY = "your-anon-key-here"
$env:SUPABASE_ACCESS_TOKEN = "your-access-token-here"

# Uruchom skrypt
.\test-flashcards-api.ps1
```

### Opcja 3: Tymczasowo w sesji PowerShell

```powershell
# Wczytaj .env ręcznie (jeśli skrypt nie wczyta automatycznie)
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)\s*$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim() -replace '^["'']|["'']$', ''
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

# Uruchom skrypt
.\test-flashcards-api.ps1
```

## Uzyskanie Access Token

Aby uzyskać `access_token` do testów z autoryzacją:

### Metoda 1: Przez Supabase Auth API

```powershell
# Zaloguj się przez Supabase Auth
$loginBody = @{
    email = "your-email@example.com"
    password = "your-password"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://lfogeotxmdekvfstkais.supabase.co/auth/v1/token?grant_type=password" `
    -Method POST `
    -Headers @{
        "apikey" = $env:PUBLIC_SUPABASE_ANON_KEY
        "Content-Type" = "application/json"
    } `
    -Body $loginBody

# Ustaw access token
$env:SUPABASE_ACCESS_TOKEN = $response.access_token
```

### Metoda 2: Z przeglądarki (DevTools)

1. Otwórz aplikację w przeglądarce
2. Zaloguj się
3. Otwórz DevTools (F12)
4. Przejdź do **Application** → **Local Storage**
5. Znajdź klucz `supabase.auth.token`
6. Skopiuj `access_token` z JSON

### Metoda 3: Z Supabase Dashboard

1. Przejdź do Supabase Dashboard
2. Otwórz **Authentication** → **Users**
3. Utwórz nowego użytkownika lub użyj istniejącego
4. Skopiuj token z sesji (wymaga dodatkowej konfiguracji)

## Testowanie

Po skonfigurowaniu zmiennych, uruchom skrypt:

```powershell
.\test-flashcards-api.ps1
```

### Oczekiwane wyniki:

- ✅ **Test 1-3 bez tokenu**: Błędy 401 (oczekiwane, jeśli nie ustawiono `SUPABASE_ACCESS_TOKEN`)
- ✅ **Test 1-3 z tokenem**: Sukces z danymi z bazy

## Sprawdzenie konfiguracji

Przed uruchomieniem testów, sprawdź czy zmienne są ustawione:

```powershell
# Sprawdź zmienne
Write-Host "PUBLIC_SUPABASE_URL: $env:PUBLIC_SUPABASE_URL"
Write-Host "PUBLIC_SUPABASE_ANON_KEY: $($env:PUBLIC_SUPABASE_ANON_KEY.Substring(0, 20))..."
Write-Host "SUPABASE_ACCESS_TOKEN: $(if ($env:SUPABASE_ACCESS_TOKEN) { 'Set' } else { 'Not set' })"
```

## Rozwiązywanie problemów

### Problem: "PUBLIC_SUPABASE_ANON_KEY not found"

**Rozwiązanie**:
1. Sprawdź czy plik `.env` istnieje w katalogu głównym
2. Sprawdź czy zawiera `PUBLIC_SUPABASE_ANON_KEY=...`
3. Upewnij się, że nie ma spacji wokół `=`

### Problem: "Invalid API key" (401)

**Rozwiązanie**:
1. Sprawdź czy `PUBLIC_SUPABASE_ANON_KEY` jest poprawny
2. Skopiuj klucz z Supabase Dashboard → Settings → API → anon/public key
3. Upewnij się, że używasz `anon` key, nie `service_role` key

### Problem: "JWT expired" (401)

**Rozwiązanie**:
1. Odśwież `access_token` przez ponowne logowanie
2. Ustaw nowy token: `$env:SUPABASE_ACCESS_TOKEN = "new-token"`

## Następne kroki

1. ✅ Zaktualizowano `test-flashcards-api.ps1` - automatyczne wczytywanie z `.env`
2. ⚠️ Zaktualizuj `test-flashcards-endpoint.ps1` - używa tej samej logiki
3. 📝 Zaktualizuj dokumentację - dodaj instrukcje dla innych skryptów

