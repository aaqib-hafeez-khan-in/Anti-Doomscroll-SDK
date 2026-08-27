import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  Notification,
  TimestampTrigger,
  TriggerType,
  RepeatFrequency,
  EventType,
  Event,
} from '@notifee/react-native';
import {
  CHANNEL_ID,
  NOTIFICATION_IDS,
  SNOOZE_DURATION_MINUTES,
} from '../utils/constants';
import {Logger} from './AnalyticsService';
import {formatMinutes} from '../utils/textUtils';

export type NotificationHandler = (event: Event) => Promise<void>;

export const NotificationService = {
  async initialize(): Promise<void> {
    try {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Doomscroll Alert',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });
      Logger.info('NotificationService initialized');
    } catch (error) {
      Logger.error('NotificationService.initialize failed', error);
      throw error;
    }
  },

  async requestPermission(): Promise<boolean> {
    try {
      const settings = await notifee.requestPermission();
      return (
        settings.android?.alarm === AndroidNotificationSetting.ENABLED ||
        settings.authorizationStatus >= 1
      );
    } catch (error) {
      Logger.error('NotificationService.requestPermission failed', error);
      return false;
    }
  },

  async displayThresholdExceededNotification(
    appName: string,
    durationSeconds: number,
  ): Promise<void> {
    try {
      const minutes = Math.round(durationSeconds / 60);
      const notification: Notification = {
        id: NOTIFICATION_IDS.THRESHOLD_EXCEEDED,
        title: 'Time for a mindful moment',
        body: `You've spent ${formatMinutes(
          durationSeconds,
        )} on ${appName}. Take 30 seconds to reflect.`,
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          actions: [
            {
              title: 'Write Now',
              pressAction: {
                id: 'write_now',
                launchActivity: 'default',
              },
            },
            {
              title: `Snooze ${SNOOZE_DURATION_MINUTES}min`,
              pressAction: {
                id: 'snooze',
              },
            },
          ],
        },
        ios: {
          categoryId: 'threshold-exceeded',
        },
        data: {
          type: 'threshold_exceeded',
          triggeredApp: appName,
          durationSeconds: String(minutes),
        },
      };

      await notifee.displayNotification(notification);
    } catch (error) {
      Logger.error(
        'NotificationService.displayThresholdExceededNotification failed',
        error,
      );
      throw error;
    }
  },

  async scheduleMorningReminder(
    hourHH: string,
    minuteMM: string,
  ): Promise<void> {
    try {
      await notifee.cancelNotification(NOTIFICATION_IDS.MORNING_REMINDER);

      const [hour, minute] = [parseInt(hourHH, 10), parseInt(minuteMM, 10)];

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: getNextTriggerTime(hour, minute),
        repeatFrequency: RepeatFrequency.DAILY,
      };

      await notifee.createTriggerNotification(
        {
          id: NOTIFICATION_IDS.MORNING_REMINDER,
          title: 'Start your day with gratitude',
          body: 'Write your first entry of the day.',
          android: {channelId: CHANNEL_ID},
          data: {type: 'morning_reminder'},
        },
        trigger,
      );
    } catch (error) {
      Logger.error('NotificationService.scheduleMorningReminder failed', error);
      throw error;
    }
  },

  async scheduleEveningReminder(
    hourHH: string,
    minuteMM: string,
  ): Promise<void> {
    try {
      await notifee.cancelNotification(NOTIFICATION_IDS.EVENING_REMINDER);

      const [hour, minute] = [parseInt(hourHH, 10), parseInt(minuteMM, 10)];

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: getNextTriggerTime(hour, minute),
        repeatFrequency: RepeatFrequency.DAILY,
      };

      await notifee.createTriggerNotification(
        {
          id: NOTIFICATION_IDS.EVENING_REMINDER,
          title: "You haven't written today",
          body: 'Keep your streak alive.',
          android: {channelId: CHANNEL_ID},
          data: {type: 'evening_reminder'},
        },
        trigger,
      );
    } catch (error) {
      Logger.error('NotificationService.scheduleEveningReminder failed', error);
      throw error;
    }
  },

  async cancelMorningReminder(): Promise<void> {
    await notifee.cancelNotification(NOTIFICATION_IDS.MORNING_REMINDER);
  },

  async cancelEveningReminder(): Promise<void> {
    await notifee.cancelNotification(NOTIFICATION_IDS.EVENING_REMINDER);
  },

  registerForegroundEventHandler(handler: NotificationHandler): () => void {
    return notifee.onForegroundEvent(async (event: Event) => {
      if (
        event.type === EventType.ACTION_PRESS &&
        event.detail.pressAction?.id === 'snooze'
      ) {
        await notifee.cancelNotification(
          event.detail.notification?.id ?? NOTIFICATION_IDS.THRESHOLD_EXCEEDED,
        );
      }
      await handler(event);
    });
  },

  registerBackgroundEventHandler(handler: NotificationHandler): void {
    notifee.onBackgroundEvent(handler);
  },
};

function getNextTriggerTime(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);

  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime();
}
