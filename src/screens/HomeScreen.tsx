// src/screens/HomeScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import ProgressRing from '../components/ProgressRing';
import DrinkControls from '../components/DrinkControls';
import SettingsModal from '../components/SettingsModal';
import HydrationTips from '../components/HydrationTips';
import { COLORS, SHADOWS } from '../constants/theme';
import { useWaterTracker } from '../hooks/useWaterTracker';
import { buildDisplayHistory, filterHistoryByPeriod } from '../utils/dayHistory';
import { getTodayDate } from '../utils/time';

const ESPACO_TOPO_ANEL = 20;
const ESPACO_ANEL_META = 30;
const ESPACO_META_HISTORICO = 20;
const ESPACO_HISTORICO_DICA = 20;
const ESPACO_DICA_BOTAO = 30;
const HISTORY_PERIODS = [7, 14, 30] as const;
type HistoryPeriod = (typeof HISTORY_PERIODS)[number];

const formatHistoryDate = (date: string): string => {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}`;
};

export default function HomeScreen() {
  const { config, progress, todayGoalMl, nextDrinkAmount, goalReached, isLoading, saveConfig, addDrink, undoLastDrink, resetDay } =
    useWaterTracker();
  const [modalVisible, setModalVisible] = useState(false);
  const [historyPeriod, setHistoryPeriod] = useState<HistoryPeriod>(7);

  const percentage = useMemo(() => {
    return todayGoalMl > 0 ? Math.round((progress.consumedMl / todayGoalMl) * 100) : 0;
  }, [progress.consumedMl, todayGoalMl]);

  const historyEntries = useMemo(() => {
    const today = getTodayDate();
    const consumedToday = progress.lastDrinkDate === today ? progress.consumedMl : 0;
    const displayHistory = buildDisplayHistory(progress.dayHistory, today, consumedToday);
    return filterHistoryByPeriod(displayHistory, today, historyPeriod);
  }, [progress.dayHistory, progress.lastDrinkDate, progress.consumedMl, historyPeriod]);

  const bestDayLabel = useMemo(() => {
    if (!progress.bestDay) return 'Nenhum dia registrado ainda.';
    return `${formatHistoryDate(progress.bestDay.date)} - ${progress.bestDay.consumedMl} ml`;
  }, [progress.bestDay]);

  if (isLoading) {
    return (
      <LinearGradient colors={COLORS.backgroundGradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </LinearGradient>
    );
  }

  const todayDate = getTodayDate();

  return (
    <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.headerContainer}>
        <View style={styles.streakContainer} accessibilityLabel={`Sequencia de ${progress.streak} dias`}>
          <Text style={styles.streakIcon}>{'\u{1F525}'}</Text>
          <Text style={styles.streakText}>{progress.streak}</Text>
        </View>
        <Text style={styles.appName} accessibilityRole="header">
          {'Hydrate-Se \u{1F4A7}'}
        </Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setModalVisible(true)}
          accessibilityLabel="Abrir configuracoes"
          accessibilityRole="button"
        >
          <Text style={styles.settingsIcon}>{'\u2699\uFE0F'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View
            style={{ marginTop: ESPACO_TOPO_ANEL }}
            accessibilityLabel={`Progresso: ${percentage}%, ${progress.consumedMl} de ${todayGoalMl} mililitros`}
          >
            <ProgressRing consumed={progress.consumedMl} goal={todayGoalMl} percentage={percentage} />
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={[styles.metaContainer, { marginTop: ESPACO_ANEL_META }]}
            accessibilityLabel={`Meta do dia: ${todayGoalMl} mililitros. Toque para configurar`}
            accessibilityRole="button"
          >
            <Text style={styles.metaText}>Meta do Dia: {todayGoalMl}ml</Text>
            <Text style={styles.hintText}>Toque para configurar</Text>
          </TouchableOpacity>

          <View style={[styles.historyCard, { marginTop: ESPACO_META_HISTORICO }]}>
            <Text style={styles.historyTitle}>Historico de dias</Text>
            <Text style={styles.bestDaySummary}>Melhor dia: {bestDayLabel}</Text>
            <View style={styles.periodRow}>
              {HISTORY_PERIODS.map((period) => {
                const isSelected = historyPeriod === period;
                return (
                  <TouchableOpacity
                    key={period}
                    style={[styles.periodButton, isSelected && styles.periodButtonActive]}
                    onPress={() => setHistoryPeriod(period)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filtrar historico para ${period} dias`}
                  >
                    <Text style={[styles.periodText, isSelected && styles.periodTextActive]}>{period}d</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {historyEntries.length === 0 ? (
              <Text style={styles.historyEmpty}>Sem registros nos ultimos {historyPeriod} dias.</Text>
            ) : (
              historyEntries.map((entry) => {
                const isBestDay =
                  progress.bestDay?.date === entry.date && progress.bestDay?.consumedMl === entry.consumedMl;
                const isToday = entry.date === todayDate;

                return (
                  <View key={entry.date} style={styles.historyRow}>
                    <Text style={styles.historyDate}>{isToday ? 'Hoje' : formatHistoryDate(entry.date)}</Text>
                    <View style={styles.historyValueWrap}>
                      {isBestDay ? <Text style={styles.bestDayBadge}>Melhor dia</Text> : null}
                      <Text style={styles.historyValue}>{entry.consumedMl} ml</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View style={{ marginTop: ESPACO_HISTORICO_DICA, width: '100%' }}>
            <HydrationTips />
          </View>

          <View style={{ marginTop: ESPACO_DICA_BOTAO, width: '100%' }}>
            <DrinkControls
              onDrink={addDrink}
              onUndo={undoLastDrink}
              onReset={resetDay}
              drinkSize={nextDrinkAmount}
              goalReached={goalReached}
              hasHistory={progress.drinks.length > 0}
            />
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
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: '#FFF',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    height: 50,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  streakContainer: { width: 50, flexDirection: 'row', alignItems: 'center' },
  streakIcon: { fontSize: 20 },
  streakText: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary, marginLeft: 4 },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textAlign: 'center',
    flex: 1,
  },
  settingsButton: { width: 50, alignItems: 'flex-end' },
  settingsIcon: { fontSize: 26 },
  metaContainer: { alignItems: 'center', paddingHorizontal: 20 },
  metaText: { fontSize: 20, color: COLORS.secondary, fontWeight: '600', textAlign: 'center' },
  hintText: { fontSize: 12, color: COLORS.textLight, marginTop: 5, textAlign: 'center', opacity: 0.8 },

  historyCard: {
    width: '88%',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...SHADOWS.small,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  bestDaySummary: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  periodButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
  historyEmpty: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyDate: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '600',
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
});
