# Plan Implementacji Usługi OpenRouter

## Opis Usługi

Usługa OpenRouter jest reużywalną klasą TypeScript zaprojektowaną do komunikacji z interfejsem API OpenRouter.ai. Usługa abstrahuje szczegóły implementacji API, zapewniając czysty interfejs do generowania odpowiedzi z modeli językowych (LLM) z pełną obsługą komunikatów systemowych, komunikatów użytkownika, structured outputs (schematów JSON), konfiguracji modelu i parametrów generowania.

### Główne Funkcjonalności

- **Komunikacja z API OpenRouter**: Centralizacja logiki wywołań API
- **Obsługa komunikatów**: System messages i user messages w formacie zgodnym z OpenRouter
- **Structured Outputs**: Wsparcie dla JSON schemas w odpowiedziach modelu
- **Konfiguracja modelu**: Elastyczna konfiguracja nazwy modelu i parametrów
- **Obsługa błędów**: Kompleksowa obsługa błędów z retry logic
- **Timeout management**: Automatyczne zarządzanie timeoutami
- **Security**: Bezpieczne przechowywanie i używanie API keys

### Wzorce Projektowe

- **Service Pattern**: Centralizacja logiki biznesowej
- **Builder Pattern**: Elastyczna konfiguracja requestów
- **Error Handling Pattern**: Spójna obsługa błędów
- **Retry Pattern**: Automatyczne ponawianie przy błędach sieciowych

## Opis Konstruktora

### Konstruktor

```typescript
constructor(config: OpenRouterServiceConfig)
```

### Parametry Konstruktora

```typescript
interface OpenRouterServiceConfig {
  apiKey: string;                    // Wymagane: OpenRouter API key
  baseUrl?: string;                  // Opcjonalne: URL API (domyślnie: 'https://openrouter.ai/api/v1')
  defaultModel?: string;             // Opcjonalne: Domyślny model (domyślnie: 'amazon/nova-2-lite-v1:free')
  defaultTimeout?: number;           // Opcjonalne: Domyślny timeout w ms (domyślnie: 30000)
  maxRetries?: number;               // Opcjonalne: Maksymalna liczba ponownych prób (domyślnie: 3)
  retryDelay?: number;               // Opcjonalne: Opóźnienie między ponownymi próbami w ms (domyślnie: 1000)
  httpReferer?: string;              // Opcjonalne: HTTP-Referer header
  httpTitle?: string;                // Opcjonalne: X-Title header
  enableLogging?: boolean;            // Opcjonalne: Włączanie logowania (domyślnie: true)
}
```

### Przykład Użycia

```typescript
const openRouterService = new OpenRouterService({
  apiKey: Deno.env.get('OPENROUTER_API_KEY')!,
  defaultModel: 'amazon/nova-2-lite-v1:free',
  defaultTimeout: 30000,
  httpReferer: 'https://your-app.com',
  httpTitle: '10xCards',
});
```

### Walidacja Konstruktora

- **apiKey**: Musi być niepustym stringiem, w przeciwnym razie rzuca `ConfigurationError`
- **baseUrl**: Jeśli podane, musi być poprawnym URL (zaczyna się od `http://` lub `https://`)
- **defaultTimeout**: Musi być dodatnią liczbą (min: 1000ms, max: 300000ms)
- **maxRetries**: Musi być nieujemną liczbą całkowitą (max: 10)
- **retryDelay**: Musi być nieujemną liczbą (min: 0ms, max: 10000ms)

## Publiczne Metody i Pola

### Metody Publiczne

#### 1. `chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>`

Główna metoda do generowania odpowiedzi z modelu językowego.

**Parametry:**

```typescript
interface ChatCompletionRequest {
  model?: string;                    // Opcjonalne: Nazwa modelu (używa defaultModel jeśli nie podane)
  messages: Message[];              // Wymagane: Tablica komunikatów
  systemMessage?: string;            // Opcjonalne: Komunikat systemowy (dodawany jako pierwszy)
  responseFormat?: ResponseFormat;   // Opcjonalne: Format odpowiedzi (JSON schema)
  temperature?: number;              // Opcjonalne: Temperature (0.0-2.0, domyślnie: 1.0)
  topP?: number;                    // Opcjonalne: Top-p (0.0-1.0, domyślnie: 1.0)
  frequencyPenalty?: number;        // Opcjonalne: Frequency penalty (-2.0-2.0, domyślnie: 0.0)
  presencePenalty?: number;         // Opcjonalne: Presence penalty (-2.0-2.0, domyślnie: 0.0)
  maxTokens?: number;                // Opcjonalne: Maksymalna liczba tokenów
  timeout?: number;                  // Opcjonalne: Timeout dla tego requestu (nadpisuje defaultTimeout)
}
```

