# Test script for /api/flashcards endpoint
# Tests endpoint functionality and integration with Supabase REST API

# Configuration
$baseUrl = "http://localhost:3000"
$supabaseUrl = $env:PUBLIC_SUPABASE_URL
$supabaseAnonKey = $env:PUBLIC_SUPABASE_ANON_KEY

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }

Write-Info "=========================================="
Write-Info "Testing /api/flashcards endpoint"
Write-Info "=========================================="
Write-Host ""

# Check environment variables
Write-Info "1. Checking environment variables..."
if (-not $supabaseUrl) {
    Write-Warning "PUBLIC_SUPABASE_URL not set in environment"
    Write-Info "Using default: http://localhost:54321"
    $supabaseUrl = "http://localhost:54321"
} else {
    Write-Success "PUBLIC_SUPABASE_URL: $supabaseUrl"
}

if (-not $supabaseAnonKey) {
    Write-Error "PUBLIC_SUPABASE_ANON_KEY not set in environment"
    Write-Info "Please set it in .env file or environment variables"
    exit 1
} else {
    Write-Success "PUBLIC_SUPABASE_ANON_KEY: Set (hidden)"
}
Write-Host ""

# Note: For testing, you need a valid access token
# This should be obtained from Supabase Auth (login)
Write-Warning "NOTE: You need a valid access_token from Supabase Auth to test this endpoint"
Write-Warning "Get it by logging in via Supabase Auth API"
Write-Host ""

# Prompt for access token
$accessToken = Read-Host "Enter your Supabase access_token (or press Enter to skip auth tests)"

if ([string]::IsNullOrWhiteSpace($accessToken)) {
    Write-Warning "Skipping authenticated tests. Testing only validation and error handling..."
    $skipAuthTests = $true
} else {
    Write-Success "Access token provided. Will test authenticated endpoints."
    $skipAuthTests = $false
}

Write-Host ""
Write-Info "=========================================="
Write-Info "Test 1: Missing Authorization Header"
Write-Info "=========================================="

