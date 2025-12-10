# Test script for Flashcards API endpoints
# Usage: .\test-flashcards-api.ps1

# ============================================================================
# KONFIGURACJA - Automatyczne wczytywanie z .env lub zmiennych środowiskowych
# ============================================================================

# Funkcja do wczytywania zmiennych z .env (obsługuje wieloliniowe wartości)
function Load-EnvFile {
    param([string]$FilePath = ".env")
    
    if (-not (Test-Path $FilePath)) {
        Write-Warning "File .env not found at: $FilePath"
        return
    }
    
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Cyan
    
    # Wczytaj plik z obsługą różnych kodowań
    $lines = Get-Content $FilePath -Encoding UTF8
    $currentKey = $null
    $currentValue = @()
    $loadedCount = 0
    
    foreach ($line in $lines) {
        $trimmedLine = $line.Trim()
        
        # Pomiń puste linie
        if ([string]::IsNullOrWhiteSpace($trimmedLine)) {
            # Pusta linia kończy wartość (jeśli była w trakcie)
            if ($null -ne $currentKey) {
                if ($currentValue.Count -gt 0) {
                    $finalValue = ($currentValue -join '').Trim()
                } else {
                    $finalValue = ""
                }
                
                # Usuń cudzysłowy z początku i końca (tylko jeśli są na początku i końcu)
                if ($finalValue.Length -ge 2) {
                    if (($finalValue.StartsWith('"') -and $finalValue.EndsWith('"')) -or
                        ($finalValue.StartsWith("'") -and $finalValue.EndsWith("'"))) {
                        $finalValue = $finalValue.Substring(1, $finalValue.Length - 2)
                    }
                }
                
                # Zapisz nawet jeśli puste (może być celowo puste)
                # Użyj bezpośredniego przypisania przez [Environment]::SetEnvironmentVariable
                [Environment]::SetEnvironmentVariable($currentKey, $finalValue, [EnvironmentVariableTarget]::Process)
                
                # Weryfikuj zapis
                $verifyValue = [Environment]::GetEnvironmentVariable($currentKey, [EnvironmentVariableTarget]::Process)
                if ($null -eq $verifyValue -or $verifyValue -ne $finalValue) {
                    Write-Warning "  WARNING: Value for $currentKey may not have been saved correctly (expected length: $($finalValue.Length), got: $($verifyValue.Length))"
                }
                
                $loadedCount++
                
                if ($currentKey -match 'KEY|TOKEN|SECRET|PASSWORD') {
                    Write-Host "  [OK] Loaded: $currentKey = [HIDDEN - $($finalValue.Length) chars]" -ForegroundColor Green
                } else {
                    Write-Host "  [OK] Loaded: $currentKey = $finalValue" -ForegroundColor Green
                }
                
                $currentKey = $null
                $currentValue = @()
            }
            continue
        }
        
        # Pomiń komentarze
        if ($trimmedLine.StartsWith('#')) {
            continue
        }
        
        # Sprawdź czy linia zawiera znak równości (nowy klucz)
        $matchResult = $trimmedLine -match '^([^=]+?)\s*=\s*(.*)$'
        if ($matchResult) {
            # Zapisz dopasowania do lokalnych zmiennych (zabezpieczenie przed nadpisaniem $matches)
            $matchedKey = $matches[1]
            $matchedValue = $matches[2]
            
            if ($null -ne $matchedKey) {
                # Zapisz poprzednią parę klucz-wartość jeśli istnieje
                if ($null -ne $currentKey) {
                    if ($currentValue.Count -gt 0) {
                        $finalValue = ($currentValue -join '').Trim()
                    } else {
                        $finalValue = ""
                    }
                    
                    # Usuń cudzysłowy z początku i końca (tylko jeśli są na początku i końcu)
                    if ($finalValue.Length -ge 2 -and 
                        (($finalValue.StartsWith('"') -and $finalValue.EndsWith('"')) -or
                         ($finalValue.StartsWith("'") -and $finalValue.EndsWith("'")))) {
                        $finalValue = $finalValue.Substring(1, $finalValue.Length - 2)
                    }
                    
                    # Zapisz nawet jeśli puste (może być celowo puste)
                    [Environment]::SetEnvironmentVariable($currentKey, $finalValue, [EnvironmentVariableTarget]::Process)
                    
                    # Weryfikuj zapis
                    $verifyValue = [Environment]::GetEnvironmentVariable($currentKey, "Process")
                    if ($null -eq $verifyValue -or $verifyValue -ne $finalValue) {
                        Write-Warning "  WARNING: Value for $currentKey may not have been saved correctly (expected length: $($finalValue.Length), got: $($verifyValue.Length))"
                    }
                    
                    $loadedCount++
                    
                    if ($currentKey -match 'KEY|TOKEN|SECRET|PASSWORD') {
                        Write-Host "  ✓ Loaded: $currentKey = [HIDDEN - $($finalValue.Length) chars]" -ForegroundColor Green
                    } else {
                        Write-Host "  ✓ Loaded: $currentKey = $finalValue" -ForegroundColor Green
                    }
                }
                
                # Rozpocznij nową parę klucz-wartość
                $currentKey = $matchedKey.Trim()
                if ($null -ne $matchedValue) {
                    $valuePart = $matchedValue
                    # Nie trimuj wartości na początku - może zawierać spacje na początku/końcu
                    if (-not [string]::IsNullOrWhiteSpace($valuePart)) {
                        $currentValue = @($valuePart)
                    } else {
                        $currentValue = @()
                    }
                } else {
                    $currentValue = @()
                }
            }
        } else {
            # Kontynuacja wartości z poprzedniej linii (linia bez znaku =)
            if ($null -ne $currentKey) {
                $currentValue += $trimmedLine
            }
        }
    }
    
    # Zapisz ostatnią parę klucz-wartość
    if ($null -ne $currentKey) {
        if ($currentValue.Count -gt 0) {
            $finalValue = ($currentValue -join '').Trim()
        } else {
            $finalValue = ""
        }
        
        # Usuń cudzysłowy z początku i końca (tylko jeśli są na początku i końcu)
        if ($finalValue.Length -ge 2) {
            if (($finalValue.StartsWith('"') -and $finalValue.EndsWith('"')) -or
                ($finalValue.StartsWith("'") -and $finalValue.EndsWith("'"))) {
                $finalValue = $finalValue.Substring(1, $finalValue.Length - 2)
            }
        }
        
        # Zapisz nawet jeśli puste (może być celowo puste)
        # Użyj bezpośredniego przypisania przez [Environment]::SetEnvironmentVariable
        [Environment]::SetEnvironmentVariable($currentKey, $finalValue, [EnvironmentVariableTarget]::Process)
        
        # Weryfikuj zapis
        $verifyValue = [Environment]::GetEnvironmentVariable($currentKey, [EnvironmentVariableTarget]::Process)
        if ($null -eq $verifyValue -or $verifyValue -ne $finalValue) {
            Write-Warning "  ⚠ Warning: Value for $currentKey may not have been saved correctly (expected length: $($finalValue.Length), got: $($verifyValue.Length))"
        }
        
        $loadedCount++
        
        if ($currentKey -match 'KEY|TOKEN|SECRET|PASSWORD') {
            Write-Host "  ✓ Loaded: $currentKey = [HIDDEN - $($finalValue.Length) chars]" -ForegroundColor Green
        } else {
            Write-Host "  ✓ Loaded: $currentKey = $finalValue" -ForegroundColor Green
        }
    }
    
    Write-Host "Loaded $loadedCount environment variables from .env" -ForegroundColor Cyan
    Write-Host ""
}

