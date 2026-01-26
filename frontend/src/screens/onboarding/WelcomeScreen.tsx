import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, colors as themeColors } from '../../context/ThemeContext';

interface WelcomeScreenProps {
  onNext: () => void;
}

const { width } = Dimensions.get('window');

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* App icon/logo */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${themeColors.primary.main}20` },
          ]}
        >
          <MaterialCommunityIcons
            name="heart-pulse"
            size={80}
            color={themeColors.primary.main}
          />
        </View>

        {/* Title */}
        <Text variant="displaySmall" style={[styles.title, { color: colors.text }]}>
          Welcome to{'\n'}Health Log
        </Text>

        {/* Subtitle */}
        <Text
          variant="bodyLarge"
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          Your personal health companion for tracking wellness, mindfulness, and daily activities.
        </Text>

        {/* Features list */}
        <View style={styles.features}>
          {[
            { icon: 'heart', text: 'Track vital health metrics' },
            { icon: 'meditation', text: 'Practice mindfulness' },
            { icon: 'run', text: 'Monitor daily activity' },
            { icon: 'chart-line', text: 'Visualize your progress' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: `${themeColors.primary.main}15` },
                ]}
              >
                <MaterialCommunityIcons
                  name={feature.icon}
                  size={20}
                  color={themeColors.primary.main}
                />
              </View>
              <Text
                variant="bodyMedium"
                style={[styles.featureText, { color: colors.text }]}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={onNext}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor={themeColors.primary.main}
        >
          Get Started
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 42,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  features: {
    width: '100%',
    maxWidth: 300,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 20,
  },
  button: {
    borderRadius: 28,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default WelcomeScreen;
