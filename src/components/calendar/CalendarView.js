import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { formatLocalDate } from '../../database/db';
import Card from '../common/Card';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarView({
  selectedDate,
  onSelectDate,
  dateCompletionMap = {}, // { 'YYYY-MM-DD': Set of completed habit IDs }
  totalHabitsCount = 0,
}) {
  const { colors } = useTheme();

  // Parse current viewing month/year from selectedDate or today
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  const todayStr = formatLocalDate(new Date());

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarDays = [];
  // Empty slots before 1st of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ key: `empty-${i}`, empty: true });
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(viewYear, viewMonth, d);
    const dateStr = formatLocalDate(dateObj);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));

    const completionsSet = dateCompletionMap[dateStr];
    const completedCount = completionsSet ? completionsSet.size : 0;
    const hasCompleted = completedCount > 0;
    const isAllCompleted = totalHabitsCount > 0 && completedCount >= totalHabitsCount;

    calendarDays.push({
      key: dateStr,
      dayNumber: d,
      dateString: dateStr,
      empty: false,
      isToday,
      isSelected,
      isPast,
      hasCompleted,
      isAllCompleted,
      completedCount,
    });
  }

  // Month summary stats
  let daysWithCompletionsThisMonth = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = formatLocalDate(new Date(viewYear, viewMonth, d));
    if (dateCompletionMap[dStr] && dateCompletionMap[dStr].size > 0) {
      daysWithCompletionsThisMonth++;
    }
  }

  return (
    <Card style={styles.card}>
      {/* Month Navigation Header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={[styles.arrowButton, { backgroundColor: colors.cardBackgroundSubtle, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.monthTitleWrapper}>
          <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleNextMonth}
          style={[styles.arrowButton, { backgroundColor: colors.cardBackgroundSubtle, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekdaysRow}>
        {DAYS_OF_WEEK.map((day, idx) => (
          <Text
            key={day}
            style={[
              styles.weekdayLabel,
              { color: idx === 0 || idx === 6 ? colors.lavender : colors.textMuted },
            ]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.grid}>
        {calendarDays.map((cell) => {
          if (cell.empty) {
            return <View key={cell.key} style={styles.dayCell} />;
          }

          let cellBg = 'transparent';
          let textColor = colors.textPrimary;
          let borderColor = 'transparent';

          if (cell.isSelected) {
            borderColor = colors.lavender;
          }

          if (cell.isAllCompleted) {
            cellBg = colors.sage;
            textColor = '#FFFFFF';
          } else if (cell.hasCompleted) {
            cellBg = `${colors.sage}25`;
            textColor = colors.sageDark || colors.sage;
          } else if (cell.isPast && totalHabitsCount > 0) {
            // Missed day
            cellBg = `${colors.danger}12`;
            textColor = colors.textSecondary;
          }

          return (
            <TouchableOpacity
              key={cell.key}
              style={[
                styles.dayCell,
                {
                  backgroundColor: cellBg,
                  borderColor: borderColor,
                  borderWidth: cell.isSelected ? 2 : 0,
                },
              ]}
              onPress={() => onSelectDate(cell.dateString)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: cell.isAllCompleted ? '#FFFFFF' : (cell.isSelected ? colors.lavender : textColor) },
                  cell.isToday && styles.todayText,
                ]}
              >
                {cell.dayNumber}
              </Text>

              {/* Status Dot */}
              <View style={styles.dotContainer}>
                {cell.isAllCompleted ? (
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                ) : cell.hasCompleted ? (
                  <View style={[styles.dot, { backgroundColor: colors.sage }]} />
                ) : cell.isToday ? (
                  <View style={[styles.dot, { backgroundColor: colors.lavender }]} />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend & Month Summary */}
      <View style={[styles.legendRow, { borderTopColor: colors.borderLight }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.sage }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: `${colors.sage}25` }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Partial</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: `${colors.danger}15` }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Missed</Text>
        </View>
      </View>

      <View style={[styles.summaryStrip, { backgroundColor: colors.cardBackgroundSubtle }]}>
        <Ionicons name="ribbon-outline" size={16} color={colors.lavender} style={{ marginRight: 6 }} />
        <Text style={[styles.summaryText, { color: colors.textPrimary }]}>
          <Text style={{ fontWeight: '800', color: colors.lavender }}>{daysWithCompletionsThisMonth}</Text> active habit days in {MONTH_NAMES[viewMonth]}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthTitleWrapper: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 38,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  todayText: {
    fontWeight: '900',
  },
  dotContainer: {
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 14,
    marginTop: 10,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

