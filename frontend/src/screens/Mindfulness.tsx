import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, colors as themeColors } from '../context/ThemeContext';
import { useHealthData } from '../context/HealthDataContext';
import { MoodWeekView } from '../components/ui/WeekCalendar';
import { MoodSelector, MoodBadge, type MoodType } from '../components/ui/MoodSelector';
import { BreathingAnimation, type BreathingPattern } from '../components/mindfulness/BreathingAnimation';
import { format } from 'date-fns';

type ActivityType = 'breathing' | 'meditation' | 'mood';

export default function Mindfulness() {
  const { colors, isDark } = useTheme();
  const { moodEntries, addMood, getWeekMoods, getTodayMoods } = useHealthData();

  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [breathingPattern, setBreathingPattern] = useState<BreathingPattern>('relaxing');

  const weekMoods = getWeekMoods();
  const todayMoods = getTodayMoods();

  const handleSaveMood = async () => {
    if (selectedMood) {
      await addMood({
        timestamp: Date.now(),
        mood: selectedMood,
        note: moodNote.trim() || undefined,
      });
      setShowMoodModal(false);
      setSelectedMood(null);
      setMoodNote('');
    }
  };

  const activities = [
    {
      id: 'breathing' as ActivityType,
      icon: 'weather-windy',
      title: 'Breathing',
      subtitle: 'Guided breathing exercises',
      color: themeColors.accent.water,
    },
    {
      id: 'meditation' as ActivityType,
      icon: 'meditation',
      title: 'Meditation',
      subtitle: 'Calm your mind',
      color: themeColors.accent.sleep,
    },
    {
      id: 'mood' as ActivityType,
      icon: 'emoticon-outline',
      title: 'Log Mood',
      subtitle: 'Track how you feel',
      color: themeColors.mood.happy,
    },
  ];

  const breathingPatterns: { id: BreathingPattern; name: string; description: string }[] = [
    { id: 'relaxing', name: '4-7-8 Relaxing', description: 'Deep relaxation' },
    { id: 'energizing', name: 'Box Breathing', description: 'Increase alertness' },
    { id: 'balancing', name: 'Square Breath', description: 'Balance & focus' },
    { id: 'calming', name: 'Calming Breath', description: 'Reduce anxiety' },
  ];

  if (selectedActivity === 'breathing') {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setSelectedActivity(null)}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text variant="titleLarge" style={{ color: colors.text }}>
            Breathing Exercises
          </Text>
        </View>

        {/* Pattern selector */}
        <View style={styles.patternSelector}>
          {breathingPatterns.map((pattern) => (
            <TouchableOpacity
              key={pattern.id}
              onPress={() => setBreathingPattern(pattern.id)}
              style={[
                styles.patternChip,
                {
                  backgroundColor:
                    breathingPattern === pattern.id
                      ? themeColors.primary.main
                      : colors.surfaceElevated,
                },
              ]}
            >
              <Text
                variant="labelMedium"
                style={{
                  color: breathingPattern === pattern.id ? '#FFFFFF' : colors.text,
                }}
              >
                {pattern.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <BreathingAnimation
          pattern={breathingPattern}
          duration={3}
          onComplete={() => console.log('Session complete')}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
        Mindfulness
      </Text>

      {/* Week mood overview */}
      <MoodWeekView weekMoods={weekMoods} style={styles.weekView} />

      {/* Quick log mood button */}
      <Card
        style={[styles.quickMoodCard, { backgroundColor: colors.card }]}
        onPress={() => setShowMoodModal(true)}
      >
        <Card.Content style={styles.quickMoodContent}>
          <View>
            <Text variant="titleMedium" style={{ color: colors.text }}>
              How are you feeling?
            </Text>
            <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
              {todayMoods.length > 0
                ? `${todayMoods.length} entries today`
                : 'Log your first mood today'}
            </Text>
          </View>
          <View
            style={[
              styles.addMoodButton,
              { backgroundColor: `${themeColors.primary.main}20` },
            ]}
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={themeColors.primary.main}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Activities */}
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: colors.text }]}
      >
        Activities
      </Text>

      <View style={styles.activitiesGrid}>
        {activities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            onPress={() => {
              if (activity.id === 'mood') {
                setShowMoodModal(true);
              } else {
                setSelectedActivity(activity.id);
              }
            }}
            activeOpacity={0.7}
            style={styles.activityCardWrapper}
          >
            <Card style={[styles.activityCard, { backgroundColor: colors.card }]}>
              <Card.Content style={styles.activityContent}>
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: `${activity.color}20` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={activity.icon}
                    size={28}
                    color={activity.color}
                  />
                </View>
                <Text
                  variant="titleSmall"
                  style={[styles.activityTitle, { color: colors.text }]}
                >
                  {activity.title}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: colors.textSecondary }}
                >
                  {activity.subtitle}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent mood entries */}
      {moodEntries.length > 0 && (
        <>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: colors.text }]}
          >
            Recent Moods
          </Text>

          {moodEntries.slice(0, 5).map((entry) => (
            <Card
              key={entry.id}
              style={[styles.moodEntryCard, { backgroundColor: colors.card }]}
            >
              <Card.Content style={styles.moodEntryContent}>
                <MoodBadge mood={entry.mood} size="medium" />
                <View style={styles.moodEntryText}>
                  <Text variant="bodyMedium" style={{ color: colors.text }}>
                    {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                    {format(entry.timestamp, 'MMM d, h:mm a')}
                  </Text>
                </View>
                {entry.note && (
                  <Text
                    variant="bodySmall"
                    style={[styles.moodNote, { color: colors.textMuted }]}
                    numberOfLines={1}
                  >
                    "{entry.note}"
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))}
        </>
      )}

      {/* Mood logging modal */}
      <Portal>
        <Modal
          visible={showMoodModal}
          onDismiss={() => setShowMoodModal(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text
            variant="titleLarge"
            style={[styles.modalTitle, { color: colors.text }]}
          >
            How are you feeling?
          </Text>

          <MoodSelector
            selectedMood={selectedMood || undefined}
            onMoodSelect={setSelectedMood}
            size="large"
            style={styles.moodSelector}
          />

          <TextInput
            mode="outlined"
            label="Add a note (optional)"
            value={moodNote}
            onChangeText={setMoodNote}
            multiline
            numberOfLines={3}
            style={styles.noteInput}
            outlineColor={colors.border}
            activeOutlineColor={themeColors.primary.main}
            textColor={colors.text}
          />

          <View style={styles.modalButtons}>
            <Button
              mode="text"
              onPress={() => setShowMoodModal(false)}
              textColor={colors.textSecondary}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveMood}
              disabled={!selectedMood}
              buttonColor={themeColors.primary.main}
            >
              Save Mood
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 20,
  },
  weekView: {
    marginBottom: 16,
  },
  quickMoodCard: {
    borderRadius: 16,
    marginBottom: 24,
  },
  quickMoodContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addMoodButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  activityCardWrapper: {
    width: '48%',
  },
  activityCard: {
    borderRadius: 16,
  },
  activityContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  moodEntryCard: {
    borderRadius: 12,
    marginBottom: 8,
  },
  moodEntryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEntryText: {
    marginLeft: 12,
    flex: 1,
  },
  moodNote: {
    maxWidth: 100,
    fontStyle: 'italic',
  },
  patternSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  patternChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modal: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
  },
  modalTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  moodSelector: {
    marginBottom: 20,
  },
  noteInput: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
