import {LinkingOptions} from '@react-navigation/native';
import {RootStackParamList} from '../types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['antidoomscroll://', 'https://antidoomscroll.app'],
  config: {
    screens: {
      Onboarding: 'onboarding',
      Main: {
        screens: {
          Home: 'home',
          Journal: 'journal',
          Insights: 'insights',
          Settings: 'settings',
        },
      },
      Blocker: 'blocker',
    },
  },
};
