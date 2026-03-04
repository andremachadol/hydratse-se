import test from 'node:test';
import assert from 'node:assert/strict';
import type { DayProgress, UserConfig } from '../src/types/index.ts';
import {
  buildProgressAfterDrink,
  buildProgressAfterReset,
  buildProgressAfterUndo,
  calculateNextDrinkAmount,
} from '../src/utils/waterTrackerDomain.ts';

const autoConfig: UserConfig = {
  weight: 70,
  startTime: '08:00',
  endTime: '10:00',
  intervalMinutes: 60,
  dailyGoalMl: 2000,
  notificationsEnabled: true,
  mode: 'auto',
  manualCupSize: 500,
};

const manualConfig: UserConfig = {
  ...autoConfig,
  mode: 'manual',
  manualCupSize: 500,
};

test('calculateNextDrinkAmount no modo manual respeita copo e restante', () => {
  assert.equal(calculateNextDrinkAmount(manualConfig, 1000, 2000), 500);
  assert.equal(calculateNextDrinkAmount(manualConfig, 1900, 2000), 100);
  assert.equal(calculateNextDrinkAmount(manualConfig, 2200, 2000), 500);
});

test('calculateNextDrinkAmount no modo auto usa slots da janela', () => {
  assert.equal(calculateNextDrinkAmount(autoConfig, 0, 1800), 600);
  assert.equal(calculateNextDrinkAmount(autoConfig, 1700, 1800), 100);
});

test('buildProgressAfterDrink cria novo dia e atualiza streak', () => {
  const progress: DayProgress = {
    consumedMl: 1200,
    drinks: [{ id: 'a', amount: 1200, timestamp: '2026-03-02T09:00:00.000Z' }],
    streak: 3,
    lastDrinkDate: '2026-03-02',
    dayHistory: [],
  };

  const result = buildProgressAfterDrink(
    progress,
    { id: 'b', amount: 300, timestamp: '2026-03-03T08:00:00.000Z' },
    '2026-03-03',
    '2026-03-02'
  );

  assert.equal(result.isNewDay, true);
  assert.equal(result.newProgress.consumedMl, 300);
  assert.equal(result.newProgress.streak, 4);
  assert.equal(result.newProgress.drinks.length, 1);
  assert.deepEqual(result.newProgress.dayHistory, [{ date: '2026-03-02', consumedMl: 1200 }]);
  assert.deepEqual(result.newProgress.bestDay, { date: '2026-03-02', consumedMl: 1200 });
});

test('buildProgressAfterUndo retorna null sem historico', () => {
  const progress: DayProgress = {
    consumedMl: 0,
    drinks: [],
    streak: 0,
    lastDrinkDate: '',
  };

  assert.equal(buildProgressAfterUndo(progress), null);
});

test('buildProgressAfterUndo e buildProgressAfterReset atualizam estado', () => {
  const progress: DayProgress = {
    consumedMl: 800,
    drinks: [
      { id: 'a', amount: 300, timestamp: '2026-03-03T09:00:00.000Z' },
      { id: 'b', amount: 500, timestamp: '2026-03-03T10:00:00.000Z' },
    ],
    streak: 5,
    lastDrinkDate: '2026-03-03',
    dayHistory: [{ date: '2026-03-02', consumedMl: 1200 }],
    bestDay: { date: '2026-03-02', consumedMl: 1200 },
  };

  const undo = buildProgressAfterUndo(progress);
  assert.notEqual(undo, null);
  if (undo) {
    assert.equal(undo.newProgress.consumedMl, 300);
    assert.equal(undo.removedDrink.amount, 500);
    assert.deepEqual(undo.newProgress.bestDay, { date: '2026-03-02', consumedMl: 1200 });
  }

  const reset = buildProgressAfterReset(progress);
  assert.equal(reset.consumedMl, 0);
  assert.equal(reset.drinks.length, 0);
  assert.equal(reset.streak, 4);
  assert.deepEqual(reset.bestDay, { date: '2026-03-02', consumedMl: 1200 });
});
