import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { formatLocalDate } from '../database/db';
import Header from '../components/common/Header';
import CalendarView from '../components/calendar/CalendarView';
import HabitCard from '../components/habit/HabitCard';
import EmptyState from '../components/common/EmptyState';

export default function CalendarScreen({ navigation }) {
  const { colors } = useTheme();
  const {
    habits,
    selectedDate,
    selectedDateLogs,
    stats,
    changeSelectedDate,
    toggleHabitCompletion,
    todayStr,
  } = useHabits();

  const isToday = selectedDate === todayStr;

  // Format selected date nicely
  const selectedDateParts = selectedDate.split('-').map(Number);
  const selectedDateObj = new Date(selectedDateParts[0], selectedDateParts[1] - 1, selectedDateParts[2]);
  const formattedSelectedDate = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const completionsOnSelectedDate = habits.filter((h) => Boolean(selectedDateLogs[h.id])).length;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Calendar"
        subtitle="Track consistency over time"
        rightComponent={
          !isToday ? (
            <TouchableOpacity
              style={[
                styles.todayButton,
                { backgroundColor: colors.lavenderLight, borderColor: colors.lavender },
              ]}
              onPress={() => changeSelectedDate(todayStr)}
              activeOpacity={0.7}
            >
              <Ionicons name="today-outline" size={14} color={colors.lavender} style={{ marginRight: 4 }} />
              <Text style={[styles.todayButtonText, { color: colors.lavender }]}>Today</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Monthly Calendar Component */}
        <CalendarView
          selectedDate={selectedDate}
          onSelectDate={changeSelectedDate}
          dateCompletionMap={stats.dateCompletionMap}
          totalHabitsCount={habits.length}
        />

        {/* Selected Date Header */}
        <View style={styles.selectedDateHeader}>
          <View>
            <Text style={[styles.selectedDateTitle, { color: colors.textPrimary }]}>
              {isToday ? 'Today, ' : ''}{formattedSelectedDate}
            </Text>
            <Text style={[styles.selectedDateSub, { color: colors.textSecondary }]}>
              {completionsOnSelectedDate} of {habits.length} habits completed
            </Text>
          </View>
        </View>

        {/* Daily Habit Checklist for Selected Date */}
        {habits.length > 0 ? (
          habits.map((habit) => {
            const isCompleted = Boolean(selectedDateLogs[habit.id]);
            const habitStreak = stats.habitStats?.[habit.id]?.currentStreak || 0;
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompleted={isCompleted}
                streak={habitStreak}
                onToggle={() => toggleHabitCompletion(habit.id, selectedDate)}
                onPress={() => toggleHabitCompletion(habit.id, selectedDate)}
              />
            );
          })
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No Habits Scheduled"
            description="Create habits to see your daily progress tracked on the calendar."
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  selectedDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
  },
  selectedDateTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  selectedDateSub: {
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '500',
  },
});

