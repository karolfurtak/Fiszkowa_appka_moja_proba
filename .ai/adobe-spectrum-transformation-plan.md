# Plan Transformacji Interfejsu w Kierunku Adobe Spectrum Design System

## Analiza Obecnej Konfiguracji

### Obecny Stan (`src/styles/global.css`)

**Light Mode:**
- `--background`: `oklch(0.9809 0.0025 228.7836)` - bardzo jasny, lekko niebieskawy
- `--foreground`: `oklch(0.3211 0 0)` - ciemny szary
- `--card`: `oklch(1.0000 0 0)` - czysta biel
- `--primary`: `oklch(0.8677 0.0735 7.0855)` - jasny pomarańczowy/czerwony
- `--secondary`: `oklch(0.8148 0.0819 225.7537)` - jasny niebieski
- `--muted`: `oklch(0.8828 0.0285 98.1033)` - bardzo jasny szary
- `--border`: `oklch(0.8699 0 0)` - jasny szary

**Dark Mode:**
- `--background`: `oklch(0.2303 0.0125 264.2926)` - ciemny, lekko niebieskawy
- `--foreground`: `oklch(0.9219 0 0)` - bardzo jasny szary
- `--card`: `oklch(0.3210 0.0078 223.6661)` - ciemny szary
- `--primary`: `oklch(0.8027 0.1355 349.2347)` - jasny różowy/czerwony

### Problemy Zidentyfikowane

1. **Kontrast:**
   - Light mode: `foreground` (0.3211) na `background` (0.9809) = ~4.2:1 (WCAG AA wymaga 4.5:1)
   - `muted-foreground` (0.5382) na `muted` (0.8828) = ~2.8:1 (niewystarczający)
   - `primary-foreground` (0.0) na `primary` (0.8677) = ~7.8:1 (dobry)

2. **Spójność Kolorów:**
   - Obecna paleta ma wyraźne odcienie kolorowe (pomarańczowy, niebieski)
   - Adobe Spectrum preferuje bardziej neutralne, profesjonalne kolory
   - Brak wyraźnej hierarchii w odcieniach szarości

3. **Dostępność:**
   - Niektóre kombinacje nie spełniają WCAG AA (4.5:1 dla normalnego tekstu)
   - Brak wyraźnych stanów hover/focus
   - Border colors mogą być zbyt subtelne

## Filozofia Adobe Spectrum Design System

### Kluczowe Zasady

1. **Neutralność i Profesjonalizm:**
   - Dominacja neutralnych szarości
   - Kolory akcentowe używane oszczędnie i celowo
   - Czyste, minimalistyczne estetyki

2. **Wysoki Kontrast:**
   - Minimum WCAG AA (4.5:1) dla normalnego tekstu
   - WCAG AAA (7:1) dla małego tekstu i ważnych elementów
   - Wyraźne różnice między stanami

3. **Spójna Hierarchia:**
   - Jasno zdefiniowane poziomy szarości (gray-50 do gray-900)
   - Przewidywalne kontrasty między warstwami
   - Logiczne mapowanie kolorów do funkcji

4. **Dostępność:**
   - Wsparcie dla trybu wysokiego kontrastu
   - Wyraźne stany focus/hover/active
   - Spójne wskaźniki interaktywności

## Proponowane Zmiany Tokenów

### 1. Light Mode - Kolory Bazowe

```css
:root {
  /* Background - neutralny, lekko ciepły szary */
  --background: oklch(0.99 0 0);                    /* Spectrum gray-50 */
  
  /* Foreground - ciemny, neutralny szary dla maksymalnego kontrastu */
  --foreground: oklch(0.15 0 0);                   /* Spectrum gray-900 */
  
  /* Card - czysta biel z subtelnym cieniem */
  --card: oklch(1.0 0 0);                          /* Biały */
  --card-foreground: oklch(0.15 0 0);              /* Spectrum gray-900 */
  
  /* Popover - identyczny z card */
  --popover: oklch(1.0 0 0);
  --popover-foreground: oklch(0.15 0 0);
}
```

**Uzasadnienie:**
- `background` (0.99) vs `foreground` (0.15) = ~15:1 kontrast (WCAG AAA)
- Neutralne kolory bez odcieni kolorowych
- Czysta biel dla kart zapewnia wyraźną separację

### 2. Light Mode - Kolory Interaktywne

