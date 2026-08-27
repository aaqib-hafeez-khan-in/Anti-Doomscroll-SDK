import BackgroundFetch, {
  BackgroundFetchStatus,
} from 'react-native-background-fetch';
import {
  BACKGROUND_TASK_INTERVAL_MINUTES,
  SNOOZE_DURATION_MINUTES,
} from '../utils/constants';
import {Logger} from './AnalyticsService';
import {ScreenTimeService} from './ScreenTimeService';
import {NotificationService} from './NotificationService';
import {DatabaseService} from './DatabaseService';
import {toISODateString} from '../utils/dateUtils';
import {MMKV} from 'react-native-mmkv';

const storage = new MMKV({id: 'background-task-storage'});

const TASK_ID = 'com.antidoomscroll.journal.background-check';

export const BackgroundTaskService = {
  async initialize(
    thresholds: Record<string, number>,
    monitoredApps: Record<string, boolean>,
  ): Promise<void> {
    try {
      const status: BackgroundFetchStatus = await BackgroundFetch.configure(
        {
          minimumFetchInterval: BACKGROUND_TASK_INTERVAL_MINUTES,
          stopOnTerminate: false,
          startOnBoot: true,
          enableHeadless: true,
          requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
        },
        async (taskId: string) => {
          Logger.info(`BackgroundTask fired: ${taskId}`);
          await BackgroundTaskService.runCheck(thresholds, monitoredApps);
          BackgroundFetch.finish(taskId);
        },
        (taskId: string) => {
          Logger.warn(`BackgroundTask timeout: ${taskId}`);
          BackgroundFetch.finish(taskId);
        },
      );

      Logger.info(`BackgroundFetch status: ${status}`);
    } catch (error) {
      Logger.error('BackgroundTaskService.initialize failed', error);
      throw error;
    }
  },

  async runCheck(
    thresholds: Record<string, number>,
    monitoredApps: Record<string, boolean>,
  ): Promise<void> {
    try {
      const snoozeUntil = storage.getNumber('snoozeUntil') ?? 0;
      if (Date.now() < snoozeUntil) {
        Logger.info('BackgroundTask: within snooze window, skipping');
        return;
      }

      const usageList = await ScreenTimeService.getTodayUsage(
        thresholds,
        monitoredApps,
      );

      for (const usage of usageList) {
        if (usage.status === 'exceeded') {
          storage.set(
            'blockerFlag',
            JSON.stringify({
              triggeredApp: usage.packageName,
              displayName: usage.displayName,
              durationSeconds: usage.durationSeconds,
            }),
          );

          await NotificationService.displayThresholdExceededNotification(
            usage.displayName,
            usage.durationSeconds,
          );

          await DatabaseService.insertUsageSnapshot({
            appPackage: usage.packageName,
            durationSeconds: usage.durationSeconds,
            snapshotDate: toISODateString(new Date()),
          });

          break;
        }
      }
    } catch (error) {
      Logger.error('BackgroundTaskService.runCheck failed', error);
    }
  },

  setSnoozeDuration(): void {
    const until = Date.now() + SNOOZE_DURATION_MINUTES * 60 * 1000;
    storage.set('snoozeUntil', until);
    Logger.info(`Snoozed until ${new Date(until).toISOString()}`);
  },

  async stop(): Promise<void> {
    await BackgroundFetch.stop(TASK_ID);
  },
};
