# Architektura Systemu 10xCards

Ten dokument opisuje szczegółową architekturę systemu 10xCards, w tym powiązania między komponentami: Astro Frontend, Supabase Backend, OpenRouter AI API oraz przepływ danych.

## Spis Treści

1. [Przegląd Architektury](#przegląd-architektury)
2. [Komponenty Systemu](#komponenty-systemu)
3. [Przepływ Danych](#przepływ-danych)
4. [Schematy Powiązań](#schematy-powiązań)
5. [Konfiguracja i Zmienne Środowiskowe](#konfiguracja-i-zmienne-środowiskowe)
6. [Bezpieczeństwo](#bezpieczeństwo)
7. [Diagramy Architektury](#diagramy-architektury)

---

## Przegląd Architektury

10xCards to aplikacja webowa wykorzystująca następujące technologie:

- **Astro** - Frontend framework (statyczny/hybrid rendering)
- **Supabase** - Backend-as-a-Service (baza danych PostgreSQL, Edge Functions, Auth)
- **OpenRouter.ai** - AI API dla generowania fiszek
- **PostgreSQL** - Baza danych (zarządzana przez Supabase)

### Wzorce Architektury

- **Serverless Functions** - Supabase Edge Functions dla logiki biznesowej
- **API Gateway Pattern** - Astro API endpoints jako proxy do Supabase
- **BFF (Backend for Frontend)** - Astro API endpoints dostosowują odpowiedzi dla frontendu
- **Row Level Security (RLS)** - Bezpieczeństwo na poziomie bazy danych

---

## Komponenty Systemu

### 1. Astro Frontend (`src/`)

**Lokalizacja:** `src/pages/`, `src/components/`, `src/lib/`

**Rola:**
- Renderowanie interfejsu użytkownika
- Obsługa interakcji użytkownika
- Komunikacja z backendem przez API endpoints

**Główne pliki:**
- `src/pages/index.astro` - Strona główna
- `src/pages/api/generations.ts` - API endpoint proxy do Supabase Edge Function
- `src/db/supabase.client.ts` - Klient Supabase dla frontendu
- `src/lib/supabase.ts` - Helpery do pracy z Supabase

**Konfiguracja:**
- `output: 'hybrid'` - Umożliwia API endpoints i statyczne strony
- Port dev: `4321`
- Endpointy API: `/api/*`

### 2. Astro API Proxy (`src/pages/api/generations.ts`)

**Rola:**
- Proxy endpoint między frontendem a Supabase Edge Function
- Obsługa błędów i walidacji
- Przekazywanie żądań do Supabase

**Endpoint:**
```
POST /api/generations
```

**Przepływ:**
1. Odbiera żądanie POST z frontendu
2. Waliduje body requestu
3. Przekazuje żądanie do Supabase Edge Function
4. Zwraca odpowiedź do frontendu

**Kod:**
```typescript
// src/pages/api/generations.ts
export const POST: APIRoute = async ({ request }) => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-flashcards`;
  
  // Proxy request to Supabase Edge Function
  const response = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return new Response(JSON.stringify(data), { status: response.status });
};
```

### 3. Supabase Edge Function (`supabase/functions/generate-flashcards/`)

**Lokalizacja:** `supabase/functions/generate-flashcards/index.ts`

**Rola:**
- Generowanie propozycji fiszek z tekstu źródłowego
- Integracja z OpenRouter.ai API
- Zapis propozycji do bazy danych
- Walidacja i przetwarzanie odpowiedzi AI

**Endpoint:**
```
POST /functions/v1/generate-flashcards
```

**Główne kroki:**
1. Walidacja żądania (text: 100-10000 znaków, domain: max 100 znaków)
2. Generacja `generation_session_id` (MD5 hash)
3. Konstrukcja promptu dla AI
4. Wywołanie OpenRouter.ai API
5. Parsowanie i walidacja odpowiedzi AI
6. Zapis propozycji do tabeli `flashcard_proposals`
7. Zwrócenie odpowiedzi z listą propozycji

**Timeout:** 30 sekund dla zapytań do OpenRouter.ai

### 4. Supabase Database (PostgreSQL)

**Lokalizacja:** Zarządzana przez Supabase

**Główne tabele:**
- `profiles` - Profile użytkowników
- `decks` - Kolekcje fiszek
- `flashcards` - Zaakceptowane fiszki
- `flashcard_proposals` - Propozycje fiszek (pending/accepted/rejected)

**Row Level Security (RLS):**
- Użytkownicy mogą tylko odczytywać/modyfikować swoje własne dane
- Polityki RLS są zdefiniowane w migracjach

### 5. OpenRouter.ai API

**Rola:**
- Generowanie fiszek z tekstu źródłowego przy użyciu AI
- Model: `amazon/nova-2-lite-v1:free`

**Endpoint:**
```
POST https://openrouter.ai/api/v1/chat/completions
```

**Request:**
```json
{
  "model": "amazon/nova-2-lite-v1:free",
  "messages": [
    {
      "role": "user",
      "content": "Prompt z instrukcjami generowania fiszek..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 4000
}
```

**Response:**
```json
{
  "choices": [{
    "message": {
      "content": "{\"flashcards\": [...], \"detected_domain\": \"Biology\"}"
    }
  }]
}
```

---

## Przepływ Danych

### Scenariusz: Generowanie Fiszek

```
┌─────────────┐
│   Frontend  │
│   (Astro)   │
└──────┬──────┘
       │
       │ POST /api/generations
       │ { text, domain }
       ▼
┌─────────────────────┐
│  Astro API Proxy    │
│ /api/generations.ts │
└──────┬──────────────┘
       │
       │ POST /functions/v1/generate-flashcards
       │ { text, domain }
       ▼
┌──────────────────────────────┐
│  Supabase Edge Function      │
│  generate-flashcards/index.ts│
└──────┬───────────────────────┘
       │
       │ 1. Walidacja
       │ 2. Generacja session_id
       │ 3. Konstrukcja promptu
       │
       │ POST https://openrouter.ai/api/v1/chat/completions
       │ { model, messages, ... }
       ▼
┌─────────────────┐
│  OpenRouter.ai  │
│      API        │
└──────┬──────────┘
       │
       │ Response z flashcards
       │ { flashcards: [...], detected_domain }
       ▼
┌──────────────────────────────┐
│  Supabase Edge Function       │
│  (kontynuacja przetwarzania)  │
└──────┬───────────────────────┘
       │
       │ 4. Parsowanie odpowiedzi
       │ 5. Walidacja (question: 50-500 znaków)
       │ 6. INSERT INTO flashcard_proposals
       │
       ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Supabase)    │
└─────────────────┘
       │
       │ Response z zapisanymi propozycjami
       │ { generation_session_id, proposals, ... }
       ▼
┌──────────────────────────────┐
│  Supabase Edge Function      │
│  (zwraca odpowiedź)         │
└──────┬───────────────────────┘
       │
       │ Response
       ▼
┌─────────────────────┐
│  Astro API Proxy    │
│  (przekazuje dalej) │
└──────┬──────────────┘
       │
       │ Response
       ▼
┌─────────────┐
│   Frontend  │
│   (Astro)   │
└─────────────┘
```

### Szczegółowy Przepływ

#### 1. Frontend → Astro API Proxy

**Request:**
```http
POST http://localhost:4321/api/generations
Content-Type: application/json

{
  "text": "Photosynthesis is a process...",
  "domain": "Biology"
}
```

**Odpowiedzialność Astro Proxy:**
- Walidacja JSON body
- Sprawdzenie konfiguracji Supabase URL
- Przekazanie żądania do Supabase Edge Function

#### 2. Astro API Proxy → Supabase Edge Function

**Request:**
```http
POST https://lfogeotxmdekvfstkais.supabase.co/functions/v1/generate-flashcards
Content-Type: application/json

{
  "text": "Photosynthesis is a process...",
  "domain": "Biology"
}
```

**Odpowiedzialność Edge Function:**
- Walidacja danych wejściowych
- Generacja `generation_session_id` (MD5 hash)
- Przygotowanie promptu dla AI

#### 3. Supabase Edge Function → OpenRouter.ai

**Request:**
```http
POST https://openrouter.ai/api/v1/chat/completions
Authorization: Bearer {OPENROUTER_API_KEY}
Content-Type: application/json

{
  "model": "amazon/nova-2-lite-v1:free",
  "messages": [{
    "role": "user",
    "content": "You are an expert educational content creator..."
  }],
  "temperature": 0.7,
  "max_tokens": 4000
}
```

**Response:**
```json
{
  "choices": [{
    "message": {
      "content": "{\"flashcards\": [{\"question\": \"...\", \"correct_answer\": \"...\", \"domain\": \"Biology\"}], \"detected_domain\": \"Biology\"}"
    }
  }]
}
```

#### 4. Supabase Edge Function → PostgreSQL

**SQL Insert:**
```sql
INSERT INTO flashcard_proposals (
  user_id,
  question,
  correct_answer,
  domain,
  generation_session_id,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Concise question text (50-500 chars)...',
  'Short answer (max 500 chars)',
  'Biology',
  'gen-1234567890-abc12345-xyz',
  'pending'
);
```

#### 5. Response Chain (odwrotny przepływ)

Wszystkie odpowiedzi przepływają z powrotem przez te same warstwy:
- PostgreSQL → Edge Function → Astro Proxy → Frontend

---

## Schematy Powiązań

### Architektura Ogólna

```
┌─────────────────────────────────────────────────────────────┐
│                        Użytkownik                           │
└───────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Astro Frontend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Pages      │  │  Components  │  │   Styles     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         API Proxy Endpoints                          │  │
│  │  POST /api/generations → Supabase Edge Function     │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                             │ HTTPS
                             │ PUBLIC_SUPABASE_URL
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Platform                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           Edge Functions (Deno Runtime)             │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │  generate-flashcards/index.ts                 │  │  │
│  │  │  - Walidacja                                  │  │  │
│  │  │  - Generacja session_id                       │  │  │
│  │  │  - Integracja z OpenRouter                    │  │  │
│  │  │  - Zapis do bazy danych                       │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         PostgreSQL Database                         │  │
│  │  - profiles                                        │  │
│  │  - decks                                           │  │
│  │  - flashcards                                      │  │
│  │  - flashcard_proposals                             │  │
│  │  - Row Level Security (RLS)                        │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                             │ HTTPS
                             │ OPENROUTER_API_KEY
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  OpenRouter.ai API                          │
│  - Model: amazon/nova-2-lite-v1:free                        │
│  - Generacja fiszek z tekstu                                │
│  - Wykrywanie domeny wiedzy                                 │
└─────────────────────────────────────────────────────────────┘
```

### Powiązania Konfiguracyjne

```
┌─────────────────────────────────────────────────────────────┐
│                    Zmienne Środowiskowe                    │
│                                                             │
│  Frontend (.env):                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ PUBLIC_SUPABASE_URL                                  │  │
│  │ PUBLIC_SUPABASE_ANON_KEY                             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Supabase Edge Function (Secrets):                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ SUPABASE_URL (automatycznie)                         │  │
│  │ SUPABASE_ANON_KEY (automatycznie)                    │  │
│  │ SUPABASE_SERVICE_ROLE_KEY (automatycznie)            │  │
│  │ OPENROUTER_API_KEY (ustawiane ręcznie)               │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Przepływ Autentykacji (przyszłość)

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       │ 1. Login Request
       ▼
┌─────────────────┐
│  Supabase Auth  │
│  (JWT Token)    │
└──────┬──────────┘
       │
       │ 2. JWT Token
       ▼
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       │ 3. Request z Authorization Header
       ▼
┌─────────────────────┐
│  Astro API Proxy    │
│  (przekazuje token) │
└──────┬──────────────┘
       │
       │ 4. Request z Authorization Header
       ▼
┌──────────────────────────────┐
│  Supabase Edge Function      │
│  (weryfikuje JWT)            │
└──────┬───────────────────────┘
       │
       │ 5. user_id z tokenu
       ▼
┌─────────────────┐
│   PostgreSQL    │
│   (RLS policy)  │
└─────────────────┘
```

---

## Konfiguracja i Zmienne Środowiskowe

### Frontend (.env)

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://lfogeotxmdekvfstkais.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenRouter API Configuration (opcjonalnie dla lokalnego dev)
OPENROUTER_API_KEY=your-openrouter-api-key
```

**Użycie:**
- `PUBLIC_SUPABASE_URL` - Używane przez Astro API proxy do przekierowania żądań
- `PUBLIC_SUPABASE_ANON_KEY` - Używane przez Supabase client w frontendzie

### Supabase Edge Function Secrets

**Lokalnie (supabase/config.toml):**
```toml
[edge_runtime.secrets]
OPENROUTER_API_KEY = "env(OPENROUTER_API_KEY)"
```

**Produkcja (Supabase Dashboard):**
1. Przejdź do: Settings → Edge Functions → Secrets
2. Dodaj: `OPENROUTER_API_KEY` = `your-key-here`

**Automatyczne zmienne (dostarczane przez Supabase):**
- `SUPABASE_URL` - URL projektu Supabase
- `SUPABASE_ANON_KEY` - Anonimowy klucz API
- `SUPABASE_SERVICE_ROLE_KEY` - Klucz service role (dla operacji DB)

### Konfiguracja Astro (astro.config.mjs)

```javascript
export default defineConfig({
  output: 'hybrid', // Umożliwia API endpoints
  integrations: [tailwind(), react()]
});
```

### Konfiguracja Supabase (supabase/config.toml)

```toml
project_id = "10xCards"

[edge_runtime]
enabled = true
policy = "per_worker"

[edge_runtime.secrets]
OPENROUTER_API_KEY = "env(OPENROUTER_API_KEY)"
```

---

## Bezpieczeństwo

### Warstwy Bezpieczeństwa

1. **Row Level Security (RLS)**
   - Polityki RLS w PostgreSQL
   - Użytkownicy mogą tylko odczytywać/modyfikować swoje dane
   - Wymaga autentykacji (JWT token)

2. **API Keys**
   - `OPENROUTER_API_KEY` - Przechowywany jako Supabase Secret
   - Nigdy nie eksponowany w frontendzie
   - Dostępny tylko w Edge Functions

3. **Walidacja Danych**
   - Walidacja długości tekstu (100-10000 znaków)
   - Walidacja odpowiedzi AI przed zapisem
   - Sanityzacja danych wejściowych

4. **Timeout**
   - 30 sekund timeout dla zapytań do OpenRouter.ai
   - Zapobiega zawieszeniu się funkcji

5. **CORS**
   - Konfiguracja CORS w Edge Functions
   - Ograniczenie do dozwolonych domen

### Przepływ Bezpieczeństwa

```
┌─────────────┐
│   Frontend  │
│  (Public)   │
└──────┬──────┘
       │
       │ Request (bez wrażliwych danych)
       ▼
┌─────────────────────┐
│  Astro API Proxy    │
│  (Public endpoint)  │
└──────┬──────────────┘
       │
       │ Request (bez API keys)
       ▼
┌──────────────────────────────┐
│  Supabase Edge Function      │
│  (Server-side, bezpieczny)   │
│  - Ma dostęp do OPENROUTER_   │
│    API_KEY (Secret)          │
│  - Weryfikuje JWT (przyszłość)│
└──────┬───────────────────────┘
       │
       │ Request z API Key (ukryty)
       ▼
┌─────────────────┐
│  OpenRouter.ai  │
│  (External API) │
└─────────────────┘
```

---

## Diagramy Architektury

### Diagram Sekwencji - Generowanie Fiszek

```
Frontend    Astro Proxy    Edge Function    OpenRouter    PostgreSQL
   │            │               │               │             │
   │──POST──────>│               │               │             │
   │            │──POST─────────>│               │             │
   │            │               │──POST─────────>│             │
   │            │               │               │             │
   │            │               │<──Response────│             │
   │            │               │               │             │
   │            │               │──INSERT───────>│             │
   │            │               │<──Success──────│             │
   │            │<──Response─────│               │             │
   │<──Response──│               │               │             │
   │            │               │               │             │
```

### Diagram Komponentów

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Astro      │  │   React      │  │   Tailwind  │      │
│  │   Pages      │  │  Components  │  │    CSS      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         Astro API Endpoints                          │  │
│  │  - /api/generations (POST)                           │  │
│  │  - Walidacja, Proxy, Error Handling                  │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Platform                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Edge Functions                          │  │
│  │  - generate-flashcards                               │  │
│  │  - Deno Runtime                                      │  │
│  │  - Serverless                                        │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                     │  │
│  │  - profiles, decks, flashcards, proposals            │  │
│  │  - Row Level Security                                │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                          │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              OpenRouter.ai API                      │  │
│  │  - AI Model: amazon/nova-2-lite-v1:free              │  │
│  │  - Flashcard Generation                              │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Podsumowanie Powiązań

### Kluczowe Powiązania

1. **Frontend ↔ Astro API Proxy**
   - Protokół: HTTP/HTTPS
   - Endpoint: `/api/generations`
   - Format: JSON

2. **Astro API Proxy ↔ Supabase Edge Function**
   - Protokół: HTTPS
   - Endpoint: `/functions/v1/generate-flashcards`
   - Format: JSON
   - Autoryzacja: (przyszłość) JWT token

3. **Supabase Edge Function ↔ OpenRouter.ai**
   - Protokół: HTTPS
   - Endpoint: `https://openrouter.ai/api/v1/chat/completions`
   - Autoryzacja: Bearer token (OPENROUTER_API_KEY)
   - Format: JSON

4. **Supabase Edge Function ↔ PostgreSQL**
   - Protokół: Wewnętrzny (Supabase)
   - Operacje: INSERT, SELECT, UPDATE
   - Bezpieczeństwo: RLS policies

### Dane Przepływające

**Request Flow:**
- `text` (string, 100-10000 znaków)
- `domain` (string, opcjonalne, max 100 znaków)

**Response Flow:**
- `generation_session_id` (string)
- `proposals` (array of flashcard proposals)
- `detected_domain` (string)
- `total_generated` (number)

---

---

> **📝 DODANE:** Poniższe sekcje zostały dodane w celu rozszerzenia dokumentacji o szczegółowe formaty danych, obsługę błędów, diagramy przepływu błędów, szczegóły deploymentu, przykłady kodu oraz informacje o timeoutach i monitoringu.

---

## Szczegółowe Formaty Danych

### Request Format - Generowanie Fiszek

**Frontend → Astro API Proxy:**
```typescript
// POST /api/generations
{
  text: string;        // Wymagane, 100-10000 znaków
  domain?: string;     // Opcjonalne, max 100 znaków
}
```

**Przykład:**
```json
{
  "text": "Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose molecules. This process occurs in chloroplasts and involves two main stages: light-dependent reactions and light-independent reactions (Calvin cycle).",
  "domain": "Biology"
}
```

### Response Format - Generowanie Fiszek

**Astro API Proxy → Frontend:**
```typescript
{
  generation_session_id: string;
  proposals: Array<{
    id: number;
    question: string;           // 50-500 znaków
    correct_answer: string;      // max 500 znaków
    domain: string | null;
    status: "pending" | "accepted" | "rejected";
  }>;
  detected_domain: string;
  total_generated: number;
}
```

**Przykład:**
```json
{
  "generation_session_id": "gen-1733683200000-abc123def456",
  "proposals": [
    {
      "id": 1,
      "question": "What is photosynthesis and where does it occur in plant cells? Explain the two main stages involved in this process.",
      "correct_answer": "Photosynthesis occurs in chloroplasts and involves light-dependent reactions and the Calvin cycle.",
      "domain": "Biology",
      "status": "pending"
    },
    {
      "id": 2,
      "question": "What are the main inputs and outputs of the light-dependent reactions in photosynthesis?",
      "correct_answer": "Inputs: light, water. Outputs: ATP, NADPH, oxygen.",
      "domain": "Biology",
      "status": "pending"
    }
  ],
  "detected_domain": "Biology",
  "total_generated": 2
}
```

### Format Błędu

**Wszystkie komponenty zwracają ten sam format:**
```typescript
{
  error: {
    code: string;              // Kod błędu (np. "VALIDATION_ERROR")
    message: string;            // Czytelna wiadomość
    details?: Record<string, unknown>;  // Opcjonalne szczegóły
  }
}
```

**Przykłady kodów błędów:**
- `INVALID_REQUEST` - Nieprawidłowe dane wejściowe
- `VALIDATION_ERROR` - Błąd walidacji (za krótki tekst, za długi domain)
- `METHOD_NOT_ALLOWED` - Nieprawidłowa metoda HTTP
- `UNAUTHORIZED` - Brak autoryzacji (przyszłość)
- `PROXY_ERROR` - Błąd proxy (Astro → Supabase)
- `EDGE_FUNCTION_ERROR` - Błąd Edge Function
- `AI_API_ERROR` - Błąd OpenRouter.ai API
- `DATABASE_ERROR` - Błąd bazy danych
- `PARSE_ERROR` - Błąd parsowania JSON
- `CONFIGURATION_ERROR` - Błąd konfiguracji

---

## Obsługa Błędów w Każdym Komponencie

### 1. Frontend (Astro Pages)

**Odpowiedzialność:**
- Wyświetlanie błędów użytkownikowi
- Retry logic dla błędów sieciowych
- Walidacja po stronie klienta (opcjonalna)

**Obsługiwane błędy:**
- Network errors (brak połączenia)
- HTTP errors (400, 500, etc.)
- Parse errors (nieprawidłowy JSON)

### 2. Astro API Proxy (`/api/generations.ts`)

**Odpowiedzialność:**
- Walidacja request body (JSON parsing)
- Sprawdzenie konfiguracji (`PUBLIC_SUPABASE_URL`)
- Przekazywanie błędów z Edge Function
- Obsługa błędów proxy (timeout, connection errors)

**Kody błędów:**
- `INVALID_REQUEST` (400) - Nieprawidłowy JSON lub pusty body
- `CONFIGURATION_ERROR` (500) - Brak `PUBLIC_SUPABASE_URL`
- `PROXY_ERROR` (500) - Błąd połączenia z Edge Function
- `PARSE_ERROR` (500) - Nie można sparsować odpowiedzi z Edge Function
- `EDGE_FUNCTION_ERROR` (500) - Edge Function zwrócił nie-JSON

**Przykład obsługi:**
```typescript
try {
  const bodyText = await request.text();
  if (!bodyText || bodyText.trim().length === 0) {
    return new Response(JSON.stringify({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Request body is empty',
      },
    }), { status: 400 });
  }
  body = JSON.parse(bodyText);
} catch (error) {
  return new Response(JSON.stringify({
    error: {
      code: 'INVALID_REQUEST',
      message: 'Invalid JSON in request body',
      details: error instanceof Error ? error.message : 'Unknown error',
    },
  }), { status: 400 });
}
```

### 3. Supabase Edge Function (`generate-flashcards/index.ts`)

**Odpowiedzialność:**
- Walidacja danych wejściowych (text: 100-10000, domain: max 100)
- Obsługa błędów OpenRouter.ai API
- Obsługa błędów bazy danych
- Timeout dla zapytań AI (30 sekund)

**Kody błędów:**
- `METHOD_NOT_ALLOWED` (405) - Nieprawidłowa metoda HTTP
- `VALIDATION_ERROR` (400) - Błąd walidacji danych
- `AI_API_ERROR` (500) - Błąd OpenRouter.ai
- `DATABASE_ERROR` (500) - Błąd zapisu do bazy
- `INTERNAL_ERROR` (500) - Inne błędy wewnętrzne

**Przykład obsługi timeout:**
```typescript
const AI_API_TIMEOUT_MS = 30000;
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), AI_API_TIMEOUT_MS);

try {
  const openRouterResponse = await fetch(openRouterUrl, {
    signal: controller.signal,
    // ... rest of config
  });
} catch (error) {
  if (error.name === 'AbortError') {
    return new Response(JSON.stringify({
      error: {
        code: 'AI_API_ERROR',
        message: 'AI API request timed out after 30 seconds',
      },
    }), { status: 500 });
  }
}
```

### 4. OpenRouter.ai API

**Odpowiedzialność:**
- Generowanie fiszek z tekstu
- Zwracanie odpowiedzi w formacie JSON

**Możliwe błędy:**
- `401 Unauthorized` - Nieprawidłowy API key
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Błąd serwera OpenRouter
- Timeout (30 sekund)

**Obsługa w Edge Function:**
```typescript
if (!openRouterResponse.ok) {
  const errorText = await openRouterResponse.text();
  return new Response(JSON.stringify({
    error: {
      code: 'AI_API_ERROR',
      message: `OpenRouter.ai API returned error: ${openRouterResponse.status}`,
      details: { status: openRouterResponse.status, body: errorText },
    },
  }), { status: 500 });
}
```

### 5. PostgreSQL Database (Supabase)

**Odpowiedzialność:**
- Zapis propozycji fiszek
- Row Level Security (RLS) enforcement

**Możliwe błędy:**
- `23505` - Unique constraint violation
- `23503` - Foreign key violation
- `23514` - Check constraint violation
- Connection errors

**Obsługa w Edge Function:**
```typescript
const { data, error } = await supabase
  .from('flashcard_proposals')
  .insert(proposals)
  .select();

if (error) {
  return new Response(JSON.stringify({
    error: {
      code: 'DATABASE_ERROR',
      message: 'Failed to save proposals to database',
      details: { code: error.code, message: error.message },
    },
  }), { status: 500 });
}
```

---

## Diagram Przepływu Błędów

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       │ POST /api/generations
       │ { text: "..." }
       ▼
┌─────────────────────┐
│  Astro API Proxy    │
│                     │
│  ❌ Błąd:           │
│  - Invalid JSON     │ → 400 INVALID_REQUEST
│  - Empty body       │ → 400 INVALID_REQUEST
│  - No SUPABASE_URL  │ → 500 CONFIGURATION_ERROR
└──────┬──────────────┘
       │
       │ POST /functions/v1/generate-flashcards
       ▼
┌──────────────────────────────┐
│  Supabase Edge Function      │
│                              │
│  ❌ Błędy:                   │
│  - Wrong HTTP method         │ → 405 METHOD_NOT_ALLOWED
│  - Text < 100 chars          │ → 400 VALIDATION_ERROR
│  - Domain > 100 chars        │ → 400 VALIDATION_ERROR
└──────┬───────────────────────┘
       │
       │ POST https://openrouter.ai/api/v1/chat/completions
       ▼
┌─────────────────┐
│  OpenRouter.ai  │
│                 │
│  ❌ Błędy:      │
│  - 401 Unauthorized          │ → 500 AI_API_ERROR
│  - 429 Rate Limit            │ → 500 AI_API_ERROR
│  - Timeout (30s)             │ → 500 AI_API_ERROR
│  - Invalid JSON response     │ → 500 AI_API_ERROR
└──────┬──────────┘
       │
       │ Response z flashcards
       ▼
┌──────────────────────────────┐
│  Supabase Edge Function      │
│  (przetwarzanie odpowiedzi)  │
│                              │
│  ❌ Błędy:                   │
│  - Invalid flashcard format  │ → Filtrowanie (logowanie)
│  - Question < 1000 chars     │ → Filtrowanie (logowanie)
│  - Answer > 500 chars        │ → Filtrowanie (logowanie)
└──────┬───────────────────────┘
       │
       │ INSERT INTO flashcard_proposals
       ▼
┌─────────────────┐
│   PostgreSQL    │
│                 │
│  ❌ Błędy:      │
│  - Constraint violation       │ → 500 DATABASE_ERROR
│  - Connection error          │ → 500 DATABASE_ERROR
│  - RLS policy violation      │ → 500 DATABASE_ERROR
└─────────────────┘
```

---

## Środowiska i Deployment

### Środowisko Lokalne (Development)

**Astro Frontend:**
- Port: `4321`
- URL: `http://localhost:4321`
- Komenda: `npm run dev`
- Konfiguracja: `.env` (nie commitowane do Git)

**Supabase Local:**
- Port: `54321` (Edge Functions)
- URL: `http://localhost:54321`
- Komenda: `npx supabase start`
- Konfiguracja: `supabase/config.toml`

**Zmienne środowiskowe lokalne:**
```env
# .env (Astro)
PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key

# .env (Supabase Edge Functions - przez config.toml)
OPENROUTER_API_KEY=your-openrouter-key
```

### Środowisko Produkcyjne

**Astro Frontend:**
- Hosting: Vercel, Netlify, lub inny
- URL: `https://your-domain.com`
- Build: `npm run build`
- Konfiguracja: Zmienne środowiskowe w panelu hostingu

**Supabase Production:**
- URL: `https://lfogeotxmdekvfstkais.supabase.co`
- Edge Functions: `https://lfogeotxmdekvfstkais.supabase.co/functions/v1/`
- Konfiguracja: Supabase Dashboard → Settings → Edge Functions → Secrets

**Zmienne środowiskowe produkcyjne:**
```env
# Astro (ustawiane w panelu hostingu)
PUBLIC_SUPABASE_URL=https://lfogeotxmdekvfstkais.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key

# Supabase Edge Functions (ustawiane w Dashboard)
OPENROUTER_API_KEY=your-openrouter-key
```

### Deployment Workflow

**1. Deploy Supabase Edge Function:**
```bash
# Link do projektu
npx supabase link --project-ref lfogeotxmdekvfstkais

# Deploy funkcji
npx supabase functions deploy generate-flashcards

# Ustawienie secretów (w Dashboard)
# Settings → Edge Functions → Secrets → Add OPENROUTER_API_KEY
```

**2. Deploy Astro Frontend:**
```bash
# Build
npm run build

# Deploy (zależnie od hostingu)
# Vercel: vercel deploy
# Netlify: netlify deploy --prod
```

**3. Konfiguracja zmiennych środowiskowych:**
- Astro: Ustaw w panelu hostingu (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`)
- Supabase: Ustaw w Dashboard (`OPENROUTER_API_KEY`)

---

## Przykłady Kodu dla Każdego Powiązania

### 1. Frontend → Astro API Proxy

```typescript
// Frontend component (React/Astro)
async function generateFlashcards(text: string, domain?: string) {
  const response = await fetch('/api/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, domain }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return await response.json();
}
```

### 2. Astro API Proxy → Supabase Edge Function

```typescript
// src/pages/api/generations.ts
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-flashcards`;

const response = await fetch(edgeFunctionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(request.headers.get('Authorization') && {
      'Authorization': request.headers.get('Authorization')!,
    }),
  },
  body: JSON.stringify(body),
});
```

### 3. Supabase Edge Function → OpenRouter.ai

```typescript
// supabase/functions/generate-flashcards/index.ts
const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

const openRouterResponse = await fetch(openRouterUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${openRouterApiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': supabaseUrl,
    'X-Title': '10xCards',
  },
  body: JSON.stringify({
    model: 'amazon/nova-2-lite-v1:free',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 4000,
  }),
  signal: controller.signal, // Timeout handling
});
```

### 4. Supabase Edge Function → PostgreSQL

```typescript
// supabase/functions/generate-flashcards/index.ts
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const proposalsToInsert = validProposals.map((proposal) => ({
  user_id: userId,
  question: proposal.question,
  correct_answer: proposal.correct_answer,
  domain: detectedDomain || proposal.domain || null,
  generation_session_id: generationSessionId,
  status: 'pending' as const,
}));

const { data: insertedProposals, error } = await supabase
  .from('flashcard_proposals')
  .insert(proposalsToInsert)
  .select();
```

---

## Timeouty i Limity

### Timeouty

| Komponent | Timeout | Opis |
|-----------|---------|------|
| OpenRouter.ai API | 30 sekund | Maksymalny czas oczekiwania na odpowiedź AI |
| Supabase Edge Function | 60 sekund (domyślnie) | Maksymalny czas wykonania funkcji |
| Astro API Proxy | Brak (domyślnie) | Zależy od hostingu |

### Limity Walidacji

| Pole | Min | Max | Opis |
|------|-----|-----|------|
| `text` (request) | 100 znaków | 10000 znaków | Tekst źródłowy do analizy |
| `domain` (request) | - | 100 znaków | Opcjonalna domena wiedzy |
| `question` (proposal) | 50 znaków | 500 znaków | Pytanie fiszki |
| `correct_answer` (proposal) | - | 500 znaków | Odpowiedź fiszki |

### Limity API

| Serwis | Limit | Opis |
|--------|-------|------|
| OpenRouter.ai | Zależy od planu | Rate limiting według planu OpenRouter |
| Supabase Edge Functions | 500k invocations/miesiąc (free tier) | Limit wywołań funkcji |
| PostgreSQL (Supabase) | 500 MB (free tier) | Limit przestrzeni dyskowej |

---

## Monitoring i Logowanie

### Logowanie w Astro API Proxy

```typescript
// src/pages/api/generations.ts
console.log('Proxying to Supabase Edge Function:', edgeFunctionUrl);
console.log('Received request body:', bodyText.substring(0, 200));
console.error('Error proxying request:', error);
```

### Logowanie w Supabase Edge Function

```typescript
// supabase/functions/generate-flashcards/index.ts
console.log('Generation session ID:', generationSessionId);
console.log('Valid proposals count:', validProposals.length);
console.error('AI API error:', {
  generation_session_id: generationSessionId,
  error: error.message,
});
```

### Dostęp do Logów

**Lokalnie:**
```bash
# Astro logs (terminal)
npm run dev  # Logi w konsoli

# Supabase logs
npx supabase functions logs generate-flashcards
```

**Produkcyjnie:**
- Astro: Logi w panelu hostingu (Vercel/Netlify)
- Supabase: Dashboard → Edge Functions → Logs → `generate-flashcards`

---

> **✅ KONIEC DODANEGO TEKSTU**

---

## Przyszłe Rozszerzenia

### Planowane Funkcjonalności

1. **Autentykacja**
   - Supabase Auth integration
   - JWT token verification w Edge Functions
   - User-specific data access

2. **Dodatkowe Endpointy**
   - Accept/Reject proposals
   - Deck management
   - Flashcard review

3. **Optymalizacje**
   - Caching odpowiedzi AI
   - Rate limiting
   - Batch processing

---

## Dokumentacja Powiązana

- [SETUP.md](./SETUP.md) - Instrukcje instalacji i konfiguracji
- [supabase/functions/generate-flashcards/README.md](./supabase/functions/generate-flashcards/README.md) - Dokumentacja Edge Function
- [.ai/api-plan.md](./.ai/api-plan.md) - Plan API endpoints
- [.ai/db-plan.md](./.ai/db-plan.md) - Plan bazy danych

---

**Ostatnia aktualizacja:** 2025-12-08  
**Wersja:** 1.0

