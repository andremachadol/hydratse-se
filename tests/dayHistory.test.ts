import assert from 'node:assert/strict';
import test from 'node:test';
import {
  archiveDayIfNeeded,
  buildDisplayHistory,
  computeBestDay,
  filterHistoryByPeriod,
  summarizeHistory,
} from '../src/utils/dayHistory.ts';
import { buildHomeDashboard } from '../src/utils/homeDashboard.ts';

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

test('buildHomeDashboard monta resumo derivado e inclui consumo de hoje', () => {
  const dashboard = buildHomeDashboard({
    progress: {
      consumedMl: 1800,
      drinks: [],
      streak: 3,
      lastDrinkDate: '2026-03-12',
      dayHistory: [
        { date: '2026-03-11', consumedMl: 2200 },
        { date: '2026-03-10', consumedMl: 1400 },
      ],
      bestDay: { date: '2026-03-11', consumedMl: 2200 },
    },
    todayGoalMl: 2000,
    goalReached: false,
    historyPeriod: 7,
    todayDate: '2026-03-12',
  });

  assert.equal(dashboard.percentage, 90);
  assert.equal(dashboard.goalStatusLabel, 'No ritmo');
  assert.equal(dashboard.historyEntries.length, 3);
  assert.equal(dashboard.historyReferenceMl, 2200);
  assert.equal(dashboard.bestDayLabel, '11/03 \u2022 2.200 ml');
  assert.deepEqual(dashboard.historyHighlights, [
    {
      label: 'M\u00e9dia',
      value: '1.800 ml',
      caption: '3 dia(s) ativos',
    },
    {
      label: 'Na meta atual',
      value: '1/3',
      caption: '33% do per\u00edodo',
    },
    {
      label: 'Tend\u00eancia',
      value: 'Subindo',
      caption: '+600 ml',
    },
    {
      label: 'Menor dia',
      value: '1.400 ml',
      caption: '10/03',
    },
  ]);
});

test('buildHomeDashboard lida com periodo sem dados recentes', () => {
  const dashboard = buildHomeDashboard({
    progress: {
      consumedMl: 0,
      drinks: [],
      streak: 0,
      lastDrinkDate: '',
      dayHistory: [{ date: '2026-02-01', consumedMl: 900 }],
      bestDay: undefined,
    },
    todayGoalMl: 2500,
    goalReached: false,
    historyPeriod: 7,
    todayDate: '2026-03-12',
  });

  assert.equal(dashboard.historyEntries.length, 0);
  assert.equal(dashboard.historyReferenceMl, 2500);
  assert.equal(dashboard.bestDayLabel, 'Nenhum dia registrado ainda');
  assert.equal(dashboard.goalStatusLabel, 'Em andamento');
  assert.equal(dashboard.historyHighlights[0]?.value, '\u2014');
  assert.equal(dashboard.historyHighlights[1]?.caption, 'Sem base ainda');
  assert.equal(dashboard.historyHighlights[3]?.caption, 'Sem registros');
});
