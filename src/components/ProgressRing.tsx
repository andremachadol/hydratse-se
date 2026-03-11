import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface ProgressRingProps {
  consumed: number;
  goal: number;
  percentage: number;
  size?: number;
}

function ProgressRing({ consumed, goal, percentage, size = 250 }: ProgressRingProps) {
  const strokeWidth = size >= 290 ? 22 : size <= 220 ? 18 : 20;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const visualPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (visualPercentage / 100) * circumference;
  const goalReached = percentage >= 100;
  const statusText = goalReached
    ? 'Meta concluída'
    : percentage >= 75
      ? 'Quase lá'
      : percentage >= 35
        ? 'Bom ritmo'
        : 'Começando';
  const percentageFontSize = size >= 290 ? 56 : size <= 220 ? 42 : 48;
  const amountFontSize = size >= 290 ? 16 : 15;
  const eyebrowFontSize = size <= 220 ? 11 : 12;

  return (
    <View style={styles.container}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={COLORS.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>

      <View style={styles.textContainer}>
        <Text style={[styles.eyebrow, { fontSize: eyebrowFontSize }]}>Hoje</Text>
        <Text
          style={[
            styles.percentageText,
            { fontSize: percentageFontSize },
            goalReached && styles.percentageTextDone,
          ]}
        >
          {percentage}%
        </Text>
        <Text style={[styles.amountText, { fontSize: amountFontSize }]}>
          {consumed} / {goal} ml
        </Text>
        <View style={[styles.statusPill, goalReached && styles.statusPillDone]}>
          <Text style={[styles.statusText, goalReached && styles.statusTextDone]}>
            {statusText}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  textContainer: { position: 'absolute', alignItems: 'center' },
  eyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  percentageText: { fontSize: 48, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
  percentageTextDone: {
    color: COLORS.secondary,
  },
  amountText: { fontSize: 15, color: COLORS.textLight, marginTop: 4 },
  statusPill: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E7F8FC',
  },
  statusPillDone: {
    backgroundColor: '#E6FBF3',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  statusTextDone: {
    color: '#127A55',
  },
});

export default memo(ProgressRing);
