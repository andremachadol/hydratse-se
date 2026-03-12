import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AmbientBackdrop from '../components/AmbientBackdrop';
import DailyGoalSummaryCard from '../components/DailyGoalSummaryCard';
import HistoryInsightsCard from '../components/HistoryInsightsCard';
import RoutineSettingsSheet from '../components/RoutineSettingsSheet';
import HomeActionSection from '../components/HomeActionSection';
import HomeHeader from '../components/HomeHeader';
import { buildResetDayConfirmationDescriptor } from '../constants/interactionDescriptors.ts';
import { COLORS } from '../constants/theme';
import { useResponsiveShellLayout } from '../hooks/useResponsiveShellLayout';
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { useWaterTracker } from '../hooks/useWaterTracker';
import type { TrackerMutationResult } from '../types';
import { presentAppActionFeedback } from '../utils/appActionFeedback';
import type { HistoryPeriod } from '../utils/homeDashboard.ts';
import { formatLongDate } from '../utils/homePresentation';
import { showAlertAsync } from '../utils/showAlertAsync';
import { showConfirmAsync } from '../utils/showConfirmAsync';

const COMPACT_MAX_WIDTH = 460;
const MEDIUM_MAX_WIDTH = 760;
const EXPANDED_MAX_WIDTH = 1120;

export default function HomeScreen() {
  const layout = useResponsiveShellLayout({
    compactMaxWidth: COMPACT_MAX_WIDTH,
    mediumMaxWidth: MEDIUM_MAX_WIDTH,
    expandedMaxWidth: EXPANDED_MAX_WIDTH,
  });
  const {
    config,
    progress,
    todayGoalMl,
    nextDrinkAmount,
    goalReached,
    isLoading,
    resetDayPrompt,
    saveConfig,
    addDrink,
    undoLastDrink,
    resetDay,
  } = useWaterTracker();
  const [modalVisible, setModalVisible] = useState(false);
  const [historyPeriod, setHistoryPeriod] = useState<HistoryPeriod>(7);
  const ringSize = layout.tier === 'expanded' ? 300 : layout.tier === 'medium' ? 270 : 240;
  const dashboard = useHomeDashboard({
    progress,
    todayGoalMl,
    goalReached,
    historyPeriod,
  });
  const remainingMl = Math.max(todayGoalMl - progress.consumedMl, 0);

  const presentTrackerResult = useCallback(async (result: TrackerMutationResult) => {
    await presentAppActionFeedback(result, {
      presentDialog: showAlertAsync,
    });
  }, []);

  const handleAddDrink = useCallback(async () => {
    const result = await addDrink();
    await presentTrackerResult(result);
  }, [addDrink, presentTrackerResult]);

  const handleUndoLastDrink = useCallback(async () => {
    const result = await undoLastDrink();
    await presentTrackerResult(result);
  }, [presentTrackerResult, undoLastDrink]);

  const handleResetConfirmed = useCallback(async () => {
    const result = await resetDay();
    await presentTrackerResult(result);
  }, [presentTrackerResult, resetDay]);

  const handleResetDay = useCallback(async () => {
    const confirmed = await showConfirmAsync(buildResetDayConfirmationDescriptor(resetDayPrompt));

    if (confirmed) {
      await handleResetConfirmed();
    }
  }, [handleResetConfirmed, resetDayPrompt]);

  if (isLoading) {
    return (
      <LinearGradient colors={COLORS.backgroundGradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </LinearGradient>
    );
  }

  const detailsSection = (
    <View style={[styles.secondaryColumn, layout.isExpanded && styles.secondaryColumnExpanded]}>
      <DailyGoalSummaryCard
        config={config}
        todayGoalMl={todayGoalMl}
        consumedMl={progress.consumedMl}
        goalReached={goalReached}
        goalStatusLabel={dashboard.goalStatusLabel}
        isExpanded={layout.isExpanded}
        onOpenSettings={() => setModalVisible(true)}
      />
      <HistoryInsightsCard
        isExpanded={layout.isExpanded}
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

  const actionSection = (
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
      isExpanded={layout.isExpanded}
      onDrink={handleAddDrink}
      onUndo={handleUndoLastDrink}
      onReset={async () => {
        await handleResetDay();
      }}
    />
  );

  return (
    <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
      <AmbientBackdrop variant="home" />
      <StatusBar style="dark" />

      <HomeHeader
        streak={progress.streak}
        dateLabel={formatLongDate(dashboard.todayDate)}
        isExpanded={layout.isExpanded}
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
              { maxWidth: layout.shellMaxWidth },
              layout.isExpanded && styles.screenShellExpanded,
            ]}
          >
            {layout.isExpanded ? (
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
