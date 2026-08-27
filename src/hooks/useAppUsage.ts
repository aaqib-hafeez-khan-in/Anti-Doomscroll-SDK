import {useScreenTime} from './useScreenTime';
import {AppUsage} from '../types';

interface UseAppUsageReturn {
  usageData: AppUsage[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  warningApps: AppUsage[];
  exceededApps: AppUsage[];
}

export function useAppUsage(): UseAppUsageReturn {
  const {usageData, isLoading, error, refresh} = useScreenTime();

  const warningApps = usageData.filter(a => a.status === 'warning');
  const exceededApps = usageData.filter(a => a.status === 'exceeded');

  return {
    usageData,
    isLoading,
    error,
    refresh,
    warningApps,
    exceededApps,
  };
}
