import * as FileSystem from 'expo-file-system';

// Safe dynamic require for expo-sqlite to prevent crash in Expo Go clients
let SQLiteModule = null;
try {
  SQLiteModule = require('expo-sqlite');
} catch (e) {
  SQLiteModule = null;
}

let dbInstance = null;
let useSQLite = false;

// Local file storage fallback for Expo Go
const FILE_STORE_PATH = `${FileSystem.documentDirectory}habitflow_offline_store.json`;
let memoryStore = {
  habits: [],
  habit_logs: [],
  settings: {},
};

const STARTER_HABITS = [
  {
    id: 1,
    name: 'Morning Hydration',
    description: 'Drink 2 glasses of fresh water right after waking up',
    category: 'Health',
    frequency: 'daily',
    target_days: '[0,1,2,3,4,5,6]',
    color: '#38A3A5',
    icon: 'water-outline',
    reminder_time: '07:30',
    reminder_enabled: 0,
    notification_id: null,
    created_at: new Date().toISOString(),
    archived: 0,
  },
  {
    id: 2,
    name: '20-Minute Walk or Run',
    description: 'Get some fresh air and boost cardio stamina',
    category: 'Fitness',
    frequency: 'daily',
    target_days: '[0,1,2,3,4,5,6]',
    color: '#5E9C76',
    icon: 'walk-outline',
    reminder_time: '08:00',
    reminder_enabled: 0,
    notification_id: null,
    created_at: new Date().toISOString(),
    archived: 0,
  },
  {
    id: 3,
    name: 'Read 15 Pages',
    description: 'Non-fiction or personal growth literature',
    category: 'Learning',
    frequency: 'daily',
    target_days: '[0,1,2,3,4,5,6]',
    color: '#7E69AB',
    icon: 'book-outline',
    reminder_time: '21:00',
    reminder_enabled: 0,
    notification_id: null,
    created_at: new Date().toISOString(),
    archived: 0,
  },
  {
    id: 4,
    name: 'Plan Tomorrow',
    description: 'Identify top 3 priorities before going to sleep',
    category: 'Productivity',
    frequency: 'daily',
    target_days: '[0,1,2,3,4,5,6]',
    color: '#E29547',
    icon: 'flash-outline',
    reminder_time: '22:00',
    reminder_enabled: 0,
    notification_id: null,
    created_at: new Date().toISOString(),
    archived: 0,
  },
];

const DEFAULT_SETTINGS = {
  theme: 'light',
  user_name: 'Habit Achiever',
  user_avatar: '🌱',
  user_goal: 'Building daily consistency and focus',
  notifications_enabled: '1',
  has_onboarded: '0',
};

async function saveFileStore() {
  try {
    await FileSystem.writeAsStringAsync(
      FILE_STORE_PATH,
      JSON.stringify(memoryStore, null, 2),
      { encoding: FileSystem.EncodingType.UTF8 }
    );
  } catch (err) {
    console.warn('Failed to save offline store to disk:', err);
  }
}

async function loadFileStore() {
  try {
    const info = await FileSystem.getInfoAsync(FILE_STORE_PATH);
    if (info.exists) {
      const content = await FileSystem.readAsStringAsync(FILE_STORE_PATH, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.habits)) {
        memoryStore = parsed;
        return;
      }
    }
  } catch (err) {
    console.warn('Error reading store file:', err);
  }

  // Seed default store
  memoryStore = {
    habits: [...STARTER_HABITS],
    habit_logs: [],
    settings: { ...DEFAULT_SETTINGS },
  };
  await saveFileStore();
}

