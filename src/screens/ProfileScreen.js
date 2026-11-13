import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { AVATAR_OPTIONS } from '../constants/theme';
import { sendInstantTestNotification } from '../services/notificationService';
import Header from '../components/common/Header';
import Card from '../components/common/Card';
import ConfirmModal from '../components/common/ConfirmModal';

export default function ProfileScreen({ navigation }) {
  const { colors, themeMode, toggleTheme, setThemeMode, isDark } = useTheme();
  const {
    userProfile,
    updateProfile,
    updateNotificationSetting,
    exportBackup,
    importBackup,
    resetAll,
  } = useHabits();

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [goal, setGoal] = useState(userProfile.goal);
  const [avatar, setAvatar] = useState(userProfile.avatar);

  // Modals state
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleSaveProfile = async () => {
    await updateProfile({
      name: name.trim() || 'Habit Achiever',
      avatar,
      goal: goal.trim(),
    });
    setIsEditingProfile(false);
    Alert.alert('Profile Updated', 'Your profile details have been saved.');
  };

  const handleTestNotification = async () => {
    const success = await sendInstantTestNotification();
    if (success) {
      Alert.alert(
        'Reminder Scheduled',
        'A local reminder will trigger in 2 seconds. You can close or background the app to view the notification banner.'
      );
    } else {
      Alert.alert(
        'Notification Disabled',
        'Please check device settings to ensure notification permissions are granted.'
      );
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const res = await exportBackup();
      if (res.note) {
        Alert.alert('Export Successful', `Data saved locally at: ${res.fileUri}`);
      }
    } catch (err) {
      Alert.alert('Export Failed', err.message || 'Could not export data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      setIsImporting(true);
      const res = await importBackup();
      if (res.success) {
        Alert.alert(
          'Import Successful',
          `Successfully restored ${res.count} habits and your entire history!`
        );
      }
    } catch (err) {
      Alert.alert('Import Failed', err.message || 'Could not restore backup.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmReset = async () => {
    try {
      await resetAll();
      setResetModalVisible(false);
      Alert.alert('Reset Complete', 'All habits and completion history have been reset.');
    } catch (err) {
      Alert.alert('Reset Failed', err.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Profile & Settings"
        subtitle="Customization & offline data"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <TouchableOpacity
              style={[styles.avatarCircle, { backgroundColor: colors.lavenderLight }]}
              onPress={() => setIsEditingProfile(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.avatarText}>{userProfile.avatar}</Text>
              <View style={[styles.avatarEditPencil, { backgroundColor: colors.lavender }]}>
                <Ionicons name="pencil" size={10} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[styles.profileName, { color: colors.textPrimary }]}>
                {userProfile.name}
              </Text>
              <Text style={[styles.profileGoal, { color: colors.textSecondary }]}>
                "{userProfile.goal}"
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.editButton, { borderColor: colors.border }]}
              onPress={() => {
                setName(userProfile.name);
                setGoal(userProfile.goal);
                setAvatar(userProfile.avatar);
                setIsEditingProfile(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={16} color={colors.lavender} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Offline Badge Card */}
        <View style={[styles.offlineBanner, { backgroundColor: `${colors.sage}15`, borderColor: colors.sage }]}>
          <Ionicons name="cloud-offline-outline" size={20} color={colors.sage} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.offlineTitle, { color: colors.sage }]}>100% Offline App</Text>
            <Text style={[styles.offlineSub, { color: colors.textSecondary }]}>
              All data is stored securely in local SQLite database. No internet or account needed.
            </Text>
          </View>
        </View>

        {/* Section: Appearance / Theme */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
          <Card style={styles.cardGroup}>
            <View style={styles.rowBetween}>
              <View style={styles.rowLeft}>
                <Ionicons
                  name={isDark ? 'moon' : 'sunny'}
                  size={20}
                  color={colors.lavender}
                  style={{ marginRight: 12 }}
                />
                <View>
                  <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>Dark Theme</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                    {isDark ? 'Deep night mode enabled' : 'Cream & Lavender light mode'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.lavenderLight }}
                thumbColor={isDark ? colors.lavender : '#f4f3f4'}
              />
            </View>
          </Card>
        </View>

        {/* Section: Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>NOTIFICATIONS</Text>
          <Card style={styles.cardGroup}>
            <View style={styles.rowBetween}>
              <View style={styles.rowLeft}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={colors.lavender}
                  style={{ marginRight: 12 }}
                />
                <View>
                  <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>Habit Reminders</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                    Enable local Android alerts
                  </Text>
                </View>
              </View>
              <Switch
                value={userProfile.notificationsEnabled}
                onValueChange={updateNotificationSetting}
                trackColor={{ false: colors.border, true: colors.lavenderLight }}
                thumbColor={userProfile.notificationsEnabled ? colors.lavender : '#f4f3f4'}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleTestNotification}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Ionicons
                  name="play-circle-outline"
                  size={20}
                  color={colors.sage}
                  style={{ marginRight: 12 }}
                />
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                  Test Local Reminder Now
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Section: Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DATA MANAGEMENT</Text>
          <Card style={styles.cardGroup}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleExportData}
              activeOpacity={0.7}
              disabled={isExporting}
            >
              <View style={styles.rowLeft}>
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={colors.lavender}
                  style={{ marginRight: 12 }}
                />
                <View>
                  <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                    {isExporting ? 'Exporting...' : 'Export Backup (JSON)'}
                  </Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                    Save or share full habit database
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleImportData}
              activeOpacity={0.7}
              disabled={isImporting}
            >
              <View style={styles.rowLeft}>
                <Ionicons
                  name="download-outline"
                  size={20}
                  color={colors.sage}
                  style={{ marginRight: 12 }}
                />
                <View>
                  <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                    {isImporting ? 'Importing...' : 'Import Backup (JSON)'}
                  </Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                    Restore previously saved HabitFlow data
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => setResetModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={colors.danger}
                  style={{ marginRight: 12 }}
                />
                <View>
                  <Text style={[styles.itemTitle, { color: colors.danger }]}>
                    Reset All Data
                  </Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                    Erase all logs and restore starter habits
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* App Info Footer */}
        <View style={styles.footerInfo}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            HabitFlow v1.0.0 (Offline Edition)
          </Text>
          <Text style={[styles.footerSub, { color: colors.textMuted }]}>
            Built with Expo, SQLite & React Native
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditingProfile}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditingProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.editModalContainer,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Edit Profile</Text>

            {/* Avatar Selector */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>SELECT AVATAR</Text>
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((item) => {
                const isSelected = avatar === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.avatarOption,
                      {
                        backgroundColor: isSelected ? colors.lavenderLight : colors.cardBackgroundSubtle,
                        borderColor: isSelected ? colors.lavender : colors.border,
                      },
                    ]}
                    onPress={() => setAvatar(item)}
                  >
                    <Text style={{ fontSize: 22 }}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Name Input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>NAME</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardBackgroundSubtle,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              placeholderTextColor={colors.textMuted}
            />

            {/* Goal Input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PERSONAL MOTTO / GOAL</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardBackgroundSubtle,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              value={goal}
              onChangeText={setGoal}
              placeholder="Your focus or goal"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => setIsEditingProfile(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.lavender }]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reset Confirmation Dialog */}
      <ConfirmModal
        visible={resetModalVisible}
        title="Reset All Data?"
        message="This will permanently delete all your custom habits, completion logs, and streak history. This action cannot be undone."
        confirmLabel="Erase & Reset"
        isDestructive
        onConfirm={handleConfirmReset}
        onCancel={() => setResetModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  profileCard: {
    padding: 18,
    borderRadius: 22,
    marginBottom: 14,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 30,
  },
  avatarEditPencil: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileGoal: {
    fontSize: 13,
    marginTop: 3,
    fontStyle: 'italic',
  },
  editButton: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  offlineTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  offlineSub: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardGroup: {
    padding: 0,
    borderRadius: 18,
    overflow: 'hidden',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  editModalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 10,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarOption: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

