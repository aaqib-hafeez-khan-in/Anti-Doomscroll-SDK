import {useEffect} from 'react';
import {useStreakStore} from '../store/useStreakStore';

interface UseStreakReturn {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
  streakHistory: string[];
  markToday: () => void;
  recalculate: () => Promise<void>;
}

export function useStreak(): UseStreakReturn {
  const {
    currentStreak,
    longestStreak,
    lastEntryDate,
    streakHistory,
    recalculate,
    markToday,
  } = useStreakStore();

  useEffect(() => {
    // eslint-disable-next-line no-void
    void recalculate();
  }, [recalculate]);

  return {
    currentStreak,
    longestStreak,
    lastEntryDate,
    streakHistory,
    markToday,
    recalculate,
  };
}
