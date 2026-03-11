import test from 'node:test';
import assert from 'node:assert/strict';
import {
  archiveDayIfNeeded,
  buildDisplayHistory,
  computeBestDay,
  filterHistoryByPeriod,
  summarizeHistory,
} from '../src/utils/dayHistory.ts';

test('archiveDayIfNeeded ignora dia vazio e consumo zero', () => {
  assert.deepEqual(archiveDayIfNeeded(undefined, '', 300), []);
  assert.deepEqual(archiveDayIfNeeded(undefined, '2026-03-03', 0), []);
});

test('archiveDayIfNeeded faz upsert por data', () => {
  const history = archiveDayIfNeeded(
    [{ date: '2026-03-02', consumedMl: 1000 }],
    '2026-03-02',
    1500,
  );
  assert.deepEqual(history, [{ date: '2026-03-02', consumedMl: 1500 }]);
});

test('computeBestDay escolhe maior consumo e desempata por data mais recente', () => {
  const best = computeBestDay(
    [
      { date: '2026-03-01', consumedMl: 2000 },
      { date: '2026-03-02', consumedMl: 2000 },
    ],
    { date: '2026-03-03', consumedMl: 1800 },
  );

  assert.deepEqual(best, { date: '2026-03-02', consumedMl: 2000 });
});

test('buildDisplayHistory inclui o dia atual quando ha consumo', () => {
  const display = buildDisplayHistory(
    [{ date: '2026-03-02', consumedMl: 1400 }],
    '2026-03-03',
    900,
  );
  assert.deepEqual(display, [
    { date: '2026-03-03', consumedMl: 900 },
    { date: '2026-03-02', consumedMl: 1400 },
  ]);
});

test('filterHistoryByPeriod aplica janela de dias corretamente', () => {
  const history = [
    { date: '2026-03-04', consumedMl: 1300 },
    { date: '2026-03-03', consumedMl: 1100 },
    { date: '2026-02-25', consumedMl: 1500 },
  ];

  const in7Days = filterHistoryByPeriod(history, '2026-03-04', 7);
  assert.deepEqual(in7Days, [
    { date: '2026-03-04', consumedMl: 1300 },
    { date: '2026-03-03', consumedMl: 1100 },
  ]);

  const in14Days = filterHistoryByPeriod(history, '2026-03-04', 14);
  assert.deepEqual(in14Days, history);
});

test('summarizeHistory calcula media, meta atual e tendencia do periodo', () => {
  const summary = summarizeHistory(
    [
      { date: '2026-03-04', consumedMl: 1500 },
      { date: '2026-03-03', consumedMl: 1200 },
      { date: '2026-03-02', consumedMl: 900 },
    ],
    1300,
  );

  assert.equal(summary.trackedDays, 3);
  assert.equal(summary.totalMl, 3600);
  assert.equal(summary.averageMl, 1200);
  assert.equal(summary.goalHitDays, 1);
  assert.equal(summary.goalHitRate, 33);
  assert.deepEqual(summary.lowestDay, { date: '2026-03-02', consumedMl: 900 });
  assert.equal(summary.trend, 'up');
  assert.equal(summary.trendDeltaMl, 450);
});
