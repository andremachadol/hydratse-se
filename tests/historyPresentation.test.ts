import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildHistoryRows,
  getHistoryEmptyMessage,
  getHistoryFilterAccessibilityLabel,
  getHistorySubtitle,
  getHistoryTotalLabel,
} from '../src/utils/historyPresentation.ts';

test('getHistorySubtitle descreve periodo com e sem registros', () => {
  assert.equal(getHistorySubtitle(3, 7), '3 dia(s) com registro neste filtro');
  assert.equal(getHistorySubtitle(0, 14), 'Sem dados nos últimos 14 dias');
});

test('getHistoryFilterAccessibilityLabel e mensagens auxiliares usam copy esperada', () => {
  assert.equal(getHistoryFilterAccessibilityLabel(30), 'Filtrar histórico para 30 dias');
  assert.equal(getHistoryEmptyMessage(), 'Nenhum registro apareceu nesta janela ainda.');
  assert.equal(getHistoryTotalLabel(2450), 'Total no período: 2.450 ml');
});

test('buildHistoryRows monta labels, flags e largura com limite seguro', () => {
  const rows = buildHistoryRows({
    historyEntries: [
      { date: '2026-03-12', consumedMl: 2500 },
      { date: '2026-03-11', consumedMl: 1200 },
    ],
    bestDay: { date: '2026-03-12', consumedMl: 2500 },
    todayDate: '2026-03-12',
    historyReferenceMl: 2000,
  });

  assert.deepEqual(rows, [
    {
      key: '2026-03-12',
      dateLabel: 'Hoje',
      valueLabel: '2.500 ml',
      fillWidth: '100%',
      isToday: true,
      isBestDay: true,
    },
    {
      key: '2026-03-11',
      dateLabel: '11/03',
      valueLabel: '1.200 ml',
      fillWidth: '60%',
      isToday: false,
      isBestDay: false,
    },
  ]);
});

test('buildHistoryRows usa referencia minima de 1 para evitar divisao invalida', () => {
  const rows = buildHistoryRows({
    historyEntries: [{ date: '2026-03-11', consumedMl: 0 }],
    todayDate: '2026-03-12',
    historyReferenceMl: 0,
  });

  assert.equal(rows[0]?.fillWidth, '0%');
  assert.equal(rows[0]?.isBestDay, false);
});
