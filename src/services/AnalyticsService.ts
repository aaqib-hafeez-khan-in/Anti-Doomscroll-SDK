import {LoggerInterface} from '../types';

const IS_PRODUCTION = !__DEV__;

const createLogger = (): LoggerInterface => {
  if (IS_PRODUCTION) {
    return {
      debug: () => undefined,
      info: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    };
  }

  return {
    debug: (message: string, ...args: unknown[]) => {
      if (__DEV__) {
        console.debug(`[DEBUG] ${message}`, ...args);
      }
    },
    info: (message: string, ...args: unknown[]) => {
      if (__DEV__) {
        console.info(`[INFO] ${message}`, ...args);
      }
    },
    warn: (message: string, ...args: unknown[]) => {
      if (__DEV__) {
        console.warn(`[WARN] ${message}`, ...args);
      }
    },
    error: (message: string, ...args: unknown[]) => {
      if (__DEV__) {
        console.error(`[ERROR] ${message}`, ...args);
      }
    },
  };
};

export const Logger = createLogger();

export const AnalyticsService = {
  trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    Logger.info(`Analytics: ${eventName}`, properties);
  },

  trackScreen(screenName: string): void {
    Logger.info(`Screen: ${screenName}`);
  },

  trackError(error: Error, context?: string): void {
    Logger.error(`Error in ${context ?? 'unknown'}:`, error.message);
  },
};
