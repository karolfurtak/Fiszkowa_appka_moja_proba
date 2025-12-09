# Test script for generate-flashcards endpoint
# Usage: .\test-openrouter.ps1

# Configuration
# Option 1: Use Astro API proxy endpoint (recommended for frontend integration)
$localAstroUrl = "http://localhost:3000/api/generations"
$productionAstroUrl = "https://YOUR_DOMAIN.com/api/generations"

# Option 2: Use Supabase Edge Function directly
$localSupabaseUrl = "http://localhost:54321/functions/v1/generate-flashcards"
$productionSupabaseUrl = "https://lfogeotxmdekvfstkais.supabase.co/functions/v1/generate-flashcards"

# Choose which URL to use
# For testing with Astro frontend, use Astro URL
# For direct testing of Edge Function, use Supabase URL
$baseUrl = $localAstroUrl  # Change to $localSupabaseUrl to test Edge Function directly

# Test data - longer text to ensure AI generates proper flashcards
$testText = @"
Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that can later be released to fuel the organism's activities. This chemical energy is stored in carbohydrate molecules, such as sugars, which are synthesized from carbon dioxide and water. In most cases, oxygen is also released as a waste product. Most plants, most algae, and cyanobacteria perform photosynthesis; such organisms are called photoautotrophs. Photosynthesis is largely responsible for producing and maintaining the oxygen content of the Earth's atmosphere, and supplies most of the energy necessary for life on Earth.

The process of photosynthesis occurs in two main stages: the light-dependent reactions and the light-independent reactions (also known as the Calvin cycle). During the light-dependent reactions, which take place in the thylakoid membranes of chloroplasts, chlorophyll and other pigments absorb light energy and convert it into chemical energy in the form of ATP and NADPH. Water molecules are split, releasing oxygen as a byproduct.

In the light-independent reactions, which occur in the stroma of chloroplasts, the ATP and NADPH produced during the light-dependent reactions are used to convert carbon dioxide into organic compounds, particularly glucose. This process is also known as carbon fixation. The overall equation for photosynthesis can be written as: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2.

Photosynthesis is crucial for life on Earth because it produces oxygen and organic compounds that serve as food for other organisms. Without photosynthesis, life as we know it would not exist. The process also plays a key role in the carbon cycle, helping to regulate the amount of carbon dioxide in the atmosphere.
"@

# Request body as hashtable (PowerShell will convert to JSON)
# Using source_text as per course requirements (10xDevs)
$bodyObject = @{
    source_text = $testText
    domain = "Biology"
}

# Convert to JSON string for display
$bodyJson = $bodyObject | ConvertTo-Json -Depth 10

Write-Host "Sending request to: $baseUrl" -ForegroundColor Cyan
Write-Host "Request body:" -ForegroundColor Yellow
Write-Host $bodyJson -ForegroundColor Gray
Write-Host ""

try {
    # Use Invoke-WebRequest with hashtable body (PowerShell auto-converts to JSON)
    $response = Invoke-WebRequest -Uri $baseUrl -Method Post -Body ($bodyObject | ConvertTo-Json) -ContentType "application/json; charset=utf-8" -UseBasicParsing -ErrorAction Stop
    
    # Parse JSON response
    $responseData = $response.Content | ConvertFrom-Json
    
    Write-Host "Success! Response:" -ForegroundColor Green
    Write-Host ($responseData | ConvertTo-Json -Depth 10) -ForegroundColor Green
    
    # Display summary
    if ($responseData.proposals) {
        Write-Host "`nGenerated proposals: $($responseData.proposals.Count)" -ForegroundColor Cyan
        Write-Host "Generation session ID: $($responseData.generation_session_id)" -ForegroundColor Cyan
        Write-Host "Detected domain: $($responseData.detected_domain)" -ForegroundColor Cyan
        
        Write-Host "`nProposal details:" -ForegroundColor Yellow
        foreach ($proposal in $responseData.proposals) {
            Write-Host "  - ID: $($proposal.id), Question length: $($proposal.question.Length), Status: $($proposal.status)" -ForegroundColor Gray
        }
    }
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