$test1Body = @{
    deck_id = 1
    flashcards = @(
        @{
            front = "cat"
            back = "kot"
            source = "manual"
            generation_id = $null
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/flashcards" `
        -Method POST `
        -ContentType "application/json" `
        -Body $test1Body `
        -ErrorAction Stop
    
    Write-Error "TEST FAILED: Should return 401 Unauthorized"
    Write-Host "Response: $($response | ConvertTo-Json)"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Success "TEST PASSED: Returns 401 Unauthorized as expected"
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Info "Error message: $($errorResponse.error.message)"
    } else {
        Write-Error "TEST FAILED: Expected 401, got $statusCode"
    }
}
Write-Host ""

Write-Info "=========================================="
Write-Info "Test 2: Empty Request Body"
Write-Info "=========================================="

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/flashcards" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $accessToken" } `
        -Body "" `
        -ErrorAction Stop
    
    Write-Error "TEST FAILED: Should return 400 Bad Request"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "TEST PASSED: Returns 400 Bad Request as expected"
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Info "Error message: $($errorResponse.error.message)"
    } else {
        Write-Error "TEST FAILED: Expected 400, got $statusCode"
    }
}
Write-Host ""

Write-Info "=========================================="
Write-Info "Test 3: Missing flashcards array"
Write-Info "=========================================="

$test3Body = @{
    deck_id = 1
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/flashcards" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $accessToken" } `
        -Body $test3Body `
        -ErrorAction Stop
    
    Write-Error "TEST FAILED: Should return 400 Bad Request"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "TEST PASSED: Returns 400 Bad Request as expected"
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Info "Error message: $($errorResponse.error.message)"
    } else {
        Write-Error "TEST FAILED: Expected 400, got $statusCode"
    }
}
Write-Host ""

Write-Info "=========================================="
Write-Info "Test 4: Empty flashcards array"
Write-Info "=========================================="

$test4Body = @{
    deck_id = 1
    flashcards = @()
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/flashcards" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $accessToken" } `
        -Body $test4Body `
        -ErrorAction Stop
    
    Write-Error "TEST FAILED: Should return 400 Bad Request"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "TEST PASSED: Returns 400 Bad Request as expected"
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Info "Error message: $($errorResponse.error.message)"
    } else {
        Write-Error "TEST FAILED: Expected 400, got $statusCode"
    }
}
Write-Host ""

Write-Info "=========================================="
Write-Info "Test 5: Missing deck_id"
Write-Info "=========================================="

$test5Body = @{
    flashcards = @(
        @{
            front = "cat"
            back = "kot"
            source = "manual"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/flashcards" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $accessToken" } `
        -Body $test5Body `
        -ErrorAction Stop
    
    Write-Error "TEST FAILED: Should return 400 Bad Request"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "TEST PASSED: Returns 400 Bad Request as expected"
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Info "Error message: $($errorResponse.error.message)"
    } else {
        Write-Error "TEST FAILED: Expected 400, got $statusCode"
    }
}
Write-Host ""

Write-Info "=========================================="
Write-Info "Test 6: Question too short (< 2 characters)"
Write-Info "=========================================="

$test6Body = @{
    deck_id = 1
    flashcards = @(
        @{
            front = "a"  # Only 1 character
            back = "kot"
            source = "manual"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/flashcards" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $accessToken" } `
        -Body $test6Body `
        -ErrorAction Stop
    
    Write-Error "TEST FAILED: Should return 400 Bad Request"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "TEST PASSED: Returns 400 Bad Request as expected"
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Info "Error message: $($errorResponse.error.message)"
        if ($errorResponse.error.details.errors) {
            Write-Info "Validation error: $($errorResponse.error.details.errors[0].error)"
        }
    } else {
        Write-Error "TEST FAILED: Expected 400, got $statusCode"
    }
}
Write-Host ""

Write-Info "=========================================="
Write-Info "Test 7: Question too long (> 10000 characters)"
Write-Info "=========================================="

$longQuestion = "a" * 10001  # 10001 characters
$test7Body = @{
    deck_id = 1
    flashcards = @(
        @{
            front = $longQuestion
            back = "kot"
            source = "manual"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/flashcards" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $accessToken" } `
        -Body $test7Body `
        -ErrorAction Stop
    
    Write-Error "TEST FAILED: Should return 400 Bad Request"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "TEST PASSED: Returns 400 Bad Request as expected"
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Info "Error message: $($errorResponse.error.message)"
    } else {
        Write-Error "TEST FAILED: Expected 400, got $statusCode"
    }
}
Write-Host ""

Write-Info "=========================================="
Write-Info "Test 8: Answer too long (> 500 characters)"
Write-Info "=========================================="

$longAnswer = "a" * 501  # 501 characters
$test8Body = @{
    deck_id = 1
    flashcards = @(
        @{
            front = "cat"
            back = $longAnswer
            source = "manual"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/flashcards" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $accessToken" } `
        -Body $test8Body `
        -ErrorAction Stop
    
    Write-Error "TEST FAILED: Should return 400 Bad Request"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "TEST PASSED: Returns 400 Bad Request as expected"
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Info "Error message: $($errorResponse.error.message)"
    } else {
        Write-Error "TEST FAILED: Expected 400, got $statusCode"
    }
}
Write-Host ""

Write-Info "=========================================="
Write-Info "Test 9: Invalid source value"
Write-Info "=========================================="

$test9Body = @{
    deck_id = 1
    flashcards = @(
        @{
            front = "cat"
            back = "kot"
            source = "invalid"  # Should be "manual" or "ai"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/flashcards" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $accessToken" } `
        -Body $test9Body `
        -ErrorAction Stop
    
    Write-Error "TEST FAILED: Should return 400 Bad Request"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Success "TEST PASSED: Returns 400 Bad Request as expected"
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Info "Error message: $($errorResponse.error.message)"
    } else {
        Write-Error "TEST FAILED: Expected 400, got $statusCode"
    }
}
Write-Host ""

if (-not $skipAuthTests) {
    Write-Info "=========================================="
    Write-Info "Test 10: Valid flashcard creation (single word - 2 chars)"
    Write-Info "=========================================="
    
    $test10Body = @{
        deck_id = 1
        flashcards = @(
            @{
                front = "cat"  # 3 characters - valid
                back = "kot"
                source = "manual"
                generation_id = $null
            }
        )
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/flashcards" `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "Authorization" = "Bearer $accessToken" } `
            -Body $test10Body `
            -ErrorAction Stop
        
        Write-Success "TEST PASSED: Flashcard created successfully"
        Write-Info "Response: $($response | ConvertTo-Json -Depth 10)"
        Write-Info "Created flashcards: $($response.total_created)"
        if ($response.flashcards.Count -gt 0) {
            Write-Info "First flashcard ID: $($response.flashcards[0].id)"
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Error "TEST FAILED: Expected 201 Created, got $statusCode"
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Info "Error: $($errorResponse | ConvertTo-Json -Depth 10)"
    }
    Write-Host ""
    
    Write-Info "=========================================="
    Write-Info "Test 11: Valid flashcard creation (bulk - multiple flashcards)"
    Write-Info "=========================================="
    
    $test11Body = @{
        deck_id = 1
        flashcards = @(
            @{
                front = "dog"
                back = "pies"
                source = "manual"
                generation_id = $null
            },
            @{
                front = "house"
                back = "dom"
                source = "manual"
                generation_id = $null
            },
            @{
                front = "water"
                back = "woda"
                source = "manual"
                generation_id = $null
            }
        )
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/flashcards" `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "Authorization" = "Bearer $accessToken" } `
            -Body $test11Body `
            -ErrorAction Stop
        
        Write-Success "TEST PASSED: Multiple flashcards created successfully"
        Write-Info "Response: $($response | ConvertTo-Json -Depth 10)"
        Write-Info "Created flashcards: $($response.total_created)"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Error "TEST FAILED: Expected 201 Created, got $statusCode"
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Info "Error: $($errorResponse | ConvertTo-Json -Depth 10)"
    }
    Write-Host ""
    
    Write-Info "=========================================="
    Write-Info "Test 12: Invalid deck_id (non-existent deck)"
    Write-Info "=========================================="
    
    $test12Body = @{
        deck_id = 99999  # Non-existent deck
        flashcards = @(
            @{
                front = "test"
                back = "test"
                source = "manual"
            }
        )
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/flashcards" `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "Authorization" = "Bearer $accessToken" } `
            -Body $test12Body `
            -ErrorAction Stop
        
        Write-Error "TEST FAILED: Should return error for non-existent deck"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404 -or $statusCode -eq 400) {
            Write-Success "TEST PASSED: Returns error for non-existent deck (status: $statusCode)"
            $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Info "Error message: $($errorResponse.error.message)"
        } else {
            Write-Warning "TEST: Got status $statusCode (expected 404 or 400)"
        }
    }
    Write-Host ""
} else {
    Write-Warning "Skipping authenticated tests (no access token provided)"
}

Write-Info "=========================================="
Write-Info "Test Summary"
Write-Info "=========================================="
Write-Info "Tests completed. Review results above."
Write-Info ""
Write-Info "Next steps:"
Write-Info "1. Verify Supabase REST API integration"
Write-Info "2. Check database constraints match validation"
Write-Info "3. Test with real deck_id from your database"
Write-Info "4. Verify RLS policies allow flashcard creation"

