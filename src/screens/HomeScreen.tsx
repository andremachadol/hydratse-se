import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AmbientBackdrop from '../components/AmbientBackdrop';
import DailyGoalSummaryCard from '../components/DailyGoalSummaryCard';
import HistoryInsightsCard from '../components/HistoryInsightsCard';
import RoutineSettingsSheet from '../components/RoutineSettingsSheet';
import HomeActionSection from '../components/HomeActionSection';
import HomeHeader from '../components/HomeHeader';
import { COLORS } from '../constants/theme';
import { type HistoryPeriod, useHomeDashboard } from '../hooks/useHomeDashboard';
import { useWaterTracker } from '../hooks/useWaterTracker';
import { formatLongDate } from '../utils/homePresentation';

const COMPACT_MAX_WIDTH = 460;
const MEDIUM_MAX_WIDTH = 760;
const EXPANDED_MAX_WIDTH = 1120;

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
  const shellMaxWidth = isExpanded
    ? EXPANDED_MAX_WIDTH
    : isMedium
      ? MEDIUM_MAX_WIDTH
      : COMPACT_MAX_WIDTH;
  const ringSize = isExpanded ? 300 : isMedium ? 270 : 240;
  const dashboard = useHomeDashboard({
    progress,
    todayGoalMl,
    goalReached,
    historyPeriod,
  });
  const remainingMl = Math.max(todayGoalMl - progress.consumedMl, 0);

  if (isLoading) {
    return (
      <LinearGradient colors={COLORS.backgroundGradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </LinearGradient>
    );
  }

  const detailsSection = (
    <View style={[styles.secondaryColumn, isExpanded && styles.secondaryColumnExpanded]}>
      <DailyGoalSummaryCard
        config={config}
        todayGoalMl={todayGoalMl}
        consumedMl={progress.consumedMl}
        goalReached={goalReached}
        goalStatusLabel={dashboard.goalStatusLabel}
        isExpanded={isExpanded}
        onOpenSettings={() => setModalVisible(true)}
      />
      <HistoryInsightsCard
        isExpanded={isExpanded}
        historyPeriod={historyPeriod}
        historySummary={dashboard.historySummary}
        historyEntries={dashboard.historyEntries}
        bestDay={progress.bestDay}
        bestDayLabel={dashboard.bestDayLabel}
        todayDate={dashboard.todayDate}
        historyReferenceMl={dashboard.historyReferenceMl}
        historyHighlights={dashboard.historyHighlights}
        onChangePeriod={setHistoryPeriod}
      />
    </View>
  );

  return (
    <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
      <AmbientBackdrop variant="home" />
      <StatusBar style="dark" />

      <HomeHeader
        streak={progress.streak}
        dateLabel={formatLongDate(dashboard.todayDate)}
        isExpanded={isExpanded}
        onOpenSettings={() => setModalVisible(true)}
      />

      <View style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.screenShell,
              { maxWidth: shellMaxWidth },
              isExpanded && styles.screenShellExpanded,
            ]}
          >
            {isExpanded ? (
              <View style={styles.expandedLayout}>
                <HomeActionSection
                  consumedMl={progress.consumedMl}
                  todayGoalMl={todayGoalMl}
                  percentage={dashboard.percentage}
                  ringSize={ringSize}
                  remainingMl={remainingMl}
                  drinkCount={progress.drinks.length}
                  drinkSize={nextDrinkAmount}
                  goalReached={goalReached}
                  hasHistory={progress.drinks.length > 0}
                  isExpanded={isExpanded}
                  onDrink={addDrink}
                  onUndo={undoLastDrink}
                  onReset={resetDay}
                />
                {detailsSection}
              </View>
            ) : (
              <>
                <HomeActionSection
                  consumedMl={progress.consumedMl}
                  todayGoalMl={todayGoalMl}
                  percentage={dashboard.percentage}
                  ringSize={ringSize}
                  remainingMl={remainingMl}
                  drinkCount={progress.drinks.length}
                  drinkSize={nextDrinkAmount}
                  goalReached={goalReached}
                  hasHistory={progress.drinks.length > 0}
                  isExpanded={isExpanded}
                  onDrink={addDrink}
                  onUndo={undoLastDrink}
                  onReset={resetDay}
                />
                {detailsSection}
              </>
            )}
          </View>
        </ScrollView>
      </View>

      <RoutineSettingsSheet
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
    position: 'relative',
  },
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
  secondaryColumn: {
    width: '100%',
    alignItems: 'stretch',
  },
  secondaryColumnExpanded: {
    flex: 1.08,
  },
});
