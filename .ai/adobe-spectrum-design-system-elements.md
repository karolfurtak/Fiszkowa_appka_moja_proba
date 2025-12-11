# Adobe Spectrum Design System - Charakterystyka Elementów UI

## Wprowadzenie

Adobe Spectrum Design System to kompleksowy system projektowy stworzony przez Adobe, który kładzie nacisk na dostępność, spójność i profesjonalizm. System wykorzystuje neutralne kolory, wysokie kontrasty i wyraźne stany interaktywne.

---

## 1. Button

### Charakterystyka

**Wizualne:**
- **Kształt**: Proste, prostokątne przyciski z subtelnymi zaokrągleniami (border-radius: 4-6px)
- **Wysokość**: Standardowa 32px (small: 24px, large: 40px)
- **Padding**: Poziomy 16px, pionowy 8px dla standardowego rozmiaru
- **Cienie**: Minimalne lub brak cieni, subtelne podniesienie przy hover

**Kolory i Stany:**
- **Primary**: Adobe Spectrum Blue (`oklch(0.50 0.20 250)`) z białym tekstem
- **Secondary**: Neutralny szary z ciemnym tekstem
- **Quiet**: Przezroczysty background, kolorowy tekst
- **Destructive**: Czerwony dla akcji destrukcyjnych
- **Disabled**: 40% opacity, brak interakcji

**Stany Interaktywne:**
- **Default**: Pełna nasycenie koloru
- **Hover**: Ciemniejszy o ~10% lightness (np. `oklch(0.45 0.20 250)`)
- **Active/Pressed**: Jeszcze ciemniejszy, subtelne wciśnięcie wizualne
- **Focus**: Wyraźny ring w kolorze primary, 2px offset
- **Loading**: Spinner zamiast tekstu, zachowana szerokość

**Dostępność:**
- Minimalny kontrast 4.5:1 (WCAG AA)
- Focus indicator zawsze widoczny
- Keyboard navigation (Enter/Space)
- ARIA labels dla akcji

**Typografia:**
- Font-weight: 600 (semibold) dla primary, 400 (regular) dla secondary
- Font-size: 14px (standard), 12px (small), 16px (large)
- Letter-spacing: 0.01em

---

## 2. Input

### Charakterystyka

**Wizualne:**
- **Kształt**: Prostokątne pola z subtelnymi zaokrągleniami (4px)
- **Wysokość**: 32px standardowa
- **Border**: 1px solid, kolor `oklch(0.85 0 0)` (light) / `oklch(0.30 0 0)` (dark)
- **Padding**: 12px poziomy, 8px pionowy
- **Background**: Biały (light) / `oklch(0.18 0 0)` (dark)

**Stany:**
- **Default**: Subtelna granica, neutralny background
- **Hover**: Ciemniejsza granica (`oklch(0.75 0 0)`)
- **Focus**: Granica w kolorze primary, wyraźny ring (2px offset)
- **Error**: Czerwona granica (`oklch(0.55 0.22 25)`), czerwony tekst błędu
- **Disabled**: 40% opacity, szary background
- **Read-only**: Subtelny background, brak interakcji

**Typografia:**
- Font-size: 14px
- Line-height: 1.5
- Font-family: Source Sans Pro
- Placeholder: `oklch(0.45 0 0)` (light) / `oklch(0.70 0 0)` (dark)

**Dostępność:**
- Label zawsze widoczny (nie tylko placeholder)
- Error messages z `aria-describedby`
- `aria-invalid="true"` dla pól z błędami
- `aria-required="true"` dla wymaganych pól
- Keyboard navigation (Tab, Shift+Tab)

**Dodatkowe Elementy:**
- **Icons**: Prefix/suffix icons w kolorze muted
- **Validation**: Real-time validation z wyraźnymi komunikatami
- **Helper text**: Subtelny tekst pomocniczy poniżej pola

---

## 3. Typography

### Hierarchia Typograficzna

**Heading 1 (H1):**
- Font-size: 28px (mobile: 24px)
- Font-weight: 700 (bold)
- Line-height: 1.2
- Letter-spacing: -0.02em
- Color: `oklch(0.15 0 0)` (light) / `oklch(0.95 0 0)` (dark)
- Margin-bottom: 16px

**Heading 2 (H2):**
- Font-size: 24px (mobile: 20px)
- Font-weight: 600 (semibold)
- Line-height: 1.3
- Letter-spacing: -0.01em
- Margin-bottom: 12px

