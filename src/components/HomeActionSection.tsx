import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import ActionControlsCard from './ActionControlsCard';
import HydrationInsightCard from './HydrationInsightCard';
import ProgressRing from './ProgressRing';
import { formatMl } from '../utils/homePresentation.ts';

interface HomeActionSectionProps {
  consumedMl: number;
  todayGoalMl: number;
  percentage: number;
  ringSize: number;
  remainingMl: number;
  drinkCount: number;
  drinkSize: number;
  goalReached: boolean;
  hasHistory: boolean;
  isExpanded: boolean;
  onDrink: () => Promise<void>;
  onUndo: () => Promise<void>;
  onReset: () => Promise<void>;
}

export default function HomeActionSection({
  consumedMl,
  todayGoalMl,
  percentage,
  ringSize,
  remainingMl,
  drinkCount,
  drinkSize,
  goalReached,
  hasHistory,
  isExpanded,
  onDrink,
  onUndo,
  onReset,
}: HomeActionSectionProps) {
  const remainingEntries =
    goalReached || remainingMl <= 0
      ? 0
      : Math.max(1, Math.ceil(remainingMl / Math.max(drinkSize, 1)));
  const heroTitle = goalReached ? 'Meta batida' : `Faltam ${formatMl(remainingMl)}`;
  const heroSubtitle = goalReached
    ? `Você registrou ${formatMl(consumedMl)} hoje. Agora vale manter um ritmo confortável.`
    : `${percentage}% da meta foi concluída. Mais ${remainingEntries} registro(s) sugeridos ajudam a fechar o dia.`;
  const summaryItems = [
    { label: 'Consumido', value: formatMl(consumedMl) },
    { label: 'Próximo', value: `+ ${drinkSize} ml` },
    { label: 'Registros', value: `${drinkCount}` },
  ];

  return (
    <View style={[styles.primaryColumn, isExpanded && styles.primaryColumnExpanded]}>
      <View style={styles.heroCard}>
        <View style={[styles.heroHeader, isExpanded && styles.heroHeaderExpanded]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Painel do dia</Text>
            <Text style={styles.heroTitle}>{heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
          </View>
          <View style={[styles.statusChip, goalReached && styles.statusChipDone]}>
            <Text style={[styles.statusChipText, goalReached && styles.statusChipTextDone]}>
              {goalReached ? 'Concluído' : 'Em curso'}
            </Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          {summaryItems.map((item) => (
            <View key={item.label} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text style={styles.metricValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View
          style={styles.progressWrap}
          accessibilityLabel={`Progresso: ${percentage}%, ${consumedMl} de ${todayGoalMl} mililitros`}
        >
          <ProgressRing
            consumed={consumedMl}
            goal={todayGoalMl}
            percentage={percentage}
            size={ringSize}
          />
        </View>

        <View style={styles.controlsWrap}>
          <ActionControlsCard
            onDrink={() => void onDrink()}
            onUndo={() => void onUndo()}
            onReset={() => void onReset()}
            drinkSize={drinkSize}
            goalReached={goalReached}
            hasHistory={hasHistory}
          />
        </View>
      </View>

      <HydrationInsightCard />
    </View>
  );
}

const styles = StyleSheet.create({
  primaryColumn: {
    width: '100%',
    alignItems: 'stretch',
  },
  primaryColumnExpanded: {
    flex: 0.92,
  },
  heroCard: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    ...SHADOWS.large,
  },
  heroHeader: {
    gap: 14,
  },
  heroHeaderExpanded: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroCopy: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.primary,
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textLight,
    maxWidth: 520,
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfacePrimary,
  },
  statusChipDone: {
    backgroundColor: COLORS.surfaceSuccess,
  },
  statusChipText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '800',
  },
  statusChipTextDone: {
    color: COLORS.success,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: 100,
    minHeight: 72,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  metricValue: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  progressWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    paddingVertical: 10,
  },
  controlsWrap: {
    width: '100%',
    marginTop: 16,
  },
});
