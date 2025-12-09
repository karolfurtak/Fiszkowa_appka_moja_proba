# Generate Flashcards Edge Function

This Supabase Edge Function generates flashcard proposals from text using OpenRouter.ai API.

## Endpoint

- **Path:** `/functions/v1/generate-flashcards`
- **Method:** `POST`
- **Authentication:** Not required (auth will be implemented comprehensively later)

### Local Development URL

When running locally with `npx supabase functions serve`:
- **Local URL:** `http://localhost:54321/functions/v1/generate-flashcards`
- **Note:** This is different from Astro dev server (`http://localhost:4321`)

### Production URL

When deployed to Supabase:
- **Production URL:** `https://lfogeotxmdekvfstkais.supabase.co/functions/v1/generate-flashcards`

## Request

### Headers
- `Content-Type: application/json` - Required

### Body
```json
{
  "text": "Photosynthesis is the process by which plants convert light energy into chemical energy...",
  "domain": "Biology"
}
```

### Parameters
- `text` (string, required): Source text to generate flashcards from. Minimum 100 characters, maximum 10000 characters.
- `domain` (string, optional): Domain of knowledge. If not provided, AI will detect it automatically. Maximum 100 characters.

## Response

### Success (200 OK)
```json
{
  "generation_session_id": "gen-1234567890-abc12345-xyz",
  "proposals": [
    {
      "id": 1,
      "question": "What is photosynthesis?",
      "correct_answer": "The process by which plants convert light energy into chemical energy",
      "domain": "Biology",
      "status": "pending"
    }
  ],
  "detected_domain": "Biology",
  "total_generated": 5
}
```

### Error Responses
- `400 Bad Request` - Invalid input (missing text, text too short/long, domain too long, no valid flashcards generated)
- `405 Method Not Allowed` - Only POST method is allowed
- `500 Internal Server Error` - AI service error (including timeout after 30 seconds), database error, or configuration error

## AI Prompt

The function uses a carefully crafted prompt to instruct the AI to:
1. Generate flashcards with questions between 50-10000 characters
2. Provide concise answers (max 500 characters)
3. Detect domain of knowledge if not provided
4. Return structured JSON response

## Environment Variables

This function requires the following environment variables (automatically provided by Supabase):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for database operations)
- `OPENROUTER_API_KEY` - OpenRouter.ai API key (must be set as Supabase secret)

## Debugging

### Checking Logs

If flashcards are not being generated, check the logs to see what OpenRouter is returning:

**Local Development:**
```powershell
# Logs will appear in the terminal where you ran `npm run functions:serve`
```

**Production (Supabase Dashboard):**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Edge Functions** → **generate-flashcards**
4. Click on **Logs** tab
5. Look for entries with `generation_session_id` to track specific requests

### Common Issues

**Issue: "No valid flashcards could be generated"**
- **Cause:** OpenRouter returned flashcards, but they don't meet validation requirements (question must be 50-10000 characters)
- **Solution:** Check logs for `questionLength` values. The AI model may not be generating long enough questions. Consider:
  - Using a different AI model
  - Adjusting the prompt to emphasize longer questions
  - Providing longer source text

**Issue: "Invalid response format from AI service"**
- **Cause:** OpenRouter returned a response that doesn't match expected JSON format
- **Solution:** Check logs for `contentPreview` to see what OpenRouter actually returned. The response may need different parsing.

**Issue: "AI service request timed out"**
- **Cause:** OpenRouter took longer than 30 seconds to respond
- **Solution:** Try with shorter source text or check OpenRouter service status

**Issue: "Failed to parse AI response as JSON"**
- **Cause:** OpenRouter returned JSON wrapped in markdown code blocks or invalid JSON
- **Solution:** Check logs for `contentPreview` to see the actual response format

### Log Fields to Check

When debugging, look for these log entries:
- `OpenRouter raw response` - Shows what OpenRouter returned
- `Parsed AI response` - Shows parsed flashcards and their lengths
- `Validation results` - Shows how many flashcards passed/failed validation
- `Flashcard rejected` - Shows why individual flashcards were rejected

## Testing with Postman

### Setup

1. **Start Supabase locally:**
   ```powershell
   npx supabase start
   ```

2. **Start Edge Function:**
   ```powershell
   npm run functions:serve
   ```

3. **Configure Postman:**
   - **Method:** `POST`
   - **URL:** `http://localhost:54321/functions/v1/generate-flashcards`
   - **Headers:**
     - `Content-Type: application/json`
   - **Body (raw JSON):**
     ```json
     {
       "text": "Photosynthesis is the process by which plants convert light energy into chemical energy. This process occurs in chloroplasts and involves two main stages: light-dependent reactions and light-independent reactions (Calvin cycle).",
       "domain": "Biology"
     }
     ```

### Common Issues

- **Getting HTML instead of JSON:** You're hitting Astro (`localhost:4321`) instead of Edge Function (`localhost:54321`)
- **Connection refused:** Make sure `npx supabase start` and `npm run functions:serve` are both running
- **Missing API key error:** Ensure `OPENROUTER_API_KEY` is set in `.env` and `supabase/config.toml` is configured

## Configuration

### Setting OpenRouter API Key

**Dla środowiska produkcyjnego (zdalnego):**

1. Go to Supabase Dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add secret: `OPENROUTER_API_KEY` with your OpenRouter.ai API key value

**Dla lokalnego developmentu:**

Możesz użyć pliku `.env` w katalogu głównym projektu. Dodaj do `supabase/config.toml` w sekcji `[edge_runtime.secrets]`:

```toml
[edge_runtime.secrets]
OPENROUTER_API_KEY = "env(OPENROUTER_API_KEY)"
```

Następnie dodaj do `.env`:
```env
OPENROUTER_API_KEY=your-openrouter-api-key
```

**Uwaga:** `.env` jest używany tylko lokalnie. W produkcji zawsze używaj Supabase Secrets.

## Database

Generated proposals are saved to the `flashcard_proposals` table with:
- `status`: `'pending'` (default)
- `generation_session_id`: Unique identifier for grouping proposals from the same generation (generated using MD5 hash)
- `user_id`: Set to default user ID (auth will be implemented comprehensively later)
- `domain`: Detected or provided domain

## Validation

- **Text length**: Minimum 100 characters, maximum 10000 characters (prevents DoS and optimizes AI costs)
- **Question length**: 50-10000 characters (enforced after AI generation)
- **Answer length**: Maximum 500 characters (enforced after AI generation)
- **Domain length**: Maximum 100 characters (if provided)

## Security

- Authentication is currently disabled (will be implemented comprehensively later)
- User ID is set to default value (`DEFAULT_USER_ID`)
- OpenRouter API key is stored as Supabase secret (never exposed)
- AI API requests have a 30-second timeout to prevent hanging requests
- Text length is limited to prevent DoS attacks
- Row Level Security (RLS) ensures users can only access their own proposals (when auth is implemented)

## Naming Convention

This API follows a consistent naming convention:
- **Fields with underscores**: Use `snake_case` (e.g., `generation_session_id`, `correct_answer`, `proposal_id`, `deck_id`)
- **Simple single-word fields**: Remain unchanged (e.g., `text`, `domain`, `status`, `id`)
- This ensures consistency with the database schema and API responses across all endpoints

