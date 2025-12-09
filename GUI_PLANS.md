# Plany GUI (Graphical User Interface)

## Wymagania funkcjonalne

### Konfiguracja długości pytań i odpowiedzi

W interfejsie użytkownika musi być możliwość ręcznego skonfigurowania limitów długości dla pytań i odpowiedzi podczas generowania fiszek.

#### Szczegóły wymagania:

1. **Konfiguracja długości pytań:**
   - Użytkownik powinien móc ustawić minimalną i maksymalną długość pytań (w znakach)
   - Domyślne wartości: min 50 znaków, max 500 znaków
   - Wartości powinny być walidowane zgodnie z ograniczeniami bazy danych

2. **Konfiguracja długości odpowiedzi:**
   - Użytkownik powinien móc ustawić maksymalną długość odpowiedzi (w znakach)
   - Domyślna wartość: 500 znaków
   - Wartość powinna być walidowana zgodnie z ograniczeniami bazy danych

3. **Interfejs użytkownika:**
   - Pola numeryczne (input type="number") do wprowadzania wartości
   - Etykiety opisujące każdy parametr
   - Walidacja po stronie klienta przed wysłaniem żądania
   - Komunikaty błędów, jeśli wartości są poza dozwolonym zakresem

4. **Integracja z API:**
   - Parametry długości powinny być przekazywane w żądaniu do endpointu `/api/generations`
   - Edge Function `generate-flashcards` powinna akceptować te parametry i używać ich do:
     - Konstrukcji promptu dla AI
     - Walidacji wygenerowanych fiszek

#### Przykładowa struktura żądania:

```typescript
{
  source_text: string;
  domain?: string;
  question_min_length?: number;  // domyślnie 50
  question_max_length?: number; // domyślnie 500
  answer_max_length?: number;    // domyślnie 500
}
```

#### Ograniczenia bazy danych:

- **Pytania:** min 50 znaków, max 500 znaków (CHECK constraint w tabelach `flashcards` i `flashcard_proposals`)
- **Odpowiedzi:** max 500 znaków (brak minimalnej długości)

#### Uwagi implementacyjne:

- Wartości domyślne powinny być zgodne z aktualnymi ograniczeniami bazy danych
- Jeśli użytkownik ustawi wartości poza dozwolonym zakresem, powinien otrzymać odpowiedni komunikat błędu
- Konfiguracja powinna być zapisywana w preferencjach użytkownika (opcjonalnie, dla przyszłych sesji)

