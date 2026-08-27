export type MoodTag =
  | 'grateful'
  | 'calm'
  | 'reflective'
  | 'challenged'
  | 'hopeful'
  | 'neutral';

export interface Entry {
  id: string;
  triggeredApp: string;
  triggeredDurationSeconds: number;
  promptText: string;
  entryText: string;
  mood: MoodTag;
  wordCount: number;
  timeOnBlockerSeconds: number;
  isManual: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppUsage {
  packageName: string;
  displayName: string;
  durationSeconds: number;
  thresholdSeconds: number;
  percentOfThreshold: number;
  status: 'safe' | 'warning' | 'exceeded';
}

export interface CustomPrompt {
  id: string;
  text: string;
  enabled: boolean;
  isUserCreated: boolean;
}

export type FilterType =
  | 'all'
  | 'week'
  | 'month'
  | 'grateful'
  | 'calm'
  | 'reflective'
  | 'challenged'
  | 'hopeful'
  | 'neutral';

export interface UsageSnapshot {
  id: string;
  appPackage: string;
  durationSeconds: number;
  snapshotDate: string;
  createdAt: string;
}

export interface ExportData {
  exportedAt: string;
  appVersion: string;
  entries: Entry[];
  usageSnapshots: UsageSnapshot[];
}

export interface SocialAppMeta {
  androidPackage: string;
  iosBundleId: string;
  displayName: string;
  category: string;
  colorHex: string;
}

export interface ThresholdSettings {
  [packageName: string]: number;
}

export interface MonitoredAppsSettings {
  [packageName: string]: boolean;
}

export interface NotificationActionType {
  type: 'write_now' | 'snooze';
  triggeredApp?: string;
  triggeredDurationSeconds?: number;
}

export interface DayActivity {
  date: string;
  count: number;
}

export interface HeatmapCell {
  dayIndex: number;
  hour: number;
  count: number;
}

export interface WeeklyBarData {
  date: string;
  label: string;
  count: number;
}

export interface AppTriggerData {
  packageName: string;
  displayName: string;
  count: number;
  colorHex: string;
}

export interface MoodDistribution {
  mood: MoodTag;
  count: number;
  percentage: number;
}

export interface SummaryStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  mostBlockedApp: string;
}

export interface JournalSection {
  title: string;
  data: Entry[];
}

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Blocker: {
    triggeredApp: string;
    triggeredDurationSeconds: number;
    editEntryId?: string;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Journal: undefined;
  Insights: undefined;
  Settings: undefined;
};

export interface LoggerInterface {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}