**Zwraca:**

```typescript
interface ChatCompletionResponse {
  id: string;                       // ID odpowiedzi
  model: string;                     // Nazwa użytego modelu
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

**Przykład Użycia:**

```typescript
const response = await openRouterService.chatCompletion({
  systemMessage: 'You are an expert educational content creator.',
  messages: [
    {
      role: 'user',
      content: 'Generate flashcards from this text: ...'
    }
  ],
  responseFormat: {
    type: 'json_schema',
    jsonSchema: {
      name: 'flashcards_schema',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          flashcards: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                correct_answer: { type: 'string' }
              }
            }
          }
        }
      }
    }
  },
  temperature: 0.7,
  maxTokens: 4000
});
```

#### 2. `setDefaultModel(model: string): void`

Ustawia domyślny model dla wszystkich przyszłych requestów.

**Parametry:**
- `model`: Nazwa modelu (musi być niepustym stringiem)

**Przykład:**

```typescript
openRouterService.setDefaultModel('gpt-4');
```

#### 3. `getDefaultModel(): string`

Zwraca aktualnie ustawiony domyślny model.

**Zwraca:** String z nazwą modelu

#### 4. `setDefaultTimeout(timeout: number): void`

Ustawia domyślny timeout dla wszystkich przyszłych requestów.

**Parametry:**
- `timeout`: Timeout w milisekundach (min: 1000, max: 300000)

#### 5. `getDefaultTimeout(): number`

Zwraca aktualnie ustawiony domyślny timeout.

**Zwraca:** Liczba milisekund

#### 6. `validateApiKey(): Promise<boolean>`

Waliduje API key poprzez wykonanie testowego requestu.

**Zwraca:** `true` jeśli API key jest poprawny, `false` w przeciwnym razie

**Przykład:**

```typescript
const isValid = await openRouterService.validateApiKey();
if (!isValid) {
  throw new Error('Invalid API key');
}
```

### Pola Publiczne (tylko do odczytu)

```typescript
readonly config: Readonly<OpenRouterServiceConfig>;  // Konfiguracja usługi (read-only)
```

## Prywatne Metody i Pola

### Pola Prywatne

```typescript
private readonly apiKey: string;
private readonly baseUrl: string;
private defaultModel: string;
private defaultTimeout: number;
private readonly maxRetries: number;
private readonly retryDelay: number;
private readonly httpReferer?: string;
private readonly httpTitle?: string;
private readonly enableLogging: boolean;
```

### Metody Prywatne

#### 1. `private buildRequest(request: ChatCompletionRequest): OpenRouterAPIRequest`

Buduje obiekt requestu zgodny z formatem OpenRouter API.

**Parametry:**
- `request`: Obiekt `ChatCompletionRequest`

**Zwraca:**
- `OpenRouterAPIRequest`: Sformatowany request dla OpenRouter API

**Logika:**
- Łączy `systemMessage` z `messages` (jeśli podane)
- Dodaje `response_format` jeśli podane
- Waliduje parametry modelu (temperature, topP, etc.)
- Używa domyślnych wartości jeśli parametry nie są podane

#### 2. `private buildMessages(systemMessage?: string, messages: Message[]): Message[]`

Buduje tablicę komunikatów z uwzględnieniem komunikatu systemowego.

**Parametry:**
- `systemMessage`: Opcjonalny komunikat systemowy
- `messages`: Tablica komunikatów użytkownika

**Zwraca:**
- `Message[]`: Tablica komunikatów w formacie OpenRouter

**Logika:**
- Jeśli `systemMessage` jest podane, dodaje je jako pierwszy element z `role: 'system'`
- Dodaje pozostałe komunikaty z `messages`

#### 3. `private buildResponseFormat(responseFormat?: ResponseFormat): object | undefined`

Buduje obiekt `response_format` dla structured outputs.

**Parametry:**
- `responseFormat`: Opcjonalny format odpowiedzi

**Zwraca:**
- Obiekt `response_format` lub `undefined`

**Format:**

```typescript
{
  type: 'json_schema',
  json_schema: {
    name: string,
    strict: boolean,
    schema: JSONSchema
  }
}
```

#### 4. `private validateModelParameters(params: ModelParameters): void`

Waliduje parametry modelu (temperature, topP, etc.).

**Parametry:**
- `params`: Obiekt z parametrami modelu

**Rzuca:**
- `ValidationError` jeśli parametry są poza dozwolonym zakresem

**Walidacja:**
- `temperature`: 0.0 - 2.0
- `topP`: 0.0 - 1.0
- `frequencyPenalty`: -2.0 - 2.0
- `presencePenalty`: -2.0 - 2.0
- `maxTokens`: dodatnia liczba całkowita

#### 5. `private async executeRequest(request: OpenRouterAPIRequest, timeout: number): Promise<Response>`

Wykonuje request HTTP do OpenRouter API z obsługą timeoutu.

**Parametry:**
- `request`: Request do wykonania
- `timeout`: Timeout w milisekundach

**Zwraca:**
- `Response`: Odpowiedź HTTP

**Logika:**
- Tworzy `AbortController` dla timeoutu
- Wykonuje `fetch` z `signal` z AbortController
- Czyści timeout po udanym requestcie
- Rzuca `TimeoutError` jeśli timeout wystąpi

#### 6. `private async parseResponse(response: Response): Promise<ChatCompletionResponse>`

Parsuje odpowiedź HTTP do obiektu `ChatCompletionResponse`.

**Parametry:**
- `response`: Odpowiedź HTTP

**Zwraca:**
- `ChatCompletionResponse`: Sparsowana odpowiedź

**Rzuca:**
- `ParseError` jeśli odpowiedź nie jest poprawnym JSON
- `APIError` jeśli odpowiedź zawiera błąd

#### 7. `private async retryRequest<T>(
  fn: () => Promise<T>,
  retries: number
): Promise<T>`

Wykonuje request z automatycznym ponawianiem przy błędach sieciowych.

**Parametry:**
- `fn`: Funkcja do wykonania (zwraca Promise)
- `retries`: Liczba pozostałych prób

**Zwraca:**
- Wynik funkcji `fn`

**Logika:**
- Próbuje wykonać funkcję
- Jeśli wystąpi błąd sieciowy (network error, timeout), ponawia próbę
- Czeka `retryDelay` ms między próbami
- Rzuca ostatni błąd jeśli wszystkie próby się nie powiodły

#### 8. `private log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void`

Loguje wiadomości (tylko jeśli `enableLogging` jest `true`).

**Parametry:**
- `level`: Poziom logowania
- `message`: Wiadomość
- `data`: Opcjonalne dane do zalogowania

**Logika:**
- Sprawdza `enableLogging`
- Loguje tylko w dev mode (nie w production)
- Nie loguje wrażliwych danych (API keys, pełne treści)

#### 9. `private sanitizeForLogging(data: unknown): unknown`

Usuwa wrażliwe dane z obiektów przed logowaniem.

**Parametry:**
- `data`: Dane do sanitizacji

**Zwraca:**
- Dane bez wrażliwych informacji

**Logika:**
- Usuwa pola zawierające `apiKey`, `key`, `token`, `password`
- Ogranicza długość stringów do 500 znaków
- Usuwa zagnieżdżone obiekty z wrażliwymi danymi

## Obsługa Błędów

### Hierarchia Błędów

```typescript
// Bazowa klasa błędu
class OpenRouterServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'OpenRouterServiceError';
  }
}

