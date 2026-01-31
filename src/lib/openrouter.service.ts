/**
 * OpenRouter Service
 * 
 * Reużywalna klasa TypeScript do komunikacji z API OpenRouter.ai
 * Zapewnia abstrakcję dla generowania odpowiedzi z modeli językowych (LLM)
 * z pełną obsługą komunikatów systemowych, structured outputs, konfiguracji modelu i parametrów generowania.
 */

// ============================================================================
// TYPY I INTERFEJSY
// ============================================================================

/**
 * Konfiguracja usługi OpenRouter
 */
export interface OpenRouterServiceConfig {
  apiKey: string;                    // Wymagane: OpenRouter API key
  baseUrl?: string;                  // Opcjonalne: URL API (domyślnie: 'https://openrouter.ai/api/v1')
  defaultModel?: string;             // Opcjonalne: Domyślny model (domyślnie: 'arcee-ai/trinity-mini:free')
  defaultTimeout?: number;           // Opcjonalne: Domyślny timeout w ms (domyślnie: 30000)
  maxRetries?: number;               // Opcjonalne: Maksymalna liczba ponownych prób (domyślnie: 3)
  retryDelay?: number;               // Opcjonalne: Opóźnienie między ponownymi próbami w ms (domyślnie: 1000)
  httpReferer?: string;              // Opcjonalne: HTTP-Referer header
  httpTitle?: string;                // Opcjonalne: X-Title header
  enableLogging?: boolean;            // Opcjonalne: Włączanie logowania (domyślnie: true)
}

/**
 * Request do chat completion
 */
export interface ChatCompletionRequest {
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

/**
 * Odpowiedź z chat completion
 */
export interface ChatCompletionResponse {
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

/**
 * Komunikat w konwersacji
 */
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Format odpowiedzi (structured output)
 */
export interface ResponseFormat {
  type: 'json_schema';
  jsonSchema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>; // JSON Schema
  };
}

/**
 * Wewnętrzny request do OpenRouter API
 */
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

/**
 * Parametry modelu do walidacji
 */
interface ModelParameters {
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// ============================================================================
// KLASY BŁĘDÓW
// ============================================================================

/**
 * Bazowa klasa błędu dla OpenRouter Service
 */
export class OpenRouterServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'OpenRouterServiceError';
    // Zachowaj poprawny stack trace dla V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OpenRouterServiceError);
    }
  }
}

/**
 * Błąd konfiguracji
 */
export class ConfigurationError extends OpenRouterServiceError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}

/**
 * Błąd walidacji
 */
export class ValidationError extends OpenRouterServiceError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Błąd API
 */
export class APIError extends OpenRouterServiceError {
  constructor(
    message: string,
    public readonly statusCode: number,
    details?: Record<string, unknown>
  ) {
    super(message, 'API_ERROR', details);
    this.name = 'APIError';
  }
}

/**
 * Błąd timeout
 */
export class TimeoutError extends OpenRouterServiceError {
  constructor(timeout: number, details?: Record<string, unknown>) {
    super(
      `Request timed out after ${timeout}ms`,
      'TIMEOUT_ERROR',
      { timeout, ...details }
    );
    this.name = 'TimeoutError';
  }
}

/**
 * Błąd sieciowy
 */
export class NetworkError extends OpenRouterServiceError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

/**
 * Błąd parsowania
 */
export class ParseError extends OpenRouterServiceError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'PARSE_ERROR', details);
    this.name = 'ParseError';
  }
}

// ============================================================================
// GŁÓWNA KLASA SERWISU
// ============================================================================

/**
 * OpenRouter Service
 * 
 * Klasa do komunikacji z API OpenRouter.ai
 */
export class OpenRouterService {
  // Pola prywatne
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private defaultModel: string;
  private defaultTimeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly httpReferer?: string;
  private readonly httpTitle?: string;
  private readonly enableLogging: boolean;

