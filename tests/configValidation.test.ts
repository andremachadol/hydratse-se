import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimeInput,
  hasCompleteUserConfig,
  parseStoredUserConfig,
  resolveUserConfigForm,
} from '../src/utils/configValidation.ts';
import { wrapStoredValue } from '../src/utils/storageValidation.ts';

test('hasCompleteUserConfig retorna false para null e config parcial', () => {
  assert.equal(hasCompleteUserConfig(null), false);
  assert.equal(
    hasCompleteUserConfig({
      weight: 70,
      mode: 'auto',
    }),
    false,
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
    true,
  );
});

test('resolveUserConfigForm valida configuracao automatica completa', () => {
  const result = resolveUserConfigForm({
    mode: 'auto',
    weightInput: '70,5',
    manualGoalInput: '',
    manualCupInput: '',
    startTime: '08:00',
    endTime: '22:00',
    intervalMinutes: 60,
    notificationsEnabled: true,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.weight, 70.5);
    assert.equal(result.value.dailyGoalMl, 2467.5);
  }
});

test('resolveUserConfigForm rejeita horarios invalidos', () => {
  const result = resolveUserConfigForm({
    mode: 'manual',
    weightInput: '',
    manualGoalInput: '3000',
    manualCupInput: '500',
    startTime: '22:00',
    endTime: '08:00',
    intervalMinutes: 30,
    notificationsEnabled: true,
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errorMessage, 'O horario de acordar deve ser antes do horario de dormir.');
  }
});

test('parseStoredUserConfig suporta envelope versionado e rejeita intervalo invalido', () => {
  const wrapped = wrapStoredValue({
    weight: 70,
    startTime: '08:00',
    endTime: '22:00',
    intervalMinutes: 60,
    dailyGoalMl: 2450,
    notificationsEnabled: true,
    mode: 'auto',
    manualCupSize: 500,
  });

  assert.deepEqual(parseStoredUserConfig(wrapped), wrapped.value);
  assert.equal(
    parseStoredUserConfig({
      ...wrapped.value,
      intervalMinutes: 45,
    }),
    null,
  );
});

test('formatTimeInput aplica mascara HH:MM', () => {
  assert.equal(formatTimeInput('1'), '1');
  assert.equal(formatTimeInput('123'), '12:3');
  assert.equal(formatTimeInput('12345'), '12:34');
});