// Konkretne typy błędów
class ConfigurationError extends OpenRouterServiceError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}

class ValidationError extends OpenRouterServiceError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

class APIError extends OpenRouterServiceError {
  constructor(
    message: string,
    public readonly statusCode: number,
    details?: Record<string, unknown>
  ) {
    super(message, 'API_ERROR', details);
    this.name = 'APIError';
  }
}

class TimeoutError extends OpenRouterServiceError {
  constructor(timeout: number, details?: Record<string, unknown>) {
    super(
      `Request timed out after ${timeout}ms`,
      'TIMEOUT_ERROR',
      { timeout, ...details }
    );
    this.name = 'TimeoutError';
  }
}

class NetworkError extends OpenRouterServiceError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

class ParseError extends OpenRouterServiceError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'PARSE_ERROR', details);
    this.name = 'ParseError';
  }
}
```

### Scenariusze Błędów

#### 1. Błędy Konfiguracji

**Scenariusz:** Brak lub nieprawidłowy API key

```typescript
// Rzuca: ConfigurationError
if (!config.apiKey || config.apiKey.trim().length === 0) {
  throw new ConfigurationError('API key is required');
}
```

**Scenariusz:** Nieprawidłowy baseUrl

```typescript
// Rzuca: ConfigurationError
if (config.baseUrl && !config.baseUrl.startsWith('http')) {
  throw new ConfigurationError('baseUrl must start with http:// or https://');
}
```

#### 2. Błędy Walidacji

**Scenariusz:** Nieprawidłowy zakres temperature

```typescript
// Rzuca: ValidationError
if (temperature < 0.0 || temperature > 2.0) {
  throw new ValidationError(
    'Temperature must be between 0.0 and 2.0',
    { temperature }
  );
}
```

**Scenariusz:** Brak komunikatów

```typescript
// Rzuca: ValidationError
if (!messages || messages.length === 0) {
  throw new ValidationError('At least one message is required');
}
```

#### 3. Błędy API

**Scenariusz:** 401 Unauthorized

```typescript
// Rzuca: APIError
if (response.status === 401) {
  throw new APIError(
    'Invalid API key',
    401,
    { response: await response.text() }
  );
}
```

**Scenariusz:** 429 Too Many Requests

```typescript
// Rzuca: APIError
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  throw new APIError(
    'Rate limit exceeded',
    429,
    { retryAfter: retryAfter ? parseInt(retryAfter) : undefined }
  );
}
```

**Scenariusz:** 500 Internal Server Error

```typescript
// Rzuca: APIError
if (response.status >= 500) {
  throw new APIError(
    'OpenRouter API server error',
    response.status,
    { response: await response.text() }
  );
}
```

#### 4. Błędy Timeout

**Scenariusz:** Request przekroczył timeout

```typescript
// Rzuca: TimeoutError
const controller = new AbortController();
const timeoutId = setTimeout(() => {
  controller.abort();
}, timeout);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  return response;
} catch (error) {
  if (error.name === 'AbortError') {
    throw new TimeoutError(timeout);
  }
  throw error;
}
```

#### 5. Błędy Sieciowe

**Scenariusz:** Brak połączenia z internetem

```typescript
// Rzuca: NetworkError
try {
  const response = await fetch(url);
  return response;
} catch (error) {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new NetworkError('Network connection failed', { error: error.message });
  }
  throw error;
}
```

#### 6. Błędy Parsowania

**Scenariusz:** Nieprawidłowy JSON w odpowiedzi

```typescript
// Rzuca: ParseError
try {
  const data = await response.json();
  return data;
} catch (error) {
  throw new ParseError(
    'Failed to parse response as JSON',
    { error: error.message, responseText: await response.text() }
  );
}
```

### Strategia Obsługi Błędów

1. **Early Validation**: Walidacja danych wejściowych przed wykonaniem requestu
2. **Retry Logic**: Automatyczne ponawianie przy błędach sieciowych i timeoutach
3. **Error Wrapping**: Zawijanie błędów w spójną hierarchię
4. **Error Logging**: Logowanie błędów z kontekstem (bez wrażliwych danych)
5. **User-Friendly Messages**: Czytelne komunikaty błędów dla użytkownika

## Względy Bezpieczeństwa

### 1. Przechowywanie API Key

**Problem:** API key nie może być eksponowany w kodzie klienta lub logach.

**Rozwiązanie:**
- API key przechowywany tylko w zmiennych środowiskowych (Deno.env)
- Nigdy nie logowany ani nie eksponowany w odpowiedziach
- Walidacja obecności API key w konstruktorze

```typescript
// ✅ DOBRZE
const apiKey = Deno.env.get('OPENROUTER_API_KEY');
if (!apiKey) {
  throw new ConfigurationError('OPENROUTER_API_KEY environment variable is required');
}

