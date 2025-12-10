import * as React from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { supabaseClient } from '../../db/supabase.client';
import type { GenerateFlashcardsRequest, GenerateFlashcardsResponse, ApiErrorResponse, ApiErrorCode } from '../../types';
import { CharacterCounter } from './CharacterCounter';
import { toast } from 'sonner';
import { Info, Loader2 } from 'lucide-react';

/**
 * Stan formularza generatora fiszek
 */
interface GeneratorFormState {
  // Wartości pól formularza
  sourceText: string;
  language: string;
  domain: string;
  questionMinLength: number | null;
  questionMaxLength: number | null;
  answerMaxLength: number | null;
  userPreferences: string;
  
  // Błędy walidacji
  errors: {
    sourceText?: string;
    language?: string;
    domain?: string;
    questionMinLength?: string;
    questionMaxLength?: string;
    answerMaxLength?: string;
    userPreferences?: string;
    general?: string;
  };
  
  // Flagi "dotkniętych" pól
  touched: {
    sourceText: boolean;
    language: boolean;
    domain: boolean;
    questionMinLength: boolean;
    questionMaxLength: boolean;
    answerMaxLength: boolean;
    userPreferences: boolean;
  };
  
  // Stan ładowania podczas generowania
  isSubmitting: boolean;
  
  // Stan accordion (zwinięty/rozwinięty)
  isAdvancedOpen: boolean;
}

/**
 * Komponent formularza generowania fiszek
 */