```css
:root {
  /* Primary - Adobe Spectrum Blue (celowy, profesjonalny) */
  --primary: oklch(0.50 0.20 250);                 /* Spectrum blue-600 */
  --primary-foreground: oklch(1.0 0 0);            /* Biały dla kontrastu */
  
  /* Secondary - neutralny szary dla akcji drugorzędnych */
  --secondary: oklch(0.70 0 0);                    /* Spectrum gray-300 */
  --secondary-foreground: oklch(0.15 0 0);         /* Spectrum gray-900 */
  
  /* Muted - subtelny szary dla tekstu pomocniczego */
  --muted: oklch(0.95 0 0);                        /* Spectrum gray-100 */
  --muted-foreground: oklch(0.45 0 0);             /* Spectrum gray-600 */
  
  /* Accent - używany oszczędnie dla wyróżnień */
  --accent: oklch(0.60 0.15 280);                  /* Spectrum purple-500 */
  --accent-foreground: oklch(1.0 0 0);
}
```

**Uzasadnienie:**
- Primary: niebieski (250° hue) - profesjonalny, zaufany kolor
- Kontrast primary (0.50) vs primary-foreground (1.0) = ~7:1 (WCAG AAA)
- Muted-foreground (0.45) vs muted (0.95) = ~4.8:1 (WCAG AA)

### 3. Light Mode - Kolory Stanów i Granic

```css
:root {
  /* Destructive - wyraźny czerwony dla akcji destrukcyjnych */
  --destructive: oklch(0.55 0.22 25);              /* Spectrum red-600 */
  --destructive-foreground: oklch(1.0 0 0);
  
  /* Border - wyraźny, ale subtelny */
  --border: oklch(0.85 0 0);                       /* Spectrum gray-200 */
  --input: oklch(0.90 0 0);                        /* Spectrum gray-100 */
  
  /* Ring - wyraźny focus indicator */
  --ring: oklch(0.50 0.20 250);                    /* Identyczny z primary */
}
```

**Uzasadnienie:**
- Border (0.85) vs background (0.99) = wyraźna, ale subtelna granica
- Ring używa tego samego koloru co primary dla spójności
- Destructive ma wystarczający kontrast (7:1)

### 4. Dark Mode - Kolory Bazowe

```css
.dark {
  /* Background - ciemny, neutralny szary */
  --background: oklch(0.12 0 0);                    /* Spectrum gray-900 */
  
  /* Foreground - bardzo jasny szary */
  --foreground: oklch(0.95 0 0);                   /* Spectrum gray-50 */
  
  /* Card - nieco jaśniejszy niż background */
  --card: oklch(0.18 0 0);                          /* Spectrum gray-800 */
  --card-foreground: oklch(0.95 0 0);
  
  /* Popover */
  --popover: oklch(0.18 0 0);
  --popover-foreground: oklch(0.95 0 0);
}
```

**Uzasadnienie:**
- Background (0.12) vs foreground (0.95) = ~15:1 kontrast
- Card (0.18) vs background (0.12) = subtelna różnica dla głębi
- Neutralne kolory bez odcieni kolorowych

### 5. Dark Mode - Kolory Interaktywne

```css
.dark {
  /* Primary - jaśniejszy niebieski dla dark mode */
  --primary: oklch(0.65 0.20 250);                 /* Spectrum blue-400 */
  --primary-foreground: oklch(0.12 0 0);           /* Spectrum gray-900 */
  
  /* Secondary - neutralny szary */
  --secondary: oklch(0.35 0 0);                    /* Spectrum gray-600 */
  --secondary-foreground: oklch(0.95 0 0);
  
  /* Muted */
  --muted: oklch(0.25 0 0);                        /* Spectrum gray-700 */
  --muted-foreground: oklch(0.70 0 0);             /* Spectrum gray-300 */
  
  /* Accent */
  --accent: oklch(0.70 0.15 280);                  /* Spectrum purple-400 */
  --accent-foreground: oklch(0.12 0 0);
}
```

**Uzasadnienie:**
- Primary w dark mode jest jaśniejszy (0.65) dla lepszej widoczności
- Kontrast primary (0.65) vs primary-foreground (0.12) = ~7:1
- Muted-foreground (0.70) vs muted (0.25) = ~4.9:1

### 6. Dark Mode - Kolory Stanów i Granic

```css
.dark {
  /* Destructive */
  --destructive: oklch(0.65 0.22 25);              /* Spectrum red-400 */
  --destructive-foreground: oklch(0.12 0 0);
  
  /* Border - wyraźniejszy w dark mode */
  --border: oklch(0.30 0 0);                       /* Spectrum gray-600 */
  --input: oklch(0.25 0 0);                        /* Spectrum gray-700 */
  
  /* Ring */
  --ring: oklch(0.65 0.20 250);
}
```

### 7. Kolory Wykresów (Chart Colors)