// ❌ ŹLE
const apiKey = 'sk-or-v1-...'; // Hardcoded
console.log('API Key:', apiKey); // Logowanie
```

### 2. Sanityzacja Danych Przed Logowaniem

**Problem:** Logowanie może eksponować wrażliwe dane.

**Rozwiązanie:**
- Implementacja metody `sanitizeForLogging`
- Usuwanie pól zawierających `apiKey`, `key`, `token`, `password`
- Ograniczenie długości stringów w logach

```typescript
private sanitizeForLogging(data: unknown): unknown {
  if (typeof data === 'string') {
    return data.length > 500 ? data.substring(0, 500) + '...' : data;
  }
  if (Array.isArray(data)) {
    return data.map(item => this.sanitizeForLogging(item));
  }
  if (data && typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('key') || lowerKey.includes('token') || lowerKey.includes('password')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = this.sanitizeForLogging(value);
      }
    }
    return sanitized;
  }
  return data;
}
```

### 3. Walidacja Danych Wejściowych

**Problem:** Nieprawidłowe dane wejściowe mogą prowadzić do błędów lub ataków.

**Rozwiązanie:**
- Walidacja wszystkich parametrów przed wykonaniem requestu
- Sprawdzanie zakresów wartości (temperature, topP, etc.)
- Walidacja formatu komunikatów

```typescript
private validateModelParameters(params: ModelParameters): void {
  if (params.temperature !== undefined) {
    if (params.temperature < 0.0 || params.temperature > 2.0) {
      throw new ValidationError('Temperature must be between 0.0 and 2.0');
    }
  }
  // ... walidacja innych parametrów
}
```

### 4. Rate Limiting

**Problem:** Zbyt wiele requestów może przekroczyć limity API.

**Rozwiązanie:**
- Implementacja retry logic z exponential backoff
- Obsługa nagłówka `Retry-After` z odpowiedzi 429
- Monitoring liczby requestów

```typescript
private async retryRequest<T>(
  fn: () => Promise<T>,
  retries: number,
  baseDelay: number = this.retryDelay
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && this.isRetryableError(error)) {
      const delay = baseDelay * Math.pow(2, this.maxRetries - retries);
      await this.sleep(delay);
      return this.retryRequest(fn, retries - 1, baseDelay);
    }
    throw error;
  }
}
```

### 5. Timeout Protection

**Problem:** Długotrwałe requesty mogą blokować zasoby.

**Rozwiązanie:**
- Wymuszanie timeoutów dla wszystkich requestów
- Używanie `AbortController` do anulowania requestów
- Domyślny timeout 30 sekund

```typescript
private async executeRequest(
  request: OpenRouterAPIRequest,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(this.baseUrl + '/chat/completions', {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new TimeoutError(timeout);
    }
    throw error;
  }
}
```

### 6. HTTPS Only

**Problem:** Komunikacja przez HTTP może być przechwycona.

**Rozwiązanie:**
- Wymuszanie HTTPS dla baseUrl
- Walidacja w konstruktorze

```typescript
if (config.baseUrl && !config.baseUrl.startsWith('https://')) {
  throw new ConfigurationError('baseUrl must use HTTPS');
}
```

### 7. Content Security

**Problem:** Złośliwe dane w komunikatach mogą prowadzić do ataków.

**Rozwiązanie:**
- Walidacja długości komunikatów
- Sanityzacja treści przed wysłaniem (opcjonalnie)
- Ograniczenie `maxTokens` do rozsądnych wartości

## Plan Implementacji Krok po Kroku

### Krok 1: Przygotowanie Struktury Plików

**Lokalizacja:** `src/lib/api/openrouter.ts`

Utwórz plik z podstawową strukturą klasy:

```typescript
// src/lib/api/openrouter.ts

