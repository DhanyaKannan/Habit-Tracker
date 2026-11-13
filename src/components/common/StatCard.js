import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Card from './Card';

export default function StatCard({
  title,
  value,
  icon,
  iconColor,
  subtitle,
  style,
}) {
  const { colors } = useTheme();
  const accent = iconColor || colors.lavender;

  return (
    <Card style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
        {icon && (
          <View style={[styles.iconWrapper, { backgroundColor: `${accent}18` }]}>
            <Ionicons name={icon} size={18} color={accent} />
          </View>
        )}
      </View>
      <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});

