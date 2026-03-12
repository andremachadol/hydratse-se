import test from 'node:test';
import assert from 'node:assert/strict';
import { collapseNotices, mergeErrorMessageWithNotices } from '../src/hooks/noticeHelpers.ts';

test('collapseNotices retorna null sem notices', () => {
  assert.equal(collapseNotices([]), null);
});

test('collapseNotices preserva primeiro titulo e concatena mensagens restantes', () => {
  assert.deepEqual(
    collapseNotices([
      { title: 'Meta batida!', message: 'Voce chegou em 100% hoje.' },
      { title: 'Novo melhor dia!', message: 'Voce bateu seu recorde.' },
    ]),
    {
      title: 'Meta batida!',
      message: 'Voce chegou em 100% hoje.\n\nNovo melhor dia!\nVoce bateu seu recorde.',
    },
  );
});

test('mergeErrorMessageWithNotices combina erro base com notices', () => {
  assert.equal(
    mergeErrorMessageWithNotices('Nao foi possivel salvar.', [
      { title: 'Lembretes desativados', message: 'Ative depois no dispositivo.' },
    ]),
    'Nao foi possivel salvar.\n\nLembretes desativados\nAtive depois no dispositivo.',
  );
});