// Typy i interfejsy
export interface OpenRouterServiceConfig { ... }
export interface ChatCompletionRequest { ... }
export interface ChatCompletionResponse { ... }
export interface Message { ... }
export interface ResponseFormat { ... }

// Klasy błędów
export class OpenRouterServiceError extends Error { ... }
export class ConfigurationError extends OpenRouterServiceError { ... }
export class ValidationError extends OpenRouterServiceError { ... }
export class APIError extends OpenRouterServiceError { ... }
export class TimeoutError extends OpenRouterServiceError { ... }
export class NetworkError extends OpenRouterServiceError { ... }
export class ParseError extends OpenRouterServiceError { ... }

// Główna klasa
export class OpenRouterService {
  // Implementacja
}
```

### Krok 2: Implementacja Konstruktora i Pól Prywatnych

**Zadania:**
1. Zdefiniuj pola prywatne
2. Zaimplementuj konstruktor z walidacją
3. Zaimplementuj metody pomocnicze do walidacji konfiguracji

**Kod:**

```typescript
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private defaultModel: string;
  private defaultTimeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly httpReferer?: string;
  private readonly httpTitle?: string;
  private readonly enableLogging: boolean;

  constructor(config: OpenRouterServiceConfig) {
    // Walidacja API key
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      throw new ConfigurationError('API key is required');
    }
    this.apiKey = config.apiKey;

    // Walidacja i ustawienie baseUrl
    this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1';
    if (!this.baseUrl.startsWith('https://')) {
      throw new ConfigurationError('baseUrl must use HTTPS');
    }

    // Ustawienie pozostałych pól z walidacją
    this.defaultModel = config.defaultModel || 'amazon/nova-2-lite-v1:free';
    this.defaultTimeout = this.validateTimeout(config.defaultTimeout || 30000);
    this.maxRetries = this.validateRetries(config.maxRetries || 3);
    this.retryDelay = this.validateRetryDelay(config.retryDelay || 1000);
    this.httpReferer = config.httpReferer;
    this.httpTitle = config.httpTitle;
    this.enableLogging = config.enableLogging !== false;
  }

  private validateTimeout(timeout: number): number {
    if (timeout < 1000 || timeout > 300000) {
      throw new ConfigurationError('Timeout must be between 1000 and 300000 ms');
    }
    return timeout;
  }

  private validateRetries(retries: number): number {
    if (retries < 0 || retries > 10 || !Number.isInteger(retries)) {
      throw new ConfigurationError('Max retries must be an integer between 0 and 10');
    }
    return retries;
  }

  private validateRetryDelay(delay: number): number {
    if (delay < 0 || delay > 10000) {
      throw new ConfigurationError('Retry delay must be between 0 and 10000 ms');
    }
    return delay;
  }
}
```

### Krok 3: Implementacja Metod Budowania Requestu

**Zadania:**
1. Zaimplementuj `buildRequest`
2. Zaimplementuj `buildMessages`
3. Zaimplementuj `buildResponseFormat`
4. Zaimplementuj `buildHeaders`

**Kod:**

```typescript
private buildRequest(request: ChatCompletionRequest): OpenRouterAPIRequest {
  const messages = this.buildMessages(request.systemMessage, request.messages);
  const responseFormat = this.buildResponseFormat(request.responseFormat);
  
  const apiRequest: OpenRouterAPIRequest = {
    model: request.model || this.defaultModel,
    messages,
  };

  if (responseFormat) {
    apiRequest.response_format = responseFormat;
  }

  // Dodaj parametry modelu z walidacją
  if (request.temperature !== undefined) {
    this.validateModelParameters({ temperature: request.temperature });
    apiRequest.temperature = request.temperature;
  }

  if (request.topP !== undefined) {
    this.validateModelParameters({ topP: request.topP });
    apiRequest.top_p = request.topP;
  }

  if (request.frequencyPenalty !== undefined) {
    this.validateModelParameters({ frequencyPenalty: request.frequencyPenalty });
    apiRequest.frequency_penalty = request.frequencyPenalty;
  }

  if (request.presencePenalty !== undefined) {
    this.validateModelParameters({ presencePenalty: request.presencePenalty });
    apiRequest.presence_penalty = request.presencePenalty;
  }

  if (request.maxTokens !== undefined) {
    if (request.maxTokens <= 0 || !Number.isInteger(request.maxTokens)) {
      throw new ValidationError('maxTokens must be a positive integer');
    }
    apiRequest.max_tokens = request.maxTokens;
  }

  return apiRequest;
}

