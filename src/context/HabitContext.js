import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';

let Haptics = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  Haptics = null;
}

let Sharing = null;
try {
  Sharing = require('expo-sharing');
} catch (e) {
  Sharing = null;
}

let DocumentPicker = null;
try {
  DocumentPicker = require('expo-document-picker');
} catch (e) {
  DocumentPicker = null;
}
import {
  initDatabase,
  getAllHabits,
  insertHabit,
  updateHabit,
  deleteHabit,
  getLogsForDate,
  setHabitCompletion,
  getDetailedStats,
  getAllSettings,
  setSetting,
  formatLocalDate,
  exportAllData,
  importAllData,
  resetAllData,
} from '../database/db';
import {
  scheduleHabitReminder,
  cancelHabitReminder,
  setupNotificationChannels,
} from '../services/notificationService';

const HabitContext = createContext(null);

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [selectedDate, setSelectedDate] = useState(formatLocalDate(new Date()));
  const [selectedDateLogs, setSelectedDateLogs] = useState({});
  const [todayLogs, setTodayLogs] = useState({});
  const [stats, setStats] = useState({
    totalHabitsCount: 0,
    totalCompletions: 0,
    activeCategoriesCount: 0,
    currentStreak: 0,
    longestStreak: 0,
    hasPerfectDay: false,
    habitStats: {},
    dateCompletionMap: {},
  });
  const [userProfile, setUserProfile] = useState({
    name: 'Habit Achiever',
    avatar: '🌱',
    goal: 'Building daily consistency and focus',
    notificationsEnabled: true,
    hasOnboarded: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = formatLocalDate(new Date());

  // Load all initial state
  const refreshAll = useCallback(async () => {
    try {
      const allHabits = await getAllHabits();
      setHabits(allHabits);

      // Load logs for today
      const todayLogsData = await getLogsForDate(todayStr);
      const todayMap = {};
      todayLogsData.forEach((l) => {
        if (l.completed === 1) todayMap[l.habit_id] = true;
      });
      setTodayLogs(todayMap);

      // Load logs for selectedDate if different
      if (selectedDate === todayStr) {
        setSelectedDateLogs(todayMap);
      } else {
        const selLogsData = await getLogsForDate(selectedDate);
        const selMap = {};
        selLogsData.forEach((l) => {
          if (l.completed === 1) selMap[l.habit_id] = true;
        });
        setSelectedDateLogs(selMap);
      }

      // Load stats
      const currentStats = await getDetailedStats();
      setStats(currentStats);

      // Load settings & profile
      const settings = await getAllSettings();
      setUserProfile({
        name: settings.user_name || 'Habit Achiever',
        avatar: settings.user_avatar || '🌱',
        goal: settings.user_goal || 'Building daily consistency and focus',
        notificationsEnabled: settings.notifications_enabled !== '0',
        hasOnboarded: settings.has_onboarded === '1',
      });
    } catch (err) {
      console.warn('Error refreshing habit data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, todayStr]);

  // Initial startup
  useEffect(() => {
    async function boot() {
      try {
        await initDatabase();
        await setupNotificationChannels();
        await refreshAll();
      } catch (err) {
        console.warn('App bootstrap error:', err);
        setIsLoading(false);
      }
    }
    boot();
  }, []);

  // Update selected date and its logs
  const changeSelectedDate = useCallback(async (dateString) => {
    setSelectedDate(dateString);
    try {
      const logsData = await getLogsForDate(dateString);
      const map = {};
      logsData.forEach((l) => {
        if (l.completed === 1) map[l.habit_id] = true;
      });
      setSelectedDateLogs(map);
    } catch (err) {
      console.warn('Error changing selected date:', err);
    }
  }, []);

  // Toggle habit completion on a given date (defaults to today)
  const toggleHabitCompletion = useCallback(async (habitId, targetDate = todayStr) => {
    try {
      try {
        if (Haptics?.impactAsync) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle?.Light);
        }
      } catch (_) {}

      const isForToday = targetDate === todayStr;
      const currentStatus = isForToday ? Boolean(todayLogs[habitId]) : Boolean(selectedDateLogs[habitId]);
      const nextStatus = !currentStatus;

      // Optimistic update
      if (isForToday) {
        setTodayLogs((prev) => ({ ...prev, [habitId]: nextStatus }));
      }
      if (targetDate === selectedDate) {
        setSelectedDateLogs((prev) => ({ ...prev, [habitId]: nextStatus }));
      }

      // Persist to SQLite
      await setHabitCompletion(habitId, targetDate, nextStatus);

      // Recalculate stats
      const newStats = await getDetailedStats();
      setStats(newStats);
    } catch (err) {
      console.warn('Failed to toggle habit completion:', err);
      await refreshAll();
    }
  }, [todayLogs, selectedDateLogs, selectedDate, todayStr, refreshAll]);

  // Add new habit
  const addHabit = useCallback(async (habitData) => {
    try {
      let notifId = null;
      if (habitData.reminder_enabled && habitData.reminder_time) {
        notifId = await scheduleHabitReminder(habitData);
      }

      const id = await insertHabit({
        ...habitData,
        notification_id: notifId,
      });

      await refreshAll();
      return id;
    } catch (err) {
      console.warn('Error adding habit:', err);
      throw err;
    }
  }, [refreshAll]);

  // Edit existing habit
  const editHabit = useCallback(async (id, fields) => {
    try {
      const existing = habits.find((h) => h.id === id);
      if (existing?.notification_id) {
        await cancelHabitReminder(existing.notification_id);
      }

      let notifId = null;
      if (fields.reminder_enabled && fields.reminder_time) {
        notifId = await scheduleHabitReminder({ id, ...fields });
      }

      await updateHabit(id, {
        ...fields,
        notification_id: notifId,
      });

      await refreshAll();
    } catch (err) {
      console.warn('Error updating habit:', err);
      throw err;
    }
  }, [habits, refreshAll]);

  // Delete habit
  const removeHabit = useCallback(async (id) => {
    try {
      const existing = habits.find((h) => h.id === id);
      if (existing?.notification_id) {
        await cancelHabitReminder(existing.notification_id);
      }

      await deleteHabit(id);
      await refreshAll();
    } catch (err) {
      console.warn('Error removing habit:', err);
      throw err;
    }
  }, [habits, refreshAll]);

  // Profile updates
  const updateProfile = useCallback(async (fields) => {
    try {
      if (fields.name !== undefined) await setSetting('user_name', fields.name);
      if (fields.avatar !== undefined) await setSetting('user_avatar', fields.avatar);
      if (fields.goal !== undefined) await setSetting('user_goal', fields.goal);

      setUserProfile((prev) => ({ ...prev, ...fields }));
    } catch (err) {
      console.warn('Error updating profile:', err);
    }
  }, []);

  // Notification toggle
  const updateNotificationSetting = useCallback(async (enabled) => {
    try {
      await setSetting('notifications_enabled', enabled ? '1' : '0');
      setUserProfile((prev) => ({ ...prev, notificationsEnabled: enabled }));

      // If disabled, cancel all habit reminders; if enabled, reschedule active habits
      if (!enabled) {
        for (const h of habits) {
          if (h.notification_id) {
            await cancelHabitReminder(h.notification_id);
            await updateHabit(h.id, { notification_id: null });
          }
        }
      } else {
        for (const h of habits) {
          if (h.reminder_enabled && h.reminder_time) {
            const notifId = await scheduleHabitReminder(h);
            await updateHabit(h.id, { notification_id: notifId });
          }
        }
      }
      await refreshAll();
    } catch (err) {
      console.warn('Error updating notification setting:', err);
    }
  }, [habits, refreshAll]);

  // Mark onboarding complete
  const completeOnboarding = useCallback(async () => {
    try {
      await setSetting('has_onboarded', '1');
      setUserProfile((prev) => ({ ...prev, hasOnboarded: true }));
    } catch (err) {
      console.warn('Error setting onboarding:', err);
    }
  }, []);

  // Export full JSON backup and trigger native sharing
  const exportBackup = useCallback(async () => {
    try {
      const backupData = await exportAllData();
      const jsonString = JSON.stringify(backupData, null, 2);
      const filename = `habitflow_backup_${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isShareAvailable = Sharing ? await Sharing.isAvailableAsync() : false;
      if (isShareAvailable && Sharing?.shareAsync) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export HabitFlow Data',
          UTI: 'public.json',
        });
        return { success: true, fileUri };
      } else {
        return { success: true, fileUri, note: 'Saved to local app documents.' };
      }
    } catch (err) {
      console.warn('Export error:', err);
      throw err;
    }
  }, []);

  // Import JSON backup from DocumentPicker
  const importBackup = useCallback(async () => {
    try {
      if (!DocumentPicker || !DocumentPicker.getDocumentAsync) {
        throw new Error('Document Picker is only available in a native build or supported client.');
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { canceled: true };
      }

      const fileAsset = result.assets[0];
      const content = await FileSystem.readAsStringAsync(fileAsset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const parsed = JSON.parse(content);
      if (!parsed || parsed.appName !== 'HabitFlow' || !parsed.data) {
        throw new Error('This file is not a valid HabitFlow backup.');
      }

      await importAllData(parsed);
      await refreshAll();
      return { success: true, count: parsed.data.habits?.length || 0 };
    } catch (err) {
      console.warn('Import error:', err);
      throw err;
    }
  }, [refreshAll]);

  // Reset all app data
  const resetAll = useCallback(async () => {
    try {
      // Cancel all notifications
      for (const h of habits) {
        if (h.notification_id) {
          await cancelHabitReminder(h.notification_id);
        }
      }
      await resetAllData();
      await refreshAll();
      return true;
    } catch (err) {
      console.warn('Reset error:', err);
      throw err;
    }
  }, [habits, refreshAll]);

  // Derived progress values
  const totalHabits = habits.length;
  const completedTodayCount = habits.filter((h) => Boolean(todayLogs[h.id])).length;
  const remainingTodayCount = Math.max(0, totalHabits - completedTodayCount);
  const todayProgressPercent = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;

  return (
    <HabitContext.Provider
      value={{
        habits,
        todayLogs,
        selectedDate,
        selectedDateLogs,
        stats,
        userProfile,
        isLoading,
        totalHabits,
        completedTodayCount,
        remainingTodayCount,
        todayProgressPercent,
        todayStr,
        refreshAll,
        changeSelectedDate,
        toggleHabitCompletion,
        addHabit,
        editHabit,
        removeHabit,
        updateProfile,
        updateNotificationSetting,
        completeOnboarding,
        exportBackup,
        importBackup,
        resetAll,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}

