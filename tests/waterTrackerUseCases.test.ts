import test from 'node:test';
import assert from 'node:assert/strict';
import type { DayProgress, UserConfig } from '../src/types/index.ts';
import {
  createDefaultConfig,
  getSuggestedDrinkAmount,
  getTodayGoalMl,
  loadTrackerState,
  registerDrink,
} from '../src/utils/waterTrackerUseCases.ts';

const baseConfig: UserConfig = {
  weight: 70,
  startTime: '08:00',
  endTime: '10:00',
  intervalMinutes: 60,
  dailyGoalMl: 1800,
  notificationsEnabled: true,
  mode: 'auto',
  manualCupSize: 500,
};

test('loadTrackerState normaliza progresso e sinaliza persistencia', () => {
  const savedProgress: DayProgress = {
    consumedMl: 1200,
    drinks: [{ id: 'a', amount: 1200, timestamp: '2026-03-02T09:00:00.000Z' }],
    streak: 3,
    lastDrinkDate: '2026-03-02',
    dayHistory: [],
  };

  const loaded = loadTrackerState({
    savedConfig: { dailyGoalMl: 2100 },
    savedProgress,
    today: '2026-03-03',
    defaultConfig: createDefaultConfig(),
  });

  assert.equal(loaded.config.dailyGoalMl, 2100);
  assert.equal(loaded.progress.consumedMl, 0);
  assert.deepEqual(loaded.progress.dayHistory, [{ date: '2026-03-02', consumedMl: 1200 }]);
  assert.equal(loaded.shouldPersistProgress, true);
});

test('registerDrink sinaliza meta batida e melhor dia', () => {
  const progress: DayProgress = {
    consumedMl: 1500,
    drinks: [{ id: 'a', amount: 1500, timestamp: '2026-03-03T09:00:00.000Z' }],
    streak: 5,
    lastDrinkDate: '2026-03-03',
    dayHistory: [{ date: '2026-03-02', consumedMl: 1600 }],
    bestDay: { date: '2026-03-02', consumedMl: 1600 },
  };

  const result = registerDrink({
    progress,
    config: baseConfig,
    amountToDrink: 300,
    today: '2026-03-03',
    yesterday: '2026-03-02',
    timestamp: '2026-03-03T10:00:00.000Z',
  });

  assert.equal(result.activeGoalMl, 1800);
  assert.equal(result.newProgress.consumedMl, 1800);
  assert.equal(result.reachedGoalToday, true);
  assert.equal(result.bestDayEvent?.kind, 'surpassed');
});

test('getSuggestedDrinkAmount retorna zero quando a meta ja foi batida', () => {
  const progress: DayProgress = {
    consumedMl: 1800,
    drinks: [],
    streak: 1,
    lastDrinkDate: '2026-03-03',
  };

  assert.equal(getTodayGoalMl(baseConfig, progress, '2026-03-03'), 1800);
  assert.equal(getSuggestedDrinkAmount(baseConfig, progress, '2026-03-03'), 0);
});
