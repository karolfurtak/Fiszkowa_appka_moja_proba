import * as React from 'react';
import { supabaseClient } from '../db/supabase.client';

interface StreakData {
  currentStreak: number;
  lastStudyDate: string | null;
  todayStudied: boolean;
  totalStudiedToday: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook do zarządzania streak (serią dni nauki)
 *
 * Oblicza streak na podstawie historii odpowiedzi użytkownika.
 * Streak zwiększa się gdy użytkownik odpowiada na fiszki każdego dnia z rzędu.
 */
export function useStreak(): StreakData {
  const [data, setData] = React.useState<StreakData>({
    currentStreak: 0,
    lastStudyDate: null,
    todayStudied: false,
    totalStudiedToday: 0,
    isLoading: true,
    error: null,
  });

  React.useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
          setData(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const userId = session.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        // Fetch flashcards with their review history
        const { data: flashcards, error: flashcardsError } = await supabaseClient
          .from('flashcards')
          .select('last_reviewed_at, consecutive_correct_answers')
          .eq('user_id', userId)
          .not('last_reviewed_at', 'is', null)
          .order('last_reviewed_at', { ascending: false });

        if (flashcardsError) throw flashcardsError;

        if (!flashcards || flashcards.length === 0) {
          setData(prev => ({
            ...prev,
            isLoading: false,
            currentStreak: 0,
            todayStudied: false,
            totalStudiedToday: 0,
          }));
          return;
        }

        // Calculate unique study days and today's count
        const studyDays = new Set<string>();
        let todayCount = 0;

        flashcards.forEach(fc => {
          if (fc.last_reviewed_at) {
            const reviewDate = new Date(fc.last_reviewed_at);
            const dateStr = reviewDate.toISOString().split('T')[0];
            studyDays.add(dateStr);

            if (dateStr === todayStr) {
              todayCount++;
            }
          }
        });

        const todayStudied = studyDays.has(todayStr);

        // Calculate streak by counting consecutive days backwards from today/yesterday
        const sortedDays = Array.from(studyDays).sort().reverse();
        let streak = 0;
        let checkDate = new Date(today);

        // If not studied today, start checking from yesterday
        if (!todayStudied) {
          checkDate.setDate(checkDate.getDate() - 1);
        }

        for (let i = 0; i < sortedDays.length; i++) {
          const expectedDateStr = checkDate.toISOString().split('T')[0];

          if (sortedDays.includes(expectedDateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        setData({
          currentStreak: streak,
          lastStudyDate: sortedDays[0] || null,
          todayStudied,
          totalStudiedToday: todayCount,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching streak data:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Nie udało się pobrać danych o streak',
        }));
      }
    };

    fetchStreakData();
  }, []);

  return data;
}
