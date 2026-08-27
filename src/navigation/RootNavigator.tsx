import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types';
import {OnboardingScreen} from '../screens/OnboardingScreen';
import {BlockerScreen} from '../screens/BlockerScreen';
import {MainTabNavigator} from './MainTabNavigator';
import {linking} from './linking';
import {useSettingsStore} from '../store/useSettingsStore';
import {useTheme} from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const onboardingComplete = useSettingsStore(
    state => state.onboardingComplete,
  );
  const {colors, isDark} = useTheme();

  return (
    <NavigationContainer
      linking={linking}
      theme={{
        dark: isDark,
        colors: {
          primary: colors.accent,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.accent,
        },
      }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: colors.background},
        }}
        initialRouteName={onboardingComplete ? 'Main' : 'Onboarding'}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen
          name="Blocker"
          component={BlockerScreen}
          options={{
            gestureEnabled: false,
            presentation: 'fullScreenModal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