export async function initDatabase() {
  // 1. Try to open native SQLite if available in the current runtime
  if (SQLiteModule && typeof SQLiteModule.openDatabaseAsync === 'function') {
    try {
      const db = await SQLiteModule.openDatabaseAsync('habitflow.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS habits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          frequency TEXT NOT NULL DEFAULT 'daily',
          target_days TEXT DEFAULT '[0,1,2,3,4,5,6]',
          color TEXT NOT NULL DEFAULT '#7E69AB',
          icon TEXT NOT NULL DEFAULT 'star-outline',
          reminder_time TEXT,
          reminder_enabled INTEGER DEFAULT 0,
          notification_id TEXT,
          created_at TEXT NOT NULL,
          archived INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS habit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          habit_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0,
          completed_at TEXT,
          FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
          UNIQUE(habit_id, date) ON CONFLICT REPLACE
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);

      // Seed if empty
      const habitsCountRow = await db.getFirstAsync('SELECT COUNT(*) as count FROM habits;');
      const hasOnboardedRow = await db.getFirstAsync("SELECT value FROM settings WHERE key = 'has_onboarded';");

      if (habitsCountRow?.count === 0 && !hasOnboardedRow) {
        for (const h of STARTER_HABITS) {
          await db.runAsync(
            `INSERT INTO habits (name, description, category, frequency, target_days, color, icon, reminder_time, reminder_enabled, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [h.name, h.description, h.category, h.frequency, h.target_days, h.color, h.icon, h.reminder_time, h.reminder_enabled, h.created_at]
          );
        }
        for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
          await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);', [k, v]);
        }
      }

      dbInstance = db;
      useSQLite = true;
      return db;
    } catch (err) {
      console.log('Native SQLite not available in this client, using persistent offline file storage:', err.message);
      useSQLite = false;
      dbInstance = null;
    }
  }

  // 2. Persistent offline JSON file storage
  useSQLite = false;
  await loadFileStore();
  return null;
}

// ====================== HABITS CRUD ======================

export async function getAllHabits() {
  if (useSQLite && dbInstance) {
    return await dbInstance.getAllAsync('SELECT * FROM habits WHERE archived = 0 ORDER BY id DESC;');
  }
  return memoryStore.habits
    .filter((h) => !h.archived)
    .sort((a, b) => b.id - a.id);
}

export async function getHabitById(id) {
  if (useSQLite && dbInstance) {
    return await dbInstance.getFirstAsync('SELECT * FROM habits WHERE id = ?;', [id]);
  }
  return memoryStore.habits.find((h) => h.id === Number(id)) || null;
}

export async function insertHabit(habitData) {
  const {
    name,
    description = '',
    category = 'Personal Growth',
    frequency = 'daily',
    target_days = '[0,1,2,3,4,5,6]',
    color = '#7E69AB',
    icon = 'star-outline',
    reminder_time = null,
    reminder_enabled = 0,
    notification_id = null,
  } = habitData;

  const now = new Date().toISOString();

  if (useSQLite && dbInstance) {
    const result = await dbInstance.runAsync(
      `INSERT INTO habits (name, description, category, frequency, target_days, color, icon, reminder_time, reminder_enabled, notification_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [name, description, category, frequency, target_days, color, icon, reminder_time, reminder_enabled ? 1 : 0, notification_id, now]
    );
    return result.lastInsertRowId;
  }

  const nextId = memoryStore.habits.length > 0
    ? Math.max(...memoryStore.habits.map((h) => h.id)) + 1
    : 1;

  const newHabit = {
    id: nextId,
    name,
    description,
    category,
    frequency,
    target_days,
    color,
    icon,
    reminder_time,
    reminder_enabled: reminder_enabled ? 1 : 0,
    notification_id,
    created_at: now,
    archived: 0,
  };

  memoryStore.habits.unshift(newHabit);
  await saveFileStore();
  return nextId;
}

export async function updateHabit(id, fields) {
  if (useSQLite && dbInstance) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;
    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const values = keys.map((key) => fields[key]);
    values.push(id);
    await dbInstance.runAsync(`UPDATE habits SET ${setClause} WHERE id = ?;`, values);
    return;
  }

  const habit = memoryStore.habits.find((h) => h.id === Number(id));
  if (habit) {
    Object.assign(habit, fields);
    await saveFileStore();
  }
}

export async function deleteHabit(id) {
  if (useSQLite && dbInstance) {
    await dbInstance.runAsync('DELETE FROM habit_logs WHERE habit_id = ?;', [id]);
    await dbInstance.runAsync('DELETE FROM habits WHERE id = ?;', [id]);
    return;
  }

  memoryStore.habits = memoryStore.habits.filter((h) => h.id !== Number(id));
  memoryStore.habit_logs = memoryStore.habit_logs.filter((l) => l.habit_id !== Number(id));
  await saveFileStore();
}

// ====================== HABIT LOGS ======================

export async function getLogsForDate(dateString) {
  if (useSQLite && dbInstance) {
    return await dbInstance.getAllAsync(
      'SELECT habit_id, completed, completed_at FROM habit_logs WHERE date = ?;',
      [dateString]
    );
  }

  return memoryStore.habit_logs
    .filter((l) => l.date === dateString)
    .map((l) => ({
      habit_id: l.habit_id,
      completed: l.completed,
      completed_at: l.completed_at,
    }));
}

export async function setHabitCompletion(habitId, dateString, completed) {
  const completedAt = completed ? new Date().toISOString() : null;
  const completedVal = completed ? 1 : 0;

  if (useSQLite && dbInstance) {
    await dbInstance.runAsync(
      `INSERT INTO habit_logs (habit_id, date, completed, completed_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(habit_id, date) DO UPDATE SET completed = excluded.completed, completed_at = excluded.completed_at;`,
      [habitId, dateString, completedVal, completedAt]
    );
    return;
  }

  const existingIndex = memoryStore.habit_logs.findIndex(
    (l) => l.habit_id === Number(habitId) && l.date === dateString
  );

  if (existingIndex >= 0) {
    memoryStore.habit_logs[existingIndex].completed = completedVal;
    memoryStore.habit_logs[existingIndex].completed_at = completedAt;
  } else {
    memoryStore.habit_logs.push({
      id: Date.now() + Math.random(),
      habit_id: Number(habitId),
      date: dateString,
      completed: completedVal,
      completed_at: completedAt,
    });
  }

  await saveFileStore();
}

export async function getAllLogs() {
  if (useSQLite && dbInstance) {
    return await dbInstance.getAllAsync('SELECT * FROM habit_logs ORDER BY date DESC;');
  }
  return [...memoryStore.habit_logs].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getLogsForRange(startDate, endDate) {
  if (useSQLite && dbInstance) {
    return await dbInstance.getAllAsync(
      'SELECT * FROM habit_logs WHERE date >= ? AND date <= ? ORDER BY date ASC;',
      [startDate, endDate]
    );
  }
  return memoryStore.habit_logs.filter((l) => l.date >= startDate && l.date <= endDate);
}

// ====================== SETTINGS ======================

export async function getSetting(key, defaultValue = null) {
  if (useSQLite && dbInstance) {
    const row = await dbInstance.getFirstAsync('SELECT value FROM settings WHERE key = ?;', [key]);
    return row ? row.value : defaultValue;
  }
  return memoryStore.settings[key] !== undefined ? memoryStore.settings[key] : defaultValue;
}

export async function setSetting(key, value) {
  if (useSQLite && dbInstance) {
    await dbInstance.runAsync(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;',
      [key, String(value)]
    );
    return;
  }
  memoryStore.settings[key] = String(value);
  await saveFileStore();
}

export async function getAllSettings() {
  if (useSQLite && dbInstance) {
    const rows = await dbInstance.getAllAsync('SELECT key, value FROM settings;');
    const result = {};
    for (const r of rows) {
      result[r.key] = r.value;
    }
    return result;
  }
  return { ...memoryStore.settings };
}

// ====================== STATS & STREAKS ======================

export async function getDetailedStats() {
  const habits = await getAllHabits();
  const allLogs = await getAllLogs();
  const logs = allLogs.filter((l) => l.completed === 1);

  const totalHabitsCount = habits.length;
  const totalCompletions = logs.length;

  const categoriesSet = new Set(habits.map((h) => h.category));
  const activeCategoriesCount = categoriesSet.size;

  const dateCompletionMap = {};
  logs.forEach((log) => {
    if (!dateCompletionMap[log.date]) {
      dateCompletionMap[log.date] = new Set();
    }
    dateCompletionMap[log.date].add(log.habit_id);
  });

  const distinctCompletedDates = Object.keys(dateCompletionMap).sort();

  let currentStreak = 0;
  let longestStreak = 0;

  if (distinctCompletedDates.length > 0) {
    const todayStr = formatLocalDate(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = formatLocalDate(yesterdayDate);

    const hasToday = Boolean(dateCompletionMap[todayStr]);
    const hasYesterday = Boolean(dateCompletionMap[yesterdayStr]);

    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? new Date() : yesterdayDate;
      while (true) {
        const checkStr = formatLocalDate(checkDate);
        if (dateCompletionMap[checkStr] && dateCompletionMap[checkStr].size > 0) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    let tempStreak = 0;
    let prevTime = null;

    for (let i = 0; i < distinctCompletedDates.length; i++) {
      const parts = distinctCompletedDates[i].split('-').map(Number);
      const currTime = new Date(parts[0], parts[1] - 1, parts[2]).getTime();

      if (prevTime === null) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((currTime - prevTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevTime = currTime;
    }
  }

  let hasPerfectDay = false;
  if (totalHabitsCount > 0) {
    for (const d of Object.keys(dateCompletionMap)) {
      if (dateCompletionMap[d].size >= totalHabitsCount) {
        hasPerfectDay = true;
        break;
      }
    }
  }

  const habitStats = {};
  for (const habit of habits) {
    const habitLogs = logs.filter((l) => l.habit_id === habit.id);
    const completedCount = habitLogs.length;

    let hStreak = 0;
    let hLongest = 0;
    const hDates = habitLogs.map((l) => l.date).sort();

    const todayStr = formatLocalDate(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatLocalDate(yesterday);

    if (hDates.includes(todayStr) || hDates.includes(yesterdayStr)) {
      let d = hDates.includes(todayStr) ? new Date() : yesterday;
      while (true) {
        const str = formatLocalDate(d);
        if (hDates.includes(str)) {
          hStreak++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
    }

    let temp = 0;
    let prev = null;
    for (const dStr of hDates) {
      const parts = dStr.split('-').map(Number);
      const curr = new Date(parts[0], parts[1] - 1, parts[2]).getTime();
      if (prev === null) {
        temp = 1;
      } else {
        const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          temp++;
        } else if (diff > 1) {
          temp = 1;
        }
      }
      if (temp > hLongest) hLongest = temp;
      prev = curr;
    }

    habitStats[habit.id] = {
      completedCount,
      currentStreak: hStreak,
      longestStreak: hLongest,
      completionRate: totalCompletions > 0 ? Math.round((completedCount / totalCompletions) * 100) : 0,
    };
  }

  return {
    totalHabitsCount,
    totalCompletions,
    activeCategoriesCount,
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    hasPerfectDay,
    habitStats,
    dateCompletionMap,
  };
}

// ====================== EXPORT / IMPORT ======================

export async function exportAllData() {
  const habits = await getAllHabits();
  const logs = await getAllLogs();
  const settings = await getAllSettings();

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    appName: 'HabitFlow',
    data: {
      habits,
      habit_logs: logs,
      settings,
    },
  };
}

export async function importAllData(payload) {
  if (!payload || !payload.data || !Array.isArray(payload.data.habits)) {
    throw new Error('Invalid HabitFlow backup file format.');
  }

  if (useSQLite && dbInstance) {
    await dbInstance.withTransactionAsync(async () => {
      await dbInstance.runAsync('DELETE FROM habit_logs;');
      await dbInstance.runAsync('DELETE FROM habits;');
      await dbInstance.runAsync('DELETE FROM settings;');

      for (const h of payload.data.habits) {
        await dbInstance.runAsync(
          `INSERT INTO habits (id, name, description, category, frequency, target_days, color, icon, reminder_time, reminder_enabled, notification_id, created_at, archived)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            h.id,
            h.name,
            h.description || '',
            h.category || 'Personal Growth',
            h.frequency || 'daily',
            h.target_days || '[0,1,2,3,4,5,6]',
            h.color || '#7E69AB',
            h.icon || 'star-outline',
            h.reminder_time || null,
            h.reminder_enabled ? 1 : 0,
            h.notification_id || null,
            h.created_at || new Date().toISOString(),
            h.archived ? 1 : 0,
          ]
        );
      }

      if (Array.isArray(payload.data.habit_logs)) {
        for (const l of payload.data.habit_logs) {
          await dbInstance.runAsync(
            `INSERT INTO habit_logs (id, habit_id, date, completed, completed_at)
             VALUES (?, ?, ?, ?, ?);`,
            [l.id, l.habit_id, l.date, l.completed ? 1 : 0, l.completed_at || null]
          );
        }
      }

      if (payload.data.settings) {
        const settingsArr = Array.isArray(payload.data.settings)
          ? payload.data.settings
          : Object.entries(payload.data.settings).map(([key, value]) => ({ key, value }));
        for (const s of settingsArr) {
          await dbInstance.runAsync('INSERT INTO settings (key, value) VALUES (?, ?);', [s.key, s.value]);
        }
      }
    });
    return true;
  }

  memoryStore = {
    habits: payload.data.habits,
    habit_logs: Array.isArray(payload.data.habit_logs) ? payload.data.habit_logs : [],
    settings: payload.data.settings
      ? Array.isArray(payload.data.settings)
        ? payload.data.settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
        : payload.data.settings
      : { ...DEFAULT_SETTINGS },
  };

  await saveFileStore();
  return true;
}

export async function resetAllData() {
  if (useSQLite && dbInstance) {
    await dbInstance.withTransactionAsync(async () => {
      await dbInstance.runAsync('DELETE FROM habit_logs;');
      await dbInstance.runAsync('DELETE FROM habits;');
      await dbInstance.runAsync('DELETE FROM settings;');
      for (const h of STARTER_HABITS) {
        await dbInstance.runAsync(
          `INSERT INTO habits (name, description, category, frequency, target_days, color, icon, reminder_time, reminder_enabled, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [h.name, h.description, h.category, h.frequency, h.target_days, h.color, h.icon, h.reminder_time, h.reminder_enabled, h.created_at]
        );
      }
      for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
        await dbInstance.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);', [k, v]);
      }
    });
    return true;
  }

  memoryStore = {
    habits: [...STARTER_HABITS],
    habit_logs: [],
    settings: { ...DEFAULT_SETTINGS },
  };
  await saveFileStore();
  return true;
}

export function formatLocalDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
