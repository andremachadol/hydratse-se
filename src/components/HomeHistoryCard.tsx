import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BestDayRecord, DayHistoryEntry } from '../types/index.ts';
import { COLORS, SHADOWS } from '../constants/theme';
import type { HistorySummary } from '../utils/dayHistory.ts';
import { formatHistoryDate, formatMl } from '../utils/homePresentation.ts';
import {
  HISTORY_PERIODS,
  type HistoryPeriod,
  type HomeHistoryHighlight,
} from '../hooks/useHomeDashboard.ts';

interface HomeHistoryCardProps {
  isExpanded: boolean;
  historyPeriod: HistoryPeriod;
  historySummary: HistorySummary;
  historyEntries: DayHistoryEntry[];
  bestDay?: BestDayRecord;
  bestDayLabel: string;
  todayDate: string;
  historyReferenceMl: number;
  historyHighlights: HomeHistoryHighlight[];
  onChangePeriod: (period: HistoryPeriod) => void;
}

export default function HomeHistoryCard({
  isExpanded,
  historyPeriod,
  historySummary,
  historyEntries,
  bestDay,
  bestDayLabel,
  todayDate,
  historyReferenceMl,
  historyHighlights,
  onChangePeriod,
}: HomeHistoryCardProps) {
  return (
    <View style={styles.historyCard}>
      <View style={[styles.historyHeader, isExpanded && styles.historyHeaderExpanded]}>
        <View style={styles.historyHeaderText}>
          <Text style={styles.historyTitle}>Histórico recente</Text>
          <Text style={styles.historySubtitle}>
            {historySummary.trackedDays > 0
              ? `${historySummary.trackedDays} dia(s) com registro neste filtro`
              : `Sem dados nos últimos ${historyPeriod} dias`}
          </Text>
        </View>
        <Text style={[styles.bestDaySummary, isExpanded && styles.bestDaySummaryExpanded]}>
          Melhor: {bestDayLabel}
        </Text>
      </View>

      <View style={styles.periodRow}>
        {HISTORY_PERIODS.map((period) => {
          const isSelected = historyPeriod === period;
          return (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, isSelected && styles.periodButtonActive]}
              onPress={() => onChangePeriod(period)}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar histórico para ${period} dias`}
            >
              <Text style={[styles.periodText, isSelected && styles.periodTextActive]}>
                {period}d
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {historyEntries.length === 0 ? (
        <Text style={styles.historyEmpty}>Nenhum registro apareceu nesta janela ainda.</Text>
      ) : (
        <>
          <View style={styles.summaryGrid}>
            {historyHighlights.map((item) => (
              <View
                key={item.label}
                style={[styles.summaryItem, isExpanded && styles.summaryItemExpanded]}
              >
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text style={styles.summaryValue}>{item.value}</Text>
                <Text style={styles.summaryCaption}>{item.caption}</Text>
              </View>
            ))}
          </View>

          <View style={styles.historyListHeader}>
            <Text style={styles.historyListTitle}>Linha do tempo</Text>
            <Text style={styles.historyListCaption}>
              Total no período: {formatMl(historySummary.totalMl)}
            </Text>
          </View>

          {historyEntries.map((entry) => {
            const isBestDay =
              bestDay?.date === entry.date && bestDay.consumedMl === entry.consumedMl;
            const isToday = entry.date === todayDate;
            const fillWidth =
              `${Math.min(100, Math.round((entry.consumedMl / historyReferenceMl) * 100))}%` as const;

            return (
              <View key={entry.date} style={styles.historyRow}>
                <View style={styles.historyRowTop}>
                  <Text style={styles.historyDate}>
                    {isToday ? 'Hoje' : formatHistoryDate(entry.date)}
                  </Text>
                  <View style={styles.historyValueWrap}>
                    {isBestDay ? <Text style={styles.bestDayBadge}>Melhor dia</Text> : null}
                    <Text style={styles.historyValue}>{formatMl(entry.consumedMl)}</Text>
                  </View>
                </View>
                <View style={styles.historyBarTrack}>
                  <View
                    style={[
                      styles.historyBarFill,
                      { width: fillWidth },
                      isToday && styles.historyBarFillToday,
                      isBestDay && styles.historyBarFillBest,
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historyCard: {
    width: '100%',
    marginTop: 18,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...SHADOWS.small,
  },
  historyHeader: {
    gap: 6,
    marginBottom: 12,
  },
  historyHeaderExpanded: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyHeaderText: {
    gap: 4,
    flex: 1,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  historySubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  bestDaySummary: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  bestDaySummaryExpanded: {
    textAlign: 'right',
    maxWidth: '40%',
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  periodButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
  },
  periodButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E7F9FD',
  },
  periodText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '700',
  },
  periodTextActive: {
    color: COLORS.secondary,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  summaryItem: {
    width: '48%',
    minHeight: 92,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7F2F6',
  },
  summaryItemExpanded: {
    width: '23.5%',
  },
  summaryLabel: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    marginTop: 8,
    color: COLORS.secondary,
    fontSize: 20,
    fontWeight: '800',
  },
  summaryCaption: {
    marginTop: 6,
    color: COLORS.textLight,
    fontSize: 12,
  },
  historyListHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  historyListTitle: {
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: '800',
  },
  historyListCaption: {
    color: COLORS.textLight,
    fontSize: 12,
  },
  historyEmpty: {
    color: COLORS.textLight,
    fontSize: 13,
  },
  historyRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF4F7',
  },
  historyRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  historyDate: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  historyValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bestDayBadge: {
    fontSize: 11,
    color: COLORS.secondary,
    backgroundColor: '#DFF6FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontWeight: '700',
  },
  historyValue: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  historyBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: '#EAF2F5',
    overflow: 'hidden',
  },
  historyBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  historyBarFillToday: {
    backgroundColor: '#31C48D',
  },
  historyBarFillBest: {
    backgroundColor: COLORS.secondary,
  },
});
