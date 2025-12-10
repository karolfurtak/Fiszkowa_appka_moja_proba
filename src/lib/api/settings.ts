import { supabaseClient } from '../../db/supabase.client';
import type {
  ProfileResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
} from '../../types';

/**
 * Obsługa błędów sieciowych z timeout i offline detection
 */
function handleNetworkError(error: unknown): never {
  if (!navigator.onLine) {
    throw new Error('Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie.');
  }
  if (error instanceof Error && error.name === 'AbortError') {
    throw new Error('Żądanie przekroczyło limit czasu. Spróbuj ponownie.');
  }
  throw new Error('Wystąpił nieoczekiwany błąd sieci. Spróbuj ponownie.');
}

/**
 * Pobiera profil użytkownika
 */
export async function fetchUserProfile(userId: string): Promise<ProfileResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (response.status === 404) {
        throw new Error('Nie znaleziono profilu użytkownika.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się pobrać profilu użytkownika');
    }

    const data: ProfileResponse[] = await response.json();
    if (!data || data.length === 0) {
      throw new Error('Nie znaleziono profilu użytkownika.');
    }

    return data[0];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    if (error instanceof Error && error.message.includes('Nie znaleziono profilu')) {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Weryfikuje stare hasło przez próbę logowania
 */
export async function verifyOldPassword(email: string, password: string): Promise<boolean> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    clearTimeout(timeoutId);
    return false;
  }
}

/**
 * Aktualizuje hasło użytkownika
 */
export async function updatePassword(newPassword: string): Promise<UpdatePasswordResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        password: newPassword,
      } as UpdatePasswordRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Nie udało się zmienić hasła');
    }

    const userData = await response.json();
    return {
      id: userData.id,
      email: userData.email,
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    handleNetworkError(error);
  }
}

/**
 * Zapisuje preferencje użytkownika (do localStorage jako backup, opcjonalnie do bazy danych)
 */
export async function saveUserPreferences(userId: string, preferences: string): Promise<void> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Zapis do localStorage jako backup
  localStorage.setItem('userPreferences', preferences);

  // Opcjonalnie: zapis do bazy danych (jeśli tabela profiles ma pole user_preferences)
  // Na razie tylko localStorage
}

/**
 * Zapisuje ustawienia aplikacji do localStorage
 */
export function saveAppSettings(settings: { darkMode: boolean; verificationViewMode: 'pagination' | 'infinite-scroll' }): void {
  localStorage.setItem('darkMode', settings.darkMode.toString());
  localStorage.setItem('verificationViewMode', settings.verificationViewMode);

  // Synchronizacja dark mode z <html> elementem
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Usuwa konto użytkownika (przez Edge Function)
 */
export async function deleteAccount(userId: string): Promise<DeleteAccountResponse> {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        user_id: userId,
      } as DeleteAccountRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || errorData.message || 'Nie udało się usunąć konta');
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    handleNetworkError(error);
  }
}

