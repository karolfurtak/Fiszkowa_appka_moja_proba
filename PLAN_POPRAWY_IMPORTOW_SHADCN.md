# Plan poprawy niezgodności importów Shadcn UI

## 📋 Analiza problemu

### Obecny stan
- **51 plików** wymaga poprawy importów komponentów UI
- Wszystkie pliki używają **ścieżek względnych** zamiast aliasu `@/`
- Wytyczne wymagają użycia: `@/components/ui/[component-name]`

### Typy plików do poprawy
1. **Komponenty React** (`.tsx`) - ~41 plików
   - Używają: `../ui/...` lub `../../ui/...`
   - Powinny używać: `@/components/ui/...`

2. **Pliki Astro** (`.astro`) - 10 plików
   - Używają: `../components/ui/...` lub `../../components/ui/...` lub `../../../components/ui/...`
   - Powinny używać: `@/components/ui/...`

## 🎯 Strategia refaktoryzacji

### Faza 1: Komponenty React (priorytet wysoki)
- Komponenty są używane najczęściej
- Łatwiejsze do testowania
- Mniejsza szansa na błędy w ścieżkach względnych

### Faza 2: Pliki Astro (priorytet średni)
- Mniej plików (10 vs 41)
- Prostsze importy (głównie Toaster)
- Mniej ryzyka błędów

## 📝 Szczegółowy plan działania

### Krok 1: Przygotowanie
- [ ] Utworzenie backupu (git commit przed zmianami)
- [ ] Sprawdzenie czy wszystkie testy przechodzą
- [ ] Weryfikacja konfiguracji aliasów w `tsconfig.json` i `astro.config.mjs`

### Krok 2: Refaktoryzacja komponentów React

#### 2.1. Komponenty formularzy
- [ ] `src/components/forms/GeneratorForm.tsx` (8 importów)
- [ ] `src/components/forms/RegisterForm.tsx`
- [ ] `src/components/forms/LoginForm.tsx`

#### 2.2. Komponenty dashboardu
- [ ] `src/components/dashboard/CreateDeckDialog.tsx` (4 importy)
- [ ] `src/components/dashboard/DeckCard.tsx` (5 importów)
- [ ] `src/components/dashboard/EditDeckDialog.tsx` (4 importy)
- [ ] `src/components/dashboard/DashboardView.tsx` (2 importy)
- [ ] `src/components/dashboard/DeleteDeckDialog.tsx` (2 importy)
- [ ] `src/components/dashboard/EmptyState.tsx` (1 import)
- [ ] `src/components/dashboard/SearchBar.tsx` (2 importy)

#### 2.3. Komponenty talii (deck)
- [ ] `src/components/deck/FlashcardCard.tsx`
- [ ] `src/components/deck/DeckHeader.tsx`
- [ ] `src/components/deck/DeckView.tsx`
- [ ] `src/components/deck/AddFlashcardModal.tsx`
- [ ] `src/components/deck/FlashcardModal.tsx`
- [ ] `src/components/deck/DeleteConfirmDialog.tsx`
- [ ] `src/components/deck/FlashcardEmptyState.tsx`
- [ ] `src/components/deck/DeckBreadcrumb.tsx`
- [ ] `src/components/deck/FlashcardFilters.tsx`

#### 2.4. Komponenty nauki (study)
- [ ] `src/components/study/StudySidebar.tsx`
- [ ] `src/components/study/StudyMode.tsx`
- [ ] `src/components/study/NavigationControls.tsx`
- [ ] `src/components/study/StudyHeader.tsx`
- [ ] `src/components/study/StudyBreadcrumb.tsx`
- [ ] `src/components/study/FlashcardListItem.tsx`

#### 2.5. Komponenty treningu (training)
- [ ] `src/components/training/SummaryScreen.tsx`
- [ ] `src/components/training/IncorrectAnswerItem.tsx`
- [ ] `src/components/training/AnswerButton.tsx`
- [ ] `src/components/training/TrainingSession.tsx`

#### 2.6. Komponenty weryfikacji (verify)
- [ ] `src/components/verify/VerificationView.tsx`
- [ ] `src/components/verify/FlashcardProposalCard.tsx`
- [ ] `src/components/verify/EditProposalModal.tsx`
- [ ] `src/components/verify/DeckSelector.tsx`

#### 2.7. Komponenty ustawień (settings)
- [ ] `src/components/settings/SettingsView.tsx`
- [ ] `src/components/settings/DeleteAccountDialog.tsx`
- [ ] `src/components/settings/AppSettingsForm.tsx`
- [ ] `src/components/settings/UserPreferencesForm.tsx`
- [ ] `src/components/settings/PasswordChangeForm.tsx`

#### 2.8. Komponenty pomocnicze
- [ ] `src/components/layout/Topbar.tsx`
- [ ] `src/components/loading/LoadingScreen.tsx`

