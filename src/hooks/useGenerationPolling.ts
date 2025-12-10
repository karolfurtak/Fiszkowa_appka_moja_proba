import { useState, useEffect, useRef, useCallback } from 'react';
import { supabaseClient } from '../db/supabase.client';
import type { FlashcardProposalResponse } from '../types';

/**
 * Wynik custom hooka useGenerationPolling
 */
export interface UseGenerationPollingResult {
  /**
   * Czy generowanie zostało zakończone
   */
  isComplete: boolean;
  /**
   * Lista propozycji (null jeśli jeszcze nie gotowe)
   */
  proposals: FlashcardProposalResponse[] | null;
  /**
   * Komunikat błędu
   */
  error: string | null;
  /**
   * Postęp generowania (0-100%)
   */
  progress: number;
  /**
   * Aktualny komunikat statusu
   */
  statusMessage: string;
}

/**
 * Szacowany czas trwania generowania (w sekundach)
 */
const ESTIMATED_DURATION = 20;

/**
 * Częstotliwość polling (w milisekundach)
 */
const POLLING_INTERVAL = 2500; // 2.5 sekundy

/**
 * Timeout dla całego procesu generowania (w milisekundach)
 */
const TIMEOUT_DURATION = 60000; // 60 sekund

/**
 * Custom hook do polling statusu generowania fiszek
 *
 * Sprawdza co 2-3 sekundy czy propozycje zostały utworzone w bazie danych.
 * Gdy propozycje zostaną znalezione, hook oznacza generowanie jako zakończone.
 */
export function useGenerationPolling(
  sessionId: string,
  onComplete: (proposals: FlashcardProposalResponse[]) => void,
  onError: (error: string) => void
): UseGenerationPollingResult {
    const [isComplete, setIsComplete] = useState(false);
    const [proposals, setProposals] = useState<FlashcardProposalResponse[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('Inicjowanie generowania...');
  
    const startTimeRef = useRef<number>(Date.now());
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isCompleteRef = useRef<boolean>(false);
    const proposalsRef = useRef<FlashcardProposalResponse[] | null>(null);
  
    /**
     * Oblicza postęp generowania na podstawie upłyniętego czasu
     */
    const calculateProgress = useCallback((elapsedTime: number): number => {
      const progressPercent = Math.min(100, (elapsedTime / ESTIMATED_DURATION) * 100);
      return Math.floor(progressPercent);
    }, []);
  
    /**
     * Zwraca komunikat statusu na podstawie postępu
     */
    const getStatusMessage = useCallback((progressPercent: number): string => {
      if (progressPercent < 30) {
        return 'Analizowanie tekstu...';
      } else if (progressPercent < 70) {
        return 'Generowanie fiszek...';
      } else if (progressPercent < 90) {
        return 'Kończenie generowania...';
      } else {
        return 'Prawie gotowe...';
      }
    }, []);
  
    /**
     * Sprawdza status generowania przez zapytanie do API
     */
    const checkStatus = useCallback(async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
          throw new Error('Unauthorized');
        }
  
        const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 sekund timeout dla pojedynczego requestu
  
        try {
          const response = await fetch(
            `${supabaseUrl}/rest/v1/flashcard_proposals?generation_session_id=eq.${encodeURIComponent(sessionId)}&select=*&order=created_at.asc`,
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
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Nie udało się sprawdzić statusu generowania');
          }
  
          const data: FlashcardProposalResponse[] = await response.json();
  
          // Jeśli propozycje zostały znalezione
          if (data && data.length > 0) {
            // Zatrzymanie polling
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
  
            setIsComplete(true);
            setProposals(data);
            isCompleteRef.current = true;
            proposalsRef.current = data;
            setProgress(100);
            setStatusMessage('Generowanie zakończone!');
            onComplete(data);
          } else {
            // Propozycje jeszcze nie zostały utworzone - aktualizacja postępu
            const elapsedTime = (Date.now() - startTimeRef.current) / 1000; // w sekundach
            const currentProgress = calculateProgress(elapsedTime);
            setProgress(currentProgress);
            setStatusMessage(getStatusMessage(currentProgress));
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error && fetchError.message === 'Unauthorized') {
            throw fetchError;
          }
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error('Żądanie przekroczyło limit czasu. Spróbuj ponownie.');
          }
          if (!navigator.onLine) {
            throw new Error('Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie.');
          }
          throw fetchError;
        }
      } catch (err) {
        // Zatrzymanie polling w przypadku błędu
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
  
        const errorMessage = err instanceof Error ? err.message : 'Wystąpił błąd podczas sprawdzania statusu generowania';
        setError(errorMessage);
        setIsComplete(false);
        onError(errorMessage);
      }
    }, [sessionId, onComplete, onError, calculateProgress, getStatusMessage]);
  
    /**
     * Inicjalizacja polling po zamontowaniu komponentu
     */
    useEffect(() => {
      // Reset stanu przy zmianie sessionId
      setIsComplete(false);
      setProposals(null);
      setError(null);
      setProgress(0);
      setStatusMessage('Inicjowanie generowania...');
      isCompleteRef.current = false;
      proposalsRef.current = null;
      startTimeRef.current = Date.now();
  
      // Sprawdzenie statusu natychmiast po zamontowaniu
      checkStatus();
  
      let isMounted = true;

      // Uruchomienie interwału polling
      pollIntervalRef.current = setInterval(() => {
        if (isMounted && !isCompleteRef.current) {
          checkStatus();
        }
      }, POLLING_INTERVAL);
  
      // Ustawienie timeout (60 sekund)
      timeoutRef.current = setTimeout(() => {
        // Sprawdzenie aktualnego stanu przez funkcję callback
        if (isMounted) {
          // Zatrzymanie polling
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

          const timeoutMessage = 'Generowanie trwa dłużej niż zwykle. Proszę czekać...';
          setError(timeoutMessage);
          setIsComplete(false);
          onError(timeoutMessage);
        }
      }, TIMEOUT_DURATION);
  
      // Cleanup przy odmontowaniu komponentu
      return () => {
        isMounted = false;
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]); // Restart polling przy zmianie sessionId
  
    // Aktualizacja postępu co sekundę (niezależnie od polling)
    useEffect(() => {
      if (isComplete) {
        return;
      }
  
      const progressInterval = setInterval(() => {
        const elapsedTime = (Date.now() - startTimeRef.current) / 1000; // w sekundach
        const currentProgress = calculateProgress(elapsedTime);
        setProgress(currentProgress);
        setStatusMessage(getStatusMessage(currentProgress));
      }, 1000); // Aktualizacja co sekundę
  
      return () => {
        clearInterval(progressInterval);
      };
    }, [isComplete, calculateProgress, getStatusMessage]);
  
    return {
      isComplete,
      proposals,
      error,
      progress,
      statusMessage,
    };
  }

