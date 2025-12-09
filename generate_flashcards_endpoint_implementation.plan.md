# API Endpoint Implementation Plan: Generate Flashcards

## 1. Przegląd punktu końcowego

Endpoint `/functions/v1/generate-flashcards` to Supabase Edge Function, która:

- Przyjmuje tekst źródłowy i opcjonalną domenę wiedzy
- Wysyła zapytanie do OpenRouter.ai API w celu wygenerowania propozycji fiszek
- Automatycznie wykrywa domenę wiedzy, jeśli nie została podana
- Zapisuje wszystkie wygenerowane propozycje do tabeli `flashcard_proposals` ze statusem `pending`
- Grupuje propozycje z jednej generacji za pomocą `generation_session_id`
- Zwraca listę propozycji wraz z wykrytą domeną i identyfikatorem sesji

**Lokalizacja implementacji:** `supabase/functions/generate-flashcards/index.ts`

## 2. Szczegóły żądania

- **Metoda HTTP:** `POST`
- **Struktura URL:** `/functions/v1/generate-flashcards`
- **Headers:**
  - `Authorization: Bearer {access_token}` - Wymagane, token JWT użytkownika
  - `Content-Type: application/json` - Wymagane
- **Request Body:**
  ```typescript
  {
    text: string;        // Wymagane, min 100 znaków (sugerowane)
    domain?: string;     // Opcjonalne, max 100 znaków
  }
  ```

- **Walidacja wejściowa:**
  - `text`: Wymagane, nie może być pustym stringiem, min długość 100 znaków (aby zapewnić sensowną treść do analizy)
  - `domain`: Opcjonalne, jeśli podane - max 100 znaków, jeśli nie podane - AI wykryje automatycznie

## 3. Wykorzystywane typy

Z pliku `src/types.ts`:

- **Request DTO:**
  ```typescript
  GenerateFlashcardsRequest {
    text: string;
    domain?: string;
  }
  ```

- **Response DTO:**
  ```typescript
  GenerateFlashcardsResponse {
    generation_session_id: string;
    proposals: Array<{
      id: number;
      question: string;
      correct_answer: string;
      domain: string | null;
      status: ProposalStatus;
    }>;
    detected_domain: string;
    total_generated: number;
  }
  ```

- **Database Types:**
  - `FlashcardProposal` - z `src/db/database.types.ts`
  - `TablesInsert<'flashcard_proposals'>` - dla insertów do bazy

## 4. Szczegóły odpowiedzi

### Sukces (200 OK)

