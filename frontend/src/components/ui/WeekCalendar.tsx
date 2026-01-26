import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme, colors as themeColors } from '../../context/ThemeContext';

interface DayData {
  date: Date;
  count?: number;
  isToday: boolean;
  isSelected: boolean;
}

interface WeekCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  entryCounts?: { [dateString: string]: number };
  style?: ViewStyle;
}

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function WeekCalendar({
  selectedDate,
  onDateSelect,
  entryCounts = {},
  style,
}: WeekCalendarProps) {
  const { colors } = useTheme();

  const getWeekDays = (): DayData[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((currentDayOfWeek + 6) % 7));

    const days: DayData[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      const dateString = date.toISOString().split('T')[0];
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate
        ? date.toDateString() === selectedDate.toDateString()
        : isToday;

      days.push({
        date,
        count: entryCounts[dateString],
        isToday,
        isSelected,
      });
    }

    return days;
  };

  const weekDays = getWeekDays();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }, style]}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={[styles.title, { color: colors.text }]}>
          This Week
        </Text>
        <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
          {weekDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
          {weekDays[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </View>

      <View style={styles.daysContainer}>
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onDateSelect?.(day.date)}
            activeOpacity={0.7}
            style={styles.dayWrapper}
          >
            <Text
              variant="labelSmall"
              style={[styles.dayLabel, { color: colors.textMuted }]}
            >
              {DAY_NAMES[index]}
            </Text>
            <View
              style={[
                styles.dayCircle,
                {
                  backgroundColor: day.isSelected
                    ? themeColors.primary.main
                    : day.isToday
                    ? `${themeColors.primary.main}30`
                    : 'transparent',
                  borderColor: day.isToday && !day.isSelected
                    ? themeColors.primary.main
                    : 'transparent',
                  borderWidth: day.isToday && !day.isSelected ? 2 : 0,
                },
              ]}
            >
              <Text
                variant="bodyLarge"
                style={[
                  styles.dayNumber,
                  {
                    color: day.isSelected
                      ? '#FFFFFF'
                      : day.isToday
                      ? themeColors.primary.main
                      : colors.text,
                    fontWeight: day.isToday || day.isSelected ? '600' : '400',
                  },
                ]}
              >
                {day.date.getDate()}
              </Text>
            </View>
            {day.count !== undefined && day.count > 0 && (
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: themeColors.accent.heart },
                ]}
              >
                <Text style={styles.countText}>{day.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Mood week view showing mood icons for each day
interface MoodWeekViewProps {
  weekMoods: { date: string; moods: { mood: string }[] }[];
  style?: ViewStyle;
}

const MOOD_EMOJIS: { [key: string]: string } = {
  happy: '😊',
  fine: '🙂',
  neutral: '😐',
  sad: '😔',
  stressed: '😰',
};

export function MoodWeekView({ weekMoods, style }: MoodWeekViewProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.moodWeekContainer, { backgroundColor: colors.card }, style]}>
      <Text variant="titleMedium" style={[styles.title, { color: colors.text }]}>
        Your Week
      </Text>

      <View style={styles.moodDaysContainer}>
        {weekMoods.map((dayData, index) => {
          const date = new Date(dayData.date);
          const isToday = new Date().toDateString() === date.toDateString();
          const latestMood = dayData.moods[0]?.mood;

          return (
            <View key={index} style={styles.moodDayWrapper}>
              <Text
                variant="labelSmall"
                style={[
                  styles.dayLabel,
                  {
                    color: isToday ? themeColors.primary.main : colors.textMuted,
                    fontWeight: isToday ? '600' : '400',
                  },
                ]}
              >
                {DAY_NAMES[index]}
              </Text>
              <View
                style={[
                  styles.moodCircle,
                  {
                    backgroundColor: latestMood
                      ? `${themeColors.mood[latestMood as keyof typeof themeColors.mood]}20`
                      : colors.surfaceElevated,
                    borderColor: isToday ? themeColors.primary.main : 'transparent',
                    borderWidth: isToday ? 2 : 0,
                  },
                ]}
              >
                {latestMood ? (
                  <Text style={styles.moodEmoji}>
                    {MOOD_EMOJIS[latestMood] || '•'}
                  </Text>
                ) : (
                  <Text style={[styles.noMood, { color: colors.textMuted }]}>–</Text>
                )}
              </View>
              {dayData.moods.length > 1 && (
                <View
                  style={[
                    styles.moodCountBadge,
                    { backgroundColor: themeColors.primary.main },
                  ]}
                >
                  <Text style={styles.moodCountText}>{dayData.moods.length}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    marginBottom: 8,
    fontSize: 12,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 16,
  },
  countBadge: {
    position: 'absolute',
    top: 24,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  // Mood week styles
  moodWeekContainer: {
    padding: 16,
    borderRadius: 16,
  },
  moodDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  moodDayWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  moodCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 22,
  },
  noMood: {
    fontSize: 18,
  },
  moodCountBadge: {
    position: 'absolute',
    top: 20,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
});

export default WeekCalendar;
