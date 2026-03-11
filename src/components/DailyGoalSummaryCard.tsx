import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import type { UserConfig } from '../types/index.ts';
import { formatMl } from '../utils/homePresentation.ts';

interface DailyGoalSummaryCardProps {
  config: Pick<UserConfig, 'startTime' | 'endTime' | 'intervalMinutes'>;
  todayGoalMl: number;
  consumedMl: number;
  goalReached: boolean;
  goalStatusLabel: string;
  isExpanded: boolean;
  onOpenSettings: () => void;
}

export default function DailyGoalSummaryCard({
  config,
  todayGoalMl,
  consumedMl,
  goalReached,
  goalStatusLabel,
  isExpanded,
  onOpenSettings,
}: DailyGoalSummaryCardProps) {
  const remainingMl = Math.max(todayGoalMl - consumedMl, 0);
  const routineItems = [
    { label: 'Início', value: config.startTime },
    { label: 'Fim', value: config.endTime },
    { label: 'Intervalo', value: `${config.intervalMinutes} min` },
  ];

  return (
    <TouchableOpacity
      onPress={onOpenSettings}
      activeOpacity={0.9}
      style={[styles.goalCard, !isExpanded && styles.goalCardStacked]}
      accessibilityLabel={`Meta do dia: ${todayGoalMl} mililitros. Toque para abrir configurações`}
      accessibilityRole="button"
    >
      <View style={styles.goalCardTop}>
        <View>
          <Text style={styles.goalEyebrow}>Rotina ativa</Text>
          <Text style={styles.goalLabel}>Meta do dia</Text>
        </View>
        <View style={[styles.goalStatusBadge, goalReached && styles.goalStatusBadgeDone]}>
          <Text style={[styles.goalStatusText, goalReached && styles.goalStatusTextDone]}>
            {goalStatusLabel}
          </Text>
        </View>
      </View>

      <Text style={styles.goalValue}>{formatMl(todayGoalMl)}</Text>
      <Text style={styles.goalSupport}>
        {goalReached
          ? `Você encerrou o dia com ${formatMl(consumedMl)} registrados.`
          : `${formatMl(consumedMl)} consumidos e ${formatMl(remainingMl)} restantes hoje.`}
      </Text>

      <View style={styles.detailGrid}>
        {routineItems.map((item, index) => (
          <View
            key={item.label}
            style={[
              styles.detailItem,
              isExpanded && styles.detailItemExpanded,
              !isExpanded && index === routineItems.length - 1 && styles.detailItemWide,
            ]}
          >
            <Text style={styles.detailLabel}>{item.label}</Text>
            <Text style={styles.detailValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.goalFooter}>
        <Text style={styles.goalHint}>Toque para ajustar horários, meta e lembretes</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  goalCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    ...SHADOWS.medium,
  },
  goalCardStacked: {
    marginTop: 12,
  },
  goalCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  goalEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.primary,
    marginBottom: 4,
  },
  goalStatusBadge: {
    backgroundColor: COLORS.surfacePrimary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  goalStatusBadgeDone: {
    backgroundColor: COLORS.surfaceSuccess,
  },
  goalStatusText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  goalStatusTextDone: {
    color: COLORS.success,
  },
  goalLabel: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  goalValue: {
    marginTop: 10,
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  goalSupport: {
    marginTop: 10,
    color: COLORS.textLight,
    fontSize: 14,
    lineHeight: 20,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  detailItem: {
    width: '48%',
    minHeight: 78,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailItemExpanded: {
    width: '31.8%',
  },
  detailItemWide: {
    width: '100%',
  },
  detailLabel: {
    color: COLORS.textLight,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailValue: {
    marginTop: 10,
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: '800',
  },
  goalFooter: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  goalHint: {
    color: COLORS.textLight,
    fontSize: 13,
    fontWeight: '600',
  },
});
