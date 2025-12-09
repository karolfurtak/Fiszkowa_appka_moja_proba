# Plany GUI (Graphical User Interface)

## Wymagania funkcjonalne

### Konfiguracja długości pytań i odpowiedzi

W interfejsie użytkownika musi być możliwość ręcznego skonfigurowania limitów długości dla pytań i odpowiedzi podczas generowania fiszek.

#### Szczegóły wymagania:

1. **Konfiguracja długości pytań:**
   - Użytkownik powinien móc ustawić minimalną i maksymalną długość pytań (w znakach)
   - Domyślne wartości: min 50 znaków, max 10000 znaków
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
  question_max_length?: number; // domyślnie 10000
  answer_max_length?: number;    // domyślnie 500
}
```

#### Ograniczenia bazy danych:

- **Pytania:** min 50 znaków, max 10000 znaków (CHECK constraint w tabelach `flashcards` i `flashcard_proposals`)
- **Odpowiedzi:** max 500 znaków (brak minimalnej długości)

#### Uwagi implementacyjne:

- Wartości domyślne powinny być zgodne z aktualnymi ograniczeniami bazy danych
- Jeśli użytkownik ustawi wartości poza dozwolonym zakresem, powinien otrzymać odpowiedni komunikat błędu
- Konfiguracja powinna być zapisywana w preferencjach użytkownika (opcjonalnie, dla przyszłych sesji)

---

### Wybór języka generowania fiszek

W interfejsie użytkownika musi być możliwość wyboru języka, w którym mają zostać wygenerowane fiszki.

#### Szczegóły wymagania:

1. **Rozwijane menu wyboru języka:**
   - Użytkownik powinien móc wybrać język z listy rozwijanej (dropdown/select)
   - Domyślna opcja: "Automatycznie" (wykrywanie języka z tekstu źródłowego)
   - Lista dostępnych języków powinna zawierać najpopularniejsze opcje:
     - Polski
     - English (Angielski)
     - Deutsch (Niemiecki)
     - Français (Francuski)
     - Español (Hiszpański)
     - Italiano (Włoski)
     - Русский (Rosyjski)
     - 中文 (Chiński)
     - 日本語 (Japoński)
     - Português (Portugalski)
     - Inne języki (według potrzeb)

2. **Interfejs użytkownika:**
   - Element HTML: `<select>` (dropdown menu)
   - Etykieta: "Język generowania fiszek" lub "Language for flashcards"
   - Domyślna wartość: "auto" (automatyczne wykrywanie)
   - Opcje powinny być wyświetlane w formacie: "Nazwa języka (kod ISO)" np. "Polski (pl)", "English (en)"
   - Tooltip/pomoc: "Wybierz język, w którym mają zostać wygenerowane fiszki. Opcja 'Automatycznie' wykryje język z tekstu źródłowego."

3. **Zachowanie:**
   - Jeśli wybrano "Automatycznie": AI wykrywa język z tekstu źródłowego i generuje fiszki w tym języku
   - Jeśli wybrano konkretny język: AI generuje fiszki w wybranym języku, niezależnie od języka tekstu źródłowego
   - Walidacja: język musi być z listy dozwolonych wartości

4. **Integracja z API:**
   - Parametr `language` powinien być przekazywany w żądaniu do endpointu `/api/generations`
   - Edge Function `generate-flashcards` powinna akceptować parametr `language` i używać go w prompcie dla AI
   - Wartości:
     - `"auto"` - automatyczne wykrywanie (domyślne)
     - `"pl"` - Polski
     - `"en"` - English
     - `"de"` - Deutsch
     - `"fr"` - Français
     - `"es"` - Español
     - `"it"` - Italiano
     - `"ru"` - Русский
     - `"zh"` - 中文
     - `"ja"` - 日本語
     - `"pt"` - Português
     - Inne kody ISO 639-1

#### Przykładowa struktura żądania (zaktualizowana):

```typescript
{
  source_text: string;
  domain?: string;
  language?: string;              // "auto" | "pl" | "en" | "de" | "fr" | "es" | "it" | "ru" | "zh" | "ja" | "pt" | ...
  question_min_length?: number;   // domyślnie 50
  question_max_length?: number;  // domyślnie 10000
  answer_max_length?: number;    // domyślnie 500
}
```

#### Przykłady użycia:

**Przykład 1: Automatyczne wykrywanie (domyślne)**
```json
{
  "source_text": "Fotosynteza to proces...",
  "language": "auto"
}
```
→ AI wykryje, że tekst jest po polsku i wygeneruje fiszki po polsku

**Przykład 2: Wymuszenie języka angielskiego**
```json
{
  "source_text": "Fotosynteza to proces...",
  "language": "en"
}
```
→ AI wygeneruje fiszki po angielsku, nawet jeśli tekst źródłowy jest po polsku

**Przykład 3: Wymuszenie języka polskiego**
```json
{
  "source_text": "Photosynthesis is a process...",
  "language": "pl"
}
```
→ AI wygeneruje fiszki po polsku, nawet jeśli tekst źródłowy jest po angielsku

#### Uwagi implementacyjne:

- Domyślna wartość: `"auto"` (jeśli parametr nie zostanie podany)
- Walidacja: język musi być z listy dozwolonych kodów ISO 639-1
- Edge Function powinna zaktualizować prompt AI, aby uwzględniał wybrany język
- Jeśli `language === "auto"`, prompt powinien zawierać instrukcję: "Generate flashcards in the SAME LANGUAGE as the source text"
- Jeśli `language` jest konkretnym kodem (np. "pl", "en"), prompt powinien zawierać: "Generate ALL flashcards in [language name] language"
- Lista języków może być rozszerzona w przyszłości bez zmiany struktury API

---

## Pytania i Zalecenia - Architektura UI dla MVP

### 1. Struktura aplikacji i routing

**Pytanie:** Czy aplikacja powinna mieć strukturę Single Page Application (SPA) czy Multi-Page Application (MPA) z routingiem?

**Rekomendacja:** Ze względu na użycie Astro, zalecam hybrydowe podejście - główne widoki jako osobne strony Astro (MPA) dla lepszego SEO i wydajności, a interaktywne komponenty (generator, tryb nauki) jako React SPA wewnątrz stron. Struktura tras: `/` (dashboard), `/generate` (generator), `/deck/[id]` (widok talii), `/deck/[id]/review` (tryb treningu), `/deck/[id]/study` (tryb nauki), `/verify/[session_id]` (weryfikacja propozycji), `/settings` (ustawienia konta).

### 2. Przepływ użytkownika - generowanie do zapisania

**Pytanie:** Jak powinien wyglądać przepływ użytkownika od generowania fiszek do ich zapisania w talii?

**Rekomendacja:** Liniowy przepływ: Dashboard → Generator (wklejenie tekstu + konfiguracja) → Ekran ładowania (progress indicator podczas generowania) → Ekran weryfikacji (lista propozycji z możliwością akceptacji/odrzucenia/edycji) → Wybór talii (dropdown z istniejącymi + opcja utworzenia nowej) → Powrót do Dashboard z komunikatem sukcesu. Każdy krok powinien mieć możliwość powrotu do poprzedniego oraz wyraźne wskaźniki postępu.

### 3. Widok weryfikacji propozycji

**Pytanie:** Jak powinien być zorganizowany widok weryfikacji propozycji fiszek, aby użytkownik mógł efektywnie przeglądać i akceptować wiele propozycji?

**Rekomendacja:** Widok weryfikacji powinien mieć układ kart (card layout) z każdą propozycją jako osobną kartą. Każda karta zawiera: pytanie, odpowiedź, domenę, checkbox "Akceptuj" (domyślnie zaznaczony), przycisk "Odrzuć", przycisk "Regeneruj dystraktory" (jeśli dotyczy), przycisk "Edytuj". Na górze: przycisk "Akceptuj wszystkie", "Odrzuć wszystkie", licznik zaakceptowanych/odrzuconych. Na dole: dropdown wyboru talii + przycisk "Zapisz zaakceptowane". Użyj infinite scroll lub paginacji dla większych sesji generowania.

### 4. Interfejs trybu treningu (spaced repetition)

**Pytanie:** Jak powinien być zaprojektowany interfejs trybu treningu (spaced repetition) z testem wielokrotnego wyboru?

**Rekomendacja:** Pełnoekranowy widok z jedną fiszką na raz. Układ: góra - pasek postępu (X/Y fiszek), środek - pytanie (duży, czytelny tekst), dół - 4 przyciski odpowiedzi (losowo ułożone, równy rozmiar, wyraźne style hover/focus). Po wyborze: natychmiastowa wizualna informacja zwrotna (zielony/czerwony kolor, ikona ✓/✗), krótkie opóźnienie (1-2s), automatyczne przejście do następnej fiszki. Na końcu sesji: ekran podsumowania z wynikiem, listą błędnych odpowiedzi, przyciskiem "Zakończ" powracającym do talii.

### 5. Dashboard z listą talii

**Pytanie:** Jak powinien być zorganizowany dashboard z listą talii, aby użytkownik mógł szybko zobaczyć postęp i rozpocząć naukę?

**Rekomendacja:** Dashboard powinien mieć układ siatki (grid) lub listy kart talii. Każda karta talii zawiera: nazwę talii, liczbę fiszek do powtórki (due today) - wyróżniona, całkowitą liczbę fiszek, przycisk "Rozpocznij powtórkę" (aktywny tylko jeśli są fiszki do powtórki), przycisk "Tryb nauki", menu kontekstowe (edytuj, usuń). Na górze: przycisk "Nowa talia", przycisk "Generuj fiszki", wyszukiwarka talii. Jeśli brak talii: ekran powitalny z CTA "Utwórz pierwszą talię" lub "Wygeneruj fiszki".

### 6. Autoryzacja i ochrona tras

**Pytanie:** Jak powinna być obsługiwana autoryzacja i ochrona tras w interfejsie użytkownika?

**Rekomendacja:** Implementuj middleware autoryzacji w Astro, który sprawdza sesję użytkownika przed renderowaniem chronionych stron. Nieautoryzowani użytkownicy są przekierowywani na `/login` z parametrem `redirect` wskazującym na docelową stronę. Wszystkie komponenty React powinny używać Supabase client do sprawdzania stanu autoryzacji. Chronione trasy: `/`, `/generate`, `/deck/*`, `/settings`. Publiczne: `/login`, `/register`. Użyj Supabase Auth helpers dla zarządzania sesją po stronie klienta.

### 7. Formularz generowania z konfiguracją zaawansowaną

**Pytanie:** Jak powinien być zaprojektowany formularz generowania fiszek z konfiguracją zaawansowaną (długość pytań, język, domena)?

**Rekomendacja:** Formularz powinien mieć układ dwukolumnowy lub accordion z sekcjami: "Podstawowe" (pole tekstowe source_text - duże textarea, rozwijane), "Zaawansowane" (collapsible section z: dropdown języka, pole domeny, pola numeryczne min/max długości pytań, max długości odpowiedzi). Domyślnie sekcja zaawansowana jest zwinięta. Przycisk "Generuj" na dole formularza. Walidacja po stronie klienta przed wysłaniem: sprawdzenie długości tekstu (min 100 znaków), zakresów długości pytań/odpowiedzi. Wyświetlanie błędów inline pod odpowiednimi polami.

### 8. Widok trybu nauki (swobodne przeglądanie)

**Pytanie:** Jak powinien być zaprojektowany widok trybu nauki (swobodne przeglądanie) z odwracalnymi kartami?

**Rekomendacja:** Widok podobny do trybu treningu, ale bez przycisków odpowiedzi. Karta fiszki z pytaniem widocznym, kliknięcie lub przycisk "Pokaż odpowiedź" odsłania odpowiedź (animacja flip). Nawigacja: przyciski "Poprzednia" / "Następna" lub gesty swipe (na urządzeniach dotykowych), lista wszystkich fiszek w talii po lewej stronie (sidebar) z możliwością szybkiego przejścia. Wskaźnik pozycji (np. "5/20"). Możliwość filtrowania po statusie (wszystkie/learning/mastered).

### 9. Zarządzanie stanem i komunikacja z API

**Pytanie:** Jak powinna być obsługiwana komunikacja z API i zarządzanie stanem podczas długotrwałych operacji (generowanie fiszek może trwać 10-30 sekund)?

**Rekomendacja:** Użyj React Query (TanStack Query) lub podobnej biblioteki do zarządzania stanem i cache'owania danych z API. Dla generowania fiszek: implementuj WebSocket lub polling (co 2-3 sekundy) do sprawdzania statusu, wyświetlaj progress bar z szacowanym czasem. Dla operacji accept/reject: optymistic updates - natychmiastowa aktualizacja UI, rollback w przypadku błędu. Loading states: skeleton loaders dla list, spinners dla przycisków. Error boundaries dla obsługi błędów na poziomie komponentów.

### 10. System nawigacji i menu

**Pytanie:** Jak powinien być zaprojektowany system nawigacji i struktura menu w aplikacji?

**Rekomendacja:** Główna nawigacja powinna być w formie sidebar (desktop) lub bottom navigation (mobile). Elementy: Logo/Home (dashboard), "Moje talie" (dashboard), "Generuj fiszki", "Opanowane" (archiwum), "Ustawienia", "Wyloguj". Breadcrumbs dla głębszych poziomów (np. Dashboard > Talia "Biologia" > Tryb treningu). Aktywna trasa powinna być wyróżniona wizualnie. Mobile: hamburger menu z drawer. Użyj komponentów Shadcn/ui: NavigationMenu, Sidebar, Breadcrumb dla spójności.