# Wczytaj .env jeśli istnieje
Load-EnvFile

# Po wczytaniu, odśwież zmienne środowiskowe z Process scope
# PowerShell automatycznie synchronizuje [Environment]::SetEnvironmentVariable z $env:
# Ale czasami trzeba wymusić odświeżenie przez bezpośrednie przypisanie
$tempUrl = [Environment]::GetEnvironmentVariable("PUBLIC_SUPABASE_URL", [EnvironmentVariableTarget]::Process)
if ($null -ne $tempUrl -and $tempUrl.Length -gt 0) { 
    $env:PUBLIC_SUPABASE_URL = $tempUrl 
    $urlLen = $tempUrl.Length
    Write-Host "[OK] Refreshed PUBLIC_SUPABASE_URL from Environment (length: $urlLen)" -ForegroundColor Gray
}

$tempAnonKey = [Environment]::GetEnvironmentVariable("PUBLIC_SUPABASE_ANON_KEY", [EnvironmentVariableTarget]::Process)
if ($null -ne $tempAnonKey -and $tempAnonKey.Length -gt 0) { 
    $env:PUBLIC_SUPABASE_ANON_KEY = $tempAnonKey 
    $anonKeyLen = $tempAnonKey.Length
    Write-Host "[OK] Refreshed PUBLIC_SUPABASE_ANON_KEY from Environment (length: $anonKeyLen)" -ForegroundColor Gray
} else {
    Write-Warning "PUBLIC_SUPABASE_ANON_KEY not found in Environment after loading .env file"
    $isNull = $null -eq $tempAnonKey
    $len = if ($tempAnonKey) { $tempAnonKey.Length } else { 'N/A' }
    Write-Host "  Debug: tempAnonKey is null: $isNull, length: $len" -ForegroundColor Yellow
}