private buildMessages(systemMessage?: string, messages: Message[] = []): Message[] {
  const result: Message[] = [];

  if (systemMessage) {
    result.push({
      role: 'system',
      content: systemMessage,
    });
  }

  if (!messages || messages.length === 0) {
    throw new ValidationError('At least one message is required');
  }

  result.push(...messages);
  return result;
}

private buildResponseFormat(responseFormat?: ResponseFormat): object | undefined {
  if (!responseFormat) {
    return undefined;
  }

  if (responseFormat.type === 'json_schema') {
    return {
      type: 'json_schema',
      json_schema: {
        name: responseFormat.jsonSchema.name,
        strict: responseFormat.jsonSchema.strict,
        schema: responseFormat.jsonSchema.schema,
      },
    };
  }

  return undefined;
}

private buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${this.apiKey}`,
    'Content-Type': 'application/json',
  };

  if (this.httpReferer) {
    headers['HTTP-Referer'] = this.httpReferer;
  }

  if (this.httpTitle) {
    headers['X-Title'] = this.httpTitle;
  }

  return headers;
}
```

### Krok 4: Implementacja Walidacji Parametrów Modelu

**Zadania:**
1. Zaimplementuj `validateModelParameters`

**Kod:**

```typescript
private validateModelParameters(params: Partial<ModelParameters>): void {
  if (params.temperature !== undefined) {
    if (params.temperature < 0.0 || params.temperature > 2.0) {
      throw new ValidationError(
        'Temperature must be between 0.0 and 2.0',
        { temperature: params.temperature }
      );
    }
  }

  if (params.topP !== undefined) {
    if (params.topP < 0.0 || params.topP > 1.0) {
      throw new ValidationError(
        'Top-p must be between 0.0 and 1.0',
        { topP: params.topP }
      );
    }
  }

  if (params.frequencyPenalty !== undefined) {
    if (params.frequencyPenalty < -2.0 || params.frequencyPenalty > 2.0) {
      throw new ValidationError(
        'Frequency penalty must be between -2.0 and 2.0',
        { frequencyPenalty: params.frequencyPenalty }
      );
    }
  }

  if (params.presencePenalty !== undefined) {
    if (params.presencePenalty < -2.0 || params.presencePenalty > 2.0) {
      throw new ValidationError(
        'Presence penalty must be between -2.0 and 2.0',
        { presencePenalty: params.presencePenalty }
      );
    }
  }
}
```

