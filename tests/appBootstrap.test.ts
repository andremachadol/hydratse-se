import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveStoredConfigPresence } from '../src/application/appBootstrap.ts';

test('resolveStoredConfigPresence retorna true quando ha config completa', async () => {
  const result = await resolveStoredConfigPresence({
    loadConfig: async () => ({
      weight: 70,
      startTime: '08:00',
      endTime: '22:00',
      intervalMinutes: 60,
      dailyGoalMl: 2450,
      notificationsEnabled: true,
      mode: 'auto',
      manualCupSize: 500,
    }),
  });

  assert.equal(result, true);
});

test('resolveStoredConfigPresence retorna false quando loadConfig falha', async () => {
  const result = await resolveStoredConfigPresence({
    loadConfig: async () => {
      throw new Error('storage failed');
    },
  });

  assert.equal(result, false);
});
