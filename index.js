import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {NotificationService} from '@services/NotificationService';
import {BackgroundTaskService} from '@services/BackgroundTaskService';

NotificationService.registerBackgroundEventHandler(async event => {
  const {EventType} = require('@notifee/react-native');
  if (
    event.type === EventType.ACTION_PRESS &&
    event.detail.pressAction?.id === 'snooze'
  ) {
    BackgroundTaskService.setSnoozeDuration();
  }
});

AppRegistry.registerComponent(appName, () => App);
