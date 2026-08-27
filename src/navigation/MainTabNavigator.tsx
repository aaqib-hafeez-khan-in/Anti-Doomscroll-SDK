import React, {useCallback} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import {HomeScreen} from '../screens/HomeScreen';
import {JournalScreen} from '../screens/JournalScreen';
import {InsightsScreen} from '../screens/InsightsScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {MainTabParamList} from '../types';
import {useTheme} from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<
  keyof MainTabParamList,
  {active: string; inactive: string}
> = {
  Home: {active: '🏠', inactive: '🏡'},
  Journal: {active: '📖', inactive: '📓'},
  Insights: {active: '📊', inactive: '📉'},
  Settings: {active: '⚙️', inactive: '🔧'},
};

type TabBarIconProps = {
  name: keyof MainTabParamList;
  focused: boolean;
};

const TabBarIcon: React.FC<TabBarIconProps> = ({name, focused}) => {
  const icons = TAB_ICONS[name];
  return (
    <Text style={{fontSize: 20}}>
      {focused ? icons.active : icons.inactive}
    </Text>
  );
};

const TabBarIconHome: React.FC<{focused: boolean}> = ({focused}) => (
  <TabBarIcon name="Home" focused={focused} />
);
const TabBarIconJournal: React.FC<{focused: boolean}> = ({focused}) => (
  <TabBarIcon name="Journal" focused={focused} />
);
const TabBarIconInsights: React.FC<{focused: boolean}> = ({focused}) => (
  <TabBarIcon name="Insights" focused={focused} />
);
const TabBarIconSettings: React.FC<{focused: boolean}> = ({focused}) => (
  <TabBarIcon name="Settings" focused={focused} />
);

const TAB_ICON_COMPONENTS: Record<
  keyof MainTabParamList,
  React.FC<{focused: boolean}>
> = {
  Home: TabBarIconHome,
  Journal: TabBarIconJournal,
  Insights: TabBarIconInsights,
  Settings: TabBarIconSettings,
};

export const MainTabNavigator: React.FC = () => {
  const {colors} = useTheme();

  const screenOptions = useCallback(
    ({route}: {route: {name: keyof MainTabParamList}}) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        paddingBottom: 4,
        height: 56,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600' as const,
        marginBottom: 4,
      },
      tabBarIcon: TAB_ICON_COMPONENTS[route.name],
    }),
    [colors],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{tabBarLabel: 'Journal'}}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{tabBarLabel: 'Insights'}}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{tabBarLabel: 'Settings'}}
      />
    </Tab.Navigator>
  );
};
