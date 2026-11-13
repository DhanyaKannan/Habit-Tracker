import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { getQuoteForToday } from '../constants/quotes';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import HabitCard from '../components/habit/HabitCard';
import HabitFormModal from '../components/habit/HabitFormModal';
import ProgressRing from '../components/analytics/ProgressRing';
import EmptyState from '../components/common/EmptyState';

export default function DashboardScreen({ navigation }) {
  const { colors, toggleTheme, isDark } = useTheme();
  const {
    habits,
    todayLogs,
    stats,
    userProfile,
    totalHabits,
    completedTodayCount,
    remainingTodayCount,
    todayProgressPercent,
    toggleHabitCompletion,
    addHabit,
    editHabit,
    removeHabit,
    refreshAll,
  } = useHabits();

  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quote = getQuoteForToday();

  // Filter habits
  const filteredHabits = habits.filter((h) => {
    const isDone = Boolean(todayLogs[h.id]);
    if (filter === 'pending') return !isDone;
    if (filter === 'completed') return isDone;
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.borderLight }]}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.avatarEmoji}>{userProfile.avatar || '🌱'}</Text>
            <View style={{ marginLeft: 8 }}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                {getGreeting()},
              </Text>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {userProfile.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons: Achievements, Theme Toggle & Add Habit */}
        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.actionIconBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Achievements')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="trophy-outline"
              size={19}
              color="#D4AF37"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionIconBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={19}
              color={colors.lavender}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addHabitBtn, { backgroundColor: colors.lavender }]}
            onPress={() => {
              setSelectedHabit(null);
              setModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addHabitText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.lavender} />
        }
      >
        {/* Date Header */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.lavender} style={{ marginRight: 6 }} />
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formattedDate}</Text>
        </View>

        {/* Progress & Overview Card */}
        <Card style={styles.overviewCard}>
          <View style={styles.progressRingSection}>
            <ProgressRing percentage={todayProgressPercent} size={130} />
          </View>

          <View style={styles.overviewStatsColumn}>
            <View style={styles.metricRow}>
              <View style={[styles.metricDot, { backgroundColor: colors.sage }]} />
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Done Today:</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {completedTodayCount} / {totalHabits}
              </Text>
            </View>

            <View style={styles.metricRow}>
              <View style={[styles.metricDot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Remaining:</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {remainingTodayCount}
              </Text>
            </View>

            <View style={styles.metricRow}>
              <View style={[styles.metricDot, { backgroundColor: colors.lavender }]} />
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Streak:</Text>
              <Text style={[styles.metricValue, { color: colors.lavender, fontWeight: '800' }]}>
                {stats.currentStreak} Days 🔥
              </Text>
            </View>
          </View>
        </Card>

        {/* Metric Cards Row */}
        <View style={styles.statCardsGrid}>
          <StatCard
            style={styles.gridStatCard}
            title="Total"
            value={totalHabits}
            icon="list-outline"
            iconColor={colors.lavender}
          />
          <StatCard
            style={styles.gridStatCard}
            title="Completed"
            value={completedTodayCount}
            icon="checkmark-done"
            iconColor={colors.sage}
          />
          <StatCard
            style={styles.gridStatCard}
            title="Pending"
            value={remainingTodayCount}
            icon="time-outline"
            iconColor={colors.warning}
          />
          <StatCard
            style={styles.gridStatCard}
            title="Best Streak"
            value={`${stats.longestStreak}d`}
            icon="trophy-outline"
            iconColor="#D4AF37"
          />
        </View>

        {/* Daily Motivational Quote */}
        <Card style={[styles.quoteCard, { backgroundColor: colors.isDark ? colors.cardBackgroundSubtle : colors.cardBackground }]}>
          <View style={styles.quoteHeader}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.lavender} style={{ marginRight: 6 }} />
            <Text style={[styles.quoteBadge, { color: colors.lavender }]}>DAILY INSPIRATION</Text>
          </View>
          <Text style={[styles.quoteText, { color: colors.textPrimary }]}>
            "{quote.quote}"
          </Text>
          <Text style={[styles.quoteAuthor, { color: colors.textSecondary }]}>
            — {quote.author}
          </Text>
        </Card>

        {/* Today's Checklist Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Today's Habits
          </Text>

          {/* Filter Pills */}
          <View style={[styles.filterContainer, { backgroundColor: colors.cardBackgroundSubtle }]}>
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Done' },
            ].map((f) => {
              const active = filter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[
                    styles.filterTab,
                    active && { backgroundColor: colors.cardBackground },
                  ]}
                  onPress={() => setFilter(f.id)}
                >
                  <Text
                    style={[
                      styles.filterLabel,
                      {
                        color: active ? colors.lavender : colors.textSecondary,
                        fontWeight: active ? '700' : '500',
                      },
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Habit List */}
        {filteredHabits.length > 0 ? (
          filteredHabits.map((habit) => {
            const isCompleted = Boolean(todayLogs[habit.id]);
            const habitStreak = stats.habitStats?.[habit.id]?.currentStreak || 0;
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompleted={isCompleted}
                streak={habitStreak}
                onToggle={() => toggleHabitCompletion(habit.id)}
                onPress={() => {
                  setSelectedHabit(habit);
                  setModalVisible(true);
                }}
              />
            );
          })
        ) : (
          <EmptyState
            icon={filter === 'completed' ? 'checkmark-circle-outline' : 'sparkles-outline'}
            title={
              totalHabits === 0
                ? 'No habits yet'
                : filter === 'completed'
                ? 'None completed today'
                : 'All habits completed!'
            }
            description={
              totalHabits === 0
                ? 'Tap the button below to add your first habit and start tracking.'
                : filter === 'completed'
                ? 'Tap the circle on any habit above to mark it as completed.'
                : 'Great job! You have conquered all your daily goals.'
            }
            actionLabel={totalHabits === 0 ? 'Create First Habit' : undefined}
            onAction={() => {
              setSelectedHabit(null);
              setModalVisible(true);
            }}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Habit Create / Edit Modal */}
      <HabitFormModal
        visible={modalVisible}
        habit={selectedHabit}
        onClose={() => setModalVisible(false)}
        onSave={(payload) => {
          if (selectedHabit) {
            editHabit(selectedHabit.id, payload);
          } else {
            addHabit(payload);
          }
        }}
        onDelete={(id) => removeHabit(id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addHabitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addHabitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 22,
    marginBottom: 14,
  },
  progressRingSection: {
    marginRight: 16,
  },
  overviewStatsColumn: {
    flex: 1,
    gap: 10,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  metricLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  metricValue: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  statCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  gridStatCard: {
    flex: 1,
    minWidth: '45%',
  },
  quoteCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 18,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  quoteBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  quoteText: {
    fontSize: 13.5,
    fontStyle: 'italic',
    lineHeight: 20,
    fontWeight: '500',
  },
  quoteAuthor: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'right',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
  },
  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
  },
  filterLabel: {
    fontSize: 11.5,
  },
});