### Krok 3: Refaktoryzacja plików Astro

#### 3.1. Strony główne
- [ ] `src/pages/index.astro`
- [ ] `src/pages/generate.astro`
- [ ] `src/pages/login.astro`
- [ ] `src/pages/register.astro`
- [ ] `src/pages/settings.astro`

#### 3.2. Strony z parametrami
- [ ] `src/pages/deck/[id].astro`
- [ ] `src/pages/deck/[id]/review.astro`
- [ ] `src/pages/deck/[id]/study.astro`
- [ ] `src/pages/loading/[session_id].astro`
- [ ] `src/pages/verify/[session_id].astro`

### Krok 4: Weryfikacja i testy
- [ ] Sprawdzenie czy wszystkie importy są poprawne
- [ ] Uruchomienie builda projektu (`npm run build`)
- [ ] Sprawdzenie czy nie ma błędów TypeScript
- [ ] Testowanie aplikacji w trybie deweloperskim
- [ ] Weryfikacja czy wszystkie komponenty renderują się poprawnie

### Krok 5: Dokumentacja
- [ ] Aktualizacja dokumentacji (jeśli wymagana)
- [ ] Commit zmian z opisem refaktoryzacji

## 🔄 Wzorce transformacji

### Komponenty React
```tsx
// PRZED (nieprawidłowe)
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../../ui/input';

// PO (prawidłowe)
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
```

### Pliki Astro
```astro
// PRZED (nieprawidłowe)
import { Toaster } from '../components/ui/sonner';
import { Toaster } from '../../components/ui/sonner';
import { Toaster } from '../../../components/ui/sonner';

// PO (prawidłowe)
import { Toaster } from '@/components/ui/sonner';
```

## ⚠️ Uwagi i ostrzeżenia

1. **Nie zmieniaj importów innych modułów** - tylko komponenty UI z `ui/`
2. **Zachowaj wszystkie nazwy eksportów** - nie zmieniaj struktury importów, tylko ścieżki
3. **Sprawdź czy alias `@/` działa w Astro** - może wymagać dodatkowej konfiguracji
4. **Testuj po każdej grupie plików** - łatwiej znaleźć błędy
5. **Nie zmieniaj importów w komponentach UI** - one już używają `@/lib/utils` poprawnie

## 📊 Statystyki

- **Łączna liczba plików**: 51
- **Komponenty React**: 41 plików
- **Pliki Astro**: 10 plików
- **Łączna liczba importów do zmiany**: 136 importów
  - Importy w komponentach React: 126 linii
  - Importy w plikach Astro: 10 linii

### Najczęściej używane komponenty
1. **Button** - ~35 importów
2. **Alert/AlertDescription** - ~15 importów
3. **Card** (różne warianty) - ~12 importów
4. **Input** - ~12 importów
5. **Label** - ~12 importów
6. **Dialog** (różne warianty) - ~8 importów
7. **Toaster** - 10 importów (tylko w Astro)
8. **Textarea** - ~6 importów
9. **Select** (różne warianty) - ~6 importów
10. **Tooltip** - ~3 importy

## ✅ Kryteria sukcesu

- [ ] Wszystkie importy komponentów UI używają aliasu `@/components/ui/...`
- [ ] Projekt kompiluje się bez błędów
- [ ] Wszystkie komponenty renderują się poprawnie
- [ ] Brak błędów w konsoli przeglądarki
- [ ] TypeScript nie zgłasza błędów

## 🚀 Automatyzacja (opcjonalna)

Można rozważyć użycie narzędzi do automatycznej refaktoryzacji:
- **jscodeshift** - do transformacji importów w plikach TSX
- **regex find & replace** - dla prostych przypadków w Astro
- **Manualne sprawdzenie** - najbezpieczniejsze podejście

### Przykładowe wyrażenia regularne do Find & Replace

#### Dla komponentów React (VS Code / Cursor)
```
Find: from ['"]\.\./ui/([^'"]+)
Replace: from '@/components/ui/$1
```

#### Dla plików Astro
```
Find: from ['"]\.\./\.\./\.\./components/ui/([^'"]+)
Replace: from '@/components/ui/$1

Find: from ['"]\.\./\.\./components/ui/([^'"]+)
Replace: from '@/components/ui/$1

Find: from ['"]\.\./components/ui/([^'"]+)
Replace: from '@/components/ui/$1
```

**⚠️ Uwaga**: Użyj trybu "Replace in Files" z opcją "Use Regular Expression" i sprawdź każdą zmianę przed zatwierdzeniem!

## 📅 Szacowany czas

- **Komponenty React**: ~2-3 godziny
- **Pliki Astro**: ~30 minut
- **Testy i weryfikacja**: ~1 godzina
- **Razem**: ~4-5 godzin