$tempApiKey = [Environment]::GetEnvironmentVariable("OPENROUTER_API_KEY", [EnvironmentVariableTarget]::Process)
if ($null -ne $tempApiKey -and $tempApiKey.Length -gt 0) { 
    $env:OPENROUTER_API_KEY = $tempApiKey 
}

# URL Twojego projektu Supabase (z .env lub domyślny)
$supabaseUrl = $env:PUBLIC_SUPABASE_URL
if ([string]::IsNullOrWhiteSpace($supabaseUrl)) {
    $supabaseUrl = "https://lfogeotxmdekvfstkais.supabase.co"
    Write-Warning "PUBLIC_SUPABASE_URL not found in .env, using default: $supabaseUrl"
} else {
    Write-Host "[OK] Using PUBLIC_SUPABASE_URL from .env: $supabaseUrl" -ForegroundColor Green
}

# Twój anon key z Supabase (z .env lub zmiennych środowiskowych)
# Sprawdź bezpośrednio z Environment, jeśli zmienna środowiskowa nie działa
$supabaseAnonKey = $env:PUBLIC_SUPABASE_ANON_KEY
if ([string]::IsNullOrWhiteSpace($supabaseAnonKey)) {
    # Spróbuj odczytać bezpośrednio z Environment
    $supabaseAnonKey = [Environment]::GetEnvironmentVariable("PUBLIC_SUPABASE_ANON_KEY", [EnvironmentVariableTarget]::Process)
    if ($null -ne $supabaseAnonKey -and $supabaseAnonKey.Length -gt 0) {
        # Ustaw również w zmiennej środowiskowej dla dalszego użycia
        $env:PUBLIC_SUPABASE_ANON_KEY = $supabaseAnonKey
        $anonKeyLen = $supabaseAnonKey.Length
        Write-Host "[OK] Loaded PUBLIC_SUPABASE_ANON_KEY directly from Environment (length: $anonKeyLen)" -ForegroundColor Gray
    }
}

if ([string]::IsNullOrWhiteSpace($supabaseAnonKey)) {
    Write-Error "PUBLIC_SUPABASE_ANON_KEY not found in .env or environment variables!"
    Write-Host "Please set PUBLIC_SUPABASE_ANON_KEY in .env file or environment variables." -ForegroundColor Red
    Write-Host ""
    Write-Host "Example .env file:" -ForegroundColor Yellow
    Write-Host "  PUBLIC_SUPABASE_URL=https://your-project.supabase.co" -ForegroundColor Yellow
    Write-Host "  PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Debug: Checking environment variable..." -ForegroundColor Yellow
    Write-Host "  PUBLIC_SUPABASE_ANON_KEY value: $supabaseAnonKey" -ForegroundColor Yellow
    Write-Host "  Is null or whitespace: $([string]::IsNullOrWhiteSpace($supabaseAnonKey))" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "[OK] Using PUBLIC_SUPABASE_ANON_KEY from .env (length: $($supabaseAnonKey.Length) chars)" -ForegroundColor Green
}
Write-Host ""

# Token JWT użytkownika (z Supabase Auth)
# Możesz go uzyskać na kilka sposobów:
# 1. Z pliku .env (SUPABASE_ACCESS_TOKEN=...)
# 2. Automatycznie przez logowanie (jeśli masz SUPABASE_TEST_EMAIL i SUPABASE_TEST_PASSWORD w .env)
# 3. Z przeglądarki (DevTools -> Application -> Local Storage -> supabase.auth.token)

$accessToken = $env:SUPABASE_ACCESS_TOKEN

