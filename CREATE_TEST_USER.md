# Instrukcje: Utworzenie użytkownika testowego

## Problem
Edge Function używa `DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'`, który nie istnieje w bazie danych, co powoduje błąd foreign key constraint violation.

## Rozwiązanie: Utworzenie użytkownika testowego

### Opcja 1: Przez Supabase Dashboard (Zalecane)

1. **Otwórz Supabase Dashboard:**
   - Przejdź do: https://supabase.com/dashboard/project/lfogeotxmdekvfstkais
   - Kliknij **Authentication** w lewym panelu
   - Kliknij **Users**

2. **Dodaj nowego użytkownika:**
   - Kliknij **Add User** (lub **Invite User**)
   - Email: `test@example.com` (lub dowolny)
   - Password: `test123456` (lub dowolny)
   - Auto Confirm User: **Włącz** (ważne!)
   - Kliknij **Create User**

3. **Skopiuj User ID:**
   - Po utworzeniu użytkownika, skopiuj jego **UUID** (User ID)
   - Przykład: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

4. **Utwórz profil dla użytkownika:**
   - Przejdź do **SQL Editor**
   - Uruchom następujące zapytanie (zamień `YOUR_USER_ID` na skopiowany UUID):

```sql
-- Utwórz profil dla użytkownika testowego
INSERT INTO public.profiles (id, username, created_at, updated_at)
VALUES (
  'YOUR_USER_ID',  -- Zamień na skopiowany UUID z Authentication → Users
  'test_user',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;
```

5. **Zaktualizuj DEFAULT_USER_ID w kodzie:**
   - Otwórz plik `supabase/functions/generate-flashcards/index.ts`
   - Znajdź linię: `const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';`
   - Zamień na: `const DEFAULT_USER_ID = 'YOUR_USER_ID';` (użyj skopiowanego UUID)

6. **Wdróż zaktualizowaną Edge Function:**
   ```powershell
   npx supabase functions deploy generate-flashcards --project-ref lfogeotxmdekvfstkais
   ```

### Opcja 2: Przez SQL (Zaawansowane)

Jeśli chcesz użyć dokładnie `00000000-0000-0000-0000-000000000000`:

**UWAGA:** To wymaga bezpośredniego dostępu do bazy danych i może nie działać ze względu na ograniczenia Supabase Auth.

1. **Otwórz SQL Editor w Supabase Dashboard**

2. **Uruchom następujące zapytanie:**

```sql
-- Utwórz użytkownika w auth.users (wymaga uprawnień administratora)
-- UWAGA: To może nie działać, jeśli Supabase nie pozwala na bezpośrednie wstawianie do auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  crypt('test123456', gen_salt('bf')),  -- Hasło: test123456
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Utwórz profil dla użytkownika
INSERT INTO public.profiles (id, username, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test_user',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;
```

**UWAGA:** Jeśli to zapytanie nie działa (błąd uprawnień), użyj **Opcji 1**.

### Opcja 3: Użyj istniejącego użytkownika

Jeśli masz już użytkownika w systemie:

1. **Znajdź User ID istniejącego użytkownika:**
   - Supabase Dashboard → Authentication → Users
   - Skopiuj UUID użytkownika

2. **Zaktualizuj DEFAULT_USER_ID w kodzie:**
   - Otwórz `supabase/functions/generate-flashcards/index.ts`
   - Zamień `DEFAULT_USER_ID` na istniejący UUID

3. **Wdróż Edge Function:**
   ```powershell
   npx supabase functions deploy generate-flashcards --project-ref lfogeotxmdekvfstkais
   ```

## Weryfikacja

Po utworzeniu użytkownika, sprawdź, czy istnieje w bazie:

```sql
-- Sprawdź użytkownika w auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = 'YOUR_USER_ID';

-- Sprawdź profil
SELECT id, username, created_at 
FROM public.profiles 
WHERE id = 'YOUR_USER_ID';
```

## Test endpointu

Po wykonaniu powyższych kroków, wyślij ponownie request z Postmana:
- `POST http://localhost:3000/api/generations`
- Body: JSON z `source_text`

Powinno teraz działać! ✅

