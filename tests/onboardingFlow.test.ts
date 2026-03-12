import test from 'node:test';
import assert from 'node:assert/strict';
import { completeOnboardingSetup } from '../src/application/onboardingFlow.ts';
import type { DayProgress, UserConfig } from '../src/types/index.ts';

const createDependencies = (overrides?: {
  requestLateStartStrategy?: () => Promise<'keep' | 'adjust'>;
  requestNotificationPermission?: () => Promise<boolean>;
  saveConfig?: (config: UserConfig) => Promise<boolean>;
  saveProgress?: (progress: DayProgress) => Promise<boolean>;
  now?: Date;
  todayDate?: string;
}) => {
  return {
    requestLateStartStrategy: overrides?.requestLateStartStrategy ?? (async () => 'keep'),
    requestNotificationPermission: overrides?.requestNotificationPermission ?? (async () => true),
    saveConfig: overrides?.saveConfig ?? (async () => true),
    saveProgress: overrides?.saveProgress ?? (async () => true),
    now: overrides?.now ?? new Date('2026-03-10T16:30:00'),
    todayDate: overrides?.todayDate ?? '2026-03-10',
  };
};

test('completeOnboardingSetup ajusta meta do dia quando onboarding ocorre tarde e usuario aceita', async () => {
  const savedProgress: DayProgress[] = [];

  const result = await completeOnboardingSetup(
    {
      mode: 'auto',
      finalWeight: 70,
      finalGoal: 2450,
      finalCup: 500,
    },
    createDependencies({
      requestLateStartStrategy: async () => 'adjust',
      saveProgress: async (progress) => {
        savedProgress.push(progress);
        return true;
      },
    }),
  );

  assert.equal(result.ok, true);
  assert.equal(savedProgress.length, 1);
  assert.equal(savedProgress[0]?.goalOverrideDate, '2026-03-10');
  assert.ok((savedProgress[0]?.goalOverrideMl ?? 0) > 0);
});

test('completeOnboardingSetup desativa notificacoes quando permissao e negada', async () => {
  const savedConfigs: UserConfig[] = [];

  const result = await completeOnboardingSetup(
    {
      mode: 'manual',
      finalWeight: 70,
      finalGoal: 2500,
      finalCup: 500,
    },
    createDependencies({
      requestNotificationPermission: async () => false,
      saveConfig: async (config) => {
        savedConfigs.push(config);
        return true;
      },
    }),
  );

  assert.equal(result.ok, true);
  assert.equal(savedConfigs[0]?.notificationsEnabled, false);
  assert.ok(result.notices.some((notice) => notice.title === 'Lembretes desativados'));
});

test('completeOnboardingSetup retorna erro quando saveConfig falha', async () => {
  const result = await completeOnboardingSetup(
    {
      mode: 'manual',
      finalWeight: 70,
      finalGoal: 2500,
      finalCup: 500,
    },
    createDependencies({
      saveConfig: async () => false,
    }),
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    assert.fail('resultado deveria falhar');
  }

  assert.equal(result.errorTitle, 'Erro');
  assert.equal(result.errorMessage, 'Não foi possível salvar suas configurações. Tente novamente.');
});