export default function GeneratorForm() {
  const [formState, setFormState] = React.useState<GeneratorFormState>({
    sourceText: '',
    language: 'auto',
    domain: '',
    questionMinLength: null,
    questionMaxLength: null,
    answerMaxLength: null,
    userPreferences: '',
    errors: {},
    touched: {
      sourceText: false,
      language: false,
      domain: false,
      questionMinLength: false,
      questionMaxLength: false,
      answerMaxLength: false,
      userPreferences: false,
    },
    isSubmitting: false,
    isAdvancedOpen: false,
  });
  
  // Użyj useRef do przechowania aktualnego stanu dla submitForm
  const formStateRef = React.useRef(formState);
  React.useEffect(() => {
    formStateRef.current = formState;
  }, [formState]);

  /**
   * Walidacja tekstu źródłowego
   */
  const validateSourceText = (text: string): string | null => {
    if (!text || text.trim().length === 0) {
      return 'Tekst źródłowy jest wymagany';
    }
    if (text.length < 100) {
      return 'Tekst musi zawierać co najmniej 100 znaków';
    }
    return null;
  };

  /**
   * Walidacja języka
   */
  const validateLanguage = (language: string): string | null => {
    // "auto" jest zawsze poprawne
    if (language === 'auto') {
      return null;
    }
    // Sprawdzenie czy to poprawny kod języka (2 litery)
    if (language.length !== 2 || !/^[a-z]{2}$/.test(language)) {
      return 'Nieprawidłowy kod języka';
    }
    return null;
  };

  /**
   * Walidacja domeny wiedzy
   */
  const validateDomain = (domain: string): string | null => {
    if (domain.length > 100) {
      return 'Domena wiedzy nie może przekraczać 100 znaków';
    }
    return null;
  };

  /**
   * Walidacja minimalnej długości pytania
   */
  const validateQuestionMinLength = (value: number | null): string | null => {
    if (value === null) {
      return null;
    }
    if (!Number.isInteger(value) || value < 2 || value > 10000) {
      return 'Minimalna długość pytania musi być między 2 a 10000 znaków';
    }
    return null;
  };

  /**
   * Walidacja maksymalnej długości pytania
   */
  const validateQuestionMaxLength = (value: number | null, minLength: number | null): string | null => {
    if (value === null) {
      return null;
    }
    if (!Number.isInteger(value) || value < 2 || value > 10000) {
      return 'Maksymalna długość pytania musi być między 2 a 10000 znaków';
    }
    if (minLength !== null && value < minLength) {
      return 'Maksymalna długość musi być większa lub równa minimalnej długości';
    }
    return null;
  };

  /**
   * Walidacja maksymalnej długości odpowiedzi
   */
  const validateAnswerMaxLength = (value: number | null): string | null => {
    if (value === null) {
      return null;
    }
    if (!Number.isInteger(value) || value < 1 || value > 500) {
      return 'Maksymalna długość odpowiedzi musi być między 1 a 500 znaków';
    }
    return null;
  };

  /**
   * Walidacja preferencji użytkownika
   */
  const validateUserPreferences = (preferences: string): string | null => {
    if (preferences.length > 1500) {
      return 'Preferencje użytkownika nie mogą przekraczać 1500 znaków';
    }
    return null;
  };

  /**
   * Walidacja całego formularza
   * Zwraca obiekt z błędami walidacji
   */
  const validateForm = React.useCallback((state: GeneratorFormState): { isValid: boolean; errors: GeneratorFormState['errors'] } => {
    const errors: GeneratorFormState['errors'] = {};
    
    // Walidacja wszystkich pól
    const sourceTextError = validateSourceText(state.sourceText);
    if (sourceTextError) {
      errors.sourceText = sourceTextError;
    }
    
    const languageError = validateLanguage(state.language);
    if (languageError) {
      errors.language = languageError;
    }
    
    const domainError = validateDomain(state.domain);
    if (domainError) {
      errors.domain = domainError;
    }
    
    const questionMinLengthError = validateQuestionMinLength(state.questionMinLength);
    if (questionMinLengthError) {
      errors.questionMinLength = questionMinLengthError;
    }
    
    const questionMaxLengthError = validateQuestionMaxLength(state.questionMaxLength, state.questionMinLength);
    if (questionMaxLengthError) {
      errors.questionMaxLength = questionMaxLengthError;
    }
    
    const answerMaxLengthError = validateAnswerMaxLength(state.answerMaxLength);
    if (answerMaxLengthError) {
      errors.answerMaxLength = answerMaxLengthError;
    }
    
    const userPreferencesError = validateUserPreferences(state.userPreferences);
    if (userPreferencesError) {
      errors.userPreferences = userPreferencesError;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, []);

  /**
   * Ustawienie błędu dla pola
   */
  const setFieldError = React.useCallback((fieldName: keyof GeneratorFormState['errors'], error: string | null) => {
    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldName]: error || undefined,
      },
    }));
  }, []);

  /**
   * Oznaczenie pola jako "dotknięte"
   */
  const setFieldTouched = React.useCallback((fieldName: keyof GeneratorFormState['touched']) => {
    setFormState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [fieldName]: true,
      },
    }));
  }, []);

  /**
   * Obsługa zmiany tekstu źródłowego
   */
  const handleSourceTextChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormState(prev => {
      // Czyszczenie błędu jeśli pole było dotknięte
      let sourceTextError = prev.errors.sourceText;
      if (prev.touched.sourceText) {
        const error = validateSourceText(value);
        sourceTextError = error || undefined;
      }
      return {
        ...prev,
        sourceText: value,
        errors: {
          ...prev.errors,
          sourceText: sourceTextError,
        },
      };
    });
  }, []);

  /**
   * Obsługa opuszczenia pola tekstu źródłowego
   */
  const handleSourceTextBlur = React.useCallback(() => {
    setFormState(prev => {
      const error = validateSourceText(prev.sourceText);
      return {
        ...prev,
        touched: { ...prev.touched, sourceText: true },
        errors: {
          ...prev.errors,
          sourceText: error || undefined,
        },
      };
    });
  }, []);

  /**
   * Obsługa zmiany języka
   */
  const handleLanguageChange = React.useCallback((value: string) => {
    setFormState(prev => {
      let languageError = prev.errors.language;
      if (prev.touched.language) {
        const error = validateLanguage(value);
        languageError = error || undefined;
      }
      return {
        ...prev,
        language: value,
        errors: {
          ...prev.errors,
          language: languageError,
        },
      };
    });
  }, []);

  /**
   * Obsługa zmiany domeny
   */
  const handleDomainChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => {
      let domainError = prev.errors.domain;
      if (prev.touched.domain) {
        const error = validateDomain(value);
        domainError = error || undefined;
      }
      return {
        ...prev,
        domain: value,
        errors: {
          ...prev.errors,
          domain: domainError,
        },
      };
    });
  }, []);

  /**
   * Obsługa opuszczenia pola domeny
   */
  const handleDomainBlur = React.useCallback(() => {
    setFormState(prev => {
      const error = validateDomain(prev.domain);
      return {
        ...prev,
        touched: { ...prev.touched, domain: true },
        errors: {
          ...prev.errors,
          domain: error || undefined,
        },
      };
    });
  }, []);

  /**
   * Obsługa zmiany minimalnej długości pytania
   */
  const handleQuestionMinLengthChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
    setFormState(prev => {
      let questionMinLengthError = prev.errors.questionMinLength;
      let questionMaxLengthError = prev.errors.questionMaxLength;
      
      if (prev.touched.questionMinLength) {
        const error = validateQuestionMinLength(value);
        questionMinLengthError = error || undefined;
        
        // Jeśli zmieniono min, sprawdź też max
        if (prev.questionMaxLength !== null) {
          const maxError = validateQuestionMaxLength(prev.questionMaxLength, value);
          questionMaxLengthError = maxError || undefined;
        }
      }
      
      return {
        ...prev,
        questionMinLength: value,
        errors: {
          ...prev.errors,
          questionMinLength: questionMinLengthError,
          questionMaxLength: questionMaxLengthError,
        },
      };
    });
  }, []);

  /**
   * Obsługa opuszczenia pola minimalnej długości pytania
   */
  const handleQuestionMinLengthBlur = React.useCallback(() => {
    setFormState(prev => {
      const error = validateQuestionMinLength(prev.questionMinLength);
      // Jeśli zmieniono min, sprawdź też max
      let maxError = prev.errors.questionMaxLength;
      if (prev.questionMaxLength !== null && error === null) {
        const maxValidationError = validateQuestionMaxLength(prev.questionMaxLength, prev.questionMinLength);
        maxError = maxValidationError || undefined;
      }
      return {
        ...prev,
        touched: { ...prev.touched, questionMinLength: true },
        errors: {
          ...prev.errors,
          questionMinLength: error || undefined,
          questionMaxLength: maxError,
        },
      };
    });
  }, []);

  /**
   * Obsługa zmiany maksymalnej długości pytania
   */
  const handleQuestionMaxLengthChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
    setFormState(prev => {
      let questionMaxLengthError = prev.errors.questionMaxLength;
      if (prev.touched.questionMaxLength) {
        const error = validateQuestionMaxLength(value, prev.questionMinLength);
        questionMaxLengthError = error || undefined;
      }
      return {
        ...prev,
        questionMaxLength: value,
        errors: {
          ...prev.errors,
          questionMaxLength: questionMaxLengthError,
        },
      };
    });
  }, []);

  /**
   * Obsługa opuszczenia pola maksymalnej długości pytania
   */
  const handleQuestionMaxLengthBlur = React.useCallback(() => {
    setFormState(prev => {
      const error = validateQuestionMaxLength(prev.questionMaxLength, prev.questionMinLength);
      return {
        ...prev,
        touched: { ...prev.touched, questionMaxLength: true },
        errors: {
          ...prev.errors,
          questionMaxLength: error || undefined,
        },
      };
    });
  }, []);

  /**
   * Obsługa zmiany maksymalnej długości odpowiedzi
   */
  const handleAnswerMaxLengthChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
    setFormState(prev => {
      let answerMaxLengthError = prev.errors.answerMaxLength;
      if (prev.touched.answerMaxLength) {
        const error = validateAnswerMaxLength(value);
        answerMaxLengthError = error || undefined;
      }
      return {
        ...prev,
        answerMaxLength: value,
        errors: {
          ...prev.errors,
          answerMaxLength: answerMaxLengthError,
        },
      };
    });
  }, []);

  /**
   * Obsługa opuszczenia pola maksymalnej długości odpowiedzi
   */
  const handleAnswerMaxLengthBlur = React.useCallback(() => {
    setFormState(prev => {
      const error = validateAnswerMaxLength(prev.answerMaxLength);
      return {
        ...prev,
        touched: { ...prev.touched, answerMaxLength: true },
        errors: {
          ...prev.errors,
          answerMaxLength: error || undefined,
        },
      };
    });
  }, []);

  /**
   * Obsługa zmiany preferencji użytkownika
   */
  const handleUserPreferencesChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormState(prev => {
      let userPreferencesError = prev.errors.userPreferences;
      if (prev.touched.userPreferences) {
        const error = validateUserPreferences(value);
        userPreferencesError = error || undefined;
      }
      return {
        ...prev,
        userPreferences: value,
        errors: {
          ...prev.errors,
          userPreferences: userPreferencesError,
        },
      };
    });
  }, []);

  /**
   * Obsługa opuszczenia pola preferencji użytkownika
   */
  const handleUserPreferencesBlur = React.useCallback(() => {
    setFormState(prev => {
      const error = validateUserPreferences(prev.userPreferences);
      return {
        ...prev,
        touched: { ...prev.touched, userPreferences: true },
        errors: {
          ...prev.errors,
          userPreferences: error || undefined,
        },
      };
    });
  }, []);

  /**
   * Obsługa przełączania accordion
   */
  const handleToggleAdvanced = React.useCallback((value: string) => {
    setFormState(prev => ({ ...prev, isAdvancedOpen: value === 'advanced' }));
  }, []);

  /**
   * Mapowanie błędów API na komunikaty w języku polskim
   * Obsługuje zarówno ogólne błędy jak i błędy dla konkretnych pól
   */
  const mapApiError = React.useCallback((error: ApiErrorResponse, statusCode: number): { message: string; field?: string } => {
    const errorCode = error.error.code as ApiErrorCode;
    const errorMessage = error.error.message;
    const errorDetails = error.error.details;

    // Mapowanie kodów błędów na komunikaty
    switch (errorCode) {
      case 'VALIDATION_ERROR':
        // Jeśli są szczegóły błędu, użyj ich i zwróć informację o polu
        if (errorDetails) {
          // Sprawdź czy jest błąd dla konkretnego pola
          if (errorDetails.source_text || errorDetails.text) {
            return {
              message: 'Tekst źródłowy jest zbyt krótki. Musi zawierać co najmniej 100 znaków.',
              field: 'sourceText'
            };
          }
          if (errorDetails.domain) {
            return {
              message: typeof errorDetails.domain === 'string' ? errorDetails.domain : 'Domena wiedzy jest nieprawidłowa.',
              field: 'domain'
            };
          }
          if (errorDetails.question_min_length) {
            return {
              message: typeof errorDetails.question_min_length === 'string' ? errorDetails.question_min_length : 'Nieprawidłowa minimalna długość pytania.',
              field: 'questionMinLength'
            };
          }
          if (errorDetails.question_max_length) {
            return {
              message: typeof errorDetails.question_max_length === 'string' ? errorDetails.question_max_length : 'Nieprawidłowa maksymalna długość pytania.',
              field: 'questionMaxLength'
            };
          }
          if (errorDetails.answer_max_length) {
            return {
              message: typeof errorDetails.answer_max_length === 'string' ? errorDetails.answer_max_length : 'Nieprawidłowa maksymalna długość odpowiedzi.',
              field: 'answerMaxLength'
            };
          }
          if (errorDetails.user_preferences) {
            return {
              message: typeof errorDetails.user_preferences === 'string' ? errorDetails.user_preferences : 'Preferencje użytkownika są nieprawidłowe.',
              field: 'userPreferences'
            };
          }
        }
        return { message: errorMessage || 'Nieprawidłowe dane formularza. Sprawdź wprowadzone wartości.' };
      
      case 'UNAUTHORIZED':
        return { message: 'Sesja wygasła. Zaloguj się ponownie.' };
      
      case 'FORBIDDEN':
        return { message: 'Brak uprawnień do wykonania tej operacji.' };
      
      case 'NOT_FOUND':
        return { message: 'Nie znaleziono żądanego zasobu.' };
      
      case 'RATE_LIMIT_EXCEEDED':
        return { message: 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.' };
      
      case 'INTERNAL_ERROR':
        return { message: 'Wystąpił błąd serwera podczas generowania fiszek. Spróbuj ponownie.' };
      
      default:
        // Mapowanie kodów statusu HTTP na komunikaty
        if (statusCode === 400) {
          return { message: errorMessage || 'Nieprawidłowe dane formularza. Sprawdź wprowadzone wartości.' };
        }
        if (statusCode === 401) {
          return { message: 'Sesja wygasła. Zaloguj się ponownie.' };
        }
        if (statusCode === 500) {
          return { message: 'Wystąpił błąd serwera podczas generowania fiszek. Spróbuj ponownie.' };
        }
        return { message: errorMessage || 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.' };
    }
  }, []);

  /**
   * Obsługa wysłania formularza
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    
    // Oznaczenie wszystkich pól jako "dotknięte" i walidacja w jednym kroku
    setFormState(prev => {
      const updatedState = {
        ...prev,
        touched: {
          sourceText: true,
          language: true,
          domain: true,
          questionMinLength: true,
          questionMaxLength: true,
          answerMaxLength: true,
          userPreferences: true,
        },
      };
      
      // Walidacja formularza
      const validationResult = validateForm(updatedState);
      console.log('Validation result:', validationResult);
      
      if (!validationResult.isValid) {
        console.log('Validation failed:', validationResult.errors);
        // Ustawienie focus na pierwszym błędnym polu
        setTimeout(() => {
          const firstErrorField = Object.keys(validationResult.errors).find(
            key => validationResult.errors[key as keyof typeof validationResult.errors]
          );
          if (firstErrorField) {
            const fieldElement = document.getElementById(firstErrorField);
            if (fieldElement) {
              fieldElement.focus();
              fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 100);
        return { ...updatedState, errors: validationResult.errors };
      }
      
      console.log('Validation passed, starting submission...');
      return { ...updatedState, errors: validationResult.errors };
    });
    
    // Sprawdź ponownie walidację po aktualizacji stanu (używamy setTimeout aby dać React czas na aktualizację)
    setTimeout(async () => {
      const currentState = formState;
      const validationResult = validateForm({
        ...currentState,
        touched: {
          sourceText: true,
          language: true,
          domain: true,
          questionMinLength: true,
          questionMaxLength: true,
          answerMaxLength: true,
          userPreferences: true,
        },
      });
      
      if (!validationResult.isValid) {
        console.log('Validation still failed after state update');
        return;
      }
      
      await submitForm();
    }, 0);
  };
  
  const submitForm = async () => {
    
    // Ustawienie stanu ładowania
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      console.log('Getting session...');
      // Pobranie tokena autoryzacji
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        console.log('No session, redirecting to login');
        window.location.href = '/login?redirect=/generate';
        return;
      }
      
      console.log('Session found, preparing request body...');
      // Przygotowanie request body - użyj aktualnego stanu z ref
      const currentState = formStateRef.current;
      const requestBody: GenerateFlashcardsRequest & {
        language?: string;
        question_min_length?: number;
        question_max_length?: number;
        answer_max_length?: number;
        user_preferences?: string;
      } = {
        source_text: currentState.sourceText,
        language: currentState.language !== 'auto' ? currentState.language : undefined,
        domain: currentState.domain || undefined,
        question_min_length: currentState.questionMinLength || undefined,
        question_max_length: currentState.questionMaxLength || undefined,
        answer_max_length: currentState.answerMaxLength || undefined,
        user_preferences: currentState.userPreferences || undefined,
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      // Wywołanie API z timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 sekund timeout
      
      let response: Response;
      try {
        console.log('Sending request to /api/generations...');
        response = await fetch('/api/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        console.log('Response received:', response.status, response.statusText);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          // Timeout
          toast.error('Generowanie trwa dłużej niż zwykle. Spróbuj ponownie lub skontaktuj się z supportem.');
          setFieldError('general', 'Generowanie przekroczyło limit czasu. Spróbuj ponownie.');
          setFormState(prev => ({ ...prev, isSubmitting: false }));
          return;
        }
        throw fetchError; // Rzuć dalej dla obsługi błędów sieci
      }
      
      if (!response.ok) {
        // Obsługa błędów API
        let errorData: ApiErrorResponse;
        try {
          errorData = await response.json();
        } catch (parseError) {
          // Jeśli nie można sparsować odpowiedzi jako JSON
          const errorResult = mapApiError(
            { error: { code: 'INTERNAL_ERROR', message: 'Nieprawidłowa odpowiedź z serwera' } },
            response.status
          );
          toast.error(errorResult.message);
          setFieldError('general', errorResult.message);
          setFormState(prev => ({ ...prev, isSubmitting: false }));
          return;
        }
        
        if (response.status === 401) {
          toast.error('Sesja wygasła. Zaloguj się ponownie.');
          window.location.href = '/login?redirect=/generate';
          return;
        }
        
        // Mapowanie błędów API na komunikaty
        const errorResult = mapApiError(errorData, response.status);
        
        // Jeśli błąd dotyczy konkretnego pola, ustaw błąd dla tego pola
        if (errorResult.field) {
          setFieldTouched(errorResult.field as keyof GeneratorFormState['touched']);
          setFieldError(errorResult.field as keyof GeneratorFormState['errors'], errorResult.message);
          // Ustawienie focus na błędnym polu
          setTimeout(() => {
            const fieldElement = document.getElementById(errorResult.field!);
            if (fieldElement) {
              fieldElement.focus();
              fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        } else {
          // Ogólny błąd
          setFieldError('general', errorResult.message);
        }
        
        toast.error(errorResult.message);
        setFormState(prev => ({ ...prev, isSubmitting: false }));
        return;
      }
      
      // Sukces - przekierowanie na ekran ładowania
      const data: GenerateFlashcardsResponse = await response.json();
      toast.success('Rozpoczynam generowanie fiszek...');
      // Przekierowanie na ekran ładowania, który będzie polling statusu generowania
      window.location.href = `/loading/${data.generation_session_id}`;
      
    } catch (error) {
      // Obsługa błędów sieci
      console.error('Error generating flashcards:', error);
      const errorMessage = error instanceof Error && error.name === 'AbortError'
        ? 'Generowanie przekroczyło limit czasu. Spróbuj ponownie.'
        : 'Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie.';
      toast.error(errorMessage);
      setFieldError('general', errorMessage);
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-label="Formularz generowania fiszek">
        {/* Sekcja podstawowa */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="sourceText">Tekst źródłowy</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Informacja o polu tekstu źródłowego"
                >
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Wklej tekst, z którego mają zostać wygenerowane fiszki. Tekst musi zawierać co najmniej 100 znaków.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        <Textarea
          id="sourceText"
          value={formState.sourceText}
          onChange={handleSourceTextChange}
          onBlur={handleSourceTextBlur}
          placeholder="Wklej tutaj tekst, z którego mają zostać wygenerowane fiszki..."
          className={`min-h-[200px] ${formState.errors.sourceText ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          rows={10}
          aria-describedby={formState.errors.sourceText ? 'sourceText-error sourceText-counter' : 'sourceText-counter'}
          aria-invalid={!!formState.errors.sourceText}
          aria-required="true"
        />
        {formState.touched.sourceText && formState.errors.sourceText && (
          <Alert variant="destructive" id="sourceText-error" role="alert" aria-live="polite">
            <AlertDescription>{formState.errors.sourceText}</AlertDescription>
          </Alert>
        )}
        <div id="sourceText-counter" aria-live="polite" aria-atomic="true">
          <CharacterCounter currentLength={formState.sourceText.length} minLength={100} />
        </div>
      </section>

      {/* Sekcja zaawansowana */}
      <Accordion
        type="single"
        collapsible
        value={formState.isAdvancedOpen ? 'advanced' : ''}
        onValueChange={handleToggleAdvanced}
      >
        <AccordionItem value="advanced">
          <AccordionTrigger>Ustawienia zaawansowane</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {/* Język */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="language">Język generowania fiszek</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Informacja o języku generowania"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Wybierz język, w którym mają zostać wygenerowane fiszki. Opcja "Automatycznie" wykryje język z tekstu źródłowego.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={formState.language} onValueChange={handleLanguageChange}>
                <SelectTrigger 
                  id="language"
                  aria-describedby={formState.errors.language ? 'language-error' : undefined}
                  aria-invalid={!!formState.errors.language}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatycznie</SelectItem>
                  <SelectItem value="pl">Polski (pl)</SelectItem>
                  <SelectItem value="en">English (en)</SelectItem>
                  <SelectItem value="de">Deutsch (de)</SelectItem>
                  <SelectItem value="fr">Français (fr)</SelectItem>
                  <SelectItem value="es">Español (es)</SelectItem>
                  <SelectItem value="it">Italiano (it)</SelectItem>
                </SelectContent>
              </Select>
              {formState.touched.language && formState.errors.language && (
                <Alert variant="destructive" id="language-error" role="alert" aria-live="polite">
                  <AlertDescription>{formState.errors.language}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Domena wiedzy */}
            <div className="space-y-2">
              <Label htmlFor="domain">Domena wiedzy (opcjonalne)</Label>
              <Input
                id="domain"
                type="text"
                value={formState.domain}
                onChange={handleDomainChange}
                onBlur={handleDomainBlur}
                placeholder="np. Biologia, Historia, Matematyka"
                className={formState.errors.domain ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-describedby={formState.errors.domain ? 'domain-error' : undefined}
                aria-invalid={!!formState.errors.domain}
              />
              {formState.touched.domain && formState.errors.domain && (
                <Alert variant="destructive" id="domain-error" role="alert" aria-live="polite">
                  <AlertDescription>{formState.errors.domain}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Min długość pytania */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="questionMinLength">Minimalna długość pytania (opcjonalne)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Informacja o minimalnej długości pytania"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Minimalna długość pytania w znakach. Zakres: 2-10000 znaków. Jeśli nie ustawione, użyta zostanie wartość domyślna (2 znaki).</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="questionMinLength"
                type="number"
                value={formState.questionMinLength ?? ''}
                onChange={handleQuestionMinLengthChange}
                onBlur={handleQuestionMinLengthBlur}
                placeholder="2"
                min={2}
                max={10000}
                className={formState.errors.questionMinLength ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-describedby={formState.errors.questionMinLength ? 'questionMinLength-error' : undefined}
                aria-invalid={!!formState.errors.questionMinLength}
              />
              {formState.touched.questionMinLength && formState.errors.questionMinLength && (
                <Alert variant="destructive" id="questionMinLength-error" role="alert" aria-live="polite">
                  <AlertDescription>{formState.errors.questionMinLength}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Max długość pytania */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="questionMaxLength">Maksymalna długość pytania (opcjonalne)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Informacja o maksymalnej długości pytania"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Maksymalna długość pytania w znakach. Zakres: 2-10000 znaków. Musi być większa lub równa minimalnej długości. Jeśli nie ustawione, użyta zostanie wartość domyślna (10000 znaków).</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="questionMaxLength"
                type="number"
                value={formState.questionMaxLength ?? ''}
                onChange={handleQuestionMaxLengthChange}
                onBlur={handleQuestionMaxLengthBlur}
                placeholder="10000"
                min={2}
                max={10000}
                className={formState.errors.questionMaxLength ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-describedby={formState.errors.questionMaxLength ? 'questionMaxLength-error' : undefined}
                aria-invalid={!!formState.errors.questionMaxLength}
              />
              {formState.touched.questionMaxLength && formState.errors.questionMaxLength && (
                <Alert variant="destructive" id="questionMaxLength-error" role="alert" aria-live="polite">
                  <AlertDescription>{formState.errors.questionMaxLength}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Max długość odpowiedzi */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="answerMaxLength">Maksymalna długość odpowiedzi (opcjonalne)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Informacja o maksymalnej długości odpowiedzi"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Maksymalna długość odpowiedzi w znakach. Zakres: 1-500 znaków. Jeśli nie ustawione, użyta zostanie wartość domyślna (500 znaków).</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="answerMaxLength"
                type="number"
                value={formState.answerMaxLength ?? ''}
                onChange={handleAnswerMaxLengthChange}
                onBlur={handleAnswerMaxLengthBlur}
                placeholder="500"
                min={1}
                max={500}
                className={formState.errors.answerMaxLength ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-describedby={formState.errors.answerMaxLength ? 'answerMaxLength-error' : undefined}
                aria-invalid={!!formState.errors.answerMaxLength}
              />
              {formState.touched.answerMaxLength && formState.errors.answerMaxLength && (
                <Alert variant="destructive" id="answerMaxLength-error" role="alert" aria-live="polite">
                  <AlertDescription>{formState.errors.answerMaxLength}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Preferencje użytkownika */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="userPreferences">Preferencje użytkownika (opcjonalne)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Informacja o preferencjach użytkownika"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Wpisz swoje preferencje dotyczące generowania fiszek w języku naturalnym. Te informacje będą przekazane do AI jako dodatkowy kontekst podczas generowania. Maksymalnie 1500 znaków.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                id="userPreferences"
                value={formState.userPreferences}
                onChange={handleUserPreferencesChange}
                onBlur={handleUserPreferencesBlur}
                placeholder="Wpisz swoje preferencje dotyczące generowania fiszek..."
                className={`min-h-[100px] ${formState.errors.userPreferences ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                rows={4}
                aria-describedby={formState.errors.userPreferences ? 'userPreferences-error' : undefined}
                aria-invalid={!!formState.errors.userPreferences}
              />
              {formState.touched.userPreferences && formState.errors.userPreferences && (
                <Alert variant="destructive" id="userPreferences-error" role="alert" aria-live="polite">
                  <AlertDescription>{formState.errors.userPreferences}</AlertDescription>
                </Alert>
              )}
              <div id="userPreferences-counter" aria-live="polite" aria-atomic="true">
                <CharacterCounter currentLength={formState.userPreferences.length} maxLength={1500} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Ogólny błąd */}
      {formState.errors.general && (
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertDescription>{formState.errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Przyciski */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => (window.location.href = '/')}
          aria-label="Anuluj i wróć do dashboardu"
        >
          Anuluj
        </Button>
        <Button 
          type="submit" 
          disabled={formState.isSubmitting}
          aria-label={formState.isSubmitting ? 'Generowanie fiszek w toku' : 'Generuj fiszki'}
        >
          {formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generowanie...
            </>
          ) : (
            'Generuj'
          )}
        </Button>
      </div>
    </form>
    </TooltipProvider>
  );
}

