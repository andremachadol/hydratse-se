import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSafeGoalForRemainingWindow,
  isLateStartToday,
  resolveEffectiveDailyGoal,
} from '../src/utils/dailyGoal.ts';
import type { DayProgress } from '../src/types/index.ts';

test('resolveEffectiveDailyGoal usa override do dia quando disponivel', () => {
  const progress: DayProgress = {
    consumedMl: 0,
    drinks: [],
    streak: 0,
    lastDrinkDate: '',
    goalOverrideMl: 1100,
    goalOverrideDate: '2026-03-03',
  };
  const goal = resolveEffectiveDailyGoal(2500, progress, '2026-03-03');
  assert.equal(goal, 1100);
});

test('resolveEffectiveDailyGoal usa meta base quando override nao e do dia', () => {
  const progress: DayProgress = {
    consumedMl: 0,
    drinks: [],
    streak: 0,
    lastDrinkDate: '',
    goalOverrideMl: 1100,
    goalOverrideDate: '2026-03-02',
  };
  const goal = resolveEffectiveDailyGoal(2500, progress, '2026-03-03');
  assert.equal(goal, 2500);
});

test('isLateStartToday detecta inicio tardio dentro da janela', () => {
  assert.equal(isLateStartToday(607, 480, 1020), true);
  assert.equal(isLateStartToday(470, 480, 1020), false);
  assert.equal(isLateStartToday(1020, 480, 1020), false);
});

test('calculateSafeGoalForRemainingWindow aplica limite por hora e arredondamento seguro', () => {
  const goal = calculateSafeGoalForRemainingWindow(3000, 960, 1020, 500);
  assert.equal(goal, 500);
});
