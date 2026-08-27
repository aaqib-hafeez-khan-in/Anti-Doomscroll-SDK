import {create} from 'zustand';
import {MMKV} from 'react-native-mmkv';
import {DatabaseService} from '../services/DatabaseService';
import {calculateStreak, toISODateString} from '../utils/dateUtils';
import {Logger} from '../services/AnalyticsService';
import {MMKV_KEYS} from '../utils/constants';

const storage = new MMKV({id: 'streak-store'});

function persistStreak(data: {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
  streakHistory: string[];
}): void {
  storage.set(MMKV_KEYS.STREAK, JSON.stringify(data));
}

function loadStreakFromStorage(): {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
  streakHistory: string[];
} {
  const raw = storage.getString(MMKV_KEYS.STREAK);
  if (!raw) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: null,
      streakHistory: [],
    };
  }
  try {
    return JSON.parse(raw) as {
      currentStreak: number;
      longestStreak: number;
      lastEntryDate: string | null;
      streakHistory: string[];
    };
  } catch {
    Logger.warn('Failed to parse streak from MMKV');
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: null,
      streakHistory: [],
    };
  }
}

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
  streakHistory: string[];
  recalculate: () => Promise<void>;
  markToday: () => void;
}

export const useStreakStore = create<StreakState>()((set, get) => ({
  ...loadStreakFromStorage(),

  recalculate: async (): Promise<void> => {
    try {
      const entries = await DatabaseService.getEntries();
      const entryDates = entries.map(e => e.createdAt);

      const {current, longest} = calculateStreak(entryDates);

      const streakHistory = Array.from(
        new Set(entryDates.map(d => toISODateString(new Date(d)))),
      ).sort();

      const lastDate =
        entries.length > 0
          ? toISODateString(new Date(entries[0].createdAt))
          : null;

      const newState = {
        currentStreak: current,
        longestStreak: Math.max(longest, get().longestStreak),
        lastEntryDate: lastDate,
        streakHistory,
      };

      set(newState);
      persistStreak(newState);
    } catch (error) {
      Logger.error('useStreakStore.recalculate failed', error);
      throw error;
    }
  },

  markToday: (): void => {
    const today = toISODateString(new Date());
    const state = get();

    if (state.streakHistory.includes(today)) {
      return;
    }

    const newHistory = [...state.streakHistory, today].sort();
    const {current, longest} = calculateStreak(
      newHistory.map(d => `${d}T12:00:00.000Z`),
    );

    const newState = {
      currentStreak: current,
      longestStreak: Math.max(longest, state.longestStreak),
      lastEntryDate: today,
      streakHistory: newHistory,
    };

    set(newState);
    persistStreak(newState);
  },
}));
