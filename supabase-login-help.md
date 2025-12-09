# Instrukcje logowania do Supabase CLI

## Metoda 1: Logowanie przez przeglądarkę (Zalecane)

1. Uruchom komendę:
   ```powershell
   npx supabase login
   ```

2. **Naciśnij Enter** (NIE wpisuj emaila w terminalu!)

3. Otworzy się przeglądarka z logowaniem Supabase

4. Zaloguj się w przeglądarce

5. Po zalogowaniu token zostanie zapisany automatycznie

## Metoda 2: Użycie tokena bezpośrednio

Jeśli przeglądarka się nie otwiera, możesz użyć tokena:

1. Przejdź do: https://supabase.com/dashboard/account/tokens

2. Wygeneruj nowy token (lub użyj istniejącego)

3. Ustaw zmienną środowiskową:
   ```powershell
   $env:SUPABASE_ACCESS_TOKEN = "your-token-here"
   ```

4. Sprawdź, czy działa:
   ```powershell
   npx supabase projects list
   ```

## Rozwiązywanie problemów

### Problem: "failed to scan line: expected newline"
**Rozwiązanie:** Nie wpisuj niczego w terminalu po uruchomieniu `npx supabase login`. Po prostu naciśnij Enter.

### Problem: Przeglądarka się nie otwiera
**Rozwiązanie:** Użyj Metody 2 (token bezpośrednio) lub otwórz ręcznie link, który pojawi się w terminalu.

### Problem: "Access token not provided"
**Rozwiązanie:** Upewnij się, że:
- Zalogowałeś się przez `npx supabase login` (Metoda 1)
- LUB ustawiłeś `SUPABASE_ACCESS_TOKEN` (Metoda 2)

