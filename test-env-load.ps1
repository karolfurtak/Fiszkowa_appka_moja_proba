# Test script to verify .env loading
. .\test-flashcards-api.ps1

Write-Host ""
Write-Host "=== Verification ===" -ForegroundColor Cyan
Write-Host "PUBLIC_SUPABASE_URL: $env:PUBLIC_SUPABASE_URL"
Write-Host "PUBLIC_SUPABASE_ANON_KEY length: $($env:PUBLIC_SUPABASE_ANON_KEY.Length)"
Write-Host "PUBLIC_SUPABASE_ANON_KEY first 20 chars: $($env:PUBLIC_SUPABASE_ANON_KEY.Substring(0, [Math]::Min(20, $env:PUBLIC_SUPABASE_ANON_KEY.Length)))"

