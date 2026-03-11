import React from 'react';
import { StyleSheet, View } from 'react-native';
import DrinkControls from './DrinkControls';
import HydrationTips from './HydrationTips';
import ProgressRing from './ProgressRing';

interface HomeActionSectionProps {
  consumedMl: number;
  todayGoalMl: number;
  percentage: number;
  ringSize: number;
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
  drinkSize,
  goalReached,
  hasHistory,
  isExpanded,
  onDrink,
  onUndo,
  onReset,
}: HomeActionSectionProps) {
  return (
    <View style={[styles.primaryColumn, isExpanded && styles.primaryColumnExpanded]}>
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
        <DrinkControls
          onDrink={() => void onDrink()}
          onUndo={() => void onUndo()}
          onReset={() => void onReset()}
          drinkSize={drinkSize}
          goalReached={goalReached}
          hasHistory={hasHistory}
        />
      </View>

      <HydrationTips />
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
  progressWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsWrap: {
    width: '100%',
    marginTop: 2,
  },
});
