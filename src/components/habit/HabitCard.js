import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Card from '../common/Card';

export default function HabitCard({
  habit,
  isCompleted = false,
  streak = 0,
  onToggle,
  onPress,
  onDelete,
  style,
}) {
  const { colors } = useTheme();
  const habitColor = habit.color || colors.lavender;

  return (
    <Card
      style={[
        styles.card,
        isCompleted && {
          borderColor: colors.isDark ? '#2D4A38' : '#D1E7DA',
          backgroundColor: colors.isDark ? '#192820' : '#F6FAF7',
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Left: Icon */}
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isCompleted ? `${colors.sage}25` : `${habitColor}18`,
              borderColor: isCompleted ? colors.sage : `${habitColor}40`,
            },
          ]}
        >
          <Ionicons
            name={habit.icon || 'star-outline'}
            size={22}
            color={isCompleted ? colors.sage : habitColor}
          />
        </View>

        {/* Center: Details */}
        <View style={styles.infoWrapper}>
          <View style={styles.titleRow}>
            <Text
              numberOfLines={1}
              style={[
                styles.habitName,
                { color: colors.textPrimary },
                isCompleted && styles.completedText,
              ]}
            >
              {habit.name}
            </Text>
          </View>

          {habit.description ? (
            <Text
              numberOfLines={1}
              style={[styles.habitDesc, { color: colors.textSecondary }]}
            >
              {habit.description}
            </Text>
          ) : null}

          {/* Badges Row */}
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: `${habitColor}18` },
              ]}
            >
              <Text style={[styles.categoryText, { color: habitColor }]}>
                {habit.category}
              </Text>
            </View>

            {habit.reminder_enabled === 1 && habit.reminder_time ? (
              <View
                style={[
                  styles.reminderBadge,
                  { backgroundColor: colors.cardBackgroundSubtle },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={11}
                  color={colors.textSecondary}
                  style={{ marginRight: 3 }}
                />
                <Text style={[styles.reminderText, { color: colors.textSecondary }]}>
                  {habit.reminder_time}
                </Text>
              </View>
            ) : null}

            {streak > 0 && (
              <View
                style={[
                  styles.streakBadge,
                  { backgroundColor: colors.isDark ? '#3D2818' : '#FDF0E4' },
                ]}
              >
                <Ionicons name="flame" size={12} color="#E29547" style={{ marginRight: 2 }} />
                <Text style={styles.streakText}>{streak}d</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Right: Checkbox Button */}
      <TouchableOpacity
        style={[
          styles.checkButton,
          isCompleted
            ? { backgroundColor: colors.sage, borderColor: colors.sage }
            : {
                backgroundColor: colors.cardBackgroundSubtle,
                borderColor: colors.border,
              },
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Ionicons
          name="checkmark"
          size={18}
          color={isCompleted ? '#FFFFFF' : 'transparent'}
        />
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  completedText: {
    opacity: 0.8,
  },
  habitDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  reminderText: {
    fontSize: 10,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E29547',
  },
  checkButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

