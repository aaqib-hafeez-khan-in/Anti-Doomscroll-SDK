import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {useTheme} from '@theme';
import {spacing, borderRadius} from '@theme/spacing';
import {typography} from '@theme/typography';
import {useSettingsStore} from '@store/useSettingsStore';
import {usePermissions} from '@hooks/usePermissions';
import {SOCIAL_APPS} from '@utils/constants';
import {DatabaseService} from '@services/DatabaseService';
import {NotificationService} from '@services/NotificationService';

const APP_VERSION = '1.0.0';

function parseTime(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

export const SettingsScreen: React.FC = () => {
  const {colors} = useTheme();
  const {permissions, requestUsageStats, requestNotifications} =
    usePermissions();

  const {
    userName,
    theme,
    thresholds,
    monitoredApps,
    notificationsEnabled,
    quietHoursStart,
    quietHoursEnd,
    morningReminderEnabled,
    eveningReminderEnabled,
    customPrompts,
    setUserName,
    setTheme,
    setThreshold,
    toggleMonitoredApp,
    setNotificationsEnabled,
    setQuietHoursStart,
    setQuietHoursEnd,
    setMorningReminderEnabled,
    setEveningReminderEnabled,
    addCustomPrompt,
    toggleCustomPrompt,
    removeCustomPrompt,
    resetAllSettings,
  } = useSettingsStore();

  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [newPromptText, setNewPromptText] = useState('');
  const [showQuietStart, setShowQuietStart] = useState(false);
  const [showQuietEnd, setShowQuietEnd] = useState(false);

  const handleDeleteAllData = async () => {
    if (deleteConfirmText !== 'DELETE MY DATA') {
      Alert.alert(
        'Confirmation required',
        'Type "DELETE MY DATA" exactly to confirm.',
      );
      return;
    }

    Alert.alert(
      'Final Confirmation',
      'This will permanently delete all journal entries and cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await DatabaseService.deleteAllData();
            resetAllSettings();
            setDeleteConfirmText('');
            Alert.alert('Done', 'All data has been deleted.');
          },
        },
      ],
    );
  };

  const handleExportData = async () => {
    const {Share} = require('react-native');
    const json = await DatabaseService.exportAllData();
    await Share.share({message: json, title: 'Anti-Doomscroll Journal Data'});
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'Import is available via the developer settings. Paste your JSON export into the console.',
    );
  };

  const handleQuietStartChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowQuietStart(false);
    if (date) {
      setQuietHoursStart(formatTime(date));
    }
  };

  const handleQuietEndChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowQuietEnd(false);
    if (date) {
      setQuietHoursEnd(formatTime(date));
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      await NotificationService.requestPermission();
    }
  };

  const handleMorningReminderToggle = async (value: boolean) => {
    setMorningReminderEnabled(value);
    if (value) {
      await NotificationService.scheduleMorningReminder('08', '00');
    } else {
      await NotificationService.cancelMorningReminder();
    }
  };

  const handleEveningReminderToggle = async (value: boolean) => {
    setEveningReminderEnabled(value);
    if (value) {
      await NotificationService.scheduleEveningReminder('21', '00');
    } else {
      await NotificationService.cancelEveningReminder();
    }
  };

  const handleAddPrompt = () => {
    const trimmed = newPromptText.trim();
    if (trimmed.length < 5) {
      Alert.alert('Too short', 'Your prompt must be at least 5 characters.');
      return;
    }
    addCustomPrompt(trimmed);
    setNewPromptText('');
  };

  const sectionStyle = [
    styles.section,
    {backgroundColor: colors.surface, borderColor: colors.border},
  ];
  const sectionHeaderStyle = [
    styles.sectionHeader,
    {color: colors.textSecondary},
  ];

  return (
    <SafeAreaView
      style={[styles.screen, {backgroundColor: colors.background}]}
      edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, {color: colors.textPrimary}]}>
          Settings
        </Text>

        <Text style={sectionHeaderStyle}>Profile</Text>
        <View style={sectionStyle}>
          <Text style={[styles.label, {color: colors.textPrimary}]}>
            Your First Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                borderColor: colors.border,
                backgroundColor: colors.surfaceElevated,
              },
            ]}
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter your name"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
            accessibilityLabel="First name input"
          />
        </View>

        <Text style={sectionHeaderStyle}>Appearance</Text>
        <View style={sectionStyle}>
          <View style={styles.themeRow}>
            {(['light', 'dark', 'system'] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor:
                      theme === t ? colors.accent : colors.surfaceElevated,
                    borderColor: theme === t ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => setTheme(t)}
                accessibilityLabel={`Theme: ${t}`}
                accessibilityRole="button">
                <Text
                  style={[
                    styles.themeText,
                    {
                      color:
                        theme === t ? colors.textInverse : colors.textSecondary,
                    },
                  ]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={sectionHeaderStyle}>Monitored Apps</Text>
        <View style={sectionStyle}>
          {SOCIAL_APPS.map(app => (
            <View key={app.androidPackage} style={styles.rowItem}>
              <View style={[styles.appDot, {backgroundColor: app.colorHex}]} />
              <Text style={[styles.rowLabel, {color: colors.textPrimary}]}>
                {app.displayName}
              </Text>
              <Switch
                value={monitoredApps[app.androidPackage] !== false}
                onValueChange={v => toggleMonitoredApp(app.androidPackage, v)}
                trackColor={{false: colors.border, true: colors.accent}}
                thumbColor={colors.textInverse}
                accessibilityLabel={`Toggle ${app.displayName}`}
              />
            </View>
          ))}
        </View>

        <Text style={sectionHeaderStyle}>Daily Thresholds</Text>
        <View style={sectionStyle}>
          {SOCIAL_APPS.filter(
            app => monitoredApps[app.androidPackage] !== false,
          ).map(app => {
            const currentMinutes = Math.round(
              (thresholds[app.androidPackage] ?? 900) / 60,
            );
            return (
              <View key={app.androidPackage} style={styles.thresholdRow}>
                <Text style={[styles.rowLabel, {color: colors.textPrimary}]}>
                  {app.displayName}
                </Text>
                <View style={styles.thresholdControls}>
                  <TouchableOpacity
                    style={[styles.thresholdBtn, {borderColor: colors.border}]}
                    onPress={() =>
                      setThreshold(
                        app.androidPackage,
                        Math.max(
                          300,
                          (thresholds[app.androidPackage] ?? 900) - 300,
                        ),
                      )
                    }
                    accessibilityLabel={`Decrease ${app.displayName} threshold`}>
                    <Text
                      style={[
                        styles.thresholdBtnText,
                        {color: colors.textPrimary},
                      ]}>
                      -5
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.thresholdValue,
                      {color: colors.textPrimary},
                    ]}>
                    {currentMinutes}m
                  </Text>
                  <TouchableOpacity
                    style={[styles.thresholdBtn, {borderColor: colors.border}]}
                    onPress={() =>
                      setThreshold(
                        app.androidPackage,
                        Math.min(
                          7200,
                          (thresholds[app.androidPackage] ?? 900) + 300,
                        ),
                      )
                    }
                    accessibilityLabel={`Increase ${app.displayName} threshold`}>
                    <Text
                      style={[
                        styles.thresholdBtnText,
                        {color: colors.textPrimary},
                      ]}>
                      +5
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={sectionHeaderStyle}>Notifications</Text>
        <View style={sectionStyle}>
          <View style={styles.rowItem}>
            <Text style={[styles.rowLabel, {color: colors.textPrimary}]}>
              Enable Notifications
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{false: colors.border, true: colors.accent}}
              thumbColor={colors.textInverse}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={[styles.rowLabel, {color: colors.textPrimary}]}>
              Morning Reminder
            </Text>
            <Switch
              value={morningReminderEnabled}
              onValueChange={handleMorningReminderToggle}
              trackColor={{false: colors.border, true: colors.accent}}
              thumbColor={colors.textInverse}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={[styles.rowLabel, {color: colors.textPrimary}]}>
              Evening Reminder
            </Text>
            <Switch
              value={eveningReminderEnabled}
              onValueChange={handleEveningReminderToggle}
              trackColor={{false: colors.border, true: colors.accent}}
              thumbColor={colors.textInverse}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={[styles.rowLabel, {color: colors.textPrimary}]}>
              Quiet Hours Start
            </Text>
            <TouchableOpacity
              onPress={() => setShowQuietStart(true)}
              accessibilityLabel="Set quiet hours start">
              <Text style={[styles.timeValue, {color: colors.accent}]}>
                {quietHoursStart}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rowItem}>
            <Text style={[styles.rowLabel, {color: colors.textPrimary}]}>
              Quiet Hours End
            </Text>
            <TouchableOpacity
              onPress={() => setShowQuietEnd(true)}
              accessibilityLabel="Set quiet hours end">
              <Text style={[styles.timeValue, {color: colors.accent}]}>
                {quietHoursEnd}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showQuietStart && (
          <DateTimePicker
            value={parseTime(quietHoursStart)}
            mode="time"
            display="default"
            onChange={handleQuietStartChange}
          />
        )}
        {showQuietEnd && (
          <DateTimePicker
            value={parseTime(quietHoursEnd)}
            mode="time"
            display="default"
            onChange={handleQuietEndChange}
          />
        )}

        <Text style={sectionHeaderStyle}>Journal Prompts</Text>
        <View style={sectionStyle}>
          <View style={styles.addPromptRow}>
            <TextInput
              style={[
                styles.promptInput,
                {
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
              value={newPromptText}
              onChangeText={setNewPromptText}
              placeholder="Add a custom prompt..."
              placeholderTextColor={colors.textTertiary}
              accessibilityLabel="Custom prompt text input"
            />
            <TouchableOpacity
              style={[styles.addBtn, {backgroundColor: colors.accent}]}
              onPress={handleAddPrompt}
              accessibilityLabel="Add prompt"
              accessibilityRole="button">
              <Text style={[styles.addBtnText, {color: colors.textInverse}]}>
                Add
              </Text>
            </TouchableOpacity>
          </View>
          {customPrompts.map(prompt => (
            <View key={prompt.id} style={styles.promptRow}>
              <Text
                style={[styles.promptText, {color: colors.textPrimary}]}
                numberOfLines={2}>
                {prompt.text}
              </Text>
              <Switch
                value={prompt.enabled}
                onValueChange={v => toggleCustomPrompt(prompt.id, v)}
                trackColor={{false: colors.border, true: colors.accent}}
                thumbColor={colors.textInverse}
              />
              <TouchableOpacity
                onPress={() => removeCustomPrompt(prompt.id)}
                accessibilityLabel="Remove prompt"
                accessibilityRole="button">
                <Text style={[styles.removeBtn, {color: colors.danger}]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={sectionHeaderStyle}>Permissions</Text>
        <View style={sectionStyle}>
          <View style={styles.rowItem}>
            <Text style={[styles.rowLabel, {color: colors.textPrimary}]}>
              Usage Stats
            </Text>
            <View style={styles.permRow}>
              <Text
                style={[
                  styles.permStatus,
                  {
                    color:
                      permissions.usageStats === 'granted'
                        ? colors.success
                        : colors.danger,
                  },
                ]}>
                {permissions.usageStats === 'granted' ? 'Granted' : 'Denied'}
              </Text>
              {permissions.usageStats !== 'granted' && (
                <TouchableOpacity
                  style={[styles.grantBtn, {backgroundColor: colors.accent}]}
                  onPress={requestUsageStats}
                  accessibilityLabel="Grant usage stats permission"
                  accessibilityRole="button">
                  <Text
                    style={[styles.grantBtnText, {color: colors.textInverse}]}>
                    Grant
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.rowItem}>
            <Text style={[styles.rowLabel, {color: colors.textPrimary}]}>
              Notifications
            </Text>
            <View style={styles.permRow}>
              <Text
                style={[
                  styles.permStatus,
                  {
                    color:
                      permissions.notifications === 'granted'
                        ? colors.success
                        : colors.danger,
                  },
                ]}>
                {permissions.notifications === 'granted' ? 'Granted' : 'Denied'}
              </Text>
              {permissions.notifications !== 'granted' && (
                <TouchableOpacity
                  style={[styles.grantBtn, {backgroundColor: colors.accent}]}
                  onPress={requestNotifications}
                  accessibilityLabel="Grant notification permission"
                  accessibilityRole="button">
                  <Text
                    style={[styles.grantBtnText, {color: colors.textInverse}]}>
                    Grant
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <Text style={sectionHeaderStyle}>Data</Text>
        <View style={sectionStyle}>
          <TouchableOpacity
            style={styles.dataBtn}
            onPress={handleExportData}
            accessibilityLabel="Export data"
            accessibilityRole="button">
            <Text style={[styles.dataBtnText, {color: colors.accent}]}>
              Export All Data (JSON)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataBtn}
            onPress={handleImportData}
            accessibilityLabel="Import data"
            accessibilityRole="button">
            <Text style={[styles.dataBtnText, {color: colors.accent}]}>
              Import Data
            </Text>
          </TouchableOpacity>

          <Text style={[styles.dangerLabel, {color: colors.danger}]}>
            To delete all data, type "DELETE MY DATA" below and tap Delete.
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.danger,
                borderColor: colors.dangerMuted,
                backgroundColor: colors.dangerMuted,
              },
            ]}
            value={deleteConfirmText}
            onChangeText={setDeleteConfirmText}
            placeholder="DELETE MY DATA"
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel="Delete confirmation input"
          />
          <TouchableOpacity
            style={[styles.deleteBtn, {backgroundColor: colors.danger}]}
            onPress={handleDeleteAllData}
            disabled={deleteConfirmText !== 'DELETE MY DATA'}
            accessibilityLabel="Delete all data"
            accessibilityRole="button">
            <Text style={[styles.deleteBtnText, {color: colors.textInverse}]}>
              Delete All Data
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={sectionHeaderStyle}>About</Text>
        <View style={sectionStyle}>
          <Text style={[styles.aboutText, {color: colors.textSecondary}]}>
            Version {APP_VERSION}
          </Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL('https://antidoomscroll.app/#privacy')
            }
            accessibilityLabel="Privacy policy">
            <Text style={[styles.aboutLink, {color: colors.accent}]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://antidoomscroll.app/#terms')}
            accessibilityLabel="Terms of service">
            <Text style={[styles.aboutLink, {color: colors.accent}]}>
              Terms of Service
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1},
  scrollContent: {
    padding: spacing.base,
    gap: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  pageTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    paddingTop: spacing.sm,
  },
  sectionHeader: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.sm,
  },
  section: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.base,
    gap: spacing.md,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
  },
  themeRow: {flexDirection: 'row', gap: spacing.sm},
  themeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  themeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowLabel: {flex: 1, fontSize: typography.sizes.base},
  appDot: {width: 10, height: 10, borderRadius: 5, flexShrink: 0},
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thresholdControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  thresholdBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  thresholdBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  thresholdValue: {
    width: 36,
    textAlign: 'center',
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
  },
  timeValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
  },
  addPromptRow: {flexDirection: 'row', gap: spacing.sm, alignItems: 'center'},
  promptInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.sizes.base,
  },
  addBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  addBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  promptRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  promptText: {flex: 1, fontSize: typography.sizes.sm},
  removeBtn: {fontSize: 16, padding: spacing.xs},
  permRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  permStatus: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
  },
  grantBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  grantBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  dataBtn: {paddingVertical: spacing.sm},
  dataBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  dangerLabel: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  deleteBtn: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
  },
  aboutText: {fontSize: typography.sizes.base},
  aboutLink: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
});
