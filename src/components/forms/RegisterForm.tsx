import * as React from 'react';
import { supabaseClient } from '../../db/supabase.client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { AuthError } from '@supabase/supabase-js';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

/**
 * Stan wewnętrzny komponentu RegisterForm
 */
interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  };
  touched: {
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  };
  isSubmitting: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isCheckingSession: boolean;
}

/**
 * Komponent formularza rejestracji
 * 
 * Obsługuje:
 * - Walidację pól email, hasło i potwierdzenie hasła
 * - Integrację z Supabase Auth API
 * - Przekierowanie po pomyślnej rejestracji
 * - Obsługę błędów autoryzacji i sieci
 */
export default function RegisterForm() {
  const [formState, setFormState] = React.useState<RegisterFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    errors: {},
    touched: {
      email: false,
      password: false,
      confirmPassword: false,
    },
    isSubmitting: false,
    showPassword: false,
    showConfirmPassword: false,
    isCheckingSession: true,
  });

  // Refs dla automatycznego fokusowania pól
  const emailInputRef = React.useRef<HTMLInputElement>(null);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = React.useRef<HTMLInputElement>(null);

  // Sprawdzenie czy użytkownik jest już zalogowany przy mount
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setFormState((prev: RegisterFormState) => ({
          ...prev,
          isCheckingSession: false,
        }));
      }
    };
    checkSession();
  }, []);

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
    if (password.length < 6) {
      return 'Hasło musi zawierać co najmniej 6 znaków';
    }
    if (password.length < 8) {
      // Ostrzeżenie, ale nie błąd - Supabase wymaga min 6, ale rekomendujemy 8+
      return null; // Nie blokujemy, ale można pokazać ostrzeżenie
    }
    return null;
  };

  /**
   * Walidacja potwierdzenia hasła
   */
  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) {
      return 'Potwierdzenie hasła jest wymagane';
    }
    if (password !== confirmPassword) {
      return 'Hasła nie są identyczne';
    }
    return null;
  };

  /**
   * Walidacja całego formularza
   */
  const validateForm = (): boolean => {
    const emailError = validateEmail(formState.email);
    const passwordError = validatePassword(formState.password);
    const confirmPasswordError = validateConfirmPassword(formState.password, formState.confirmPassword);

    const errors: RegisterFormState['errors'] = {};
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    setFormState((prev: RegisterFormState) => ({
      ...prev,
      errors,
      touched: {
        email: true,
        password: true,
        confirmPassword: true,
      },
    }));

    return Object.keys(errors).length === 0;
  };

  /**
   * Obsługa zmiany wartości pola email
   * 
   * Aktualizuje wartość email w stanie i czyści błędy jeśli pole było dotknięte.
   */
  const handleEmailChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState((prev: RegisterFormState) => ({
      ...prev,
      email: value,
      errors: {
        ...prev.errors,
        email: prev.touched.email ? undefined : prev.errors.email,
        general: undefined,
      },
    }));
  }, []);

  /**
   * Obsługa opuszczenia pola email (onBlur)
   * 
   * Wykonuje walidację email po opuszczeniu pola i oznacza pole jako dotknięte.
   */
  const handleEmailBlur = React.useCallback(() => {
    const emailError = validateEmail(formState.email);
    setFormState((prev: RegisterFormState) => ({
      ...prev,
      touched: { ...prev.touched, email: true },
      errors: {
        ...prev.errors,
        email: emailError || undefined,
      },
    }));
  }, []);

  /**
   * Obsługa zmiany wartości pola hasła
   * 
   * Aktualizuje wartość hasła w stanie, czyści błędy i waliduje zgodność z potwierdzeniem hasła.
   */
  const handlePasswordChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState((prev: RegisterFormState) => ({
      ...prev,
      password: value,
      errors: {
        ...prev.errors,
        password: prev.touched.password ? undefined : prev.errors.password,
        confirmPassword: prev.touched.confirmPassword && prev.confirmPassword
          ? validateConfirmPassword(value, prev.confirmPassword) || undefined
          : prev.errors.confirmPassword,
        general: undefined,
      },
    }));
  }, []);

  /**
   * Obsługa opuszczenia pola hasła (onBlur)
   * 
   * Wykonuje walidację hasła po opuszczeniu pola i oznacza pole jako dotknięte.
   */
  const handlePasswordBlur = React.useCallback(() => {
    const passwordError = validatePassword(formState.password);
    setFormState((prev: RegisterFormState) => ({
      ...prev,
      touched: { ...prev.touched, password: true },
      errors: {
        ...prev.errors,
        password: passwordError || undefined,
      },
    }));
  }, []);

  /**
   * Obsługa zmiany wartości pola potwierdzenia hasła
   * 
   * Aktualizuje wartość potwierdzenia hasła w stanie i czyści błędy jeśli pole było dotknięte.
   */
  const handleConfirmPasswordChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState((prev: RegisterFormState) => ({
      ...prev,
      confirmPassword: value,
      errors: {
        ...prev.errors,
        confirmPassword: prev.touched.confirmPassword ? undefined : prev.errors.confirmPassword,
        general: undefined,
      },
    }));
  }, []);

  /**
   * Obsługa opuszczenia pola potwierdzenia hasła (onBlur)
   * 
   * Wykonuje walidację zgodności haseł po opuszczeniu pola i oznacza pole jako dotknięte.
   */
  const handleConfirmPasswordBlur = React.useCallback(() => {
    const confirmPasswordError = validateConfirmPassword(formState.password, formState.confirmPassword);
    setFormState((prev: RegisterFormState) => ({
      ...prev,
      touched: { ...prev.touched, confirmPassword: true },
      errors: {
        ...prev.errors,
        confirmPassword: confirmPasswordError || undefined,
      },
    }));
  }, []);

  /**
   * Obsługa przełączania widoczności hasła
   * 
   * Przełącza między widocznym a ukrytym hasłem.
   */
  const togglePasswordVisibility = React.useCallback(() => {
    setFormState((prev: RegisterFormState) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  }, []);

  /**
   * Obsługa przełączania widoczności potwierdzenia hasła
   * 
   * Przełącza między widocznym a ukrytym potwierdzeniem hasła.
   */
  const toggleConfirmPasswordVisibility = React.useCallback(() => {
    setFormState((prev: RegisterFormState) => ({
      ...prev,
      showConfirmPassword: !prev.showConfirmPassword,
    }));
  }, []);

  /**
   * Mapowanie błędów autoryzacji Supabase na komunikaty użytkownika
   * 
   * Analizuje kod błędu i komunikat z Supabase Auth API i zwraca
   * odpowiedni komunikat w języku polskim oraz pole, którego dotyczy błąd.
   * 
   * @param error - Błąd autoryzacji z Supabase
   * @returns Obiekt z opcjonalnym polem i komunikatem błędu
   */
  const mapAuthError = React.useCallback((error: AuthError): { field?: string; message: string } => {
    const message = error.message.toLowerCase();
    
    if (message.includes('email already registered') || message.includes('user already registered') || error.status === 422) {
      return { field: 'email', message: 'Ten email jest już zarejestrowany' };
    }
    if (message.includes('invalid email') || message.includes('invalid_email')) {
      return { field: 'email', message: 'Nieprawidłowy format email' };
    }
    if (message.includes('weak password') || message.includes('password') || message.includes('too short')) {
      return { field: 'password', message: 'Hasło jest zbyt słabe. Musi zawierać co najmniej 6 znaków' };
    }
    if (message.includes('signup disabled')) {
      return { message: 'Rejestracja jest obecnie wyłączona' };
    }
    return { message: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.' };
  }, []);

  /**
   * Obsługa błędów autoryzacji
   * 
   * Mapuje błąd autoryzacji na odpowiedni komunikat i ustawia go w stanie formularza.
   * 
   * @param error - Błąd autoryzacji z Supabase
   */
  const handleAuthError = React.useCallback((error: AuthError) => {
    const { field, message } = mapAuthError(error);
    
    if (field) {
      setFormState((prev: RegisterFormState) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: message,
        },
        isSubmitting: false,
      }));
    } else {
      setFormState((prev: RegisterFormState) => ({
        ...prev,
        errors: {
          ...prev.errors,
          general: message,
        },
        isSubmitting: false,
      }));
    }
  }, [mapAuthError]);

  /**
   * Obsługa błędów sieci z wykrywaniem offline
   * 
   * Wykrywa typ błędu sieci (offline, timeout, inne) i wyświetla odpowiedni komunikat.
   * 
   * @param error - Błąd sieci
   */
  const handleNetworkError = React.useCallback((error: unknown) => {
    console.error('Network error:', error);
    
    if (!navigator.onLine) {
      toast.error('Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie.');
    } else if (error instanceof Error && error.message.includes('timeout')) {
      toast.error('Żądanie przekroczyło limit czasu. Spróbuj ponownie.');
    } else {
      toast.error('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.');
    }
    
    setFormState((prev: RegisterFormState) => ({
      ...prev,
      isSubmitting: false,
    }));
  }, []);

  /**
   * Obsługa wysłania formularza
   * 
   * Wykonuje walidację formularza, wysyła żądanie rejestracji do Supabase Auth API,
   * obsługuje odpowiedzi (sukces/błąd) i przekierowuje użytkownika po sukcesie.
   * 
   * @param e - Zdarzenie submit formularza
   */
  const handleSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Walidacja przed wysłaniem
    const emailError = validateEmail(formState.email);
    const passwordError = validatePassword(formState.password);
    const confirmPasswordError = validateConfirmPassword(formState.password, formState.confirmPassword);

    const errors: RegisterFormState['errors'] = {};
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    if (Object.keys(errors).length > 0) {
      setFormState((prev: RegisterFormState) => ({
        ...prev,
        errors,
        touched: {
          email: true,
          password: true,
          confirmPassword: true,
        },
      }));

      // Fokusowanie pierwszego pola z błędem
      if (errors.email && emailInputRef.current) {
        emailInputRef.current.focus();
        emailInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errors.password && passwordInputRef.current) {
        passwordInputRef.current.focus();
        passwordInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errors.confirmPassword && confirmPasswordInputRef.current) {
        confirmPasswordInputRef.current.focus();
        confirmPasswordInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setFormState((prev: RegisterFormState) => ({
      ...prev,
      isSubmitting: true,
      errors: { ...prev.errors, general: undefined },
    }));

    // Timeout dla requestu (30 sekund)
    const timeoutId = setTimeout(() => {
      toast.error('Żądanie przekroczyło limit czasu. Spróbuj ponownie.');
      setFormState((prev: RegisterFormState) => ({
        ...prev,
        isSubmitting: false,
      }));
    }, 30000);

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: formState.email,
        password: formState.password,
      });

      clearTimeout(timeoutId);

      if (error) {
        // Sprawdzenie czy sesja wygasła
        if (error.message.includes('session') || error.message.includes('expired') || error.message.includes('token')) {
          toast.error('Sesja wygasła. Odśwież stronę i spróbuj ponownie.');
        }
        handleAuthError(error);
        return;
      }

      // Sukces - przekierowanie na dashboard (onboarding będzie dodany później)
      if (data.user && data.session) {
        const targetUrl = '/';
        window.location.href = targetUrl;
      } else if (data.user && !data.session) {
        // Użytkownik zarejestrowany, ale wymaga potwierdzenia email
        toast.success('Rejestracja zakończona pomyślnie! Sprawdź skrzynkę pocztową, aby potwierdzić email.', {
          duration: 10000, // Dłuższy czas wyświetlania dla ważnej informacji
        });
        // Wyczyść formularz po sukcesie
        setFormState((prev: RegisterFormState) => ({
          ...prev,
          email: '',
          password: '',
          confirmPassword: '',
          errors: {},
          touched: {
            email: false,
            password: false,
            confirmPassword: false,
          },
          isSubmitting: false,
        }));
      }
    } catch (error) {
      clearTimeout(timeoutId);
      handleNetworkError(error);
    } finally {
      setFormState((prev: RegisterFormState) => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  }, [formState.email, formState.password, formState.confirmPassword, handleAuthError, handleNetworkError]);

  // Sprawdzenie czy formularz może być wysłany
  const canSubmit = 
    !formState.isSubmitting &&
    formState.email.trim().length > 0 &&
    formState.password.length > 0 &&
    formState.confirmPassword.length > 0 &&
    Object.keys(formState.errors).length === 0;

  // Generowanie unikalnych ID dla ARIA
  const emailErrorId = React.useId();
  const passwordErrorId = React.useId();
  const confirmPasswordErrorId = React.useId();

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
            aria-describedby={formState.errors.email ? emailErrorId : undefined}
            aria-invalid={!!formState.errors.email}
            disabled={formState.isSubmitting || formState.isCheckingSession}
            className={formState.errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {formState.errors.email && (
            <p
              id={emailErrorId}
              className="text-sm text-destructive font-medium"
              role="alert"
              aria-live="polite"
            >
              {formState.errors.email}
            </p>
          )}
        </div>

        {/* Pole Hasło */}
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <div className="relative">
            <Input
              ref={passwordInputRef}
              id="password"
              type={formState.showPassword ? 'text' : 'password'}
              value={formState.password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              autoComplete="new-password"
              required
              aria-label="Hasło"
              aria-describedby={formState.errors.password ? passwordErrorId : undefined}
              aria-invalid={!!formState.errors.password}
              disabled={formState.isSubmitting}
              className={formState.errors.password ? 'border-destructive pr-10' : 'pr-10'}
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
          {formState.errors.password && (
            <p
              id={passwordErrorId}
              className="text-sm text-destructive font-medium"
              role="alert"
              aria-live="polite"
            >
              {formState.errors.password}
            </p>
          )}
          {formState.password && formState.password.length >= 6 && formState.password.length < 8 && !formState.errors.password && (
            <p className="text-sm text-orange-500">
              Hasło powinno zawierać co najmniej 8 znaków dla lepszego bezpieczeństwa
            </p>
          )}
          {formState.password && formState.touched.password && !formState.errors.password && (
            <PasswordStrengthIndicator password={formState.password} />
          )}
        </div>

        {/* Pole Potwierdzenie Hasła */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Potwierdzenie hasła</Label>
          <div className="relative">
            <Input
              ref={confirmPasswordInputRef}
              id="confirmPassword"
              type={formState.showConfirmPassword ? 'text' : 'password'}
              value={formState.confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordBlur}
              autoComplete="new-password"
              required
              aria-label="Potwierdzenie hasła"
              aria-describedby={formState.errors.confirmPassword ? confirmPasswordErrorId : undefined}
              aria-invalid={!!formState.errors.confirmPassword}
              disabled={formState.isSubmitting}
              className={formState.errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={formState.showConfirmPassword ? 'Ukryj potwierdzenie hasła' : 'Pokaż potwierdzenie hasła'}
              tabIndex={-1}
            >
              {formState.showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {formState.errors.confirmPassword && (
            <p
              id={confirmPasswordErrorId}
              className="text-sm text-destructive font-medium"
              role="alert"
              aria-live="polite"
            >
              {formState.errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Komunikat błędu ogólnego */}
        {formState.errors.general && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <AlertDescription>{formState.errors.general}</AlertDescription>
          </Alert>
        )}

        {/* Przycisk Submit */}
        <Button
          type="submit"
          disabled={!canSubmit || formState.isCheckingSession}
          className="w-full"
          aria-label="Zarejestruj się"
        >
          {formState.isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Rejestrowanie...
            </>
          ) : (
            'Zarejestruj się'
          )}
        </Button>
      </form>

      {/* Link do logowania */}
      <div className="text-center text-sm">
        <a
          href="/login"
          className="text-primary hover:underline"
        >
          Masz już konto? Zaloguj się
        </a>
      </div>
    </div>
  );
}

