# Test script for Flashcards API endpoints
# Usage: .\test-flashcards-api.ps1

# ============================================================================
# KONFIGURACJA - ZASTĄP TYMI WARTOŚCIAMI
# ============================================================================

# URL Twojego projektu Supabase
$supabaseUrl = "https://lfogeotxmdekvfstkais.supabase.co"

# Twój anon key z Supabase (z .env lub Dashboard)
$supabaseAnonKey = "YOUR_ANON_KEY_HERE"

# Token JWT użytkownika (z Supabase Auth)
# Możesz go uzyskać z przeglądarki (DevTools → Application → Local Storage → supabase.auth.token)
$accessToken = "YOUR_ACCESS_TOKEN_HERE"

# ID decku do testowania
$deckId = 1

# ID fiszki do testowania (opcjonalne)
$flashcardId = 1

# ============================================================================
# TEST 1: Lista wszystkich fiszek w decku
# ============================================================================

Write-Host "=== Test 1: Lista wszystkich fiszek w decku ===" -ForegroundColor Cyan
Write-Host ""

$url = "$supabaseUrl/rest/v1/flashcards?deck_id=eq.$deckId&select=*&order=created_at.desc"

Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers @{
        "apikey" = $supabaseAnonKey
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
    }
    
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

Write-Host "=== Test 2: Pobierz pojedynczą fiszkę po ID ===" -ForegroundColor Cyan
Write-Host ""

$url = "$supabaseUrl/rest/v1/flashcards?id=eq.$flashcardId&select=*"

Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers @{
        "apikey" = $supabaseAnonKey
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
    }
    
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
# TEST 3: Utwórz nową fiszkę
# ============================================================================

Write-Host "=== Test 3: Utwórz nową fiszkę ===" -ForegroundColor Cyan
Write-Host ""

$url = "$supabaseUrl/rest/v1/flashcards"

$body = @{
    deck_id = $deckId
    question = "What is photosynthesis?"
    correct_answer = "The process by which plants convert light energy into chemical energy"
    image_url = $null
} | ConvertTo-Json

Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host "Body: $body" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers @{
        "apikey" = $supabaseAnonKey
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
        "Prefer" = "return=representation"
    } -Body $body
    
    Write-Host "Success! Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Green
    
    if ($response -is [array] -and $response.Count -gt 0) {
        Write-Host ""
        Write-Host "Utworzona fiszka ID: $($response[0].id)" -ForegroundColor Cyan
    }
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

Write-Host "Aby uruchomić więcej testów, edytuj plik i odkomentuj odpowiednie sekcje." -ForegroundColor Yellow

