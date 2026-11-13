import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export async function getDatabase() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('habitflow.db');
  }
  return dbInstance;
}

export async function initDatabase() {
  const db = await getDatabase();

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

  // Check if first-run seeding is needed
  const habitsCountRow = await db.getFirstAsync('SELECT COUNT(*) as count FROM habits;');
  const hasOnboardedRow = await db.getFirstAsync("SELECT value FROM settings WHERE key = 'has_onboarded';");

  if (habitsCountRow?.count === 0 && !hasOnboardedRow) {
    await seedStarterHabits(db);
  }

  return db;
}

async function seedStarterHabits(db) {
  const now = new Date().toISOString();
  const starterHabits = [
    {
      name: 'Morning Hydration',
      description: 'Drink 2 glasses of fresh water right after waking up',
      category: 'Health',
      frequency: 'daily',
      target_days: '[0,1,2,3,4,5,6]',
      color: '#38A3A5',
      icon: 'water-outline',
      reminder_time: '07:30',
      reminder_enabled: 0,
      created_at: now
    },
    {
      name: '20-Minute Walk or Run',
      description: 'Get some fresh air and boost cardio stamina',
      category: 'Fitness',
      frequency: 'daily',
      target_days: '[0,1,2,3,4,5,6]',
      color: '#5E9C76',
      icon: 'walk-outline',
      reminder_time: '08:00',
      reminder_enabled: 0,
      created_at: now
    },
    {
      name: 'Read 15 Pages',
      description: 'Non-fiction or personal growth literature',
      category: 'Learning',
      frequency: 'daily',
      target_days: '[0,1,2,3,4,5,6]',
      color: '#7E69AB',
      icon: 'book-outline',
      reminder_time: '21:00',
      reminder_enabled: 0,
      created_at: now
    },
    {
      name: 'Plan Tomorrow',
      description: 'Identify top 3 priorities before going to sleep',
      category: 'Productivity',
      frequency: 'daily',
      target_days: '[0,1,2,3,4,5,6]',
      color: '#E29547',
      icon: 'flash-outline',
      reminder_time: '22:00',
      reminder_enabled: 0,
      created_at: now
    }
  ];

  for (const h of starterHabits) {
    await db.runAsync(
      `INSERT INTO habits (name, description, category, frequency, target_days, color, icon, reminder_time, reminder_enabled, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [h.name, h.description, h.category, h.frequency, h.target_days, h.color, h.icon, h.reminder_time, h.reminder_enabled, h.created_at]
    );
  }

  // Pre-seed default settings
  await db.runAsync("INSERT OR REPLACE INTO settings (key, value) VALUES ('theme', 'light');");
  await db.runAsync("INSERT OR REPLACE INTO settings (key, value) VALUES ('user_name', 'Habit Achiever');");
  await db.runAsync("INSERT OR REPLACE INTO settings (key, value) VALUES ('user_avatar', '🌱');");
  await db.runAsync("INSERT OR REPLACE INTO settings (key, value) VALUES ('user_goal', 'Building daily consistency and focus');");
  await db.runAsync("INSERT OR REPLACE INTO settings (key, value) VALUES ('notifications_enabled', '1');");
}

// ====================== HABITS CRUD ======================

export async function getAllHabits() {
  const db = await getDatabase();
  return await db.getAllAsync('SELECT * FROM habits WHERE archived = 0 ORDER BY id DESC;');
}

export async function getHabitById(id) {
  const db = await getDatabase();
  return await db.getFirstAsync('SELECT * FROM habits WHERE id = ?;', [id]);
}

export async function insertHabit(habitData) {
  const db = await getDatabase();
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
    notification_id = null
  } = habitData;

  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO habits (name, description, category, frequency, target_days, color, icon, reminder_time, reminder_enabled, notification_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [name, description, category, frequency, target_days, color, icon, reminder_time, reminder_enabled ? 1 : 0, notification_id, now]
  );
  return result.lastInsertRowId;
}

export async function updateHabit(id, fields) {
  const db = await getDatabase();
  const keys = Object.keys(fields);
  if (keys.length === 0) return;

  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  const values = keys.map((key) => fields[key]);
  values.push(id);

  await db.runAsync(`UPDATE habits SET ${setClause} WHERE id = ?;`, values);
}

export async function deleteHabit(id) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ?;', [id]);
  await db.runAsync('DELETE FROM habits WHERE id = ?;', [id]);
}

// ====================== HABIT LOGS ======================

export async function getLogsForDate(dateString) {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT habit_id, completed, completed_at FROM habit_logs WHERE date = ?;',
    [dateString]
  );
}

export async function setHabitCompletion(habitId, dateString, completed) {
  const db = await getDatabase();
  const completedAt = completed ? new Date().toISOString() : null;
  const completedVal = completed ? 1 : 0;

  await db.runAsync(
    `INSERT INTO habit_logs (habit_id, date, completed, completed_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(habit_id, date) DO UPDATE SET completed = excluded.completed, completed_at = excluded.completed_at;`,
    [habitId, dateString, completedVal, completedAt]
  );
}

export async function getAllLogs() {
  const db = await getDatabase();
  return await db.getAllAsync('SELECT * FROM habit_logs ORDER BY date DESC;');
}

export async function getLogsForRange(startDate, endDate) {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM habit_logs WHERE date >= ? AND date <= ? ORDER BY date ASC;',
    [startDate, endDate]
  );
}

// ====================== SETTINGS ======================

export async function getSetting(key, defaultValue = null) {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT value FROM settings WHERE key = ?;', [key]);
  return row ? row.value : defaultValue;
}

export async function setSetting(key, value) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;',
    [key, String(value)]
  );
}

export async function getAllSettings() {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT key, value FROM settings;');
  const result = {};
  for (const r of rows) {
    result[r.key] = r.value;
  }
  return result;
}

// ====================== STATS & STREAKS ======================

export async function getDetailedStats() {
  const db = await getDatabase();
  const habits = await db.getAllAsync('SELECT * FROM habits WHERE archived = 0;');
  const logs = await db.getAllAsync('SELECT habit_id, date, completed FROM habit_logs WHERE completed = 1 ORDER BY date ASC;');

  const totalHabitsCount = habits.length;
  const totalCompletions = logs.length;

  // Active categories
  const categoriesSet = new Set(habits.map((h) => h.category));
  const activeCategoriesCount = categoriesSet.size;

  // Group completions by date
  const dateCompletionMap = {};
  logs.forEach((log) => {
    if (!dateCompletionMap[log.date]) {
      dateCompletionMap[log.date] = new Set();
    }
    dateCompletionMap[log.date].add(log.habit_id);
  });

  const distinctCompletedDates = Object.keys(dateCompletionMap).sort();

  // Calculate global streak (consecutive days with at least 1 completed habit)
  let currentStreak = 0;
  let longestStreak = 0;

  if (distinctCompletedDates.length > 0) {
    const todayStr = formatLocalDate(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = formatLocalDate(yesterdayDate);

    // Check if streak is active (completed today or yesterday)
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

    // Calculate longest consecutive streak across history
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

  // Check if any day was a "Perfect Day" (all active habits completed on that day)
  let hasPerfectDay = false;
  if (totalHabitsCount > 0) {
    for (const d of Object.keys(dateCompletionMap)) {
      if (dateCompletionMap[d].size >= totalHabitsCount) {
        hasPerfectDay = true;
        break;
      }
    }
  }

  // Calculate stats per habit
  const habitStats = {};
  for (const habit of habits) {
    const habitLogs = logs.filter((l) => l.habit_id === habit.id);
    const completedCount = habitLogs.length;

    // Habit specific streak
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

    // Longest streak for this habit
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
      completionRate: totalCompletions > 0 ? Math.round((completedCount / totalCompletions) * 100) : 0
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
    dateCompletionMap
  };
}

// ====================== EXPORT / IMPORT ======================

export async function exportAllData() {
  const db = await getDatabase();
  const habits = await db.getAllAsync('SELECT * FROM habits;');
  const logs = await db.getAllAsync('SELECT * FROM habit_logs;');
  const settings = await db.getAllAsync('SELECT * FROM settings;');

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    appName: 'HabitFlow',
    data: {
      habits,
      habit_logs: logs,
      settings
    }
  };
}

export async function importAllData(payload) {
  if (!payload || !payload.data || !Array.isArray(payload.data.habits)) {
    throw new Error('Invalid HabitFlow backup file format.');
  }

  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    // Clear existing
    await db.runAsync('DELETE FROM habit_logs;');
    await db.runAsync('DELETE FROM habits;');
    await db.runAsync('DELETE FROM settings;');

    // Restore habits
    for (const h of payload.data.habits) {
      await db.runAsync(
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
          h.archived ? 1 : 0
        ]
      );
    }

    // Restore logs
    if (Array.isArray(payload.data.habit_logs)) {
      for (const l of payload.data.habit_logs) {
        await db.runAsync(
          `INSERT INTO habit_logs (id, habit_id, date, completed, completed_at)
           VALUES (?, ?, ?, ?, ?);`,
          [l.id, l.habit_id, l.date, l.completed ? 1 : 0, l.completed_at || null]
        );
      }
    }

    // Restore settings
    if (Array.isArray(payload.data.settings)) {
      for (const s of payload.data.settings) {
        await db.runAsync(
          `INSERT INTO settings (key, value) VALUES (?, ?);`,
          [s.key, s.value]
        );
      }
    }
  });

  return true;
}

export async function resetAllData() {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM habit_logs;');
    await db.runAsync('DELETE FROM habits;');
    await db.runAsync('DELETE FROM settings;');
  });
  await seedStarterHabits(db);
  return true;
}

// Utility: format Date to YYYY-MM-DD local string
export function formatLocalDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

