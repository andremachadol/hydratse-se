import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import DrinkControls from '../components/DrinkControls';
import HydrationTips from '../components/HydrationTips';
import ProgressRing from '../components/ProgressRing';
import SettingsModal from '../components/SettingsModal';
import { COLORS, SHADOWS } from '../constants/theme';
import { useWaterTracker } from '../hooks/useWaterTracker';
import { buildDisplayHistory, filterHistoryByPeriod, summarizeHistory } from '../utils/dayHistory';
import { getTodayDate } from '../utils/time';

const HISTORY_PERIODS = [7, 14, 30] as const;
const COMPACT_MAX_WIDTH = 460;
const MEDIUM_MAX_WIDTH = 760;
const EXPANDED_MAX_WIDTH = 1120;
type HistoryPeriod = (typeof HISTORY_PERIODS)[number];

const formatHistoryDate = (date: string): string => {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}`;
};

const formatMl = (value: number): string => {
  return `${value.toLocaleString('pt-BR')} ml`;
};

const getTrendCopy = (trend: 'up' | 'down' | 'stable', deltaMl: number) => {
  if (trend === 'up') {
    return {
      label: 'Subindo',
      caption: `+${Math.abs(deltaMl)} ml`,
    };
  }

  if (trend === 'down') {
    return {
      label: 'Caindo',
      caption: `-${Math.abs(deltaMl)} ml`,
    };
  }

  return {
    label: 'Estável',
    caption: 'Sem virada forte',
  };
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const {
    config,
    progress,
    todayGoalMl,
    nextDrinkAmount,
    goalReached,
    isLoading,
    saveConfig,
    addDrink,
    undoLastDrink,
    resetDay,
  } = useWaterTracker();
  const [modalVisible, setModalVisible] = useState(false);
  const [historyPeriod, setHistoryPeriod] = useState<HistoryPeriod>(7);
  const isExpanded = width >= 840;
  const isMedium = width >= 600 && width < 840;
  const shellMaxWidth = isExpanded ? EXPANDED_MAX_WIDTH : isMedium ? MEDIUM_MAX_WIDTH : COMPACT_MAX_WIDTH;
  const ringSize = isExpanded ? 300 : isMedium ? 270 : 240;

  const percentage = useMemo(() => {
    return todayGoalMl > 0 ? Math.round((progress.consumedMl / todayGoalMl) * 100) : 0;
  }, [progress.consumedMl, todayGoalMl]);

  const historyEntries = useMemo(() => {
    const today = getTodayDate();
    const consumedToday = progress.lastDrinkDate === today ? progress.consumedMl : 0;
    const displayHistory = buildDisplayHistory(progress.dayHistory, today, consumedToday);
    return filterHistoryByPeriod(displayHistory, today, historyPeriod);
  }, [progress.consumedMl, progress.dayHistory, progress.lastDrinkDate, historyPeriod]);

  const historySummary = useMemo(() => summarizeHistory(historyEntries, todayGoalMl), [historyEntries, todayGoalMl]);

  const trendCopy = useMemo(
    () => getTrendCopy(historySummary.trend, historySummary.trendDeltaMl),
    [historySummary.trend, historySummary.trendDeltaMl]
  );

  const historyReferenceMl = useMemo(() => {
    const reference = historyEntries.reduce((maxValue, entry) => Math.max(maxValue, entry.consumedMl), todayGoalMl);
    return Math.max(1, reference);
  }, [historyEntries, todayGoalMl]);

  const bestDayLabel = useMemo(() => {
    if (!progress.bestDay) return 'Nenhum dia registrado ainda';
    return `${formatHistoryDate(progress.bestDay.date)} • ${formatMl(progress.bestDay.consumedMl)}`;
  }, [progress.bestDay]);

  const historyHighlights = useMemo(
    () => [
      {
        label: 'Média',
        value: historySummary.trackedDays > 0 ? formatMl(historySummary.averageMl) : '—',
        caption: `${historySummary.trackedDays} dia(s) ativos`,
      },
      {
        label: 'Na meta atual',
        value: historySummary.trackedDays > 0 ? `${historySummary.goalHitDays}/${historySummary.trackedDays}` : '—',
        caption: historySummary.trackedDays > 0 ? `${historySummary.goalHitRate}% do período` : 'Sem base ainda',
      },
      {
        label: 'Tendência',
        value: trendCopy.label,
        caption: trendCopy.caption,
      },
      {
        label: 'Menor dia',
        value: historySummary.lowestDay ? formatMl(historySummary.lowestDay.consumedMl) : '—',
        caption: historySummary.lowestDay ? formatHistoryDate(historySummary.lowestDay.date) : 'Sem registros',
      },
    ],
    [historySummary, trendCopy]
  );

  if (isLoading) {
    return (
      <LinearGradient colors={COLORS.backgroundGradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </LinearGradient>
    );
  }

  const todayDate = getTodayDate();
  const goalStatusLabel = goalReached ? 'Meta concluída' : percentage >= 75 ? 'No ritmo' : 'Em andamento';
  const actionSection = (
    <View style={[styles.primaryColumn, isExpanded && styles.primaryColumnExpanded]}>
      <View
        style={styles.progressWrap}
        accessibilityLabel={`Progresso: ${percentage}%, ${progress.consumedMl} de ${todayGoalMl} mililitros`}
      >
        <ProgressRing consumed={progress.consumedMl} goal={todayGoalMl} percentage={percentage} size={ringSize} />
      </View>

      <View style={styles.controlsWrap}>
        <DrinkControls
          onDrink={addDrink}
          onUndo={undoLastDrink}
          onReset={resetDay}
          drinkSize={nextDrinkAmount}
          goalReached={goalReached}
          hasHistory={progress.drinks.length > 0}
        />
      </View>

      <HydrationTips />
    </View>
  );

  const detailsSection = (
    <View style={[styles.secondaryColumn, isExpanded && styles.secondaryColumnExpanded]}>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.goalCard, !isExpanded && styles.goalCardStacked]}
        accessibilityLabel={`Meta do dia: ${todayGoalMl} mililitros. Toque para abrir configurações`}
        accessibilityRole="button"
      >
        <View style={styles.goalCardTop}>
          <Text style={styles.goalEyebrow}>Hoje</Text>
          <View style={[styles.goalStatusBadge, goalReached && styles.goalStatusBadgeDone]}>
            <Text style={[styles.goalStatusText, goalReached && styles.goalStatusTextDone]}>{goalStatusLabel}</Text>
          </View>
        </View>
        <Text style={styles.goalLabel}>Meta do dia</Text>
        <Text style={styles.goalValue}>{formatMl(todayGoalMl)}</Text>
        <View style={styles.goalMetaRow}>
          <Text style={styles.goalMetaText}>{formatMl(progress.consumedMl)} consumidos</Text>
          <Text style={styles.goalMetaDivider}>•</Text>
          <Text style={styles.goalMetaText}>
            {config.startTime} às {config.endTime}
          </Text>
          <Text style={styles.goalMetaDivider}>•</Text>
          <Text style={styles.goalMetaText}>{config.intervalMinutes} min</Text>
        </View>
        <Text style={styles.goalHint}>Toque para ajustar lembretes e horários</Text>
      </TouchableOpacity>

      <View style={styles.historyCard}>
        <View style={[styles.historyHeader, isExpanded && styles.historyHeaderExpanded]}>
          <View style={styles.historyHeaderText}>
            <Text style={styles.historyTitle}>Histórico recente</Text>
            <Text style={styles.historySubtitle}>
              {historySummary.trackedDays > 0
                ? `${historySummary.trackedDays} dia(s) com registro neste filtro`
                : `Sem dados nos últimos ${historyPeriod} dias`}
            </Text>
          </View>
          <Text style={[styles.bestDaySummary, isExpanded && styles.bestDaySummaryExpanded]}>Melhor: {bestDayLabel}</Text>
        </View>

        <View style={styles.periodRow}>
          {HISTORY_PERIODS.map((period) => {
            const isSelected = historyPeriod === period;
            return (
              <TouchableOpacity
                key={period}
                style={[styles.periodButton, isSelected && styles.periodButtonActive]}
                onPress={() => setHistoryPeriod(period)}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar histórico para ${period} dias`}
              >
                <Text style={[styles.periodText, isSelected && styles.periodTextActive]}>{period}d</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {historyEntries.length === 0 ? (
          <Text style={styles.historyEmpty}>Nenhum registro apareceu nesta janela ainda.</Text>
        ) : (
          <>
            <View style={styles.summaryGrid}>
              {historyHighlights.map((item) => (
                <View key={item.label} style={[styles.summaryItem, isExpanded && styles.summaryItemExpanded]}>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                  <Text style={styles.summaryValue}>{item.value}</Text>
                  <Text style={styles.summaryCaption}>{item.caption}</Text>
                </View>
              ))}
            </View>

            <View style={styles.historyListHeader}>
              <Text style={styles.historyListTitle}>Linha do tempo</Text>
              <Text style={styles.historyListCaption}>Total no período: {formatMl(historySummary.totalMl)}</Text>
            </View>

            {historyEntries.map((entry) => {
              const isBestDay =
                progress.bestDay?.date === entry.date && progress.bestDay?.consumedMl === entry.consumedMl;
              const isToday = entry.date === todayDate;
              const fillWidth = `${Math.min(100, Math.round((entry.consumedMl / historyReferenceMl) * 100))}%` as const;

              return (
                <View key={entry.date} style={styles.historyRow}>
                  <View style={styles.historyRowTop}>
                    <Text style={styles.historyDate}>{isToday ? 'Hoje' : formatHistoryDate(entry.date)}</Text>
                    <View style={styles.historyValueWrap}>
                      {isBestDay ? <Text style={styles.bestDayBadge}>Melhor dia</Text> : null}
                      <Text style={styles.historyValue}>{formatMl(entry.consumedMl)}</Text>
                    </View>
                  </View>
                  <View style={styles.historyBarTrack}>
                    <View
                      style={[
                        styles.historyBarFill,
                        { width: fillWidth },
                        isToday && styles.historyBarFillToday,
                        isBestDay && styles.historyBarFillBest,
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.headerContainer}>
        <View style={styles.streakPill} accessibilityLabel={`Sequência de ${progress.streak} dias`}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.streakText}>{progress.streak}</Text>
        </View>
        <Text style={[styles.appName, isExpanded && styles.appNameExpanded]} accessibilityRole="header">
          Hidrate-se
        </Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setModalVisible(true)}
          accessibilityLabel="Abrir configurações"
          accessibilityRole="button"
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.screenShell, { maxWidth: shellMaxWidth }, isExpanded && styles.screenShellExpanded]}>
            {isExpanded ? (
              <View style={styles.expandedLayout}>
                {actionSection}
                {detailsSection}
              </View>
            ) : (
              <>
                {actionSection}
                {detailsSection}
              </>
            )}
          </View>
        </ScrollView>
      </View>

      <SettingsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={saveConfig}
        currentConfig={config}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 56,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  streakPill: {
    minWidth: 58,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.78)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    ...SHADOWS.small,
  },
  streakIcon: { fontSize: 18 },
  streakText: { fontSize: 15, fontWeight: '700', color: COLORS.secondary },
  appName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  appNameExpanded: {
    fontSize: 30,
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  settingsIcon: { fontSize: 21 },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 28,
  },
  screenShell: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  screenShellExpanded: {
    paddingHorizontal: 20,
  },
  expandedLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
  },
  primaryColumn: {
    width: '100%',
    alignItems: 'stretch',
  },
  primaryColumnExpanded: {
    flex: 0.92,
  },
  secondaryColumn: {
    width: '100%',
    alignItems: 'stretch',
  },
  secondaryColumnExpanded: {
    flex: 1.08,
  },
  progressWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  historyCard: {
    width: '100%',
    marginTop: 18,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...SHADOWS.small,
  },
  historyHeader: {
    gap: 6,
    marginBottom: 12,
  },
  historyHeaderExpanded: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyHeaderText: {
    gap: 4,
    flex: 1,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  historySubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  bestDaySummary: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  bestDaySummaryExpanded: {
    textAlign: 'right',
    maxWidth: '40%',
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  periodButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
  },
  periodButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E7F9FD',
  },
  periodText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '700',
  },
  periodTextActive: {
    color: COLORS.secondary,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  summaryItem: {
    width: '48%',
    minHeight: 92,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7F2F6',
  },
  summaryItemExpanded: {
    width: '23.5%',
  },
  summaryLabel: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    marginTop: 8,
    color: COLORS.secondary,
    fontSize: 20,
    fontWeight: '800',
  },
  summaryCaption: {
    marginTop: 6,
    color: COLORS.textLight,
    fontSize: 12,
  },
  historyListHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  historyListTitle: {
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: '800',
  },
  historyListCaption: {
    color: COLORS.textLight,
    fontSize: 12,
  },
  historyEmpty: {
    color: COLORS.textLight,
    fontSize: 13,
  },
  historyRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF4F7',
  },
  historyRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  historyDate: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  historyValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bestDayBadge: {
    fontSize: 11,
    color: COLORS.secondary,
    backgroundColor: '#DFF6FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontWeight: '700',
  },
  historyValue: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  historyBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: '#EAF2F5',
    overflow: 'hidden',
  },
  historyBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  historyBarFillToday: {
    backgroundColor: '#31C48D',
  },
  historyBarFillBest: {
    backgroundColor: COLORS.secondary,
  },
  controlsWrap: {
    width: '100%',
    marginTop: 2,
  },
});