### Krok 5: Implementacja Wykonywania Requestu z Timeoutem

**Zadania:**
1. Zaimplementuj `executeRequest` z obsługą timeoutu
2. Zaimplementuj pomocniczą metodę `sleep` dla retry logic

**Kod:**

```typescript
private async executeRequest(
  request: OpenRouterAPIRequest,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError(timeout);
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Network connection failed', {
        error: error.message,
      });
    }
    
    throw error;
  }
}

private sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Krok 6: Implementacja Parsowania Odpowiedzi

**Zadania:**
1. Zaimplementuj `parseResponse`
2. Zaimplementuj obsługę błędów API

**Kod:**

```typescript
private async parseResponse(response: Response): Promise<ChatCompletionResponse> {
  // Sprawdź status odpowiedzi
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    
    if (response.status === 401) {
      throw new APIError('Invalid API key', 401);
    }
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new APIError('Rate limit exceeded', 429, {
        retryAfter: retryAfter ? parseInt(retryAfter) : undefined,
      });
    }
    
    if (response.status >= 500) {
      throw new APIError('OpenRouter API server error', response.status, {
        error: errorText.substring(0, 500),
      });
    }
    
    throw new APIError(
      `API request failed with status ${response.status}`,
      response.status,
      { error: errorText.substring(0, 500) }
    );
  }

  // Parsuj JSON
  try {
    const data = await response.json();
    return data as ChatCompletionResponse;
  } catch (error) {
    const text = await response.text().catch(() => 'Unable to read response');
    throw new ParseError('Failed to parse response as JSON', {
      error: error instanceof Error ? error.message : 'Unknown error',
      responseText: text.substring(0, 500),
    });
  }
}
```

### Krok 7: Implementacja Retry Logic

**Zadania:**
1. Zaimplementuj `retryRequest`
2. Zaimplementuj `isRetryableError`

**Kod:**

```typescript
private isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return true;
  }
  
  if (error instanceof TimeoutError) {
    return true;
  }
  
  if (error instanceof APIError) {
    // Retry tylko dla błędów serwera (5xx) i rate limits (429)
    return error.statusCode >= 500 || error.statusCode === 429;
  }
  
  return false;
}

private async retryRequest<T>(
  fn: () => Promise<T>,
  retries: number,
  attempt: number = 1
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && this.isRetryableError(error)) {
      const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
      
      this.log('warn', `Request failed, retrying in ${delay}ms (attempt ${attempt}/${this.maxRetries})`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      await this.sleep(delay);
      return this.retryRequest(fn, retries - 1, attempt + 1);
    }
    
    throw error;
  }
}
```

### Krok 8: Implementacja Głównej Metody `chatCompletion`

**Zadania:**
1. Zaimplementuj publiczną metodę `chatCompletion`
2. Połącz wszystkie komponenty (build, execute, parse, retry)

**Kod:**

```typescript
async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  // Walidacja podstawowa
  if (!request.messages || request.messages.length === 0) {
    throw new ValidationError('At least one message is required');
  }

  // Buduj request
  const apiRequest = this.buildRequest(request);
  const timeout = request.timeout || this.defaultTimeout;

  this.log('info', 'Sending chat completion request', {
    model: apiRequest.model,
    messagesCount: apiRequest.messages.length,
    hasResponseFormat: !!apiRequest.response_format,
  });

  // Wykonaj request z retry logic
  const response = await this.retryRequest(
    () => this.executeRequest(apiRequest, timeout),
    this.maxRetries
  );

  // Parsuj odpowiedź
  const parsedResponse = await this.parseResponse(response);

  this.log('info', 'Chat completion successful', {
    model: parsedResponse.model,
    choicesCount: parsedResponse.choices?.length || 0,
  });

  return parsedResponse;
}
```

### Krok 9: Implementacja Metod Pomocniczych

**Zadania:**
1. Zaimplementuj `setDefaultModel`, `getDefaultModel`
2. Zaimplementuj `setDefaultTimeout`, `getDefaultTimeout`
3. Zaimplementuj `validateApiKey`
4. Zaimplementuj `log` i `sanitizeForLogging`

**Kod:**

```typescript
setDefaultModel(model: string): void {
  if (!model || model.trim().length === 0) {
    throw new ValidationError('Model name cannot be empty');
  }
  this.defaultModel = model;
}

