import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStoredProgress, wrapStoredValue } from '../src/utils/storageValidation.ts';

test('parseStoredProgress aceita progresso legado e versionado', () => {
  const progress = {
    consumedMl: 500,
    drinks: [{ id: 'a', amount: 500, timestamp: '2026-03-03T08:00:00.000Z' }],
    streak: 2,
    lastDrinkDate: '2026-03-03',
    dayHistory: [{ date: '2026-03-02', consumedMl: 1200 }],
    bestDay: { date: '2026-03-02', consumedMl: 1200 },
  };

  assert.deepEqual(parseStoredProgress(progress), progress);
  assert.deepEqual(parseStoredProgress(wrapStoredValue(progress)), progress);
});

test('parseStoredProgress rejeita drinks invalidos', () => {
  const invalid = parseStoredProgress({
    consumedMl: 500,
    drinks: [{ id: '', amount: 500, timestamp: '2026-03-03T08:00:00.000Z' }],
    streak: 2,
    lastDrinkDate: '2026-03-03',
  });

  assert.equal(invalid, null);
});