  /**
   * Konstruktor
   * 
   * @param config - Konfiguracja usługi
   * @throws {ConfigurationError} Jeśli konfiguracja jest nieprawidłowa
   */
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
    this.defaultModel = config.defaultModel || 'arcee-ai/trinity-mini:free';
    this.defaultTimeout = this.validateTimeout(config.defaultTimeout || 30000);
    this.maxRetries = this.validateRetries(config.maxRetries || 3);
    this.retryDelay = this.validateRetryDelay(config.retryDelay || 1000);
    this.httpReferer = config.httpReferer;
    this.httpTitle = config.httpTitle;
    this.enableLogging = config.enableLogging !== false;
  }

  /**
   * Waliduje timeout
   * 
   * @param timeout - Timeout w milisekundach
   * @returns Zwalidowany timeout
   * @throws {ConfigurationError} Jeśli timeout jest poza dozwolonym zakresem
   */
  private validateTimeout(timeout: number): number {
    if (timeout < 1000 || timeout > 300000) {
      throw new ConfigurationError('Timeout must be between 1000 and 300000 ms');
    }
    return timeout;
  }

  /**
   * Waliduje liczbę ponownych prób
   * 
   * @param retries - Liczba ponownych prób
   * @returns Zwalidowana liczba ponownych prób
   * @throws {ConfigurationError} Jeśli liczba jest poza dozwolonym zakresem
   */
  private validateRetries(retries: number): number {
    if (retries < 0 || retries > 10 || !Number.isInteger(retries)) {
      throw new ConfigurationError('Max retries must be an integer between 0 and 10');
    }
    return retries;
  }

  /**
   * Waliduje opóźnienie między ponownymi próbami
   * 
   * @param delay - Opóźnienie w milisekundach
   * @returns Zwalidowane opóźnienie
   * @throws {ConfigurationError} Jeśli opóźnienie jest poza dozwolonym zakresem
   */
  private validateRetryDelay(delay: number): number {
    if (delay < 0 || delay > 10000) {
      throw new ConfigurationError('Retry delay must be between 0 and 10000 ms');
    }
    return delay;
  }

  // ============================================================================
  // METODY BUDOWANIA REQUESTU
  // ============================================================================

  /**
   * Buduje obiekt requestu zgodny z formatem OpenRouter API
   * 
   * @param request - Request do przetworzenia
   * @returns Sformatowany request dla OpenRouter API
   * @throws {ValidationError} Jeśli parametry są nieprawidłowe
   */
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

  /**
   * Buduje tablicę komunikatów z uwzględnieniem komunikatu systemowego
   * 
   * @param systemMessage - Opcjonalny komunikat systemowy
   * @param messages - Tablica komunikatów użytkownika
   * @returns Tablica komunikatów w formacie OpenRouter
   * @throws {ValidationError} Jeśli brak komunikatów
   */
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

  /**
   * Buduje obiekt response_format dla structured outputs
   * 
   * @param responseFormat - Opcjonalny format odpowiedzi
   * @returns Obiekt response_format lub undefined
   */
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

  /**
   * Buduje nagłówki HTTP dla requestu
   * 
   * @returns Obiekt z nagłówkami
   */
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

  /**
   * Waliduje parametry modelu
   * 
   * @param params - Parametry do walidacji
   * @throws {ValidationError} Jeśli parametry są poza dozwolonym zakresem
   */
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

  // ============================================================================
  // METODY WYKONYWANIA REQUESTU
  // ============================================================================

  /**
   * Wykonuje request do OpenRouter API z obsługą timeoutu
   * 
   * @param request - Request do wykonania
   * @param timeout - Timeout w milisekundach
   * @returns Response z OpenRouter API
   * @throws {TimeoutError} Jeśli request przekroczy timeout
   * @throws {NetworkError} Jeśli wystąpi błąd sieciowy
   */
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

  /**
   * Parsuje odpowiedź z OpenRouter API
   * 
   * @param response - Response z fetch
   * @returns Parsowana odpowiedź
   * @throws {APIError} Jeśli status odpowiedzi wskazuje na błąd
   * @throws {ParseError} Jeśli nie można sparsować odpowiedzi jako JSON
   */
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
          retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
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

  /**
   * Sprawdza czy błąd jest retryable (można ponowić próbę)
   * 
   * @param error - Błąd do sprawdzenia
   * @returns true jeśli błąd jest retryable
   */
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

  /**
   * Wykonuje request z logiką ponownych prób
   * 
   * @param fn - Funkcja do wykonania
   * @param retries - Liczba pozostałych prób
   * @param attempt - Numer aktualnej próby (domyślnie: 1)
   * @returns Wynik funkcji
   * @throws Błąd jeśli wszystkie próby się nie powiodły
   */
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

  /**
   * Pomocnicza metoda do opóźnienia (sleep)
   * 
   * @param ms - Czas opóźnienia w milisekundach
   * @returns Promise który rozwiązuje się po określonym czasie
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // PUBLICZNE METODY API
  // ============================================================================

  /**
   * Główna metoda do generowania odpowiedzi z LLM
   * 
   * @param request - Request do chat completion
   * @returns Odpowiedź z LLM
   * @throws {ValidationError} Jeśli request jest nieprawidłowy
   * @throws {APIError} Jeśli wystąpi błąd API
   * @throws {TimeoutError} Jeśli request przekroczy timeout
   * @throws {NetworkError} Jeśli wystąpi błąd sieciowy
   * @throws {ParseError} Jeśli nie można sparsować odpowiedzi
   */
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

  // ============================================================================
  // METODY POMOCNICZE
  // ============================================================================

  /**
   * Ustawia domyślny model
   * 
   * @param model - Nazwa modelu
   * @throws {ValidationError} Jeśli nazwa modelu jest pusta
   */
  setDefaultModel(model: string): void {
    if (!model || model.trim().length === 0) {
      throw new ValidationError('Model name cannot be empty');
    }
    this.defaultModel = model;
  }

  /**
   * Zwraca domyślny model
   * 
   * @returns Nazwa domyślnego modelu
   */
  getDefaultModel(): string {
    return this.defaultModel;
  }

  /**
   * Ustawia domyślny timeout
   * 
   * @param timeout - Timeout w milisekundach
   * @throws {ConfigurationError} Jeśli timeout jest poza dozwolonym zakresem
   */
  setDefaultTimeout(timeout: number): void {
    this.defaultTimeout = this.validateTimeout(timeout);
  }

  /**
   * Zwraca domyślny timeout
   * 
   * @returns Domyślny timeout w milisekundach
   */
  getDefaultTimeout(): number {
    return this.defaultTimeout;
  }

  /**
   * Waliduje API key poprzez wykonanie testowego requestu
   * 
   * @returns true jeśli API key jest prawidłowy
   * @throws {APIError} Jeśli wystąpi inny błąd niż 401
   */
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

  /**
   * Loguje wiadomość (jeśli logowanie jest włączone)
   * 
   * @param level - Poziom logowania
   * @param message - Wiadomość
   * @param data - Opcjonalne dane do zalogowania
   */
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

  /**
   * Sanityzuje dane przed logowaniem (usuwa wrażliwe informacje)
   * 
   * @param data - Dane do sanityzacji
   * @returns Zsanityzowane dane
   */
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
}

