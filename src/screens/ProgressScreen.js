import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import Header from '../components/common/Header';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import ProgressBar from '../components/common/ProgressBar';
import WeeklyBarChart from '../components/analytics/WeeklyBarChart';
import EmptyState from '../components/common/EmptyState';

export default function ProgressScreen({ navigation }) {
  const { colors } = useTheme();
  const {
    habits,
    stats,
    todayProgressPercent,
    completedTodayCount,
    totalHabits,
  } = useHabits();

  // Calculate overall completion rate across all recorded days
  const totalCompletedCheckins = stats.totalCompletions;
  const recordedDaysCount = Object.keys(stats.dateCompletionMap || {}).length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Analytics"
        subtitle="Insights & performance trends"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Key Metrics */}
        <View style={styles.metricsGrid}>
          <StatCard
            style={styles.metricCard}
            title="Total Check-ins"
            value={totalCompletedCheckins}
            icon="checkbox-outline"
            iconColor={colors.sage}
            subtitle="Lifetime completions"
          />
          <StatCard
            style={styles.metricCard}
            title="Active Streak"
            value={`${stats.currentStreak} Days`}
            icon="flame-outline"
            iconColor="#E29547"
            subtitle="Continuous days"
          />
          <StatCard
            style={styles.metricCard}
            title="Longest Streak"
            value={`${stats.longestStreak} Days`}
            icon="trophy-outline"
            iconColor="#D4AF37"
            subtitle="Personal record"
          />
          <StatCard
            style={styles.metricCard}
            title="Active Habits"
            value={totalHabits}
            icon="layers-outline"
            iconColor={colors.lavender}
            subtitle="Daily targets"
          />
        </View>

        {/* Today's Completion Card */}
        <Card style={styles.todayCard}>
          <View style={styles.todayCardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Today's Completion Rate
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                {completedTodayCount} of {totalHabits} habits marked done
              </Text>
            </View>
            <View style={[styles.todayBadge, { backgroundColor: `${colors.sage}20` }]}>
              <Text style={[styles.todayBadgeText, { color: colors.sage }]}>
                {todayProgressPercent}%
              </Text>
            </View>
          </View>
          <ProgressBar progress={todayProgressPercent} color={colors.sage} height={12} style={{ marginTop: 12 }} />
        </Card>

        {/* Weekly Activity Bar Chart */}
        <WeeklyBarChart
          dateCompletionMap={stats.dateCompletionMap}
          totalHabitsCount={totalHabits}
        />

        {/* Habit-Wise Performance Breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Habit Breakdown
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Individual streak & completion history
          </Text>
        </View>

        {habits.length > 0 ? (
          habits.map((habit) => {
            const hStat = stats.habitStats?.[habit.id] || {
              completedCount: 0,
              currentStreak: 0,
              longestStreak: 0,
            };
            const habitColor = habit.color || colors.lavender;

            return (
              <Card key={habit.id} style={styles.habitStatCard}>
                <View style={styles.habitHeader}>
                  <View
                    style={[
                      styles.habitIconBox,
                      { backgroundColor: `${habitColor}20`, borderColor: habitColor },
                    ]}
                  >
                    <Ionicons name={habit.icon || 'star-outline'} size={20} color={habitColor} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.habitName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {habit.name}
                    </Text>
                    <Text style={[styles.habitCategory, { color: habitColor }]}>
                      {habit.category}
                    </Text>
                  </View>

                  <View style={[styles.habitStreakBadge, { backgroundColor: colors.isDark ? '#3D2818' : '#FDF0E4' }]}>
                    <Ionicons name="flame" size={12} color="#E29547" style={{ marginRight: 3 }} />
                    <Text style={styles.habitStreakText}>{hStat.currentStreak}d streak</Text>
                  </View>
                </View>

                {/* Sub metrics */}
                <View style={[styles.statSplit, { borderTopColor: colors.borderLight }]}>
                  <View style={styles.statColumn}>
                    <Text style={[styles.statSubLabel, { color: colors.textMuted }]}>Completions</Text>
                    <Text style={[styles.statSubVal, { color: colors.textPrimary }]}>{hStat.completedCount}</Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={[styles.statSubLabel, { color: colors.textMuted }]}>Best Streak</Text>
                    <Text style={[styles.statSubVal, { color: colors.textPrimary }]}>{hStat.longestStreak} days</Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={[styles.statSubLabel, { color: colors.textMuted }]}>Frequency</Text>
                    <Text style={[styles.statSubVal, { color: colors.textPrimary }]}>
                      {habit.frequency.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="stats-chart-outline"
            title="No Data Yet"
            description="Add habits and start checking them off to see analytics."
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
  },
  todayCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  todayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  todayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  todayBadgeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  habitStatCard: {
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    fontSize: 15,
    fontWeight: '700',
  },
  habitCategory: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  habitStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  habitStreakText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E29547',
  },
  statSplit: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statSubLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statSubVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
});