```json
{
  "generation_session_id": "session-abc123",
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

### Błędy

- **400 Bad Request:** Nieprawidłowe dane wejściowe (brak tekstu, tekst za krótki)
- **401 Unauthorized:** Brak lub nieprawidłowy token autoryzacji
- **500 Internal Server Error:** Błąd OpenRouter.ai API, błąd bazy danych, błąd przetwarzania

## 5. Przepływ danych

1. **Walidacja żądania:**

   - Sprawdzenie obecności i ważności tokenu JWT
   - Walidacja `text` (wymagane, min długość)
   - Walidacja `domain` (jeśli podane)

2. **Pobranie user_id:**

   - Wyciągnięcie `user_id` z tokenu JWT (`auth.uid()`)

3. **Generacja generation_session_id:**

   - Utworzenie unikalnego identyfikatora sesji (np. `uuid` lub `timestamp-userid-random`)

4. **Przygotowanie promptu dla AI:**

   - Konstrukcja promptu dla OpenRouter.ai z instrukcjami generowania fiszek
   - Uwzględnienie opcjonalnej domeny wiedzy
   - Wymaganie formatu JSON w odpowiedzi

5. **Wywołanie OpenRouter.ai API:**

   - Wysłanie zapytania z tekstem źródłowym
   - Pobranie klucza API z Supabase Secrets
   - Obsługa odpowiedzi i parsowanie JSON

6. **Walidacja i przetwarzanie odpowiedzi AI:**

   - Parsowanie odpowiedzi JSON z listą fiszek
   - Walidacja każdej propozycji (question: 50-10000 znaków, correct_answer: max 500 znaków)
   - Filtrowanie nieprawidłowych propozycji

7. **Zapis do bazy danych:**

   - Dla każdej poprawnej propozycji: insert do `flashcard_proposals`
   - Ustawienie `user_id`, `status='pending'`, `generation_session_id`
   - Ustawienie `domain` (wykryta lub podana)

8. **Zwrócenie odpowiedzi:**

   - Zwrócenie listy zapisanych propozycji z ich ID
   - Zwrócenie `generation_session_id` i `detected_domain`
   - Zwrócenie `total_generated`

## 6. Względy bezpieczeństwa

1. **Autoryzacja:**

   - Weryfikacja tokenu JWT przez Supabase
   - Pobranie `user_id` z tokenu (nie z request body)
   - Weryfikacja, że użytkownik istnieje w `profiles`

2. **Ochrona klucza API:**

   - Klucz OpenRouter.ai przechowywany jako Supabase Secret
   - Dostęp tylko z Edge Function (server-side)
   - Nigdy nie eksponowany w odpowiedzi lub logach

3. **Walidacja danych:**

   - Walidacja długości tekstu wejściowego (zapobieganie atakom DoS)
   - Walidacja odpowiedzi AI przed zapisem do bazy
   - Sanityzacja danych przed zapisem

4. **Row Level Security:**

   - RLS w bazie danych zapewnia, że użytkownik może zapisywać tylko swoje propozycje
   - `user_id` ustawiane automatycznie z tokenu

5. **Rate Limiting:**

   - Rozważyć implementację rate limitingu na poziomie Edge Function
   - Ochrona przed nadużyciami API OpenRouter.ai

## 7. Obsługa błędów

### Scenariusze błędów i kody statusu:

1. **400 Bad Request:**

   - Brak pola `text` w request body
   - `text` jest pustym stringiem
   - `text` jest za krótki (< 100 znaków)
   - `domain` przekracza 100 znaków
   - Nieprawidłowy format JSON w request body

2. **401 Unauthorized:**

   - Brak nagłówka `Authorization`
   - Nieprawidłowy lub wygasły token JWT
   - Token nie zawiera `user_id`

3. **404 Not Found:**

   - Użytkownik nie istnieje w `profiles` (rzadki przypadek)

4. **500 Internal Server Error:**

   - Błąd połączenia z OpenRouter.ai API
   - Nieprawidłowa odpowiedź z OpenRouter.ai (nie JSON)
   - Błąd zapisu do bazy danych
   - Błąd pobrania klucza API z Supabase Secrets
   - Wszystkie propozycje zostały odrzucone podczas walidacji

### Format odpowiedzi błędu:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Logowanie błędów:

- Logowanie wszystkich błędów do Supabase Logs
- Nie logowanie wrażliwych danych (klucze API, pełne treści tekstów)
- Logowanie `generation_session_id` dla śledzenia

## 8. Rozważania dotyczące wydajności

1. **Optymalizacja zapytań AI:**

   - Ograniczenie długości tekstu wejściowego (np. max 10000 znaków)
   - Użycie efektywnego modelu AI (np. GPT-3.5-turbo dla kosztów)

2. **Batch Insert:**

   - Użycie bulk insert do zapisu wielu propozycji jednocześnie
   - Transakcyjność operacji (wszystko lub nic)

3. **Timeout:**

   - Ustawienie timeoutu dla zapytań do OpenRouter.ai (np. 30 sekund)
   - Timeout dla operacji bazy danych

4. **Caching (opcjonalnie):**

   - Rozważyć cache dla często generowanych domen
   - Nie krytyczne dla MVP

## 9. Etapy wdrożenia

### Krok 1: Utworzenie struktury Edge Function

- Utworzenie katalogu `supabase/functions/generate-flashcards/`
- Utworzenie pliku `index.ts` z podstawową strukturą Deno Edge Function
- Konfiguracja `deno.json` jeśli potrzebne

### Krok 2: Implementacja podstawowej struktury funkcji

- Import niezbędnych modułów (Supabase client, Deno)
- Implementacja handlera funkcji z typami
- Podstawowa walidacja request method (tylko POST)

### Krok 3: Implementacja autoryzacji

- Pobranie tokenu z nagłówka `Authorization`
- Weryfikacja tokenu przez Supabase
- Pobranie `user_id` z tokenu
- Weryfikacja istnienia użytkownika w `profiles`

### Krok 4: Implementacja walidacji danych wejściowych

- Walidacja obecności `text`
- Walidacja długości `text` (min 100 znaków)
- Walidacja `domain` (jeśli podane, max 100 znaków)
- Zwracanie odpowiednich błędów 400

### Krok 5: Implementacja generacji session_id

- Utworzenie funkcji generującej unikalny `generation_session_id`
- Format: `gen-{timestamp}-{user_id}-{random}` lub UUID

### Krok 6: Implementacja integracji z OpenRouter.ai

- Pobranie klucza API z Supabase Secrets
- Konstrukcja promptu dla AI z instrukcjami generowania fiszek
- Wysłanie zapytania do OpenRouter.ai API
- Obsługa odpowiedzi i parsowanie JSON

### Krok 7: Implementacja przetwarzania odpowiedzi AI

- Parsowanie odpowiedzi JSON
- Walidacja każdej propozycji:
  - `question`: 50-10000 znaków
  - `correct_answer`: max 500 znaków
  - Obecność wymaganych pól
- Filtrowanie nieprawidłowych propozycji

### Krok 8: Implementacja zapisu do bazy danych

- Przygotowanie danych do insertu (bulk insert)
- Ustawienie `user_id`, `status='pending'`, `generation_session_id`
- Ustawienie `domain` (wykryta lub podana)
- Wykonanie bulk insert do `flashcard_proposals`
- Obsługa błędów bazy danych

### Krok 9: Implementacja odpowiedzi sukcesu

- Konstrukcja odpowiedzi zgodnej z `GenerateFlashcardsResponse`
- Zwrócenie listy propozycji z ID z bazy danych
- Zwrócenie `generation_session_id`, `detected_domain`, `total_generated`

### Krok 10: Implementacja obsługi błędów

- Try-catch dla wszystkich operacji
- Mapowanie błędów na odpowiednie kody statusu HTTP
- Logowanie błędów (bez wrażliwych danych)
- Zwracanie ustandaryzowanych odpowiedzi błędów

### Krok 11: Konfiguracja Supabase Secrets

- Dodanie klucza OpenRouter.ai do Supabase Secrets
- Weryfikacja dostępu z Edge Function

### Krok 12: Testowanie

- Testy jednostkowe dla walidacji
- Testy integracyjne z mock OpenRouter.ai
- Testy end-to-end z rzeczywistym API
- Testy obsługi błędów

### Krok 13: Dokumentacja

- Dokumentacja promptu AI
- Dokumentacja formatu odpowiedzi OpenRouter.ai
- Przykłady użycia w README

## 10. Szczegóły techniczne

### Struktura pliku Edge Function:

```typescript
// supabase/functions/generate-flashcards/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Implementation
});
```

### Prompt dla OpenRouter.ai:

Prompt powinien zawierać:

- Instrukcje generowania fiszek w formacie JSON
- Wymaganie pytań (50-10000 znaków - elastyczne, mogą być zwięzłe lub szczegółowe)
- Wymaganie krótkich odpowiedzi (max 500 znaków)
- Wykrywanie domeny wiedzy, jeśli nie podana
- Format odpowiedzi: `{ flashcards: [{ question, correct_answer, domain }] }`

### Format odpowiedzi OpenRouter.ai:

```json
{
  "flashcards": [
    {
      "question": "Very long question text...",
      "correct_answer": "Short answer",
      "domain": "Biology"
    }
  ],
  "detected_domain": "Biology"
}
```

### Bulk Insert do bazy:

```typescript
const { data, error } = await supabase
  .from('flashcard_proposals')
  .insert(proposals)
  .select();
```