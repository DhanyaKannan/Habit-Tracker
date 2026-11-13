import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { BADGES } from '../constants/badges';
import Header from '../components/common/Header';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';

export default function AchievementsScreen({ navigation }) {
  const { colors } = useTheme();
  const { stats, habits } = useHabits();

  const [selectedBadge, setSelectedBadge] = useState(null);

  // Evaluate each badge with current stats
  const evaluatedBadges = BADGES.map((badge) => {
    const result = badge.check({
      totalHabitsCount: habits.length,
      totalCompletions: stats.totalCompletions,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      hasPerfectDay: stats.hasPerfectDay,
      activeCategoriesCount: stats.activeCategoriesCount,
    });
    return {
      ...badge,
      unlocked: result.unlocked,
      current: result.current,
      progress: result.progress,
    };
  });

  const unlockedCount = evaluatedBadges.filter((b) => b.unlocked).length;
  const totalBadges = evaluatedBadges.length;
  const overallBadgePercent = Math.round((unlockedCount / totalBadges) * 100);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title="Achievements"
        subtitle={`${unlockedCount} of ${totalBadges} badges earned`}
        leftIcon={navigation.canGoBack() ? 'arrow-back' : undefined}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Showcase Banner */}
        <Card style={styles.bannerCard}>
          <View style={styles.bannerLeft}>
            <View style={[styles.trophyCircle, { backgroundColor: '#FDF3D6' }]}>
              <Ionicons name="trophy" size={32} color="#D4AF37" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>
                Milestone Mastery
              </Text>
              <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
                Longest Streak: <Text style={{ fontWeight: '800', color: colors.lavender }}>{stats.longestStreak} Days</Text>
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 14 }}>
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                Badges Unlocked
              </Text>
              <Text style={[styles.progressVal, { color: colors.lavender }]}>
                {unlockedCount} / {totalBadges} ({overallBadgePercent}%)
              </Text>
            </View>
            <ProgressBar progress={overallBadgePercent} color={colors.lavender} height={8} />
          </View>
        </Card>

        {/* Badges Grid */}
        <View style={styles.badgesGrid}>
          {evaluatedBadges.map((b) => {
            return (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.badgeCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: b.unlocked ? colors.lavender : colors.border,
                  },
                ]}
                onPress={() => setSelectedBadge(b)}
                activeOpacity={0.7}
              >
                {/* Badge Icon Circle */}
                <View
                  style={[
                    styles.badgeIconCircle,
                    {
                      backgroundColor: b.unlocked ? `${b.color}25` : colors.cardBackgroundSubtle,
                      borderColor: b.unlocked ? b.color : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={b.unlocked ? b.icon.replace('-outline', '') : 'lock-closed'}
                    size={26}
                    color={b.unlocked ? b.color : colors.textMuted}
                  />
                </View>

                {/* Tier Ribbon */}
                <View
                  style={[
                    styles.tierBadge,
                    {
                      backgroundColor: b.unlocked ? `${b.color}20` : colors.cardBackgroundSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tierText,
                      { color: b.unlocked ? b.color : colors.textMuted },
                    ]}
                  >
                    {b.tier}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.badgeTitle,
                    { color: b.unlocked ? colors.textPrimary : colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {b.title}
                </Text>

                <Text
                  style={[styles.badgeSub, { color: colors.textMuted }]}
                  numberOfLines={2}
                >
                  {b.subtitle}
                </Text>

                {/* Progress Mini Bar */}
                <View style={styles.miniBarContainer}>
                  <ProgressBar
                    progress={b.progress * 100}
                    color={b.unlocked ? colors.sage : colors.lavender}
                    height={5}
                  />
                  <Text style={[styles.miniBarLabel, { color: colors.textMuted }]}>
                    {b.unlocked ? 'Unlocked' : `${b.current} / ${b.target}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <Modal
          visible={Boolean(selectedBadge)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedBadge(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalDialog,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.modalIconBox,
                  {
                    backgroundColor: selectedBadge.unlocked
                      ? `${selectedBadge.color}25`
                      : colors.cardBackgroundSubtle,
                  },
                ]}
              >
                <Ionicons
                  name={
                    selectedBadge.unlocked
                      ? selectedBadge.icon.replace('-outline', '')
                      : 'lock-closed'
                  }
                  size={42}
                  color={selectedBadge.unlocked ? selectedBadge.color : colors.textMuted}
                />
              </View>

              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {selectedBadge.title}
              </Text>
              <Text style={[styles.modalTier, { color: selectedBadge.color }]}>
                {selectedBadge.tier} Badge • {selectedBadge.category.toUpperCase()}
              </Text>

              <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
                {selectedBadge.subtitle}
              </Text>

              <View style={[styles.modalStatusBox, { backgroundColor: colors.cardBackgroundSubtle }]}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                  Current Progress:
                </Text>
                <Text
                  style={[
                    styles.statusValue,
                    { color: selectedBadge.unlocked ? colors.sage : colors.lavender },
                  ]}
                >
                  {selectedBadge.unlocked
                    ? 'Completed & Unlocked! 🎉'
                    : `${selectedBadge.current} / ${selectedBadge.target} (${Math.round(selectedBadge.progress * 100)}%)`}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.closeModalBtn, { backgroundColor: colors.lavender }]}
                onPress={() => setSelectedBadge(null)}
              >
                <Text style={styles.closeModalText}>Awesome</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  bannerCard: {
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  bannerSub: {
    fontSize: 13,
    marginTop: 3,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '48%',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  badgeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  tierText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeSub: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    marginBottom: 10,
    minHeight: 30,
  },
  miniBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  miniBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 320,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalTier: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  modalStatusBox: {
    width: '100%',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  closeModalBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
