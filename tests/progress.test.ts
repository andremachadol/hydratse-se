import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateNextStreak, normalizeProgressForToday } from '../src/utils/progress.ts';
import type { DayProgress } from '../src/types/index.ts';

const sampleProgress: DayProgress = {
  consumedMl: 1200,
  drinks: [
    { id: '1', amount: 300, timestamp: '2026-03-02T09:00:00.000Z' },
    { id: '2', amount: 900, timestamp: '2026-03-02T12:00:00.000Z' },
  ],
  streak: 4,
  lastDrinkDate: '2026-03-02',
  goalOverrideMl: 1500,
  goalOverrideDate: '2026-03-02',
};

test('normalizeProgressForToday mantem dados quando ja e hoje', () => {
  const normalized = normalizeProgressForToday(sampleProgress, '2026-03-02');
  assert.strictEqual(normalized, sampleProgress);
});

test('normalizeProgressForToday zera consumo e drinks quando dia mudou', () => {
  const normalized = normalizeProgressForToday(sampleProgress, '2026-03-03');

  assert.equal(normalized.consumedMl, 0);
  assert.deepEqual(normalized.drinks, []);
  assert.equal(normalized.streak, 4);
  assert.equal(normalized.lastDrinkDate, '2026-03-02');
  assert.equal(normalized.goalOverrideMl, undefined);
  assert.equal(normalized.goalOverrideDate, undefined);
});

test('normalizeProgressForToday mantem override valido de hoje', () => {
  const lateStartProgress: DayProgress = {
    consumedMl: 0,
    drinks: [],
    streak: 1,
    lastDrinkDate: '',
    goalOverrideMl: 1000,
    goalOverrideDate: '2026-03-03',
  };
  const normalized = normalizeProgressForToday(lateStartProgress, '2026-03-03');

  assert.equal(normalized.goalOverrideMl, 1000);
  assert.equal(normalized.goalOverrideDate, '2026-03-03');
});

test('calculateNextStreak incrementa quando ultimo registro e ontem', () => {
  const nextStreak = calculateNextStreak(4, '2026-03-02', '2026-03-03', '2026-03-02');
  assert.equal(nextStreak, 5);
});

test('calculateNextStreak reseta para 1 quando ha gap de dias', () => {
  const nextStreak = calculateNextStreak(4, '2026-02-28', '2026-03-03', '2026-03-02');
  assert.equal(nextStreak, 1);
});

test('calculateNextStreak mantem valor quando ja registrou hoje', () => {
  const nextStreak = calculateNextStreak(4, '2026-03-03', '2026-03-03', '2026-03-02');
  assert.equal(nextStreak, 4);
});
