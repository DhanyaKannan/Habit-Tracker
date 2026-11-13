import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification presentation when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const HABIT_CHANNEL_ID = 'habitflow-reminders';

export async function setupNotificationChannels() {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(HABIT_CHANNEL_ID, {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7E69AB',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
      });
    } catch (err) {
      console.warn('Failed to set notification channel:', err);
    }
  }
}

export async function requestNotificationPermissions() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Error requesting notification permissions:', err);
    return false;
  }
}

/**
 * Schedule a daily reminder for a habit
 * @param {Object} habit - { id, name, reminder_time: "HH:MM", category }
 * @returns {Promise<string|null>} notificationId
 */
export async function scheduleHabitReminder(habit) {
  if (!habit.reminder_time || !habit.reminder_enabled) {
    return null;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    await setupNotificationChannels();

    const [hoursStr, minutesStr] = habit.reminder_time.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Habit Reminder: ${habit.name} ✨`,
        body: `Time to check in on your "${habit.name}" habit! Keep your streak flowing.`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { habitId: habit.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
        channelId: HABIT_CHANNEL_ID,
      },
    });

    return notificationId;
  } catch (err) {
    console.warn(`Failed to schedule reminder for habit ${habit.name}:`, err);
    return null;
  }
}

export async function cancelHabitReminder(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.warn('Failed to cancel notification:', err);
  }
}

export async function sendInstantTestNotification() {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return false;

    await setupNotificationChannels();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'HabitFlow Reminder Test 🔔',
        body: 'Local notifications are configured and working offline smoothly!',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        channelId: HABIT_CHANNEL_ID,
      },
    });
    return true;
  } catch (err) {
    console.warn('Test notification failed:', err);
    return false;
  }
}