getDefaultModel(): string {
  return this.defaultModel;
}

setDefaultTimeout(timeout: number): void {
  this.defaultTimeout = this.validateTimeout(timeout);
}

getDefaultTimeout(): number {
  return this.defaultTimeout;
}

async validateApiKey(): Promise<boolean> {
  try {
    await this.chatCompletion({
      messages: [
        {
          role: 'user',
          content: 'test',
        },
      ],
      maxTokens: 1,
    });
    return true;
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 401) {
      return false;
    }
    // Inne błędy mogą oznaczać problemy sieciowe, niekoniecznie nieprawidłowy key
    throw error;
  }
}

private log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
  if (!this.enableLogging) {
    return;
  }

  const sanitizedData = data ? this.sanitizeForLogging(data) : undefined;
  const logMessage = `[OpenRouterService] ${message}`;

  switch (level) {
    case 'info':
      console.log(logMessage, sanitizedData);
      break;
    case 'warn':
      console.warn(logMessage, sanitizedData);
      break;
    case 'error':
      console.error(logMessage, sanitizedData);
      break;
  }
}

private sanitizeForLogging(data: unknown): unknown {
  if (typeof data === 'string') {
    return data.length > 500 ? data.substring(0, 500) + '...' : data;
  }

  if (Array.isArray(data)) {
    return data.map(item => this.sanitizeForLogging(item));
  }

  if (data && typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('key') ||
        lowerKey.includes('token') ||
        lowerKey.includes('password') ||
        lowerKey.includes('apikey')
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = this.sanitizeForLogging(value);
      }
    }
    return sanitized;
  }

  return data;
}
```

### Krok 10: Definicja Typów i Interfejsów

**Zadania:**
1. Zdefiniuj wszystkie typy i interfejsy na początku pliku

**Kod:**

```typescript
// Konfiguracja
export interface OpenRouterServiceConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultTimeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  httpReferer?: string;
  httpTitle?: string;
  enableLogging?: boolean;
}

// Request
export interface ChatCompletionRequest {
  model?: string;
  messages: Message[];
  systemMessage?: string;
  responseFormat?: ResponseFormat;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  maxTokens?: number;
  timeout?: number;
}

// Response
export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Message
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Response Format
export interface ResponseFormat {
  type: 'json_schema';
  jsonSchema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>; // JSON Schema
  };
}

// Internal API Request
interface OpenRouterAPIRequest {
  model: string;
  messages: Message[];
  response_format?: object;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
}

// Model Parameters
interface ModelParameters {
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}
```

### Krok 11: Testowanie i Dokumentacja

**Zadania:**
1. Utwórz przykłady użycia
2. Dodaj komentarze JSDoc do wszystkich publicznych metod
3. Przetestuj różne scenariusze

**Przykład użycia w Edge Function:**

```typescript
import { OpenRouterService } from '@/lib/api/openrouter';

const openRouterService = new OpenRouterService({
  apiKey: Deno.env.get('OPENROUTER_API_KEY')!,
  defaultModel: 'amazon/nova-2-lite-v1:free',
  defaultTimeout: 30000,
  httpReferer: Deno.env.get('SUPABASE_URL'),
  httpTitle: '10xCards',
});

const response = await openRouterService.chatCompletion({
  systemMessage: 'You are an expert educational content creator.',
  messages: [
    {
      role: 'user',
      content: prompt,
    },
  ],
  responseFormat: {
    type: 'json_schema',
    jsonSchema: {
      name: 'flashcards_schema',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          flashcards: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                correct_answer: { type: 'string' },
                domain: { type: 'string' },
              },
              required: ['question', 'correct_answer'],
            },
          },
          detected_domain: { type: 'string' },
        },
        required: ['flashcards'],
      },
    },
  },
  temperature: 0.7,
  maxTokens: 4000,
});

const content = response.choices[0]?.message?.content;
```

## Podsumowanie

Plan implementacji usługi OpenRouter obejmuje:

1. **Kompleksową strukturę klasy** z wyraźnym podziałem na publiczne i prywatne metody
2. **Pełną obsługę błędów** z hierarchią klas błędów i retry logic
3. **Bezpieczeństwo** z sanityzacją danych i bezpiecznym przechowywaniem API keys
4. **Elastyczną konfigurację** wspierającą wszystkie funkcje OpenRouter API
5. **Dokumentację** z przykładami użycia i komentarzami JSDoc

Usługa jest gotowa do użycia w Supabase Edge Functions i może być łatwo rozszerzona o dodatkowe funkcjonalności w przyszłości.