# Sprawdź, czy token jest prawidłowym JWT (powinien mieć 3 części oddzielone kropkami)
$isValidJWT = $false
if (-not [string]::IsNullOrWhiteSpace($accessToken)) {
    $tokenParts = $accessToken -split '\.'
    if ($tokenParts.Count -eq 3) {
        $isValidJWT = $true
        Write-Host "[OK] Using SUPABASE_ACCESS_TOKEN from .env" -ForegroundColor Green
    } else {
        Write-Warning "SUPABASE_ACCESS_TOKEN in .env is not a valid JWT token (expected 3 parts, got $($tokenParts.Count))"
        Write-Host "  Current value starts with: $($accessToken.Substring(0, [Math]::Min(30, $accessToken.Length)))..." -ForegroundColor Yellow
        Write-Host "  This looks like a publishable key, not a JWT token. Attempting auto-login..." -ForegroundColor Yellow
        $accessToken = $null  # Reset, aby spróbować automatycznego logowania
    }
}

# Jeśli token nie jest ustawiony lub nie jest prawidłowy, spróbuj automatycznie zalogować się
if ([string]::IsNullOrWhiteSpace($accessToken) -or -not $isValidJWT) {
    $testEmail = $env:SUPABASE_TEST_EMAIL
    $testPassword = $env:SUPABASE_TEST_PASSWORD
    
    if (-not [string]::IsNullOrWhiteSpace($testEmail) -and -not [string]::IsNullOrWhiteSpace($testPassword)) {
        Write-Host "Attempting to login to get access token..." -ForegroundColor Cyan
        try {
            $loginBody = @{
                email = $testEmail
                password = $testPassword
            } | ConvertTo-Json
            
            $loginResponse = Invoke-RestMethod -Uri "$supabaseUrl/auth/v1/token?grant_type=password" `
                -Method POST `
                -Headers @{
                    "apikey" = $supabaseAnonKey
                    "Content-Type" = "application/json"
                } `
                -Body $loginBody
            
            $accessToken = $loginResponse.access_token
            $env:SUPABASE_ACCESS_TOKEN = $accessToken
            Write-Host "[OK] Successfully logged in and obtained access token" -ForegroundColor Green
        } catch {
            Write-Warning "Failed to login automatically: $($_.Exception.Message)"
            Write-Host "You can still set SUPABASE_ACCESS_TOKEN manually in .env file" -ForegroundColor Yellow
        }
    } else {
        Write-Warning "SUPABASE_ACCESS_TOKEN not found. Some tests may fail with 401 Unauthorized."
        Write-Host "To get access token, you can:" -ForegroundColor Yellow
        Write-Host "  1. Add SUPABASE_TEST_EMAIL and SUPABASE_TEST_PASSWORD to .env (for auto-login)" -ForegroundColor Yellow
        Write-Host "  2. Or add SUPABASE_ACCESS_TOKEN to .env (manual token)" -ForegroundColor Yellow
        Write-Host "  3. Or get it from browser DevTools -> Local Storage -> supabase.auth.token" -ForegroundColor Yellow
    }
    Write-Host ""
}

# ID decku do testowania
$deckId = 1

# ID fiszki do testowania (opcjonalne)
$flashcardId = 1

# ============================================================================
# TEST 1: Lista wszystkich fiszek w decku
# ============================================================================

Write-Host "=== Test 1: Lista wszystkich fiszek w decku ===" -ForegroundColor Cyan
Write-Host ""

$url = "$supabaseUrl/rest/v1/flashcards?deck_id=eq.$deckId" + '&select=*' + '&order=created_at.desc'

Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host ""

try {
    $headers = @{
        "apikey" = $supabaseAnonKey
        "Content-Type" = "application/json"
    }
    if (-not [string]::IsNullOrWhiteSpace($accessToken)) {
        $headers["Authorization"] = "Bearer $accessToken"
    }
    
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
    
    Write-Host "Success! Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Green
    Write-Host ""
    Write-Host "Liczba fiszek: $($response.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Error details:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    
    # Try to parse error response
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# TEST 2: Pobierz pojedynczą fiszkę po ID
# ============================================================================

Write-Host "=== Test 2: Pobierz pojedyncza fiszke po ID ===" -ForegroundColor Cyan
Write-Host ""

$url = "$supabaseUrl/rest/v1/flashcards?id=eq.$flashcardId" + '&select=*'

Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host ""

try {
    $headers = @{
        "apikey" = $supabaseAnonKey
        "Content-Type" = "application/json"
    }
    if (-not [string]::IsNullOrWhiteSpace($accessToken)) {
        $headers["Authorization"] = "Bearer $accessToken"
    }
    
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
    
    Write-Host "Success! Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Green
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Error details:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# TEST 2.5: Sprawdź/utwórz deck dla użytkownika (wymagane przed Test 3)
# ============================================================================

Write-Host "=== Test 2.5: Sprawdz/utworz deck dla uzytkownika ===" -ForegroundColor Cyan
Write-Host ""

# Najpierw pobierz user_id z tokenu JWT przez Supabase Auth API
$userId = $null
if (-not [string]::IsNullOrWhiteSpace($accessToken)) {
    try {
        $userInfoUrl = "$supabaseUrl/auth/v1/user"
        $userInfoHeaders = @{
            "apikey" = $supabaseAnonKey
            "Authorization" = "Bearer $accessToken"
        }
        
        $userInfoResponse = Invoke-RestMethod -Uri $userInfoUrl -Method Get -Headers $userInfoHeaders
        $userId = $userInfoResponse.id
        Write-Host "[OK] Retrieved user_id from token: $userId" -ForegroundColor Green
    } catch {
        Write-Warning "Failed to get user_id from token: $($_.Exception.Message)"
    }
}

if ([string]::IsNullOrWhiteSpace($userId)) {
    Write-Warning "Cannot get user_id. Test 3 may fail."
    Write-Host "Test 3 will use deck_id = $deckId (may fail if deck doesn't exist or doesn't belong to user)" -ForegroundColor Yellow
} else {
    $decksUrl = "$supabaseUrl/rest/v1/decks?select=id,name&order=created_at.desc&limit=1"
    
    try {
        $headers = @{
            "apikey" = $supabaseAnonKey
            "Content-Type" = "application/json"
        }
        if (-not [string]::IsNullOrWhiteSpace($accessToken)) {
            $headers["Authorization"] = "Bearer $accessToken"
        }
        
        $decksResponse = Invoke-RestMethod -Uri $decksUrl -Method Get -Headers $headers
        
        if ($decksResponse -and $decksResponse.Count -gt 0) {
            $deckId = $decksResponse[0].id
            Write-Host "[OK] Found deck ID: $deckId (name: $($decksResponse[0].name))" -ForegroundColor Green
        } else {
            Write-Host "No decks found. Creating a new deck..." -ForegroundColor Yellow
            
            # Utwórz nowy deck (tylko name i user_id są wymagane)
            $createDeckUrl = "$supabaseUrl/rest/v1/decks"
            $createDeckBody = @{
                name = "Test Deck"
                user_id = $userId
            } | ConvertTo-Json
            
            $createDeckHeaders = @{
                "apikey" = $supabaseAnonKey
                "Content-Type" = "application/json"
                "Prefer" = "return=representation"
            }
            if (-not [string]::IsNullOrWhiteSpace($accessToken)) {
                $createDeckHeaders["Authorization"] = "Bearer $accessToken"
            }
            
            try {
                $newDeckResponse = Invoke-RestMethod -Uri $createDeckUrl -Method Post -Headers $createDeckHeaders -Body $createDeckBody
                
                if ($newDeckResponse -and $newDeckResponse.Count -gt 0) {
                    $deckId = $newDeckResponse[0].id
                    Write-Host "[OK] Created new deck ID: $deckId" -ForegroundColor Green
                } else {
                    Write-Warning "Failed to create deck. Test 3 may fail."
                }
            } catch {
                Write-Host "Error creating deck:" -ForegroundColor Red
                Write-Host $_.Exception.Message -ForegroundColor Red
                
                if ($_.ErrorDetails.Message) {
                    Write-Host "Error details:" -ForegroundColor Red
                    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
                    
                    # Try to parse error JSON
                    try {
                        $errorJson = $_.ErrorDetails.Message | ConvertFrom-Json
                        if ($errorJson.message) {
                            Write-Host "Error message: $($errorJson.message)" -ForegroundColor Red
                        }
                        if ($errorJson.hint) {
                            Write-Host "Hint: $($errorJson.hint)" -ForegroundColor Yellow
                        }
                    } catch {
                        # Ignore JSON parsing errors
                    }
                }
                
                # Try to get response body from exception
                if ($_.Exception.Response) {
                    try {
                        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                        $responseBody = $reader.ReadToEnd()
                        Write-Host "Response body:" -ForegroundColor Red
                        Write-Host $responseBody -ForegroundColor Red
                    } catch {
                        # Ignore stream reading errors
                    }
                }
                
                Write-Host "Test 3 will use deck_id = $deckId (may fail if deck doesn't exist or doesn't belong to user)" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Warning "Failed to check/create deck: $($_.Exception.Message)"
        Write-Host "Test 3 will use deck_id = $deckId (may fail if deck doesn't exist or doesn't belong to user)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# TEST 3: Utwórz nową fiszkę (używa naszego endpointu /api/flashcards)
# ============================================================================

Write-Host "=== Test 3: Utworz nowa fiszke (przez /api/flashcards) ===" -ForegroundColor Cyan
Write-Host ""

# URL naszego Astro API endpointu
# Jeśli Astro dev server działa lokalnie, użyj localhost:3000 (domyślny port w astro.config.mjs)
# W przeciwnym razie użyj produkcyjnego URL (jeśli dostępny)
$astroApiUrl = $env:ASTRO_API_URL
if ([string]::IsNullOrWhiteSpace($astroApiUrl)) {
    $astroApiUrl = "http://localhost:3000"
    Write-Host "ASTRO_API_URL not set, using default: $astroApiUrl" -ForegroundColor Yellow
    Write-Host "Make sure Astro dev server is running (npm run dev)" -ForegroundColor Yellow
    Write-Host ""
}

# Sprawdź, czy serwer Astro działa (opcjonalnie)
$serverCheckUrl = "$astroApiUrl"
try {
    $null = Invoke-WebRequest -Uri $serverCheckUrl -Method Get -TimeoutSec 2 -ErrorAction Stop
    Write-Host "[OK] Astro server appears to be running at $astroApiUrl" -ForegroundColor Green
} catch {
    Write-Warning "Cannot connect to Astro server at $astroApiUrl"
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "  Please start the Astro dev server: npm run dev" -ForegroundColor Yellow
    Write-Host ""
}

$url = "$astroApiUrl/api/flashcards"

# Format kursu (front/back) zamiast formatu Supabase (question/correct_answer)
$body = @{
    deck_id = $deckId
    flashcards = @(
        @{
            front = "What is photosynthesis?"
            back = "The process by which plants convert light energy into chemical energy"
            source = "manual"
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host "Body: $body" -ForegroundColor Yellow
Write-Host ""

try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    if (-not [string]::IsNullOrWhiteSpace($accessToken)) {
        $headers["Authorization"] = "Bearer $accessToken"
    } else {
        Write-Warning "No access token available. Test may fail with 401 Unauthorized."
    }
    
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
    
    Write-Host "Success! Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Green
    
    if ($response.flashcards -and $response.flashcards.Count -gt 0) {
        Write-Host ""
        Write-Host "Utworzona fiszka ID: $($response.flashcards[0].id)" -ForegroundColor Cyan
        Write-Host "Total created: $($response.total_created)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    # Sprawdź, czy to błąd połączenia
    if ($_.Exception.Message -match "Nie można połączyć|Cannot connect|Connection refused|Connection timeout") {
        Write-Host ""
        Write-Host "The Astro dev server is not running or not accessible." -ForegroundColor Yellow
        Write-Host "To fix this:" -ForegroundColor Yellow
        Write-Host "  1. Start the Astro dev server: npm run dev" -ForegroundColor Yellow
        Write-Host "  2. Wait for it to start (usually on http://localhost:4321)" -ForegroundColor Yellow
        Write-Host "  3. Run this test again" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Alternatively, you can test the Supabase REST API directly" -ForegroundColor Yellow
        Write-Host "  (but you'll need to use Supabase format: question/correct_answer instead of front/back)" -ForegroundColor Yellow
    } else {
        if ($_.ErrorDetails.Message) {
            Write-Host "Error details:" -ForegroundColor Red
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
            
            # Try to parse error JSON
            try {
                $errorJson = $_.ErrorDetails.Message | ConvertFrom-Json
                if ($errorJson.error) {
                    Write-Host "Error code: $($errorJson.error.code)" -ForegroundColor Red
                    Write-Host "Error message: $($errorJson.error.message)" -ForegroundColor Red
                    if ($errorJson.error.details) {
                        Write-Host "Error details:" -ForegroundColor Red
                        Write-Host ($errorJson.error.details | ConvertTo-Json -Depth 10) -ForegroundColor Red
                    }
                }
            } catch {
                # Ignore JSON parsing errors
            }
        }
        
        # Try to get response body from exception
        if ($_.Exception.Response) {
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "Response body:" -ForegroundColor Red
                Write-Host $responseBody -ForegroundColor Red
            } catch {
                # Ignore stream reading errors
            }
        }
    }
}

Write-Host ""
$separator = "========================================"
Write-Host $separator -ForegroundColor Cyan
Write-Host ""

Write-Host 'Aby uruchomic wiecej testow, edytuj plik i odkomentuj odpowiednie sekcje.' -ForegroundColor Yellow

