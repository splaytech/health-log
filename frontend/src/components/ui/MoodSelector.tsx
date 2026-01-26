import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme, colors as themeColors } from '../../context/ThemeContext';

export type MoodType = 'happy' | 'fine' | 'neutral' | 'sad' | 'stressed';

interface MoodOption {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { type: 'happy', emoji: '😊', label: 'Happy', color: themeColors.mood.happy },
  { type: 'fine', emoji: '🙂', label: 'Fine', color: themeColors.mood.fine },
  { type: 'neutral', emoji: '😐', label: 'Neutral', color: themeColors.mood.neutral },
  { type: 'sad', emoji: '😔', label: 'Sad', color: themeColors.mood.sad },
  { type: 'stressed', emoji: '😰', label: 'Stressed', color: themeColors.mood.stressed },
];

interface MoodSelectorProps {
  selectedMood?: MoodType;
  onMoodSelect: (mood: MoodType) => void;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export function MoodSelector({
  selectedMood,
  onMoodSelect,
  showLabels = true,
  size = 'medium',
  style,
}: MoodSelectorProps) {
  const { colors } = useTheme();

  const sizeConfig = {
    small: { button: 48, emoji: 24, gap: 8 },
    medium: { button: 60, emoji: 32, gap: 12 },
    large: { button: 72, emoji: 40, gap: 16 },
  };

  const config = sizeConfig[size];

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.moodRow, { gap: config.gap }]}>
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selectedMood === mood.type;
          return (
            <TouchableOpacity
              key={mood.type}
              onPress={() => onMoodSelect(mood.type)}
              activeOpacity={0.7}
              style={styles.moodButton}
            >
              <View
                style={[
                  styles.moodCircle,
                  {
                    width: config.button,
                    height: config.button,
                    borderRadius: config.button / 2,
                    backgroundColor: isSelected
                      ? `${mood.color}30`
                      : colors.surfaceElevated,
                    borderColor: isSelected ? mood.color : 'transparent',
                    borderWidth: isSelected ? 3 : 0,
                  },
                ]}
              >
                <Text style={{ fontSize: config.emoji }}>{mood.emoji}</Text>
              </View>
              {showLabels && (
                <Text
                  variant="labelSmall"
                  style={[
                    styles.moodLabel,
                    {
                      color: isSelected ? mood.color : colors.textSecondary,
                      fontWeight: isSelected ? '600' : '400',
                    },
                  ]}
                >
                  {mood.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Compact mood display for history items
interface MoodBadgeProps {
  mood: MoodType;
  size?: 'small' | 'medium';
  showLabel?: boolean;
  style?: ViewStyle;
}

export function MoodBadge({ mood, size = 'small', showLabel = false, style }: MoodBadgeProps) {
  const { colors } = useTheme();
  const moodOption = MOOD_OPTIONS.find((m) => m.type === mood);

  if (!moodOption) return null;

  const sizeConfig = {
    small: { container: 28, emoji: 16 },
    medium: { container: 36, emoji: 20 },
  };

  const config = sizeConfig[size];

  return (
    <View style={[styles.badgeContainer, style]}>
      <View
        style={[
          styles.badge,
          {
            width: config.container,
            height: config.container,
            borderRadius: config.container / 2,
            backgroundColor: `${moodOption.color}25`,
          },
        ]}
      >
        <Text style={{ fontSize: config.emoji }}>{moodOption.emoji}</Text>
      </View>
      {showLabel && (
        <Text
          variant="labelSmall"
          style={[styles.badgeLabel, { color: moodOption.color }]}
        >
          {moodOption.label}
        </Text>
      )}
    </View>
  );
}

// Stress level selector (1-5 scale with colors)
interface StressLevelSelectorProps {
  selectedLevel?: number;
  onLevelSelect: (level: number) => void;
  style?: ViewStyle;
}

export function StressLevelSelector({
  selectedLevel,
  onLevelSelect,
  style,
}: StressLevelSelectorProps) {
  const { colors } = useTheme();

  const levels = [
    { level: 1, label: 'Very Low', color: themeColors.stressScale[0] },
    { level: 2, label: 'Low', color: themeColors.stressScale[1] },
    { level: 3, label: 'Moderate', color: themeColors.stressScale[2] },
    { level: 4, label: 'High', color: themeColors.stressScale[3] },
    { level: 5, label: 'Very High', color: themeColors.stressScale[4] },
  ];

  return (
    <View style={[styles.stressContainer, style]}>
      <View style={styles.stressBar}>
        {levels.map((item, index) => {
          const isSelected = selectedLevel === item.level;
          return (
            <TouchableOpacity
              key={item.level}
              onPress={() => onLevelSelect(item.level)}
              activeOpacity={0.7}
              style={[
                styles.stressSegment,
                {
                  flex: 1,
                  backgroundColor: isSelected
                    ? item.color
                    : `${item.color}40`,
                  borderTopLeftRadius: index === 0 ? 8 : 0,
                  borderBottomLeftRadius: index === 0 ? 8 : 0,
                  borderTopRightRadius: index === levels.length - 1 ? 8 : 0,
                  borderBottomRightRadius: index === levels.length - 1 ? 8 : 0,
                  transform: isSelected ? [{ scale: 1.1 }] : [],
                  zIndex: isSelected ? 1 : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.stressLevel,
                  { color: isSelected ? '#FFFFFF' : colors.text },
                ]}
              >
                {item.level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {selectedLevel && (
        <Text
          variant="bodyMedium"
          style={[styles.stressLabel, { color: levels[selectedLevel - 1].color }]}
        >
          {levels[selectedLevel - 1].label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodButton: {
    alignItems: 'center',
  },
  moodCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodLabel: {
    marginTop: 6,
    fontSize: 11,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeLabel: {
    marginLeft: 6,
    fontWeight: '500',
  },
  stressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  stressBar: {
    flexDirection: 'row',
    width: '100%',
    height: 44,
    borderRadius: 8,
    overflow: 'visible',
  },
  stressSegment: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
  },
  stressLevel: {
    fontSize: 16,
    fontWeight: '600',
  },
  stressLabel: {
    marginTop: 12,
    fontWeight: '600',
  },
});

export default MoodSelector;
