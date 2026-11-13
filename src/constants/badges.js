// Achievement Badges Configuration for HabitFlow

export const BADGES = [
  {
    id: 'first_habit_created',
    title: 'Pioneer',
    subtitle: 'Create your first habit',
    icon: 'flag-outline',
    category: 'creation',
    target: 1,
    tier: 'Bronze',
    color: '#CD7F32',
    check: (stats) => ({
      unlocked: stats.totalHabitsCount >= 1,
      current: stats.totalHabitsCount,
      target: 1,
      progress: Math.min(1, stats.totalHabitsCount / 1)
    })
  },
  {
    id: 'first_completion',
    title: 'First Step',
    subtitle: 'Complete your first habit check-in',
    icon: 'checkmark-circle-outline',
    category: 'completion',
    target: 1,
    tier: 'Bronze',
    color: '#CD7F32',
    check: (stats) => ({
      unlocked: stats.totalCompletions >= 1,
      current: stats.totalCompletions,
      target: 1,
      progress: Math.min(1, stats.totalCompletions / 1)
    })
  },
  {
    id: 'streak_3_days',
    title: 'Spark',
    subtitle: 'Achieve a 3-day habit streak',
    icon: 'flame-outline',
    category: 'streak',
    target: 3,
    tier: 'Bronze',
    color: '#E29547',
    check: (stats) => ({
      unlocked: stats.longestStreak >= 3,
      current: stats.longestStreak,
      target: 3,
      progress: Math.min(1, stats.longestStreak / 3)
    })
  },
  {
    id: 'streak_7_days',
    title: '7-Day Champion',
    subtitle: 'Maintain a 7-day streak',
    icon: 'ribbon-outline',
    category: 'streak',
    target: 7,
    tier: 'Silver',
    color: '#5E9C76',
    check: (stats) => ({
      unlocked: stats.longestStreak >= 7,
      current: stats.longestStreak,
      target: 7,
      progress: Math.min(1, stats.longestStreak / 7)
    })
  },
  {
    id: 'streak_14_days',
    title: '14-Day Fortitude',
    subtitle: 'Achieve a 14-day streak',
    icon: 'shield-checkmark-outline',
    category: 'streak',
    target: 14,
    tier: 'Gold',
    color: '#7E69AB',
    check: (stats) => ({
      unlocked: stats.longestStreak >= 14,
      current: stats.longestStreak,
      target: 14,
      progress: Math.min(1, stats.longestStreak / 14)
    })
  },
  {
    id: 'streak_30_days',
    title: '30-Day Master',
    subtitle: 'Complete a full month 30-day streak',
    icon: 'trophy-outline',
    category: 'streak',
    target: 30,
    tier: 'Platinum',
    color: '#D4AF37',
    check: (stats) => ({
      unlocked: stats.longestStreak >= 30,
      current: stats.longestStreak,
      target: 30,
      progress: Math.min(1, stats.longestStreak / 30)
    })
  },
  {
    id: 'perfect_day',
    title: 'Perfect Day',
    subtitle: 'Complete 100% of all scheduled habits in a day',
    icon: 'star-outline',
    category: 'completion',
    target: 1,
    tier: 'Silver',
    color: '#E29547',
    check: (stats) => ({
      unlocked: stats.hasPerfectDay === true,
      current: stats.hasPerfectDay ? 1 : 0,
      target: 1,
      progress: stats.hasPerfectDay ? 1 : 0
    })
  },
  {
    id: 'completions_25',
    title: 'Consistent Mover',
    subtitle: 'Reach 25 total habit completions',
    icon: 'trending-up-outline',
    category: 'volume',
    target: 25,
    tier: 'Silver',
    color: '#4B88BE',
    check: (stats) => ({
      unlocked: stats.totalCompletions >= 25,
      current: stats.totalCompletions,
      target: 25,
      progress: Math.min(1, stats.totalCompletions / 25)
    })
  },
  {
    id: 'completions_100',
    title: 'Century Club',
    subtitle: 'Reach 100 total habit check-ins',
    icon: 'diamond-outline',
    category: 'volume',
    target: 100,
    tier: 'Platinum',
    color: '#9B5DE5',
    check: (stats) => ({
      unlocked: stats.totalCompletions >= 100,
      current: stats.totalCompletions,
      target: 100,
      progress: Math.min(1, stats.totalCompletions / 100)
    })
  },
  {
    id: 'category_diversity',
    title: 'Renaissance',
    subtitle: 'Maintain active habits in 3 or more categories',
    icon: 'layers-outline',
    category: 'diversity',
    target: 3,
    tier: 'Gold',
    color: '#38A3A5',
    check: (stats) => ({
      unlocked: stats.activeCategoriesCount >= 3,
      current: stats.activeCategoriesCount,
      target: 3,
      progress: Math.min(1, stats.activeCategoriesCount / 3)
    })
  }
];

