import test from 'node:test';
import assert from 'node:assert/strict';
import type { DayProgress, UserConfig } from '../src/types/index.ts';
import {
  addTrackerDrink,
  resetTrackerDay,
  saveTrackerConfig,
  undoTrackerDrink,
} from '../src/application/waterTrackerMutations.ts';

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

const createLoggerStub = () => ({
  configSaved: () => {},
  drink: () => {},
  undo: () => {},
  reset: () => {},
  streakUpdated: () => {},
  goalReached: () => {},
});

test('saveTrackerConfig desativa lembretes quando permissao e negada', async () => {
  let persistedConfig: UserConfig | null = null;
  const syncCalls: Array<{ progressMl: number; goalMl: number; notificationsEnabled: boolean }> =
    [];

  const result = await saveTrackerConfig(
    {
      newConfig: baseConfig,
      progress: {
        consumedMl: 600,
        drinks: [],
        streak: 2,
        lastDrinkDate: '2026-03-12',
      },
      today: '2026-03-12',
    },
    {
      persistConfig: async (config) => {
        persistedConfig = config;
        return true;
      },
      persistProgress: async () => true,
      requestNotificationPermission: async () => false,
      syncNotifications: async (progressMl, currentConfig, goalMl) => {
        syncCalls.push({
          progressMl,
          goalMl,
          notificationsEnabled: currentConfig.notificationsEnabled,
        });
      },
      logger: createLoggerStub(),
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.changed, true);
  assert.equal(result.notices[0]?.title, 'Lembretes desativados');
  assert.equal(persistedConfig?.notificationsEnabled, false);
  assert.deepEqual(syncCalls, [{ progressMl: 600, goalMl: 2450, notificationsEnabled: false }]);
});

test('addTrackerDrink retorna notices de meta batida e melhor dia', async () => {
  const persistedProgress: DayProgress[] = [];

  const result = await addTrackerDrink(
    {
      config: baseConfig,
      progress: {
        consumedMl: 1500,
        drinks: [{ id: 'a', amount: 1500, timestamp: '2026-03-12T09:00:00.000Z' }],
        streak: 5,
        lastDrinkDate: '2026-03-12',
        dayHistory: [{ date: '2026-03-11', consumedMl: 1600 }],
        bestDay: { date: '2026-03-11', consumedMl: 1600 },
      },
      amountToDrink: 300,
      today: '2026-03-12',
      yesterday: '2026-03-11',
    },
    {
      persistConfig: async () => true,
      persistProgress: async (progress) => {
        persistedProgress.push(progress);
        return true;
      },
      requestNotificationPermission: async () => true,
      syncNotifications: async () => {},
      logger: createLoggerStub(),
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.changed, true);
  assert.deepEqual(
    result.notices.map((notice) => notice.title),
    ['Meta batida!', 'Novo melhor dia!'],
  );
  assert.equal(persistedProgress[0]?.consumedMl, 1800);
});

test('undoTrackerDrink retorna no-op quando nao ha historico para desfazer', async () => {
  const result = await undoTrackerDrink(
    {
      config: baseConfig,
      progress: {
        consumedMl: 0,
        drinks: [],
        streak: 0,
        lastDrinkDate: '2026-03-12',
      },
      today: '2026-03-12',
    },
    {
      persistConfig: async () => true,
      persistProgress: async () => true,
      requestNotificationPermission: async () => true,
      syncNotifications: async () => {},
      logger: createLoggerStub(),
    },
  );

  assert.deepEqual(result, {
    ok: true,
    changed: false,
    notices: [],
  });
});

test('resetTrackerDay retorna erro quando persistencia falha', async () => {
  const result = await resetTrackerDay(
    {
      config: baseConfig,
      progress: {
        consumedMl: 1200,
        drinks: [{ id: 'a', amount: 1200, timestamp: '2026-03-12T09:00:00.000Z' }],
        streak: 3,
        lastDrinkDate: '2026-03-12',
      },
      today: '2026-03-12',
    },
    {
      persistConfig: async () => true,
      persistProgress: async () => false,
      requestNotificationPermission: async () => true,
      syncNotifications: async () => {},
      logger: createLoggerStub(),
    },
  );

  assert.deepEqual(result, {
    ok: false,
    changed: false,
    notices: [],
    errorTitle: 'Erro',
    errorMessage: 'Não foi possível salvar seu progresso agora.',
  });
});
