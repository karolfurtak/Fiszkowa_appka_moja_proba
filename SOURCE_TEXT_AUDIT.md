# Audyt Spójności Nazewnictwa: source_text

## Sprawdzenie wszystkich miejsc użycia

### ✅ 1. API Request Body (Postman/HTTP)
- **Format:** `source_text` (snake_case)
- **Lokalizacja:** Request body JSON
- **Przykład:**
  ```json
  {
    "source_text": "Photosynthesis is a process..."
  }
  ```
- **Status:** ✅ Spójne

### ✅ 2. Astro API Proxy (`src/pages/api/generations.ts`)
- **Format:** `source_text` (snake_case)
- **Lokalizacja:** Linia 61-63
- **Kod:**
  ```typescript
  if (body.source_text && !body.text) {
    body.text = body.source_text;
    delete body.source_text;
  }
  ```
- **Status:** ✅ Spójne

### ✅ 3. TypeScript Types (`src/types.ts`)
- **Format:** `source_text` (snake_case)
- **Lokalizacja:** Linia 253
- **Kod:**
  ```typescript
  export interface GenerateFlashcardsRequest {
    text?: string;
    source_text?: string; // Course requirement - alternative to "text"
    domain?: string;
  }
  ```
- **Status:** ✅ Spójne

### ✅ 4. Supabase Edge Function Interface (`supabase/functions/generate-flashcards/index.ts`)
- **Format:** `source_text` (snake_case)
- **Lokalizacja:** Linia 12
- **Kod:**
  ```typescript
  interface GenerateFlashcardsRequest {
    text?: string;
    source_text?: string; // Support course requirement (source_text)
    domain?: string;
  }
  ```
- **Status:** ✅ Spójne

### ⚠️ 5. Supabase Edge Function - Zmienna lokalna
- **Format:** `sourceText` (camelCase) - zmienna lokalna
- **Lokalizacja:** Linia 116
- **Kod:**
  ```typescript
  const sourceText = requestBody.text || requestBody.source_text;
  ```
- **Uwaga:** To jest zmienna lokalna w TypeScript, więc camelCase jest poprawne (standard TypeScript/JavaScript)
- **Status:** ✅ Poprawne (zmienna lokalna może być camelCase)

### ✅ 6. Test Script (`test-openrouter.ps1`)
- **Format:** `source_text` (snake_case)
- **Lokalizacja:** Linia 32
- **Kod:**
  ```powershell
  $bodyObject = @{
      source_text = $testText
      domain = "Biology"
  }
  ```
- **Status:** ✅ Spójne

### ✅ 7. Dokumentacja (`OPENROUTER_FLOW.md`)
- **Format:** `source_text` (snake_case)
- **Lokalizacja:** Linie 7, 9, 186
- **Status:** ✅ Spójne

### ✅ 8. Zasady Audytu (`rules/Audit.mdc`)
- **Format:** `source_text` (snake_case)
- **Lokalizacja:** Linia 28
- **Status:** ✅ Spójne

## Podsumowanie

### Wszystkie miejsca użycia `source_text`:

| Miejsce | Format | Status |
|---------|--------|--------|
| API Request Body | `source_text` (snake_case) | ✅ |
| Astro API Proxy | `source_text` (snake_case) | ✅ |
| TypeScript Types | `source_text` (snake_case) | ✅ |
| Edge Function Interface | `source_text` (snake_case) | ✅ |
| Edge Function - zmienna lokalna | `sourceText` (camelCase) | ✅ OK (zmienna lokalna) |
| Test Script | `source_text` (snake_case) | ✅ |
| Dokumentacja | `source_text` (snake_case) | ✅ |

## Wnioski

✅ **Wszystkie miejsca są spójne!**

- Wszystkie API/request body używają `source_text` (snake_case)
- Zmienna lokalna `sourceText` w Edge Function używa camelCase, co jest poprawne dla zmiennych lokalnych w TypeScript
- Wszystkie interfejsy i typy używają `source_text` (snake_case)
- Dokumentacja i testy używają `source_text` (snake_case)

**Konwencja:**
- **API/Request Body:** `source_text` (snake_case) - zgodne z konwencją API
- **Zmienne lokalne TypeScript:** `sourceText` (camelCase) - zgodne z konwencją TypeScript

---

**Data audytu:** 2025-12-08  
**Status:** ✅ Wszystko spójne