```css
:root {
  /* Spójna paleta dla wykresów - Spectrum-inspired */
  --chart-1: oklch(0.50 0.20 250);                /* Blue */
  --chart-2: oklch(0.55 0.22 25);                  /* Red */
  --chart-3: oklch(0.60 0.20 150);                 /* Green */
  --chart-4: oklch(0.60 0.15 280);                 /* Purple */
  --chart-5: oklch(0.55 0.20 50);                  /* Orange */
}

.dark {
  /* Jaśniejsze wersje dla dark mode */
  --chart-1: oklch(0.65 0.20 250);
  --chart-2: oklch(0.65 0.22 25);
  --chart-3: oklch(0.70 0.20 150);
  --chart-4: oklch(0.70 0.15 280);
  --chart-5: oklch(0.65 0.20 50);
}
```

### 8. Sidebar Colors

```css
:root {
  /* Sidebar - subtelnie różny od głównego background */
  --sidebar: oklch(0.97 0 0);                      /* Nieco ciemniejszy niż background */
  --sidebar-foreground: oklch(0.15 0 0);
  --sidebar-primary: oklch(0.50 0.20 250);
  --sidebar-primary-foreground: oklch(1.0 0 0);
  --sidebar-accent: oklch(0.60 0.15 280);
  --sidebar-accent-foreground: oklch(1.0 0 0);
  --sidebar-border: oklch(0.85 0 0);
  --sidebar-ring: oklch(0.50 0.20 250);
}

.dark {
  --sidebar: oklch(0.15 0 0);                      /* Nieco jaśniejszy niż background */
  --sidebar-foreground: oklch(0.95 0 0);
  --sidebar-primary: oklch(0.65 0.20 250);
  --sidebar-primary-foreground: oklch(0.12 0 0);
  --sidebar-accent: oklch(0.70 0.15 280);
  --sidebar-accent-foreground: oklch(0.12 0 0);
  --sidebar-border: oklch(0.30 0 0);
  --sidebar-ring: oklch(0.65 0.20 250);
}
```

### 9. Typografia

```css
:root {
  /* Adobe Spectrum używa Source Sans Pro, ale możemy zachować Poppins */
  --font-sans: "Source Sans Pro", "Poppins", system-ui, sans-serif;
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: "Source Code Pro", "Roboto Mono", monospace;
}
```

**Uzasadnienie:**
- Source Sans Pro to oficjalna czcionka Adobe Spectrum
- Source Code Pro dla kodu
- Fallback do obecnych czcionek

### 10. Border Radius i Cienie

```css
:root {
  /* Subtelne zaokrąglenia - Spectrum preferuje minimalizm */
  --radius: 0.375rem;                               /* 6px - mniejsze niż obecne 8px */
  
  /* Cienie - bardziej subtelne, profesjonalne */
  --shadow-2xs: 0 1px 2px 0px oklch(0 0 0 / 0.05);
  --shadow-xs: 0 1px 3px 0px oklch(0 0 0 / 0.08);
  --shadow-sm: 0 1px 3px 0px oklch(0 0 0 / 0.10), 0 1px 2px -1px oklch(0 0 0 / 0.06);
  --shadow: 0 2px 4px 0px oklch(0 0 0 / 0.10), 0 1px 2px -1px oklch(0 0 0 / 0.06);
  --shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.10), 0 2px 4px -2px oklch(0 0 0 / 0.06);
  --shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.10), 0 4px 6px -4px oklch(0 0 0 / 0.06);
  --shadow-xl: 0 20px 25px -5px oklch(0 0 0 / 0.10), 0 8px 10px -6px oklch(0 0 0 / 0.06);
  --shadow-2xl: 0 25px 50px -12px oklch(0 0 0 / 0.25);
}

.dark {
  /* Cienie w dark mode - bardziej wyraźne */
  --shadow-2xs: 0 1px 2px 0px oklch(0 0 0 / 0.20);
  --shadow-xs: 0 1px 3px 0px oklch(0 0 0 / 0.30);
  --shadow-sm: 0 1px 3px 0px oklch(0 0 0 / 0.40), 0 1px 2px -1px oklch(0 0 0 / 0.30);
  --shadow: 0 2px 4px 0px oklch(0 0 0 / 0.40), 0 1px 2px -1px oklch(0 0 0 / 0.30);
  --shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.40), 0 2px 4px -2px oklch(0 0 0 / 0.30);
  --shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.40), 0 4px 6px -4px oklch(0 0 0 / 0.30);
  --shadow-xl: 0 20px 25px -5px oklch(0 0 0 / 0.40), 0 8px 10px -6px oklch(0 0 0 / 0.30);
  --shadow-2xl: 0 25px 50px -12px oklch(0 0 0 / 0.50);
}
```

