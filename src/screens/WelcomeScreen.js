import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';

export default function WelcomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { completeOnboarding } = useHabits();

  const handleGetStarted = async () => {
    await completeOnboarding();
    navigation.replace('MainTabs');
  };

  const FEATURES = [
    {
      icon: 'sparkles-outline',
      title: '100% Offline & Private',
      description: 'Your habits stay strictly on your device in local SQLite storage. No accounts, no clouds.',
      color: colors.lavender,
    },
    {
      icon: 'flame-outline',
      title: 'Dynamic Streaks & Analytics',
      description: 'Watch your momentum grow with smart streaks, calendars, and detailed visual stats.',
      color: colors.warning,
    },
    {
      icon: 'alarm-outline',
      title: 'Offline Reminders',
      description: 'Never miss a check-in with scheduled device alarms that work in airplane mode.',
      color: colors.sage,
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* App Logo & Branding */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.logoBadge,
              { backgroundColor: colors.lavenderLight, borderColor: colors.lavender },
            ]}
          >
            <Ionicons name="infinite" size={56} color={colors.lavender} />
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>HabitFlow</Text>
          <Text style={[styles.tagline, { color: colors.lavender }]}>
            Master Your Daily Consistency
          </Text>
          <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
            Build life-changing routines with a calm, offline-first habit tracker designed for focus and flow.
          </Text>
        </View>

        {/* Value Proposition Cards */}
        <View style={styles.featuresList}>
          {FEATURES.map((feat, index) => (
            <View
              key={index}
              style={[
                styles.featureCard,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
              ]}
            >
              <View style={[styles.featureIconBox, { backgroundColor: `${feat.color}20` }]}>
                <Ionicons name={feat.icon} size={24} color={feat.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>
                  {feat.title}
                </Text>
                <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                  {feat.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.lavender }]}
            onPress={handleGetStarted}
            activeOpacity={0.85}
          >
            <Text style={styles.startButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <Text style={[styles.offlineNotice, { color: colors.textMuted }]}>
            Ready to use offline • No sign-up required
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ? 20 : 28) : 0,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 320,
  },
  featuresList: {
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  offlineNotice: {
    fontSize: 12,
    marginTop: 14,
    fontWeight: '500',
  },
});

