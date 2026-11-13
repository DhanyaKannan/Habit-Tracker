import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { HABIT_CATEGORIES, HABIT_COLORS, HABIT_ICONS } from '../../constants/theme';

export default function HabitFormModal({
  visible,
  habit = null, // null for create, object for edit
  onClose,
  onSave,
  onDelete,
}) {
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [frequency, setFrequency] = useState('daily');
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [error, setError] = useState('');

  useEffect(() => {
    if (habit) {
      setName(habit.name || '');
      setDescription(habit.description || '');
      setCategory(habit.category || 'Health');
      setFrequency(habit.frequency || 'daily');
      setColor(habit.color || HABIT_COLORS[0]);
      setIcon(habit.icon || HABIT_ICONS[0]);
      setReminderEnabled(habit.reminder_enabled === 1);
      setReminderTime(habit.reminder_time || '08:00');
    } else {
      setName('');
      setDescription('');
      setCategory('Health');
      setFrequency('daily');
      setColor(HABIT_COLORS[0]);
      setIcon(HABIT_ICONS[0]);
      setReminderEnabled(false);
      setReminderTime('08:00');
    }
    setError('');
  }, [habit, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please provide a name for this habit.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category,
      frequency,
      color,
      icon,
      reminder_enabled: reminderEnabled ? 1 : 0,
      reminder_time: reminderEnabled ? reminderTime : null,
    };

    onSave(payload);
    onClose();
  };

  const TIME_PRESETS = [
    '06:30', '07:30', '08:30', '09:00',
    '12:30', '18:00', '20:00', '21:30'
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {habit ? 'Edit Habit' : 'New Habit'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.lavender }]}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          {/* Habit Preview Preview */}
          <View
            style={[
              styles.previewCard,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.previewIcon,
                { backgroundColor: `${color}20`, borderColor: color },
              ]}
            >
              <Ionicons name={icon} size={28} color={color} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.previewName, { color: colors.textPrimary }]}>
                {name.trim() || 'Habit Name'}
              </Text>
              <Text style={[styles.previewSub, { color: colors.textSecondary }]}>
                {category} • {frequency.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Name Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>HABIT NAME *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: error ? colors.danger : colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. Drink 2L of water, Morning Jog"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={(txt) => {
                setName(txt);
                if (error) setError('');
              }}
              maxLength={50}
            />
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>DESCRIPTION / NOTES</Text>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Why does this habit matter to you? (optional)"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
              maxLength={120}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>CATEGORY</Text>
            <View style={styles.chipRow}>
              {HABIT_CATEGORIES.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategory(cat.name)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected
                          ? `${cat.color}25`
                          : colors.cardBackground,
                        borderColor: isSelected ? cat.color : colors.border,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={14}
                      color={isSelected ? cat.color : colors.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: isSelected ? cat.color : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>FREQUENCY</Text>
            <View style={styles.frequencyRow}>
              {[
                { id: 'daily', label: 'Everyday' },
                { id: 'weekdays', label: 'Weekdays' },
                { id: 'weekends', label: 'Weekends' },
              ].map((f) => {
                const isSelected = frequency === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setFrequency(f.id)}
                    style={[
                      styles.freqButton,
                      {
                        backgroundColor: isSelected ? colors.lavender : colors.cardBackground,
                        borderColor: isSelected ? colors.lavender : colors.border,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.freqText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
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

          {/* Color Selector */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>COLOR ACCENT</Text>
            <View style={styles.colorsGrid}>
              {HABIT_COLORS.map((c) => {
                const isSelected = color === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setColor(c)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: c },
                      isSelected && styles.selectedColorCircle,
                    ]}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Icon Selector */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>ICON</Text>
            <View style={styles.iconsGrid}>
              {HABIT_ICONS.map((ic) => {
                const isSelected = icon === ic;
                return (
                  <TouchableOpacity
                    key={ic}
                    onPress={() => setIcon(ic)}
                    style={[
                      styles.iconSelectButton,
                      {
                        backgroundColor: isSelected ? `${color}25` : colors.cardBackground,
                        borderColor: isSelected ? color : colors.border,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={ic}
                      size={20}
                      color={isSelected ? color : colors.textSecondary}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Reminder Section */}
          <View
            style={[
              styles.section,
              styles.reminderCard,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
          >
            <View style={styles.reminderHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name="alarm-outline"
                  size={20}
                  color={colors.lavender}
                  style={{ marginRight: 10 }}
                />
                <View>
                  <Text style={[styles.reminderTitle, { color: colors.textPrimary }]}>
                    Daily Offline Reminder
                  </Text>
                  <Text style={[styles.reminderSubtitle, { color: colors.textSecondary }]}>
                    Local notification on your device
                  </Text>
                </View>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: colors.border, true: colors.lavenderLight }}
                thumbColor={reminderEnabled ? colors.lavender : '#f4f3f4'}
              />
            </View>

            {reminderEnabled && (
              <View style={styles.timePickerContainer}>
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                  Select Reminder Time:
                </Text>
                <View style={styles.timePresetsRow}>
                  {TIME_PRESETS.map((t) => {
                    const isSelected = reminderTime === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setReminderTime(t)}
                        style={[
                          styles.timeChip,
                          {
                            backgroundColor: isSelected ? colors.lavender : colors.cardBackgroundSubtle,
                            borderColor: isSelected ? colors.lavender : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.timeChipText,
                            {
                              color: isSelected ? '#FFFFFF' : colors.textPrimary,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {t}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Delete Action (Edit Mode only) */}
          {habit && onDelete && (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Delete Habit',
                  `Are you sure you want to delete "${habit.name}"? All completion history for this habit will also be removed.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        onDelete(habit.id);
                        onClose();
                      },
                    },
                  ]
                );
              }}
              style={[
                styles.deleteButton,
                { backgroundColor: colors.dangerLight, borderColor: colors.danger },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} style={{ marginRight: 8 }} />
              <Text style={[styles.deleteButtonText, { color: colors.danger }]}>
                Delete Habit
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 14 : 44) : 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  previewIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    fontSize: 16,
    fontWeight: '700',
  },
  previewSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  freqButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqText: {
    fontSize: 13,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorCircle: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconSelectButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  reminderSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  timePickerContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DDD',
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  timePresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  timeChipText: {
    fontSize: 13,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

