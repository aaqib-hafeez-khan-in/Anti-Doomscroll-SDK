import {create} from 'zustand';
import {MMKV} from 'react-native-mmkv';
import {CustomPrompt, ThresholdSettings, MonitoredAppsSettings} from '../types';
import {
  SOCIAL_APPS,
  DEFAULT_THRESHOLD_SECONDS,
  MMKV_KEYS,
} from '../utils/constants';
import {Logger} from '../services/AnalyticsService';

const storage = new MMKV({id: 'settings-store'});

function persist<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

function hydrate<T>(key: string, fallback: T): T {
  const raw = storage.getString(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    Logger.warn(`Failed to parse MMKV key: ${key}`);
    return fallback;
  }
}

const defaultThresholds: ThresholdSettings =
  SOCIAL_APPS.reduce<ThresholdSettings>((acc, app) => {
    acc[app.androidPackage] = DEFAULT_THRESHOLD_SECONDS;
    return acc;
  }, {});

const defaultMonitoredApps: MonitoredAppsSettings =
  SOCIAL_APPS.reduce<MonitoredAppsSettings>((acc, app) => {
    acc[app.androidPackage] = true;
    return acc;
  }, {});

interface SettingsState {
  userName: string;
  theme: 'light' | 'dark' | 'system';
  thresholds: ThresholdSettings;
  monitoredApps: MonitoredAppsSettings;
  notificationsEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  morningReminderEnabled: boolean;
  eveningReminderEnabled: boolean;
  customPrompts: CustomPrompt[];
  onboardingComplete: boolean;

  setUserName: (name: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setThreshold: (packageName: string, seconds: number) => void;
  setAllThresholds: (thresholds: ThresholdSettings) => void;
  toggleMonitoredApp: (packageName: string, enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setQuietHoursStart: (time: string) => void;
  setQuietHoursEnd: (time: string) => void;
  setMorningReminderEnabled: (enabled: boolean) => void;
  setEveningReminderEnabled: (enabled: boolean) => void;
  addCustomPrompt: (text: string) => void;
  toggleCustomPrompt: (id: string, enabled: boolean) => void;
  removeCustomPrompt: (id: string) => void;
  setOnboardingComplete: (complete: boolean) => void;
  resetAllSettings: () => void;
}

const SETTINGS_KEY = MMKV_KEYS.SETTINGS;

function loadInitial(): Omit<
  SettingsState,
  keyof {
    setUserName: unknown;
    setTheme: unknown;
    setThreshold: unknown;
    setAllThresholds: unknown;
    toggleMonitoredApp: unknown;
    setNotificationsEnabled: unknown;
    setQuietHoursStart: unknown;
    setQuietHoursEnd: unknown;
    setMorningReminderEnabled: unknown;
    setEveningReminderEnabled: unknown;
    addCustomPrompt: unknown;
    toggleCustomPrompt: unknown;
    removeCustomPrompt: unknown;
    setOnboardingComplete: unknown;
    resetAllSettings: unknown;
  }
> {
  const saved = hydrate<Record<string, unknown> | null>(SETTINGS_KEY, null);
  return {
    userName: (saved?.userName as string) ?? '',
    theme: (saved?.theme as 'light' | 'dark' | 'system') ?? 'system',
    thresholds: (saved?.thresholds as ThresholdSettings) ?? defaultThresholds,
    monitoredApps:
      (saved?.monitoredApps as MonitoredAppsSettings) ?? defaultMonitoredApps,
    notificationsEnabled: (saved?.notificationsEnabled as boolean) ?? true,
    quietHoursStart: (saved?.quietHoursStart as string) ?? '22:00',
    quietHoursEnd: (saved?.quietHoursEnd as string) ?? '08:00',
    morningReminderEnabled: (saved?.morningReminderEnabled as boolean) ?? true,
    eveningReminderEnabled: (saved?.eveningReminderEnabled as boolean) ?? true,
    customPrompts: (saved?.customPrompts as CustomPrompt[]) ?? [],
    onboardingComplete: (saved?.onboardingComplete as boolean) ?? false,
  };
}

export const useSettingsStore = create<SettingsState>()((set, get) => {
  const save = () => {
    const state = get();
    persist(SETTINGS_KEY, {
      userName: state.userName,
      theme: state.theme,
      thresholds: state.thresholds,
      monitoredApps: state.monitoredApps,
      notificationsEnabled: state.notificationsEnabled,
      quietHoursStart: state.quietHoursStart,
      quietHoursEnd: state.quietHoursEnd,
      morningReminderEnabled: state.morningReminderEnabled,
      eveningReminderEnabled: state.eveningReminderEnabled,
      customPrompts: state.customPrompts,
      onboardingComplete: state.onboardingComplete,
    });
  };

  return {
    ...loadInitial(),

    setUserName: (name: string) => {
      set({userName: name});
      save();
    },

    setTheme: (theme: 'light' | 'dark' | 'system') => {
      set({theme});
      save();
    },

    setThreshold: (packageName: string, seconds: number) => {
      set(state => ({
        thresholds: {...state.thresholds, [packageName]: seconds},
      }));
      save();
    },

    setAllThresholds: (thresholds: ThresholdSettings) => {
      set({thresholds});
      save();
    },

    toggleMonitoredApp: (packageName: string, enabled: boolean) => {
      set(state => ({
        monitoredApps: {...state.monitoredApps, [packageName]: enabled},
      }));
      save();
    },

    setNotificationsEnabled: (enabled: boolean) => {
      set({notificationsEnabled: enabled});
      save();
    },

    setQuietHoursStart: (time: string) => {
      set({quietHoursStart: time});
      save();
    },

    setQuietHoursEnd: (time: string) => {
      set({quietHoursEnd: time});
      save();
    },

    setMorningReminderEnabled: (enabled: boolean) => {
      set({morningReminderEnabled: enabled});
      save();
    },

    setEveningReminderEnabled: (enabled: boolean) => {
      set({eveningReminderEnabled: enabled});
      save();
    },

    addCustomPrompt: (text: string) => {
      const newPrompt: CustomPrompt = {
        id: Date.now().toString(),
        text,
        enabled: true,
        isUserCreated: true,
      };
      set(state => ({customPrompts: [...state.customPrompts, newPrompt]}));
      save();
    },

    toggleCustomPrompt: (id: string, enabled: boolean) => {
      set(state => ({
        customPrompts: state.customPrompts.map(p =>
          p.id === id ? {...p, enabled} : p,
        ),
      }));
      save();
    },

    removeCustomPrompt: (id: string) => {
      set(state => ({
        customPrompts: state.customPrompts.filter(p => p.id !== id),
      }));
      save();
    },

    setOnboardingComplete: (complete: boolean) => {
      set({onboardingComplete: complete});
      save();
    },

    resetAllSettings: () => {
      const defaults = {
        userName: '',
        theme: 'system' as const,
        thresholds: defaultThresholds,
        monitoredApps: defaultMonitoredApps,
        notificationsEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        morningReminderEnabled: true,
        eveningReminderEnabled: true,
        customPrompts: [],
        onboardingComplete: false,
      };
      set(defaults);
      storage.delete(SETTINGS_KEY);
    },
  };
});