**Heading 3 (H3):**
- Font-size: 20px (mobile: 18px)
- Font-weight: 600
- Line-height: 1.4
- Margin-bottom: 10px

**Heading 4 (H4):**
- Font-size: 16px
- Font-weight: 600
- Line-height: 1.4
- Margin-bottom: 8px

**Body (Paragraph):**
- Font-size: 14px
- Font-weight: 400 (regular)
- Line-height: 1.5
- Color: `oklch(0.15 0 0)` (light) / `oklch(0.95 0 0)` (dark)
- Margin-bottom: 12px

**Body Small:**
- Font-size: 12px
- Font-weight: 400
- Line-height: 1.4
- Color: `oklch(0.45 0 0)` (muted)

**Caption:**
- Font-size: 11px
- Font-weight: 400
- Line-height: 1.3
- Color: `oklch(0.45 0 0)` (muted)
- Text-transform: uppercase (opcjonalnie)
- Letter-spacing: 0.05em

**Code/Monospace:**
- Font-family: Source Code Pro
- Font-size: 13px
- Background: `oklch(0.95 0 0)` (light) / `oklch(0.25 0 0)` (dark)
- Padding: 2px 6px
- Border-radius: 3px

**Dostępność:**
- Minimalny kontrast 4.5:1 dla body text
- 7:1 dla małego tekstu (WCAG AAA)
- Responsive font sizes
- Semantic HTML (h1-h6, p, span)

---

## 4. Card

### Charakterystyka

**Wizualne:**
- **Background**: Biały (light) / `oklch(0.18 0 0)` (dark)
- **Border**: Subtelna granica `oklch(0.85 0 0)` (light) / `oklch(0.30 0 0)` (dark)
- **Border-radius**: 6px
- **Padding**: 16px standardowy, 24px dla większych kart
- **Shadow**: Subtelny `shadow-sm` (0 1px 3px rgba(0,0,0,0.1))

**Struktura:**
- **Header**: Opcjonalny, padding-bottom: 12px, border-bottom dla separacji
- **Content**: Główna zawartość, padding: 16px
- **Footer**: Opcjonalny, padding-top: 12px, border-top dla separacji
- **Actions**: Przyciski w footerze, wyrównane do prawej

**Warianty:**
- **Default**: Standardowa karta z cieniem
- **Quiet**: Bez cienia, tylko border
- **Interactive**: Hover effect (subtle lift), cursor pointer
- **Selected**: Border w kolorze primary, background highlight

**Dostępność:**
- Semantic HTML (`<article>`, `<section>`)
- ARIA labels dla interaktywnych kart
- Keyboard navigation dla klikalnych kart

---

## 5. Modal/Dialog

### Charakterystyka

**Wizualne:**
- **Overlay**: `oklch(0 0 0 / 0.5)` z blur backdrop (4px)
- **Modal**: Biały background (light) / `oklch(0.18 0 0)` (dark)
- **Border-radius**: 8px
- **Max-width**: 480px (small), 640px (medium), 800px (large)
- **Shadow**: `shadow-xl` (0 20px 25px rgba(0,0,0,0.1))

**Struktura:**
- **Header**: 
  - Title: H3 typography
  - Close button: Top-right, 32x32px
  - Padding: 20px 24px
  - Border-bottom dla separacji
- **Content**: 
  - Padding: 24px
  - Scrollable jeśli zawartość długa
  - Max-height: 70vh
- **Footer**: 
  - Padding: 16px 24px
  - Border-top dla separacji
  - Actions: Przyciski wyrównane do prawej

**Zachowanie:**
- **Opening**: Fade-in + scale animation (0.95 → 1.0)
- **Closing**: Fade-out + scale animation
- **Focus trap**: Focus pozostaje w modalu
- **Escape key**: Zamyka modal
- **Click outside**: Zamyka modal (opcjonalnie)

