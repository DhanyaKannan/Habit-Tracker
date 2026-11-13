import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function ProgressBar({
  progress = 0, // 0 to 1 or 0 to 100
  color,
  height = 10,
  showLabel = false,
  style,
}) {
  const { colors } = useTheme();

  // Normalize progress to percentage (0 - 100)
  const normalized = progress <= 1 && progress > 0 ? Math.round(progress * 100) : Math.min(100, Math.max(0, Math.round(progress)));
  const fillColor = color || colors.sage;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: colors.isDark ? colors.cardBackgroundSubtle : colors.borderLight,
            borderRadius: height / 2,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${normalized}%`,
              backgroundColor: fillColor,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {normalized}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
});