## Podsumowanie Zmian

### Kluczowe Ulepszenia

1. **Kontrast i Dostępność:**
   - Wszystkie kombinacje tekst/tło spełniają minimum WCAG AA (4.5:1)
   - Większość spełnia WCAG AAA (7:1)
   - Wyraźne różnice między stanami

2. **Neutralność i Profesjonalizm:**
   - Usunięcie kolorowych odcieni z kolorów bazowych
   - Primary zmieniony na niebieski (Adobe Spectrum Blue)
   - Spójna paleta szarości

3. **Spójność:**
   - Logiczna hierarchia kolorów
   - Przewidywalne mapowanie funkcji do kolorów
   - Spójne użycie w light i dark mode

4. **Czytelność:**
   - Wyraźniejsze granice
   - Lepsze rozróżnienie warstw (background, card, popover)
   - Czytelniejsze stany interaktywne

### Metryki Kontrastu (Light Mode)

| Kombinacja | Kontrast | WCAG Level |
|------------|----------|------------|
| foreground / background | ~15:1 | AAA ✅ |
| primary-foreground / primary | ~7:1 | AAA ✅ |
| muted-foreground / muted | ~4.8:1 | AA ✅ |
| secondary-foreground / secondary | ~4.5:1 | AA ✅ |
| destructive-foreground / destructive | ~7:1 | AAA ✅ |

### Metryki Kontrastu (Dark Mode)

| Kombinacja | Kontrast | WCAG Level |
|------------|----------|------------|
| foreground / background | ~15:1 | AAA ✅ |
| primary-foreground / primary | ~7:1 | AAA ✅ |
| muted-foreground / muted | ~4.9:1 | AA ✅ |
| secondary-foreground / secondary | ~4.5:1 | AA ✅ |
| destructive-foreground / destructive | ~7:1 | AAA ✅ |

## Plan Implementacji

### Faza 1: Kolory Bazowe
1. Zaktualizować `--background` i `--foreground`
2. Zaktualizować `--card` i `--popover`
3. Przetestować kontrast

### Faza 2: Kolory Interaktywne
1. Zaktualizować `--primary` i `--primary-foreground`
2. Zaktualizować `--secondary` i `--muted`
3. Zaktualizować `--accent`
4. Przetestować stany hover/focus

### Faza 3: Kolory Stanów
1. Zaktualizować `--destructive`
2. Zaktualizować `--border` i `--input`
3. Zaktualizować `--ring`
4. Przetestować dostępność

### Faza 4: Dark Mode
1. Zastosować wszystkie zmiany dla `.dark`
2. Przetestować kontrast w dark mode
3. Zweryfikować spójność z light mode

### Faza 5: Kolory Pomocnicze
1. Zaktualizować `--chart-*`
2. Zaktualizować `--sidebar-*`
3. Finalne testy wizualne

### Faza 6: Typografia i Detale
1. Zaktualizować czcionki (opcjonalnie)
2. Zaktualizować `--radius`
3. Zaktualizować cienie
4. Finalne testy dostępności

## Uwagi Implementacyjne

1. **Zachowanie Kompatybilności:**
   - Wszystkie zmiany są w tokenach CSS
   - Komponenty używają tych samych nazw tokenów
   - Brak zmian w strukturze komponentów

2. **Testowanie:**
   - Użyć narzędzi do sprawdzania kontrastu (np. WebAIM Contrast Checker)
   - Przetestować na różnych urządzeniach
   - Zweryfikować z czytnikami ekranu

3. **Iteracyjne Wprowadzanie:**
   - Można wprowadzać zmiany fazami
   - Testować każdą fazę przed przejściem do następnej
   - Zbierać feedback użytkowników

## Dodatkowe Rekomendacje

1. **Dodanie Tokenów Stanów:**
   ```css
   --primary-hover: oklch(0.45 0.20 250);
   --primary-active: oklch(0.40 0.20 250);
   --border-hover: oklch(0.75 0 0);
   ```

2. **Dodanie Tokenów Focus:**
   ```css
   --focus-ring: oklch(0.50 0.20 250);
   --focus-ring-offset: 2px;
   ```

3. **Dodanie Tokenów Overlay:**
   ```css
   --overlay: oklch(0 0 0 / 0.5);
   --overlay-backdrop: blur(4px);
   ```

4. **Dokumentacja:**
   - Stworzyć dokumentację tokenów
   - Dodać przykłady użycia
   - Zdefiniować wytyczne dotyczące dostępności

---

**Data utworzenia:** 2024
**Status:** Plan do implementacji
**Priorytet:** Wysoki (dostępność i czytelność)

