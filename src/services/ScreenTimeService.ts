import {Platform, NativeModules} from 'react-native';
import {SOCIAL_APPS} from '../utils/constants';
import {AppUsage} from '../types';
import {Logger} from './AnalyticsService';
import {toISODateString} from '../utils/dateUtils';

const {UsageStatsModule} = NativeModules as {
  UsageStatsModule?: {
    queryUsageStats: (
      startTime: number,
      endTime: number,
    ) => Promise<Array<{packageName: string; totalTimeInForeground: number}>>;
    hasUsageStatsPermission: () => Promise<boolean>;
    requestUsageStatsPermission: () => Promise<void>;
  };
};

export type ScreenTimeQueryResult = {
  packageName: string;
  durationSeconds: number;
  date: string;
};

export const ScreenTimeService = {
  async hasPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        return (await UsageStatsModule?.hasUsageStatsPermission()) ?? false;
      } catch (error) {
        Logger.error('ScreenTimeService.hasPermission failed', error);
        return false;
      }
    }
    return true;
  },

  async requestPermission(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        await UsageStatsModule?.requestUsageStatsPermission();
      } catch (error) {
        Logger.error('ScreenTimeService.requestPermission failed', error);
        throw error;
      }
    }
  },

  async getTodayUsage(
    thresholds: Record<string, number>,
    monitoredApps: Record<string, boolean>,
  ): Promise<AppUsage[]> {
    const today = toISODateString(new Date());
    const results: ScreenTimeQueryResult[] =
      Platform.OS === 'android'
        ? await this.getAndroidUsage()
        : await this.getIosUsage();

    return SOCIAL_APPS.filter(
      app => monitoredApps[app.androidPackage] !== false,
    ).map(app => {
      const packageId =
        Platform.OS === 'android' ? app.androidPackage : app.iosBundleId;

      const usage = results.find(
        r => r.packageName === packageId && r.date === today,
      );
      const durationSeconds = usage?.durationSeconds ?? 0;
      const thresholdKey = app.androidPackage;
      const thresholdSeconds = thresholds[thresholdKey] ?? 15 * 60;
      const percentOfThreshold =
        thresholdSeconds > 0 ? durationSeconds / thresholdSeconds : 0;

      let status: AppUsage['status'] = 'safe';
      if (percentOfThreshold >= 1) {
        status = 'exceeded';
      } else if (percentOfThreshold >= 0.8) {
        status = 'warning';
      }

      return {
        packageName: app.androidPackage,
        displayName: app.displayName,
        durationSeconds,
        thresholdSeconds,
        percentOfThreshold: Math.min(percentOfThreshold, 1),
        status,
      };
    });
  },

  async getAndroidUsage(): Promise<ScreenTimeQueryResult[]> {
    if (!UsageStatsModule) {
      Logger.warn('UsageStatsModule not available');
      return [];
    }

    try {
      const now = Date.now();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const stats = await UsageStatsModule.queryUsageStats(
        startOfDay.getTime(),
        now,
      );

      const today = toISODateString(new Date());

      return stats.map(stat => ({
        packageName: stat.packageName,
        durationSeconds: Math.floor(stat.totalTimeInForeground / 1000),
        date: today,
      }));
    } catch (error) {
      Logger.error('ScreenTimeService.getAndroidUsage failed', error);
      return [];
    }
  },

  async getIosUsage(): Promise<ScreenTimeQueryResult[]> {
    Logger.warn(
      'iOS Screen Time API requires DeviceActivity framework entitlement',
    );
    return [];
  },
};
