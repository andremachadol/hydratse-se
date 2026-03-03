import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReminderSlots } from '../src/utils/reminderSlots.ts';

test('buildReminderSlots gera horarios por intervalo ate o fim do dia', () => {
  const slots = buildReminderSlots(480, 1320, 60);

  assert.equal(slots[0], 540);
  assert.equal(slots.at(-1), 1320);
  assert.equal(slots.length, 14);
});

test('buildReminderSlots retorna vazio com intervalo invalido', () => {
  assert.deepEqual(buildReminderSlots(480, 1320, 0), []);
  assert.deepEqual(buildReminderSlots(480, 1320, -10), []);
});

test('buildReminderSlots retorna vazio quando janela de tempo e invalida', () => {
  assert.deepEqual(buildReminderSlots(1320, 480, 60), []);
  assert.deepEqual(buildReminderSlots(600, 600, 60), []);
});
