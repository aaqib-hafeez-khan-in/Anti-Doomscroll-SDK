import React, {useEffect} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootNavigator} from '@navigation/RootNavigator';
import {DatabaseService} from '@services/DatabaseService';
import {NotificationService} from '@services/NotificationService';
import {BackgroundTaskService} from '@services/BackgroundTaskService';
import {useSettingsStore} from '@store/useSettingsStore';
import {useJournalStore} from '@store/useJournalStore';
import {useStreakStore} from '@store/useStreakStore';
import {Logger} from '@services/AnalyticsService';
import {StyleSheet} from 'react-native';

const App: React.FC = () => {
  const thresholds = useSettingsStore(state => state.thresholds);
  const monitoredApps = useSettingsStore(state => state.monitoredApps);
  const loadEntries = useJournalStore(state => state.loadEntries);
  const recalculate = useStreakStore(state => state.recalculate);

  useEffect(() => {
    const initializeServices = async (): Promise<void> => {
      try {
        await DatabaseService.initialize();
        Logger.info('Database initialized');

        await NotificationService.initialize();
        Logger.info('Notifications initialized');

        await BackgroundTaskService.initialize(thresholds, monitoredApps);
        Logger.info('Background tasks initialized');

        await loadEntries();
        await recalculate();
      } catch (error) {
        Logger.error('App initialization failed', error);
      }
    };

    void initializeServices();
  }, [loadEntries, monitoredApps, recalculate, thresholds]);

  const isDarkScheme = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkScheme ? 'light-content' : 'dark-content'}
          translucent
          backgroundColor="transparent"
        />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
