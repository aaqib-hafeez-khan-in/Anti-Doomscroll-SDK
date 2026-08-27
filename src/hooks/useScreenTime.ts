import {useState, useEffect, useCallback} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {AppUsage} from '../types';
import {ScreenTimeService} from '../services/ScreenTimeService';
import {useSettingsStore} from '../store/useSettingsStore';
import {Logger} from '../services/AnalyticsService';

interface UseScreenTimeReturn {
  usageData: AppUsage[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useScreenTime(): UseScreenTimeReturn {
  const [usageData, setUsageData] = useState<AppUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const thresholds = useSettingsStore(state => state.thresholds);
  const monitoredApps = useSettingsStore(state => state.monitoredApps);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ScreenTimeService.getTodayUsage(
        thresholds,
        monitoredApps,
      );
      setUsageData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      Logger.error('useScreenTime.refresh failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [thresholds, monitoredApps]);

  useEffect(() => {
    void refresh(); // eslint-disable-line no-void

    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          void refresh(); // eslint-disable-line no-void
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [refresh]);

  return {usageData, isLoading, error, refresh};
}
