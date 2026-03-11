import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import type { UserConfig } from '../types/index.ts';
import { formatMl } from '../utils/homePresentation.ts';

interface HomeGoalCardProps {
  config: Pick<UserConfig, 'startTime' | 'endTime' | 'intervalMinutes'>;
  todayGoalMl: number;
  consumedMl: number;
  goalReached: boolean;
  goalStatusLabel: string;
  isExpanded: boolean;
  onOpenSettings: () => void;
}

export default function HomeGoalCard({
  config,
  todayGoalMl,
  consumedMl,
  goalReached,
  goalStatusLabel,
  isExpanded,
  onOpenSettings,
}: HomeGoalCardProps) {
  return (
    <TouchableOpacity
      onPress={onOpenSettings}
      style={[styles.goalCard, !isExpanded && styles.goalCardStacked]}
      accessibilityLabel={`Meta do dia: ${todayGoalMl} mililitros. Toque para abrir configurações`}
      accessibilityRole="button"
    >
      <View style={styles.goalCardTop}>
        <Text style={styles.goalEyebrow}>Hoje</Text>
        <View style={[styles.goalStatusBadge, goalReached && styles.goalStatusBadgeDone]}>
          <Text style={[styles.goalStatusText, goalReached && styles.goalStatusTextDone]}>
            {goalStatusLabel}
          </Text>
        </View>
      </View>
      <Text style={styles.goalLabel}>Meta do dia</Text>
      <Text style={styles.goalValue}>{formatMl(todayGoalMl)}</Text>
      <View style={styles.goalMetaRow}>
        <Text style={styles.goalMetaText}>{formatMl(consumedMl)} consumidos</Text>
        <Text style={styles.goalMetaDivider}>•</Text>
        <Text style={styles.goalMetaText}>
          {config.startTime} às {config.endTime}
        </Text>
        <Text style={styles.goalMetaDivider}>•</Text>
        <Text style={styles.goalMetaText}>{config.intervalMinutes} min</Text>
      </View>
      <Text style={styles.goalHint}>Toque para ajustar lembretes e horários</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  goalCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    ...SHADOWS.medium,
  },
  goalCardStacked: {
    marginTop: 12,
  },
  goalCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.primary,
  },
  goalStatusBadge: {
    backgroundColor: '#E7F8FC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  goalStatusBadgeDone: {
    backgroundColor: '#E6FBF3',
  },
  goalStatusText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  goalStatusTextDone: {
    color: '#127A55',
  },
  goalLabel: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  goalValue: {
    marginTop: 4,
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  goalMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  goalMetaText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  goalMetaDivider: {
    color: COLORS.border,
    fontSize: 12,
  },
  goalHint: {
    marginTop: 10,
    color: COLORS.textLight,
    fontSize: 12,
  },
});
