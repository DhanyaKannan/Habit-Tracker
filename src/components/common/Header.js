import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function Header({
  title,
  subtitle,
  rightIcon,
  onRightPress,
  leftIcon,
  onLeftPress,
  rightComponent,
  style,
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftPress}
            style={[styles.iconButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name={leftIcon} size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightSection}>
        {rightComponent}
        {rightIcon && !rightComponent && (
          <TouchableOpacity
            onPress={onRightPress}
            style={[styles.iconButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name={rightIcon} size={20} color={colors.lavender} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 4,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 8,
  },
});

