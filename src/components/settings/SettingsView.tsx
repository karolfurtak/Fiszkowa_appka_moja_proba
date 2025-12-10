import * as React from 'react';
import { supabaseClient } from '../../db/supabase.client';
import {
  fetchUserProfile,
  verifyOldPassword,
  updatePassword,
  saveUserPreferences,
  saveAppSettings,
  deleteAccount,
} from '../../lib/api/settings';
import type { ProfileResponse } from '../../types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PasswordChangeForm } from './PasswordChangeForm';
import { UserPreferencesForm } from './UserPreferencesForm';
import { AppSettingsForm } from './AppSettingsForm';
import { DeleteAccountDialog } from './DeleteAccountDialog';

/**
 * Stan komponentu SettingsView
 */
interface SettingsViewState {
  // Sekcja zmiany hasła
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordErrors: {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  isChangingPassword: boolean;
  passwordChangeSuccess: boolean;

  // Sekcja preferencji użytkownika
  userPreferences: string;
  isSavingPreferences: boolean;
  preferencesSaveSuccess: boolean;
  preferencesError: string | null;

  // Sekcja ustawień aplikacji
  darkMode: boolean;
  verificationViewMode: 'pagination' | 'infinite-scroll';
  isSavingAppSettings: boolean;

  // Sekcja konta
  userProfile: ProfileResponse | null;
  userEmail: string | null;
  deleteAccountConfirmation: string;
  isDeleteAccountDialogOpen: boolean;
  isDeletingAccount: boolean;

  // Ogólne
  isLoading: boolean;
  error: string | null;
}

/**
 * Główny komponent widoku ustawień
 *
 * Zarządza wszystkimi sekcjami ustawień: zmianą hasła, preferencjami użytkownika,
 * ustawieniami aplikacji oraz zarządzaniem kontem.
 */
export default function SettingsView() {
  const [state, setState] = React.useState<SettingsViewState>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    passwordErrors: {},
    isChangingPassword: false,
    passwordChangeSuccess: false,
    userPreferences: '',
    isSavingPreferences: false,
    preferencesSaveSuccess: false,
    preferencesError: null,
    darkMode: false,
    verificationViewMode: 'pagination',
    isSavingAppSettings: false,
    userProfile: null,
    userEmail: null,
    deleteAccountConfirmation: '',
    isDeleteAccountDialogOpen: false,
    isDeletingAccount: false,
    isLoading: true,
    error: null,
  });

  /**
   * Mapowanie błędów API na komunikaty dla użytkownika
   */
  const mapApiError = React.useCallback((errorMessage: string): string => {
    if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
      return 'Sesja wygasła. Zaloguj się ponownie.';
    }
    if (errorMessage.includes('Nie znaleziono profilu')) {
      return 'Nie znaleziono profilu użytkownika.';
    }
    if (errorMessage.includes('hasło') || errorMessage.includes('password')) {
      return 'Nieprawidłowe hasło. Sprawdź wprowadzone dane.';
    }
    if (errorMessage.includes('Brak połączenia')) {
      return 'Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie.';
    }
    if (errorMessage.includes('limit czasu') || errorMessage.includes('timeout')) {
      return 'Żądanie trwa zbyt długo. Spróbuj ponownie.';
    }
    return errorMessage || 'Wystąpił błąd. Spróbuj ponownie.';
  }, []);

  /**
   * Pobieranie profilu użytkownika i ustawień
   */
  const loadProfile = React.useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        throw new Error('Unauthorized');
      }

      const profile = await fetchUserProfile(session.user.id);

      // Pobierz preferencje z localStorage
      const savedPreferences = localStorage.getItem('userPreferences') || '';

      // Pobierz ustawienia aplikacji z localStorage
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      const savedViewMode = (localStorage.getItem('verificationViewMode') ||
        'pagination') as 'pagination' | 'infinite-scroll';

      // Synchronizacja dark mode z <html> elementem
      if (savedDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      setState((prev) => ({
        ...prev,
        userProfile: profile,
        userEmail: session.user.email || null,
        userPreferences: savedPreferences,
        darkMode: savedDarkMode,
        verificationViewMode: savedViewMode,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
      const errorMessage = mapApiError(
        error instanceof Error ? error.message : 'Nie udało się załadować profilu'
      );
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));

      if (errorMessage === 'Sesja wygasła. Zaloguj się ponownie.') {
        toast.error(errorMessage);
        setTimeout(() => {
          window.location.href = '/login?redirect=/settings';
        }, 2000);
      } else {
        toast.error(errorMessage);
      }
    }
  }, [mapApiError]);

  /**
   * Pobieranie profilu po zamontowaniu komponentu
   */
  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Walidacja formularza zmiany hasła
   */
  const validatePasswordForm = React.useCallback(() => {
    const errors: {
      oldPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!state.oldPassword.trim()) {
      errors.oldPassword = 'Stare hasło jest wymagane';
    }

    if (!state.newPassword.trim()) {
      errors.newPassword = 'Nowe hasło jest wymagane';
    } else if (state.newPassword.length < 8) {
      errors.newPassword = 'Hasło musi zawierać co najmniej 8 znaków';
    } else if (!/[a-zA-Z]/.test(state.newPassword) || !/\d/.test(state.newPassword)) {
      errors.newPassword = 'Hasło musi zawierać litery i cyfry';
    }

    if (!state.confirmPassword.trim()) {
      errors.confirmPassword = 'Potwierdzenie hasła jest wymagane';
    } else if (state.newPassword !== state.confirmPassword) {
      errors.confirmPassword = 'Hasła nie są identyczne';
    }

    return errors;
  }, [state.oldPassword, state.newPassword, state.confirmPassword]);

  /**
   * Obsługa zmiany hasła
   */
  const handleChangePassword = React.useCallback(async () => {
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setState((prev) => ({ ...prev, passwordErrors: errors }));
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        isChangingPassword: true,
        passwordErrors: {},
      }));

      // Weryfikacja starego hasła
      if (!state.userEmail) {
        throw new Error('Nie znaleziono adresu email użytkownika');
      }

      const isOldPasswordValid = await verifyOldPassword(state.userEmail, state.oldPassword);
      if (!isOldPasswordValid) {
        setState((prev) => ({
          ...prev,
          passwordErrors: {
            oldPassword: 'Nieprawidłowe stare hasło',
          },
          isChangingPassword: false,
        }));
        toast.error('Nieprawidłowe stare hasło');
        return;
      }

      // Zmiana hasła
      await updatePassword(state.newPassword);

      toast.success('Hasło zostało zmienione pomyślnie');
      setState((prev) => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        passwordErrors: {},
        passwordChangeSuccess: true,
        isChangingPassword: false,
      }));
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = mapApiError(
        error instanceof Error ? error.message : 'Nie udało się zmienić hasła'
      );
      toast.error(errorMessage);
      setState((prev) => ({
        ...prev,
        isChangingPassword: false,
        passwordErrors: {
          oldPassword: errorMessage.includes('hasło') ? errorMessage : undefined,
        },
      }));
    }
  }, [state.oldPassword, state.newPassword, state.userEmail, validatePasswordForm, mapApiError]);

  /**
   * Obsługa zapisu preferencji użytkownika
   */
  const handleSavePreferences = React.useCallback(async () => {
    if (state.userPreferences.length > 1500) {
      setState((prev) => ({
        ...prev,
        preferencesError: `Preferencje nie mogą przekraczać 1500 znaków (obecnie: ${state.userPreferences.length} znaków)`,
      }));
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        isSavingPreferences: true,
        preferencesError: null,
      }));

      if (!state.userProfile) {
        throw new Error('Nie znaleziono profilu użytkownika');
      }

      await saveUserPreferences(state.userProfile.id, state.userPreferences);

      toast.success('Preferencje zostały zapisane');
      setState((prev) => ({
        ...prev,
        preferencesSaveSuccess: true,
        isSavingPreferences: false,
      }));
    } catch (error) {
      console.error('Error saving preferences:', error);
      const errorMessage = mapApiError(
        error instanceof Error ? error.message : 'Nie udało się zapisać preferencji'
      );
      toast.error(errorMessage);
      setState((prev) => ({
        ...prev,
        preferencesError: errorMessage,
        isSavingPreferences: false,
      }));
    }
  }, [state.userPreferences, state.userProfile, mapApiError]);

  /**
   * Ref do timera debouncingu dla ustawień aplikacji
   */
  const appSettingsTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Obsługa zmiany ustawień aplikacji (auto-save z debouncing)
   */
  const handleAppSettingsChange = React.useCallback(
    (darkMode: boolean, verificationViewMode: 'pagination' | 'infinite-scroll') => {
      setState((prev) => ({
        ...prev,
        darkMode,
        verificationViewMode,
        isSavingAppSettings: true,
      }));

      // Anuluj poprzedni timer jeśli istnieje
      if (appSettingsTimerRef.current) {
        clearTimeout(appSettingsTimerRef.current);
      }

      // Debouncing - zapis po 500ms
      appSettingsTimerRef.current = setTimeout(() => {
        try {
          saveAppSettings({ darkMode, verificationViewMode });
          setState((prev) => ({
            ...prev,
            isSavingAppSettings: false,
          }));
        } catch (error) {
          console.error('Error saving app settings:', error);
          toast.error('Nie udało się zapisać ustawień');
          setState((prev) => ({
            ...prev,
            isSavingAppSettings: false,
          }));
        }
        appSettingsTimerRef.current = null;
      }, 500);
    },
    []
  );

  /**
   * Cleanup timera przy unmount
   */
  React.useEffect(() => {
    return () => {
      if (appSettingsTimerRef.current) {
        clearTimeout(appSettingsTimerRef.current);
      }
    };
  }, []);

  /**
   * Obsługa usunięcia konta
   */
  const handleDeleteAccount = React.useCallback(async () => {
    if (!state.userProfile) {
      toast.error('Nie znaleziono profilu użytkownika');
      return;
    }

    try {
      setState((prev) => ({ ...prev, isDeletingAccount: true }));

      await deleteAccount(state.userProfile.id);

      toast.success('Konto zostało usunięte');
      
      // Wylogowanie użytkownika
      await supabaseClient.auth.signOut();
      
      // Przekierowanie na stronę główną
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      const errorMessage = mapApiError(
        error instanceof Error ? error.message : 'Nie udało się usunąć konta'
      );
      toast.error(errorMessage);
      setState((prev) => ({
        ...prev,
        isDeletingAccount: false,
      }));
    }
  }, [state.userProfile, mapApiError]);

  /**
   * Formatowanie daty rejestracji
   */
  const formattedCreatedAt = React.useMemo(() => {
    if (!state.userProfile?.created_at) {
      return '';
    }
    const date = new Date(state.userProfile.created_at);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [state.userProfile?.created_at]);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state.error && !state.userProfile) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{state.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Nagłówek */}
      <header>
        <h1 className="text-3xl font-bold">Ustawienia</h1>
      </header>

      {/* Sekcja zmiany hasła */}
      <Card>
        <CardHeader>
          <CardTitle>Zmiana hasła</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm
            oldPassword={state.oldPassword}
            newPassword={state.newPassword}
            confirmPassword={state.confirmPassword}
            errors={state.passwordErrors}
            isChanging={state.isChangingPassword}
            success={state.passwordChangeSuccess}
            onOldPasswordChange={(value) =>
              setState((prev) => ({ ...prev, oldPassword: value, passwordErrors: {} }))
            }
            onNewPasswordChange={(value) =>
              setState((prev) => ({ ...prev, newPassword: value, passwordErrors: {} }))
            }
            onConfirmPasswordChange={(value) =>
              setState((prev) => ({ ...prev, confirmPassword: value, passwordErrors: {} }))
            }
            onSubmit={handleChangePassword}
            onSuccessReset={() =>
              setState((prev) => ({ ...prev, passwordChangeSuccess: false }))
            }
          />
        </CardContent>
      </Card>

      {/* Sekcja preferencji użytkownika */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencje użytkownika</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Wpisz swoje preferencje dotyczące generowania fiszek. Te informacje będą przekazywane
            do AI podczas generowania jako dodatkowy kontekst.
          </p>
        </CardHeader>
        <CardContent>
          <UserPreferencesForm
            preferences={state.userPreferences}
            error={state.preferencesError}
            isSaving={state.isSavingPreferences}
            success={state.preferencesSaveSuccess}
            onPreferencesChange={(value) =>
              setState((prev) => ({
                ...prev,
                userPreferences: value,
                preferencesError: null,
              }))
            }
            onSubmit={handleSavePreferences}
            onSuccessReset={() =>
              setState((prev) => ({ ...prev, preferencesSaveSuccess: false }))
            }
          />
        </CardContent>
      </Card>

      {/* Sekcja ustawień aplikacji */}
      <Card>
        <CardHeader>
          <CardTitle>Ustawienia aplikacji</CardTitle>
        </CardHeader>
        <CardContent>
          <AppSettingsForm
            darkMode={state.darkMode}
            verificationViewMode={state.verificationViewMode}
            isSaving={state.isSavingAppSettings}
            onDarkModeChange={(enabled) =>
              handleAppSettingsChange(enabled, state.verificationViewMode)
            }
            onVerificationViewModeChange={(mode) =>
              handleAppSettingsChange(state.darkMode, mode)
            }
          />
        </CardContent>
      </Card>

      {/* Sekcja konta */}
      <Card>
        <CardHeader>
          <CardTitle>Konto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informacje o koncie */}
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{state.userEmail || 'Nie znaleziono'}</p>
            </div>
            {state.userProfile && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nazwa użytkownika</p>
                <p className="text-base">{state.userProfile.username}</p>
              </div>
            )}
            {formattedCreatedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data rejestracji</p>
                <p className="text-base">{formattedCreatedAt}</p>
              </div>
            )}
          </div>

          {/* Przycisk usunięcia konta */}
          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              onClick={() =>
                setState((prev) => ({ ...prev, isDeleteAccountDialogOpen: true }))
              }
            >
              Usuń konto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal usunięcia konta */}
      <DeleteAccountDialog
        isOpen={state.isDeleteAccountDialogOpen}
        confirmation={state.deleteAccountConfirmation}
        isDeleting={state.isDeletingAccount}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            isDeleteAccountDialogOpen: false,
            deleteAccountConfirmation: '',
          }))
        }
        onConfirmationChange={(value) =>
          setState((prev) => ({ ...prev, deleteAccountConfirmation: value }))
        }
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}

