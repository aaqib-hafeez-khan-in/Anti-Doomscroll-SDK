import {useState, useEffect, useCallback} from 'react';
import {Platform, Linking} from 'react-native';
import {ScreenTimeService} from '../services/ScreenTimeService';
import {NotificationService} from '../services/NotificationService';
import {Logger} from '../services/AnalyticsService';

interface PermissionsState {
  usageStats: 'granted' | 'denied' | 'unknown';
  notifications: 'granted' | 'denied' | 'unknown';
}

interface UsePermissionsReturn {
  permissions: PermissionsState;
  isChecking: boolean;
  requestUsageStats: () => Promise<void>;
  requestNotifications: () => Promise<void>;
  checkAll: () => Promise<void>;
  openSettings: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<PermissionsState>({
    usageStats: 'unknown',
    notifications: 'unknown',
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkAll = useCallback(async (): Promise<void> => {
    setIsChecking(true);
    try {
      const hasUsage = await ScreenTimeService.hasPermission();
      const hasNotifications = await NotificationService.requestPermission();

      setPermissions({
        usageStats: hasUsage ? 'granted' : 'denied',
        notifications: hasNotifications ? 'granted' : 'denied',
      });
    } catch (error) {
      Logger.error('usePermissions.checkAll failed', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void checkAll();
  }, [checkAll]);

  const openSettings = useCallback(async (): Promise<void> => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('App-Prefs:');
    } else {
      await Linking.openSettings();
    }
  }, []);

  const requestNotifications = useCallback(async (): Promise<void> => {
    try {
      const granted = await NotificationService.requestPermission();
      setPermissions(prev => ({
        ...prev,
        notifications: granted ? 'granted' : 'denied',
      }));
    } catch (error) {
      Logger.error('usePermissions.requestNotifications failed', error);
    }
  }, []);

  const requestUsageStats = useCallback(async (): Promise<void> => {
    try {
      if (Platform.OS === 'android') {
        await ScreenTimeService.requestPermission();
      } else {
        await openSettings();
      }
      await checkAll();
    } catch (error) {
      Logger.error('usePermissions.requestUsageStats failed', error);
    }
  }, [checkAll, openSettings]);

  return {
    permissions,
    isChecking,
    requestUsageStats,
    requestNotifications,
    checkAll,
    openSettings,
  };
}
