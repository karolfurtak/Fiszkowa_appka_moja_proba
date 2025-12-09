# Check project status
Write-Host "=== 10xCards Project Status ===" -ForegroundColor Cyan
Write-Host ""

# Check if Astro dev server is running
Write-Host "Checking Astro dev server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "[OK] Astro dev server is running on http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Astro dev server is NOT running" -ForegroundColor Red
    Write-Host "  Run: npm run dev" -ForegroundColor Gray
}

Write-Host ""

# Check if Supabase is running locally
Write-Host "Checking local Supabase..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:54321" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "[OK] Local Supabase is running on http://localhost:54321" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Local Supabase is NOT running" -ForegroundColor Red
    Write-Host "  (This is OK if you are using remote Supabase)" -ForegroundColor Gray
    Write-Host "  To start locally: npx supabase start (requires Docker Desktop)" -ForegroundColor Gray
}

Write-Host ""

# Check .env file
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "[OK] .env file exists" -ForegroundColor Green
    
    # Check for required variables
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "PUBLIC_SUPABASE_URL") {
        Write-Host "  [OK] PUBLIC_SUPABASE_URL is configured" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] PUBLIC_SUPABASE_URL is missing" -ForegroundColor Red
    }
    
    if ($envContent -match "PUBLIC_SUPABASE_ANON_KEY") {
        Write-Host "  [OK] PUBLIC_SUPABASE_ANON_KEY is configured" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] PUBLIC_SUPABASE_ANON_KEY is missing" -ForegroundColor Red
    }
} else {
    Write-Host "[FAIL] .env file does NOT exist" -ForegroundColor Red
    Write-Host "  Create .env file with:" -ForegroundColor Gray
    Write-Host "    PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co" -ForegroundColor Gray
    Write-Host "    PUBLIC_SUPABASE_ANON_KEY=your-anon-key" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== API Endpoint ===" -ForegroundColor Cyan
Write-Host "Endpoint: http://localhost:3000/api/generations" -ForegroundColor Yellow
Write-Host "Method: POST" -ForegroundColor Yellow
Write-Host ""
Write-Host "To test, run the test script" -ForegroundColor Cyan
