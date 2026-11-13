import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { HABIT_CATEGORIES } from '../constants/theme';
import Header from '../components/common/Header';
import HabitCard from '../components/habit/HabitCard';
import HabitFormModal from '../components/habit/HabitFormModal';
import EmptyState from '../components/common/EmptyState';

export default function HabitsScreen({ navigation }) {
  const { colors } = useTheme();
  const {
    habits,
    todayLogs,
    stats,
    toggleHabitCompletion,
    addHabit,
    editHabit,
    removeHabit,
  } = useHabits();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  // Filter habits by category and search term
  const filteredHabits = habits.filter((h) => {
    const matchesCategory = selectedCategory === 'All' || h.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="My Habits"
        subtitle={`${habits.length} routines created`}
        rightIcon="add"
        onRightPress={() => {
          setSelectedHabit(null);
          setModalVisible(true);
        }}
      />

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search habits..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Horizontal Filter Pills */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <TouchableOpacity
            style={[
              styles.categoryPill,
              {
                backgroundColor: selectedCategory === 'All' ? colors.lavender : colors.cardBackground,
                borderColor: selectedCategory === 'All' ? colors.lavender : colors.border,
              },
            ]}
            onPress={() => setSelectedCategory('All')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryPillText,
                { color: selectedCategory === 'All' ? '#FFFFFF' : colors.textPrimary },
              ]}
            >
              All ({habits.length})
            </Text>
          </TouchableOpacity>

          {HABIT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const count = habits.filter((h) => h.category === cat.name).length;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? cat.color : colors.cardBackground,
                    borderColor: isSelected ? cat.color : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.name)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon}
                  size={13}
                  color={isSelected ? '#FFFFFF' : cat.color}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {cat.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Habits List */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
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
            icon="clipboard-outline"
            title={searchQuery ? 'No habits found' : 'No habits in this category'}
            description={
              searchQuery
                ? 'Try a different search keyword.'
                : `You do not have any habits listed in "${selectedCategory}".`
            }
            actionLabel="Add Habit"
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
  searchContainer: {
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  categoriesWrapper: {
    marginBottom: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 18,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
});

