import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildInitialProgress,
  resolveOnboardingInputs,
  submitWelcomeSetup,
} from '../src/utils/onboarding.ts';

const constraints = { minWeight: 20, maxWeight: 650 };

test('resolveOnboardingInputs auto retorna peso/meta validos', () => {
  const result = resolveOnboardingInputs('auto', '70', '', '', 35, constraints);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.weight, 70);
    assert.equal(result.value.goalMl, 2450);
  }
});

test('resolveOnboardingInputs auto valida peso invalido', () => {
  const result = resolveOnboardingInputs('auto', '10', '', '', 35, constraints);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errorMessage, 'Informe um peso valido (kg).');
  }
});

test('resolveOnboardingInputs manual valida meta e copo', () => {
  const invalidGoal = resolveOnboardingInputs('manual', '', '200', '500', 35, constraints);
  assert.equal(invalidGoal.ok, false);

  const invalidCup = resolveOnboardingInputs('manual', '', '3000', '20', 35, constraints);
  assert.equal(invalidCup.ok, false);

  const valid = resolveOnboardingInputs('manual', '', '3000', '500', 35, constraints);
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.value.goalMl, 3000);
    assert.equal(valid.value.cupMl, 500);
  }
});

test('buildInitialProgress cria override apenas quando informado', () => {
  const withOverride = buildInitialProgress(1200, '2026-03-03');
  assert.equal(withOverride.goalOverrideMl, 1200);
  assert.equal(withOverride.goalOverrideDate, '2026-03-03');
  assert.deepEqual(withOverride.dayHistory, []);
  assert.equal(withOverride.bestDay, undefined);

  const noOverride = buildInitialProgress();
  assert.equal(noOverride.goalOverrideMl, undefined);
  assert.equal(noOverride.goalOverrideDate, undefined);
  assert.deepEqual(noOverride.dayHistory, []);
  assert.equal(noOverride.bestDay, undefined);
});

test('submitWelcomeSetup retorna erro de validacao sem chamar submit', async () => {
  let called = false;

  const result = await submitWelcomeSetup(
    {
      mode: 'auto',
      weight: '10',
      manualGoal: '',
      manualCup: '',
    },
    {
      submitSetup: async () => {
        called = true;
        return { ok: true, notices: [] };
      },
      askLateStartStrategy: async () => 'keep',
    },
  );

  assert.equal(called, false);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errorTitle, 'Ops');
    assert.equal(result.errorMessage, 'Informe um peso valido (kg).');
  }
});

test('submitWelcomeSetup preserva warning quando submit retorna falha', async () => {
  const result = await submitWelcomeSetup(
    {
      mode: 'auto',
      weight: '210',
      manualGoal: '',
      manualCup: '',
    },
    {
      submitSetup: async () => ({
        ok: false,
        notices: [],
        errorTitle: 'Erro',
        errorMessage: 'Falha simulada.',
      }),
      askLateStartStrategy: async () => 'keep',
    },
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errorMessage, 'Falha simulada.');
    assert.equal(result.warningMessage, 'Peso muito elevado, considere consultar um medico.');
  }
});

test('submitWelcomeSetup retorna erro generico quando submit lanca excecao', async () => {
  const result = await submitWelcomeSetup(
    {
      mode: 'auto',
      weight: '210',
      manualGoal: '',
      manualCup: '',
    },
    {
      submitSetup: async () => {
        throw new Error('boom');
      },
      askLateStartStrategy: async () => 'adjust',
    },
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errorTitle, 'Erro');
    assert.equal(
      result.errorMessage,
      'N\u00e3o foi poss\u00edvel concluir a configura\u00e7\u00e3o inicial.',
    );
    assert.equal(result.warningMessage, 'Peso muito elevado, considere consultar um medico.');
  }
});