**Dostępność:**
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` wskazujący na tytuł
- `aria-describedby` dla opisu (opcjonalnie)
- Focus management: focus na pierwszy interaktywny element
- Focus return: powrót focus do triggera po zamknięciu

**Warianty:**
- **Alert**: Dla ważnych komunikatów, bez możliwości zamknięcia przez click outside
- **Confirmation**: Dla potwierdzeń akcji
- **Form**: Dla formularzy w modalu

---

## 6. Form

### Charakterystyka

**Layout:**
- **Spacing**: 24px między sekcjami, 16px między polami
- **Alignment**: Labels wyrównane do lewej, pola pełnej szerokości
- **Grid**: Opcjonalnie 2-kolumnowy grid dla większych formularzy

**Struktura:**
- **Fieldset**: Grupowanie powiązanych pól
- **Legend**: Tytuł sekcji, H4 typography
- **Label**: 
  - Font-weight: 600
  - Font-size: 14px
  - Margin-bottom: 4px
  - Required indicator: Czerwona gwiazdka (*)
- **Input Group**: Grupowanie powiązanych inputów (np. data urodzenia)

**Validation:**
- **Real-time**: Walidacja podczas pisania (opcjonalnie)
- **On Submit**: Walidacja przy wysłaniu
- **Error State**: 
  - Czerwona granica inputa
  - Czerwony tekst błędu poniżej pola
  - Icon błędu (opcjonalnie)
- **Success State**: 
  - Zielona granica (opcjonalnie)
  - Checkmark icon

**Dostępność:**
- Wszystkie pola mają `<label>`
- Error messages z `aria-describedby`
- `aria-invalid="true"` dla błędnych pól
- `aria-required="true"` dla wymaganych
- Grupowanie powiązanych pól w `<fieldset>`

**Submit:**
- Primary button dla głównej akcji
- Secondary button dla anulowania
- Loading state podczas submit
- Success/Error feedback po submit

---

## 7. Navigation

### Charakterystyka

**Top Navigation:**
- **Height**: 48px
- **Background**: Biały (light) / `oklch(0.15 0 0)` (dark)
- **Border-bottom**: 1px solid `oklch(0.85 0 0)` (light) / `oklch(0.30 0 0)` (dark)
- **Padding**: 0 16px
- **Logo**: Po lewej, 32px wysokości
- **Links**: Poziomo, 16px spacing
- **Actions**: Po prawej (user menu, notifications)

**Sidebar Navigation:**
- **Width**: 240px (collapsed: 48px)
- **Background**: `oklch(0.97 0 0)` (light) / `oklch(0.15 0 0)` (dark)
- **Border-right**: 1px solid `oklch(0.85 0 0)`
- **Padding**: 8px

**Navigation Items:**
- **Height**: 32px
- **Padding**: 8px 12px
- **Border-radius**: 4px
- **Font-size**: 14px
- **Icon**: 16px, margin-right: 8px

**Stany:**
- **Default**: Neutralny background, muted text
- **Hover**: Subtelny background highlight
- **Active/Selected**: 
  - Background: Primary color (subtle)
  - Text: Primary color
  - Border-left: 3px solid primary (opcjonalnie)
- **Focus**: Ring w kolorze primary

**Hierarchia:**
- **Level 1**: Główne sekcje, font-weight: 600
- **Level 2**: Podsekcje, indent: 24px, font-weight: 400
- **Level 3**: Głębsze zagnieżdżenie, indent: 40px

**Dostępność:**
- Semantic HTML (`<nav>`, `<ul>`, `<li>`)
- `aria-current="page"` dla aktywnego linka
- Keyboard navigation (Arrow keys, Enter, Space)
- Skip links dla głównej zawartości

---

## 8. List

### Charakterystyka

**Wizualne:**
- **Spacing**: 8px między elementami (compact), 12px (comfortable)
- **Padding**: 12px 16px dla każdego elementu
- **Border-radius**: 4px dla interaktywnych elementów
- **Background**: Transparent (default), hover: subtle highlight

**Struktura:**
- **List Item**: 
  - Min-height: 40px
  - Display: flex
  - Align-items: center
  - Justify-content: space-between
- **Content**: 
  - Primary text: 14px, font-weight: 400
  - Secondary text: 12px, muted color
  - Metadata: Po prawej, muted color
- **Actions**: 
  - Icons/buttons po prawej
  - Opcjonalne menu (3 dots)

**Warianty:**
- **Simple List**: Tylko tekst, bez interakcji
- **Interactive List**: Hover effect, clickable
- **Selectable List**: Checkbox/radio, selected state
- **Draggable List**: Drag handle, visual feedback podczas drag

**Stany:**
- **Default**: Transparent background
- **Hover**: `oklch(0.95 0 0)` background (light) / `oklch(0.25 0 0)` (dark)
- **Selected**: Primary color background (subtle)
- **Focus**: Ring w kolorze primary

**Dostępność:**
- Semantic HTML (`<ul>`, `<ol>`, `<li>`)
- `aria-selected="true"` dla wybranych elementów
- `aria-checked` dla checkbox/radio
- Keyboard navigation (Arrow keys, Enter, Space)

---

## 9. Feedback

### Toast/Notification

**Wizualne:**
- **Position**: Top-right (default), opcjonalnie inne pozycje
- **Width**: 320px (max)
- **Background**: Biały (light) / `oklch(0.18 0 0)` (dark)
- **Border-radius**: 6px
- **Shadow**: `shadow-lg`
- **Padding**: 16px
- **Icon**: 20px, margin-right: 12px

**Typy:**
- **Info**: Niebieski icon i accent
- **Success**: Zielony icon i accent
- **Warning**: Pomarańczowy icon i accent
- **Error**: Czerwony icon i accent

**Zachowanie:**
- **Auto-dismiss**: 5 sekund (opcjonalnie)
- **Manual dismiss**: Close button
- **Stacking**: Wiele toastów w stosie
- **Animation**: Slide-in from right, fade-out

**Dostępność:**
- `role="alert"` dla ważnych komunikatów
- `aria-live="polite"` dla informacyjnych
- `aria-atomic="true"`
- Keyboard dismissible

### Progress Indicator

**Wizualne:**
- **Height**: 4px (linear), 32px (circular)
- **Color**: Primary color
- **Background**: `oklch(0.90 0 0)` (light) / `oklch(0.25 0 0)` (dark)
- **Border-radius**: 2px (linear)

**Stany:**
- **Indeterminate**: Animowany pasek/circle
- **Determinate**: Pasek z procentem
- **Complete**: Zielony, checkmark icon

**Dostępność:**
- `role="progressbar"`
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-label` dla opisu

