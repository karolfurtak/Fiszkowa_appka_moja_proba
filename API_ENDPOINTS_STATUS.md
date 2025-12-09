# Status Endpointów API - 10xCards

## ✅ Zaimplementowane Endpointy

### 1. Generowanie Fiszek (AI)
- **✅ POST `/api/generations`** (Astro API Proxy)
  - Lokalizacja: `src/pages/api/generations.ts`
  - Status: **DZIAŁA**
  - Proxy do Supabase Edge Function

- **✅ POST `/functions/v1/generate-flashcards`** (Supabase Edge Function)
  - Lokalizacja: `supabase/functions/generate-flashcards/index.ts`
  - Status: **DZIAŁA** (wdrożone)
  - Generuje propozycje fiszek z tekstu źródłowego

### 2. Supabase REST API (automatyczne)
- **✅ GET/POST/PATCH/DELETE `/rest/v1/profiles`**
  - Status: **DOSTĘPNE** (Supabase automatycznie)
  - Zarządzanie profilami użytkowników

- **✅ GET/POST/PATCH/DELETE `/rest/v1/decks`**
  - Status: **DOSTĘPNE** (Supabase automatycznie)
  - Zarządzanie kolekcjami fiszek

- **✅ GET/POST/PATCH/DELETE `/rest/v1/flashcards`**
  - Status: **DOSTĘPNE** (Supabase automatycznie)
  - Zarządzanie fiszkami

- **✅ GET/PATCH/DELETE `/rest/v1/flashcard_proposals`**
  - Status: **DOSTĘPNE** (Supabase automatycznie)
  - Przeglądanie i zarządzanie propozycjami

---

## ❌ Brakujące Endpointy (zaplanowane, ale nie zaimplementowane)

### 1. Zarządzanie Propozycjami (Edge Functions)

#### ❌ POST `/functions/v1/accept-proposal` ⭐⭐⭐
- **Status:** BRAK
- **Priorytet:** ⭐⭐⭐ (Najwyższy)
- **Opis:** Akceptacja pojedynczej propozycji i konwersja na fiszkę
- **Request:**
  ```json
  {
    "proposal_id": 1,
    "deck_id": 1
  }
  ```
- **Response:**
  ```json
  {
    "proposal_id": 1,
    "flashcard_id": 10,
    "deck_id": 1,
    "status": "accepted",
    "message": "Proposal accepted and converted to flashcard"
  }
  ```

#### ❌ POST `/functions/v1/reject-proposal` ⭐⭐
- **Status:** BRAK
- **Priorytet:** ⭐⭐
- **Opis:** Odrzucenie pojedynczej propozycji
- **Request:**
  ```json
  {
    "proposal_id": 1,
    "delete": false
  }
  ```

#### ❌ POST `/functions/v1/accept-proposals` ⭐⭐
- **Status:** BRAK
- **Priorytet:** ⭐⭐
- **Opis:** Akceptacja wielu propozycji jednocześnie (bulk)
- **Request:**
  ```json
  {
    "proposal_ids": [1, 2, 3],
    "deck_id": 1
  }
  ```

#### ❌ POST `/functions/v1/reject-proposals` ⭐
- **Status:** BRAK
- **Priorytet:** ⭐
- **Opis:** Odrzucenie wielu propozycji jednocześnie (bulk)
- **Request:**
  ```json
  {
    "proposal_ids": [4, 5, 6],
    "delete": false
  }
  ```

#### ❌ POST `/functions/v1/accept-proposals-by-session` ⭐⭐⭐
- **Status:** BRAK
- **Priorytet:** ⭐⭐⭐ (Najwyższy)
- **Opis:** Akceptacja wszystkich propozycji z sesji generowania
- **Request:**
  ```json
  {
    "generation_session_id": "gen-1234567890-abc12345-xyz",
    "deck_id": 1
  }
  ```

### 2. Spaced Repetition (Edge Functions)

#### ❌ POST `/functions/v1/update-flashcard-progress` ⭐⭐⭐
- **Status:** BRAK
- **Priorytet:** ⭐⭐⭐ (Najwyższy)
- **Opis:** Aktualizacja postępu nauki fiszki (po odpowiedzi użytkownika)
- **Request:**
  ```json
  {
    "flashcard_id": 1,
    "is_correct": true
  }
  ```
- **Funkcjonalność:**
  - Aktualizuje `consecutive_correct_answers`
  - Aktualizuje `interval` (algorytm spaced repetition)
  - Aktualizuje `due_date`
  - Zmienia `status` na `mastered` jeśli osiągnięto próg

#### ❌ GET `/functions/v1/flashcards-due` ⭐⭐
- **Status:** BRAK
- **Priorytet:** ⭐⭐
- **Opis:** Pobranie fiszek do powtórki (due for review)
- **Query params:** `deck_id`, `limit`

