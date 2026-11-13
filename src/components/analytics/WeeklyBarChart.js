import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatLocalDate } from '../../database/db';
import Card from '../common/Card';

export default function WeeklyBarChart({
  dateCompletionMap = {},
  totalHabitsCount = 0,
}) {
  const { colors } = useTheme();

  // Generate last 7 days (including today)
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatLocalDate(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isToday = i === 0;

    const completionsSet = dateCompletionMap[dateStr];
    const completedCount = completionsSet ? completionsSet.size : 0;
    const percentage = totalHabitsCount > 0 ? Math.min(100, Math.round((completedCount / totalHabitsCount) * 100)) : 0;

    days.push({
      dateStr,
      dayName,
      isToday,
      completedCount,
      percentage,
    });
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Last 7 Days Activity</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Daily completion rate</Text>
      </View>

      <View style={styles.chartContainer}>
        {days.map((item) => {
          // Bar height from 6px min to 110px max
          const barHeight = Math.max(8, Math.round((item.percentage / 100) * 110));
          const isFull = item.percentage === 100;

          return (
            <View key={item.dateStr} style={styles.barColumn}>
              {/* Value label on top */}
              <Text
                style={[
                  styles.valueLabel,
                  { color: item.isToday ? colors.lavender : colors.textMuted },
                ]}
              >
                {item.percentage}%
              </Text>

              {/* Bar Track & Fill */}
              <View
                style={[
                  styles.barTrack,
                  { backgroundColor: colors.isDark ? colors.cardBackgroundSubtle : colors.borderLight },
                ]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      height: barHeight,
                      backgroundColor: isFull
                        ? colors.sage
                        : item.percentage > 0
                        ? colors.lavender
                        : 'transparent',
                    },
                  ]}
                />
              </View>

              {/* Day Label */}
              <View
                style={[
                  styles.dayLabelBadge,
                  item.isToday && { backgroundColor: `${colors.lavender}20` },
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    {
                      color: item.isToday ? colors.lavender : colors.textSecondary,
                      fontWeight: item.isToday ? '800' : '600',
                    },
                  ]}
                >
                  {item.dayName}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingHorizontal: 4,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  barTrack: {
    width: 22,
    height: 110,
    borderRadius: 11,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 11,
  },
  dayLabelBadge: {
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 11,
  },
});

