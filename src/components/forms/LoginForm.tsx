import * as React from 'react';
import { supabaseClient } from '../../db/supabase.client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { AuthError } from '@supabase/supabase-js';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

/**
 * Propsy komponentu LoginForm
 */
interface LoginFormProps {
  /**
   * Opcjonalna ścieżka przekierowania po zalogowaniu
   * Pochodzi z query parametru ?redirect= w URL
   */
  redirectUrl?: string;
}

/**
 * Stan wewnętrzny komponentu LoginForm
 */
interface LoginFormState {
  email: string;
  password: string;
  emailError: string | null;
  passwordError: string | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  isEmailTouched: boolean;
  isPasswordTouched: boolean;
  showPassword: boolean;
  isCheckingSession: boolean;
}

/**
 * Komponent formularza logowania
 * 
 * Obsługuje:
 * - Walidację pól email i hasło
 * - Integrację z Supabase Auth API
 * - Przekierowanie po pomyślnym zalogowaniu
 * - Obsługę błędów autoryzacji i sieci
 */
export default function LoginForm({ redirectUrl }: LoginFormProps) {
  const [formState, setFormState] = React.useState<LoginFormState>({
    email: '',
    password: '',
    emailError: null,
    passwordError: null,
    errorMessage: null,
    isSubmitting: false,
    isEmailTouched: false,
    isPasswordTouched: false,
    showPassword: false,
    isCheckingSession: true,
  });

  // Ref dla automatycznego fokusowania pierwszego pola
  const emailInputRef = React.useRef<HTMLInputElement>(null);

  // Sprawdzenie czy użytkownik jest już zalogowany przy mount
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
          const targetUrl = redirectUrl || '/';
          window.location.href = targetUrl;
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setFormState((prev: LoginFormState) => ({
          ...prev,
          isCheckingSession: false,
        }));
      }
    };
    checkSession();
  }, [redirectUrl]);

  // Automatyczne fokusowanie pierwszego pola po załadowaniu
  React.useEffect(() => {
    if (!formState.isCheckingSession && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [formState.isCheckingSession]);

  /**
   * Walidacja formatu email
   */
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'Email jest wymagany';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Nieprawidłowy format email';
    }
    return null;
  };

  /**
   * Walidacja hasła
   */
  const validatePassword = (password: string): string | null => {
    if (!password) {
      return 'Hasło jest wymagane';
    }
    return null;
  };

  /**
   * Walidacja całego formularza
   */
  const validateForm = (): boolean => {
    const emailError = validateEmail(formState.email);
    const passwordError = validatePassword(formState.password);

    setFormState((prev: LoginFormState) => ({
      ...prev,
      emailError,
      passwordError,
    }));

    return emailError === null && passwordError === null;
  };

  /**
   * Obsługa zmiany wartości pola email
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState((prev: LoginFormState) => ({
      ...prev,
      email: value,
      // Czyszczenie błędu jeśli pole było dotknięte
      emailError: prev.isEmailTouched ? null : prev.emailError,
      errorMessage: null,
    }));
  };

  /**
   * Obsługa opuszczenia pola email (onBlur)
   */
  const handleEmailBlur = () => {
    const emailError = validateEmail(formState.email);
    setFormState((prev: LoginFormState) => ({
      ...prev,
      isEmailTouched: true,
      emailError,
    }));
  };

  /**
   * Obsługa zmiany wartości pola hasła
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState((prev: LoginFormState) => ({
      ...prev,
      password: value,
      // Czyszczenie błędu jeśli pole było dotknięte
      passwordError: prev.isPasswordTouched ? null : prev.passwordError,
      errorMessage: null,
    }));
  };

  /**
   * Obsługa opuszczenia pola hasła (onBlur)
   */
  const handlePasswordBlur = () => {
    const passwordError = validatePassword(formState.password);
    setFormState((prev: LoginFormState) => ({
      ...prev,
      isPasswordTouched: true,
      passwordError,
    }));
  };

  /**
   * Mapowanie błędów autoryzacji Supabase na komunikaty użytkownika
   */
  const mapAuthError = (error: AuthError): string => {
    if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
      return 'Nieprawidłowy email lub hasło';
    }
    if (error.message.includes('email_not_confirmed') || error.message.includes('Email not confirmed')) {
      return 'Email nie został potwierdzony. Sprawdź skrzynkę pocztową.';
    }
    return 'Wystąpił błąd podczas logowania. Spróbuj ponownie.';
  };

  /**
   * Obsługa błędów autoryzacji
   */
  const handleAuthError = (error: AuthError) => {
    const errorMessage = mapAuthError(error);
    setFormState((prev: LoginFormState) => ({
      ...prev,
      errorMessage,
      isSubmitting: false,
    }));
  };

  /**
   * Obsługa błędów sieci z wykrywaniem offline
   */
  const handleNetworkError = React.useCallback((error: unknown) => {
    console.error('Network error:', error);
    
    // Sprawdzenie czy użytkownik jest offline
    if (!navigator.onLine) {
      toast.error('Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie.');
    } else if (error instanceof Error && error.message.includes('timeout')) {
      toast.error('Żądanie przekroczyło limit czasu. Spróbuj ponownie.');
    } else {
      toast.error('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.');
    }
    
    setFormState((prev: LoginFormState) => ({
      ...prev,
      isSubmitting: false,
    }));
  }, []);

  /**
   * Obsługa przełączania widoczności hasła
   */
  const togglePasswordVisibility = React.useCallback(() => {
    setFormState((prev: LoginFormState) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  }, []);

  /**
   * Obsługa wysłania formularza z timeout
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Walidacja przed wysłaniem
    const emailError = validateEmail(formState.email);
    const passwordError = validatePassword(formState.password);
    
    if (emailError || passwordError) {
      setFormState((prev: LoginFormState) => ({
        ...prev,
        emailError,
        passwordError,
        isEmailTouched: true,
        isPasswordTouched: true,
      }));
      // Fokusowanie pierwszego pola z błędem
      if (emailError && emailInputRef.current) {
        emailInputRef.current.focus();
      }
      return;
    }

    setFormState((prev: LoginFormState) => ({
      ...prev,
      isSubmitting: true,
      errorMessage: null,
    }));

    // Timeout dla requestu (30 sekund)
    const timeoutId = setTimeout(() => {
      toast.error('Żądanie przekroczyło limit czasu. Spróbuj ponownie.');
      setFormState((prev: LoginFormState) => ({
        ...prev,
        isSubmitting: false,
      }));
    }, 30000);

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: formState.email,
        password: formState.password,
      });

      clearTimeout(timeoutId);

      if (error) {
        // Sprawdzenie czy sesja wygasła
        if (error.message.includes('session') || error.message.includes('expired')) {
          toast.error('Sesja wygasła. Zaloguj się ponownie.');
        }
        handleAuthError(error);
        return;
      }

      // Sukces - przekierowanie
      if (data.session) {
        const targetUrl = redirectUrl || '/';
        window.location.href = targetUrl;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      handleNetworkError(error);
    } finally {
      setFormState((prev: LoginFormState) => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  };

  // Sprawdzenie czy formularz może być wysłany
  const canSubmit = 
    !formState.isSubmitting &&
    formState.email.trim().length > 0 &&
    formState.password.length > 0 &&
    formState.emailError === null &&
    formState.passwordError === null;

  // Generowanie unikalnych ID dla ARIA
  const emailErrorId = React.useId();
  const passwordErrorId = React.useId();

  // Pokazanie loading state podczas sprawdzania sesji
  if (formState.isCheckingSession) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Pole Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            ref={emailInputRef}
            id="email"
            type="email"
            value={formState.email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            autoComplete="email"
            required
            aria-label="Email"
            aria-describedby={formState.emailError ? emailErrorId : undefined}
            aria-invalid={formState.emailError !== null}
            disabled={formState.isSubmitting || formState.isCheckingSession}
            className={formState.emailError ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {formState.emailError && (
            <p
              id={emailErrorId}
              className="text-sm text-destructive font-medium"
              role="alert"
              aria-live="polite"
            >
              {formState.emailError}
            </p>
          )}
        </div>

        {/* Pole Hasło */}
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <div className="relative">
            <Input
              id="password"
              type={formState.showPassword ? 'text' : 'password'}
              value={formState.password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              autoComplete="current-password"
              required
              aria-label="Hasło"
              aria-describedby={formState.passwordError ? passwordErrorId : undefined}
              aria-invalid={formState.passwordError !== null}
              disabled={formState.isSubmitting}
              className={formState.passwordError ? 'border-destructive pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={formState.showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
              tabIndex={-1}
            >
              {formState.showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {formState.passwordError && (
            <p
              id={passwordErrorId}
              className="text-sm text-destructive font-medium"
              role="alert"
              aria-live="polite"
            >
              {formState.passwordError}
            </p>
          )}
        </div>

        {/* Komunikat błędu ogólnego */}
        {formState.errorMessage && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <AlertDescription>{formState.errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Przycisk Submit */}
        <Button
          type="submit"
          disabled={!canSubmit || formState.isCheckingSession}
          className="w-full"
          aria-label="Zaloguj się"
        >
          {formState.isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Logowanie...
            </>
          ) : (
            'Zaloguj się'
          )}
        </Button>
      </form>

      {/* Link do rejestracji */}
      <div className="text-center text-sm">
        <a
          href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
          className="text-primary hover:underline"
        >
          Nie masz konta? Zarejestruj się
        </a>
      </div>
    </div>
  );
}

