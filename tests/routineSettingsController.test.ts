import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createRoutineSettingsDraft,
  getRoutineSettingsAutoGoalPreview,
  submitRoutineSettingsDraft,
} from '../src/hooks/routineSettingsHelpers.ts';
import type { UserConfig } from '../src/types/index.ts';

const baseConfig: UserConfig = {
  weight: 72,
  startTime: '08:00',
  endTime: '20:00',
  intervalMinutes: 60,
  dailyGoalMl: 2520,
  notificationsEnabled: true,
  mode: 'auto',
  manualCupSize: 500,
};

test('createRoutineSettingsDraft hidrata estado inicial a partir da config', () => {
  assert.deepEqual(createRoutineSettingsDraft(baseConfig), {
    mode: 'auto',
    weight: '72',
    manualGoal: '2520',
    manualCup: '500',
    startTime: '08:00',
    endTime: '20:00',
    interval: 60,
    notificationsEnabled: true,
  });
});

test('getRoutineSettingsAutoGoalPreview calcula preview em ml', () => {
  assert.equal(getRoutineSettingsAutoGoalPreview('72,5'), '2538 ml');
});

test('submitRoutineSettingsDraft retorna erro de validacao sem chamar onSave', async () => {
  let called = false;

  const result = await submitRoutineSettingsDraft(
    {
      ...createRoutineSettingsDraft(baseConfig),
      startTime: '22:00',
      endTime: '08:00',
    },
    async () => {
      called = true;
      return { ok: true, changed: true, notices: [] };
    },
  );

  assert.equal(called, false);
  assert.deepEqual(result, {
    ok: false,
    changed: false,
    notices: [],
    errorTitle: 'Erro',
    errorMessage: 'O horario de acordar deve ser antes do horario de dormir.',
  });
});

test('submitRoutineSettingsDraft preserva warning quando save retorna falha', async () => {
  const result = await submitRoutineSettingsDraft(
    {
      ...createRoutineSettingsDraft(baseConfig),
      weight: '210',
    },
    async () => ({
      ok: false,
      changed: false,
      notices: [],
      errorTitle: 'Erro',
      errorMessage: 'Falha simulada.',
    }),
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errorMessage, 'Falha simulada.');
    assert.equal(result.warningMessage, 'Peso muito elevado, considere consultar um medico.');
  }
});

test('submitRoutineSettingsDraft retorna erro generico quando onSave lanca excecao', async () => {
  const result = await submitRoutineSettingsDraft(
    createRoutineSettingsDraft(baseConfig),
    async () => {
      throw new Error('boom');
    },
  );

  assert.deepEqual(result, {
    ok: false,
    changed: false,
    notices: [],
    errorTitle: 'Erro',
    errorMessage: 'N\u00e3o foi poss\u00edvel atualizar as configura\u00e7\u00f5es.',
  });
});
