import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function ProgressRing({
  percentage = 0,
  size = 140,
  strokeWidth = 12,
  subtitle = "Today's Score",
}) {
  const { colors } = useTheme();
  const normalized = Math.min(100, Math.max(0, Math.round(percentage)));
  const isFull = normalized === 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer Glow / Ring Track */}
      <View
        style={[
          styles.ringBase,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.isDark ? colors.cardBackgroundSubtle : colors.borderLight,
          },
        ]}
      />

      {/* Progress Indicator Arc Representation */}
      <View
        style={[
          styles.activeIndicator,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: isFull ? colors.sage : colors.lavender,
            opacity: normalized > 0 ? 0.9 : 0.1,
            transform: [{ rotate: `${(normalized / 100) * 360}deg` }],
          },
        ]}
      />

      {/* Center Content */}
      <View style={styles.centerTextContainer}>
        {isFull ? (
          <Ionicons name="sparkles" size={24} color={colors.sage} style={{ marginBottom: 2 }} />
        ) : null}
        <Text style={[styles.percentNumber, { color: colors.textPrimary }]}>
          {normalized}%
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isFull ? 'All Done!' : subtitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringBase: {
    position: 'absolute',
  },
  activeIndicator: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  centerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentNumber: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

