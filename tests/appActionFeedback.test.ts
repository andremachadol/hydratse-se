import test from 'node:test';
import assert from 'node:assert/strict';
import { presentAppActionFeedback } from '../src/utils/appActionFeedback.ts';
import type { AppActionResult } from '../src/types/index.ts';

test('presentAppActionFeedback apresenta erro combinado e nao chama onSuccess', async () => {
  const dialogs: Array<{ title: string; message: string; acknowledgeLabel?: string }> = [];
  let successCalls = 0;

  const result: AppActionResult = {
    ok: false,
    errorTitle: 'Erro',
    errorMessage: 'Falha principal.',
    notices: [{ title: 'Detalhe', message: 'Mais contexto.' }],
  };

  const handled = await presentAppActionFeedback(result, {
    presentDialog: async (title, message, acknowledgeLabel) => {
      dialogs.push({ title, message, acknowledgeLabel });
    },
    onSuccess: () => {
      successCalls += 1;
    },
  });

  assert.equal(handled, false);
  assert.equal(successCalls, 0);
  assert.deepEqual(dialogs, [
    {
      title: 'Erro',
      message: 'Falha principal.\n\nDetalhe\nMais contexto.',
      acknowledgeLabel: undefined,
    },
  ]);
});

test('presentAppActionFeedback apresenta warning antes dos notices e chama onSuccess depois', async () => {
  const dialogs: Array<{ title: string; message: string; acknowledgeLabel?: string }> = [];
  let successCalls = 0;

  const result: AppActionResult = {
    ok: true,
    notices: [{ title: 'Meta batida!', message: 'Voce atingiu 100% hoje.' }],
    warningMessage: 'Isso vale apenas para hoje.',
  };

  const handled = await presentAppActionFeedback(result, {
    presentDialog: async (title, message, acknowledgeLabel) => {
      dialogs.push({ title, message, acknowledgeLabel });
    },
    onSuccess: () => {
      successCalls += 1;
    },
    successAcknowledgeLabel: 'Continuar',
  });

  assert.equal(handled, true);
  assert.equal(successCalls, 1);
  assert.deepEqual(dialogs, [
    {
      title: 'Atenção',
      message: 'Isso vale apenas para hoje.',
      acknowledgeLabel: undefined,
    },
    {
      title: 'Meta batida!',
      message: 'Voce atingiu 100% hoje.',
      acknowledgeLabel: 'Continuar',
    },
  ]);
});

test('presentAppActionFeedback chama onSuccess sem dialog de notice quando nao ha notice', async () => {
  const dialogs: Array<{ title: string; message: string; acknowledgeLabel?: string }> = [];
  let successCalls = 0;

  const result: AppActionResult = {
    ok: true,
    notices: [],
  };

  const handled = await presentAppActionFeedback(result, {
    presentDialog: async (title, message, acknowledgeLabel) => {
      dialogs.push({ title, message, acknowledgeLabel });
    },
    onSuccess: () => {
      successCalls += 1;
    },
  });

  assert.equal(handled, true);
  assert.equal(successCalls, 1);
  assert.deepEqual(dialogs, []);
});
