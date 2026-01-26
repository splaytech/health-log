import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, colors as themeColors } from '../../context/ThemeContext';

interface PillButtonProps {
  label: string;
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

export function PillButton({
  label,
  icon,
  selected = false,
  onPress,
  disabled = false,
  style,
  size = 'medium',
}: PillButtonProps) {
  const { colors, isDark } = useTheme();

  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      iconSize: 16,
      fontSize: 12,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      iconSize: 20,
      fontSize: 14,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      iconSize: 24,
      fontSize: 16,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          backgroundColor: selected
            ? themeColors.primary.main
            : colors.surfaceElevated,
          borderColor: selected
            ? themeColors.primary.main
            : colors.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={currentSize.iconSize}
          color={selected ? '#FFFFFF' : colors.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            fontSize: currentSize.fontSize,
            color: selected ? '#FFFFFF' : colors.text,
          },
        ]}
      >
        {label}
      </Text>
      {selected && (
        <MaterialCommunityIcons
          name="check"
          size={currentSize.iconSize}
          color="#FFFFFF"
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );
}

// Goal selection card for onboarding
interface GoalCardProps {
  title: string;
  description: string;
  icon: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function GoalCard({
  title,
  description,
  icon,
  selected = false,
  onPress,
  style,
}: GoalCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.goalCard,
        {
          backgroundColor: selected
            ? `${themeColors.primary.main}15`
            : colors.card,
          borderColor: selected
            ? themeColors.primary.main
            : colors.border,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.goalIconContainer,
          {
            backgroundColor: selected
              ? `${themeColors.primary.main}25`
              : colors.surfaceElevated,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={28}
          color={selected ? themeColors.primary.main : colors.textSecondary}
        />
      </View>
      <View style={styles.goalContent}>
        <Text
          variant="titleMedium"
          style={[
            styles.goalTitle,
            { color: selected ? themeColors.primary.main : colors.text },
          ]}
        >
          {title}
        </Text>
        <Text
          variant="bodySmall"
          style={[styles.goalDescription, { color: colors.textSecondary }]}
        >
          {description}
        </Text>
      </View>
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: selected
              ? themeColors.primary.main
              : 'transparent',
            borderColor: selected
              ? themeColors.primary.main
              : colors.border,
          },
        ]}
      >
        {selected && (
          <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    borderWidth: 1,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 8,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  goalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  goalDescription: {
    opacity: 0.8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});

export default PillButton;
