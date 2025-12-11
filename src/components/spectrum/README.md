# Adobe Spectrum Design System Components

Zestaw komponentów React/Tailwind zgodnych z wytycznymi **Adobe Spectrum Design System**, wykorzystujących **Tailwind 4** z CSS variables i design tokens.

## Instalacja

Komponenty są gotowe do użycia. Wszystkie eksportowane są z `src/components/spectrum/index.ts`.

```tsx
import {
  SpectrumButton,
  SpectrumInput,
  SpectrumCard,
  SpectrumDialog,
  // ... inne komponenty
} from "@/components/spectrum"
```

## Komponenty

### 1. SpectrumButton

Przycisk zgodny z Adobe Spectrum Design System.

**Warianty:**
- `primary` - Główna akcja (Adobe Spectrum Blue)
- `secondary` - Akcja drugorzędna
- `quiet` - Przezroczysty background
- `destructive` - Akcja destrukcyjna
- `destructive-quiet` - Destrukcyjna wariant quiet

**Rozmiary:**
- `small` - 24px wysokości
- `default` - 32px wysokości
- `large` - 40px wysokości
- `icon` - 32x32px dla ikon

**Przykład:**
```tsx
<SpectrumButton variant="primary" size="default" loading={isLoading}>
  Zapisz
</SpectrumButton>
```

### 2. SpectrumInput

Pole tekstowe z pełną walidacją i dostępnością.

**Funkcje:**
- Zawsze widoczny label (nie tylko placeholder)
- Real-time validation
- Error states z wyraźnymi komunikatami
- Success states (opcjonalnie)
- Left/right icons
- Helper text

**Przykład:**
```tsx
<SpectrumInput
  label="Email"
  type="email"
  required
  error={errors.email}
  helperText="Wprowadź poprawny adres email"
  leftIcon={<Mail className="h-4 w-4" />}
/>
```

### 3. SpectrumCard

Karta z wariantami i opcjonalnym header/footer.

**Warianty:**
- `default` - Standardowa karta z cieniem
- `quiet` - Bez cienia, tylko border
- `interactive` - Hover effect, klikalna
- `selected` - Border w kolorze primary

**Przykład:**
```tsx
<SpectrumCard variant="interactive" header={<h3>Tytuł</h3>} footer={<Button>Akcja</Button>}>
  <p>Zawartość karty</p>
</SpectrumCard>
```

### 4. SpectrumDialog

Modal/Dialog z pełną funkcjonalnością.

**Funkcje:**
- Focus trap
- Escape key support
- Click outside (opcjonalnie)
- Animacje (fade + scale)
- Różne rozmiary (small, medium, large)

**Przykład:**
```tsx
<SpectrumDialog>
  <SpectrumDialogTrigger>Otwórz</SpectrumDialogTrigger>
  <SpectrumDialogContent size="medium">
    <SpectrumDialogHeader>
      <SpectrumDialogTitle>Tytuł</SpectrumDialogTitle>
      <SpectrumDialogDescription>Opis</SpectrumDialogDescription>
    </SpectrumDialogHeader>
    <SpectrumDialogBody>
      Zawartość modala
    </SpectrumDialogBody>
    <SpectrumDialogFooter>
      <SpectrumButton variant="primary">Zapisz</SpectrumButton>
    </SpectrumDialogFooter>
  </SpectrumDialogContent>
</SpectrumDialog>
```

### 5. SpectrumForm

Formularz z pełną strukturą i dostępnością.

**Komponenty:**
- `SpectrumForm` - Główny kontener
- `SpectrumFieldset` - Grupowanie pól
- `SpectrumFormGroup` - Grupa z label i walidacją

**Przykład:**
```tsx
<SpectrumForm title="Formularz" description="Wypełnij wszystkie pola">
  <SpectrumFieldset legend="Dane osobowe">
    <SpectrumFormGroup label="Imię" required error={errors.firstName}>
      <SpectrumInput />
    </SpectrumFormGroup>
  </SpectrumFieldset>
</SpectrumForm>
```