### Skeleton Loader

**Wizualne:**
- **Background**: `oklch(0.95 0 0)` (light) / `oklch(0.25 0 0)` (dark)
- **Animation**: Shimmer effect
- **Shape**: Odzwierciedla finalną zawartość

---

## 10. Layout

### Grid System

**Breakpoints:**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Wide**: > 1440px

**Container:**
- **Max-width**: 1280px (desktop)
- **Padding**: 16px (mobile), 24px (desktop)
- **Margin**: Auto (centered)

**Grid:**
- **Columns**: 12 kolumn (desktop), 8 (tablet), 4 (mobile)
- **Gutter**: 16px (mobile), 24px (desktop)
- **Gap**: 16px standardowy

### Spacing Scale

- **2px**: XS spacing (tight)
- **4px**: S spacing (compact)
- **8px**: M spacing (standard)
- **16px**: L spacing (comfortable)
- **24px**: XL spacing (spacious)
- **32px**: 2XL spacing (very spacious)
- **48px**: 3XL spacing (section spacing)

### Z-index Scale

- **1**: Base content
- **10**: Dropdowns
- **20**: Sticky elements
- **30**: Overlays
- **40**: Modals
- **50**: Tooltips, popovers
- **100**: Maximum (rarely used)

### Responsive Patterns

**Mobile First:**
- Design zaczyna od mobile
- Progressive enhancement dla większych ekranów
- Touch-friendly targets (min 44x44px)

**Breakpoint Strategy:**
- `min-width` media queries
- Fluid typography (clamp)
- Flexible images (max-width: 100%)

---

## Podsumowanie Zasad Adobe Spectrum

### Kluczowe Zasady

1. **Dostępność First**: Wszystkie komponenty spełniają WCAG AA minimum
2. **Wysoki Kontrast**: Minimalny 4.5:1, preferowane 7:1
3. **Neutralność**: Dominacja neutralnych szarości, kolory akcentowe oszczędnie
4. **Spójność**: Jednolite wzorce w całym systemie
5. **Profesjonalizm**: Czyste, minimalistyczne estetyki
6. **Responsywność**: Mobile-first approach
7. **Performance**: Optymalizacja animacji i renderowania

### Kolorystyczne Zasady

- **Primary**: Adobe Spectrum Blue (`oklch(0.50 0.20 250)`)
- **Neutral**: Szarości bez odcieni kolorowych
- **Semantic**: Czerwony dla błędów, zielony dla sukcesu
- **Dark Mode**: Pełne wsparcie z odpowiednimi kontrastami

### Typograficzne Zasady

- **Font**: Source Sans Pro (primary), Source Code Pro (mono)
- **Scale**: Modular scale (1.125 - 1.25)
- **Line-height**: 1.5 dla body, 1.2-1.4 dla headings
- **Weight**: 400 (regular), 600 (semibold), 700 (bold)

---

**Data utworzenia:** 2024
**Status:** Dokumentacja referencyjna
**Wersja Design System:** Adobe Spectrum (najnowsza)

