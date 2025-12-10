import * as React from 'react';

/**
 * Propsy komponentu PasswordStrengthIndicator
 */
interface PasswordStrengthIndicatorProps {
  /**
   * Hasło do oceny siły
   */
  password: string;
}

/**
 * Typ siły hasła
 */
type PasswordStrength = 'weak' | 'medium' | 'strong';

/**
 * Oblicza siłę hasła na podstawie jego długości i złożoności
 * 
 * @param password - Hasło do oceny
 * @returns Siła hasła: 'weak', 'medium' lub 'strong'
 */
function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 6) {
    return 'weak';
  }

  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);
  
  const length = password.length;
  const complexity = [hasLetters, hasNumbers, hasSymbols].filter(Boolean).length;

  // Słabe: < 6 znaków lub tylko litery lub tylko cyfry
  if (length < 6 || (hasLetters && !hasNumbers && !hasSymbols) || (hasNumbers && !hasLetters && !hasSymbols)) {
    return 'weak';
  }

  // Średnie: 6-7 znaków z literami i cyframi, lub 8+ znaków z tylko literami/cyframi
  if ((length >= 6 && length <= 7 && complexity >= 2) || (length >= 8 && complexity === 1)) {
    return 'medium';
  }

  // Silne: 8+ znaków z literami i cyframi (opcjonalnie z symbolami)
  if (length >= 8 && complexity >= 2) {
    return 'strong';
  }

  return 'weak';
}

/**
 * Komponent wskaźnika siły hasła
 * 
 * Wyświetla wizualny wskaźnik siły hasła z kolorami (czerwony/żółty/zielony)
 * i tekstem opisowym (Słabe/Średnie/Silne).
 */
export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = React.useMemo(() => calculatePasswordStrength(password), [password]);

  // Nie pokazuj wskaźnika jeśli hasło jest puste
  if (!password) {
    return null;
  }

  const getStrengthConfig = () => {
    switch (strength) {
      case 'weak':
        return {
          label: 'Słabe',
          color: 'bg-destructive',
          textColor: 'text-destructive',
          width: 'w-1/3',
        };
      case 'medium':
        return {
          label: 'Średnie',
          color: 'bg-orange-500',
          textColor: 'text-orange-500',
          width: 'w-2/3',
        };
      case 'strong':
        return {
          label: 'Silne',
          color: 'bg-green-500',
          textColor: 'text-green-500',
          width: 'w-full',
        };
      default:
        return {
          label: 'Słabe',
          color: 'bg-destructive',
          textColor: 'text-destructive',
          width: 'w-1/3',
        };
    }
  };

  const config = getStrengthConfig();

  return (
    <div className="space-y-1" role="status" aria-live="polite">
      <div className="flex items-center justify-between text-xs">
        <span className={config.textColor + ' font-medium'}>
          Siła hasła: {config.label}
        </span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${config.color} transition-all duration-300 ${config.width}`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