### 3. Astro API Endpoints (dla frontendu)

#### ❌ POST `/api/flashcards` ⭐
- **Status:** BRAK
- **Priorytet:** ⭐
- **Opis:** Endpoint zgodny z formatem z kursu (front/back/source/generation_id)
- **Request:**
  ```json
  {
    "flashcards": [
      {
        "front": "What is the capital of France?",
        "back": "Paris",
        "source": "manual",
        "generation_id": null
      }
    ]
  }
  ```

---

## 📋 Plan Implementacji - Kolejność (zgodnie z priorytetem gwiazdek)

### ✅ Faza 0: Obecna (Zakończona)
- ✅ Generowanie fiszek (generate-flashcards)
- ✅ Supabase REST API (automatyczne)

### 🔄 Faza 1: Priorytet ⭐⭐⭐ (Najważniejsze)

1. **POST `/functions/v1/accept-proposal`** ⭐⭐⭐
   - Najważniejsze - bez tego użytkownik nie może zaakceptować wygenerowanych fiszek
   - Konwersja pojedynczej propozycji na fiszkę
   
2. **POST `/functions/v1/accept-proposals-by-session`** ⭐⭐⭐
   - Bardzo przydatne - akceptacja całej generacji jednym kliknięciem
   - Konwersja wszystkich propozycji z sesji na fiszki

3. **POST `/functions/v1/update-flashcard-progress`** ⭐⭐⭐
   - Kluczowe dla spaced repetition - bez tego aplikacja nie ma sensu
   - Aktualizacja postępu nauki po odpowiedzi użytkownika

### 🔄 Faza 2: Priorytet ⭐⭐ (Ważne dla UX)

4. **POST `/functions/v1/accept-proposals`** ⭐⭐
   - Bulk accept dla wybranych propozycji
   - Akceptacja wielu propozycji jednocześnie

5. **POST `/functions/v1/reject-proposal`** ⭐⭐
   - Odrzucanie pojedynczych propozycji
   - Oznaczenie propozycji jako odrzuconej

6. **GET `/functions/v1/flashcards-due`** ⭐⭐
   - Optymalizacja - pobieranie tylko fiszek do powtórki
   - Filtrowanie fiszek według due_date

### 🔄 Faza 3: Priorytet ⭐ (Dodatkowe funkcje)

7. **POST `/functions/v1/reject-proposals`** ⭐
   - Bulk reject - odrzucanie wielu propozycji jednocześnie
   - Opcjonalne usuwanie odrzuconych propozycji

8. **POST `/api/flashcards`** ⭐
   - Endpoint zgodny z formatem z kursu (front/back/source/generation_id)
   - Astro API endpoint dla frontendu

---

## 🔧 Jak zaimplementować brakujące endpointy?

### Przykład: Accept Proposal Edge Function

1. **Utwórz nową Edge Function:**
   ```bash
   npx supabase functions new accept-proposal
   ```

2. **Implementacja** (`supabase/functions/accept-proposal/index.ts`):
   - Pobierz propozycję z bazy
   - Sprawdź, czy należy do użytkownika
   - Sprawdź, czy ma status `pending`
   - Utwórz fiszkę w podanym decku
   - Zaktualizuj status propozycji na `accepted`
   - Zwróć odpowiedź z ID utworzonej fiszki

3. **Wdróż:**
   ```bash
   npx supabase functions deploy accept-proposal --project-ref lfogeotxmdekvfstkais
   ```

### Przykład: Astro API Endpoint

1. **Utwórz plik:** `src/pages/api/flashcards.ts`
2. **Implementacja:**
   - Mapowanie `front` → `question`, `back` → `correct_answer`
   - Walidacja danych
   - Wywołanie Supabase REST API do utworzenia fiszek
   - Zwrócenie odpowiedzi

---

## 📊 Podsumowanie

- **Zaimplementowane:** 1 Edge Function (generate-flashcards) + Supabase REST API
- **Do zaimplementowania:** 7 Edge Functions + 1 Astro API endpoint
- **Plan:** Wszystkie endpointy będą zaimplementowane zgodnie z priorytetem (gwiazdkami)

## 🎯 Plan Implementacji

**Kolejność zgodna z priorytetem gwiazdek:**

1. **Faza 1 (⭐⭐⭐):** 3 najważniejsze endpointy
   - accept-proposal
   - accept-proposals-by-session
   - update-flashcard-progress

2. **Faza 2 (⭐⭐):** 3 ważne endpointy dla UX
   - accept-proposals
   - reject-proposal
   - flashcards-due

3. **Faza 3 (⭐):** 2 dodatkowe endpointy
   - reject-proposals
   - /api/flashcards

**Uwaga:** Wszystkie endpointy będą zaimplementowane - żaden nie zostanie pominięty.

