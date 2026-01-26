import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Card, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

export type MetricStatus = 'normal' | 'warning' | 'critical' | 'low' | 'elevated';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  status?: MetricStatus;
  onPress?: () => void;
  progress?: number; // 0-100
  progressColor?: string;
  showProgressBar?: boolean;
  lastUpdated?: Date | number;
  style?: ViewStyle;
  compact?: boolean;
}

const STATUS_COLORS = {
  normal: '#00D68F',
  warning: '#FFAA00',
  critical: '#FF3D71',
  low: '#3498DB',
  elevated: '#F39C12',
};

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  iconColor,
  status,
  onPress,
  progress,
  progressColor,
  showProgressBar = false,
  lastUpdated,
  style,
  compact = false,
}: MetricCardProps) {
  const { colors, isDark } = useTheme();

  const statusColor = status ? STATUS_COLORS[status] : undefined;
  const finalIconColor = iconColor || (isDark ? '#A29BFE' : '#6C5CE7');

  const formatLastUpdated = (date: Date | number) => {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper onPress={onPress} activeOpacity={0.7} style={[styles.wrapper, style]}>
      <Card
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: statusColor || colors.border,
            borderWidth: status ? 1 : 0,
          },
          compact && styles.cardCompact,
        ]}
      >
        <Card.Content style={[styles.content, compact && styles.contentCompact]}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${finalIconColor}20` }]}>
              <MaterialCommunityIcons name={icon} size={compact ? 18 : 22} color={finalIconColor} />
            </View>
            <Text
              variant={compact ? 'labelSmall' : 'labelMedium'}
              style={[styles.title, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>

          <View style={styles.valueContainer}>
            <Text
              variant={compact ? 'titleLarge' : 'headlineSmall'}
              style={[styles.value, { color: statusColor || colors.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {value}
            </Text>
            {unit && (
              <Text
                variant="bodySmall"
                style={[styles.unit, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {unit}
              </Text>
            )}
          </View>

          {showProgressBar && progress !== undefined && (
            <View style={[styles.progressContainer, { backgroundColor: colors.divider }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                    backgroundColor: progressColor || finalIconColor,
                  },
                ]}
              />
            </View>
          )}

          {(subtitle || lastUpdated) && (
            <View style={styles.footer}>
              {subtitle && (
                <Text
                  variant="labelSmall"
                  style={[styles.subtitle, { color: colors.textMuted }]}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
              {lastUpdated && (
                <Text
                  variant="labelSmall"
                  style={[styles.timestamp, { color: colors.textMuted }]}
                  numberOfLines={1}
                >
                  {formatLastUpdated(lastUpdated)}
                </Text>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 140,
  },
  card: {
    borderRadius: 16,
    elevation: 0,
    flex: 1,
  },
  cardCompact: {
    borderRadius: 12,
  },
  content: {
    padding: 14,
  },
  contentCompact: {
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
    flexWrap: 'nowrap',
  },
  value: {
    fontWeight: '700',
    flexShrink: 1,
  },
  unit: {
    marginLeft: 4,
    flexShrink: 0,
  },
  progressContainer: {
    height: 5,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'column',
    gap: 2,
  },
  subtitle: {
    fontSize: 11,
  },
  timestamp: {
    fontSize: 10,
  },
});

export default MetricCard;
