import test from 'node:test';
import assert from 'node:assert/strict';
import { hasCompleteUserConfig } from '../src/utils/configValidation.ts';

test('hasCompleteUserConfig retorna false para null e config parcial', () => {
  assert.equal(hasCompleteUserConfig(null), false);
  assert.equal(
    hasCompleteUserConfig({
      weight: 70,
      mode: 'auto',
    }),
    false
  );
});

test('hasCompleteUserConfig retorna true para config completa valida', () => {
  assert.equal(
    hasCompleteUserConfig({
      weight: 70,
      startTime: '08:00',
      endTime: '22:00',
      intervalMinutes: 60,
      dailyGoalMl: 2450,
      notificationsEnabled: true,
      mode: 'auto',
      manualCupSize: 500,
    }),
    true
  );
});