### 6. SpectrumList

Lista z wariantami i pełną dostępnością.

**Warianty:**
- `simple` - Prosta lista
- `interactive` - Klikalna z hover
- `selectable` - Z możliwością wyboru

**Density:**
- `compact` - 8px spacing
- `comfortable` - 12px spacing

**Przykład:**
```tsx
<SpectrumList variant="interactive" density="comfortable">
  <SpectrumListItem
    primaryText="Element 1"
    secondaryText="Opis"
    metadata="2024"
    selected={selectedId === "1"}
    onClick={() => setSelectedId("1")}
  />
</SpectrumList>
```

### 7. SpectrumToast

System powiadomień (używa `sonner` pod spodem).

**Typy:**
- `info` - Informacja
- `success` - Sukces
- `warning` - Ostrzeżenie
- `error` - Błąd

**Przykład:**
```tsx
import { toast } from "@/components/spectrum"

toast.success("Operacja zakończona pomyślnie", "Dane zostały zapisane")
toast.error("Błąd", "Nie udało się zapisać danych")
```

### 8. SpectrumProgress

Wskaźnik postępu (linear lub circular).

**Warianty:**
- `linear` - Pasek postępu
- `circular` - Okrągły wskaźnik

**Stany:**
- `indeterminate` - Animowany (bez wartości)
- `determinate` - Z wartością procentową

**Przykład:**
```tsx
<SpectrumProgress value={75} max={100} variant="linear" showLabel />
<SpectrumProgress variant="circular" size="large" />
```

### 9. SpectrumSkeleton

Loader z animacją shimmer.

**Warianty:**
- `text` - Dla tekstu
- `circular` - Dla avatarów
- `rectangular` - Dla obrazów/kart

**Przykład:**
```tsx
<SpectrumSkeleton variant="rectangular" width="100%" height="200px" />
<SpectrumSkeleton variant="text" width="80%" />
```

### 10. SpectrumNavigation

Nawigacja (top bar lub sidebar).

**Warianty:**
- `top` - Górny pasek (48px)
- `sidebar` - Boczny panel (240px, collapsed: 48px)

**Przykład:**
```tsx
<SpectrumNavigation
  variant="sidebar"
  items={[
    { id: "1", label: "Dashboard", icon: Home, href: "/" },
    { id: "2", label: "Ustawienia", icon: Settings, href: "/settings" },
  ]}
  activeId="1"
  collapsed={false}
/>
```

## Design Tokens

Wszystkie komponenty wykorzystują design tokens z `src/styles/global.css`:

- `--primary` - Adobe Spectrum Blue
- `--secondary` - Neutralny szary
- `--muted` - Subtelny szary
- `--destructive` - Czerwony dla błędów
- `--border` - Granice
- `--ring` - Focus ring
- I inne...

## Dostępność

Wszystkie komponenty spełniają wymagania WCAG AA/AAA:

- ✅ Minimalny kontrast 4.5:1 (preferowane 7:1)
- ✅ Pełna obsługa klawiatury
- ✅ ARIA labels i attributes
- ✅ Focus management
- ✅ Screen reader support

## Najlepsze Praktyki

1. **Używaj zawsze label w inputach** - nie polegaj tylko na placeholder
2. **Dodawaj error messages** - używaj `aria-describedby`
3. **Zarządzaj focus** - szczególnie w modalach
4. **Testuj kontrast** - używaj narzędzi do sprawdzania
5. **Responsywność** - wszystkie komponenty są responsive

## Zgodność z Adobe Spectrum

Komponenty są zgodne z:
- ✅ Wysokości i rozmiary
- ✅ Kolory i kontrasty
- ✅ Border radius (4-6px)
- ✅ Spacing (8px, 16px, 24px)
- ✅ Typography (Source Sans Pro)
- ✅ Stany interaktywne
- ✅ Animacje i transitions

## Wsparcie

Wszystkie komponenty są w pełni typowane (TypeScript) i gotowe do użycia w projekcie.

