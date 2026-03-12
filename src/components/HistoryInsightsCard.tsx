import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import type { BestDayRecord, DayHistoryEntry } from '../types/index.ts';
import type { HistorySummary } from '../utils/dayHistory.ts';
import {
  HISTORY_PERIODS,
  type HistoryPeriod,
  type HomeHistoryHighlight,
} from '../utils/homeDashboard.ts';
import {
  buildHistoryRows,
  getHistoryEmptyMessage,
  getHistoryFilterAccessibilityLabel,
  getHistorySubtitle,
  getHistoryTotalLabel,
} from '../utils/historyPresentation.ts';

interface HistoryInsightsCardProps {
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

export default function HistoryInsightsCard({
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
}: HistoryInsightsCardProps) {
  const historyRows = buildHistoryRows({
    historyEntries,
    bestDay,
    todayDate,
    historyReferenceMl,
  });

  return (
    <View style={styles.historyCard}>
      <View style={[styles.historyHeader, isExpanded && styles.historyHeaderExpanded]}>
        <View style={styles.historyHeaderText}>
          <Text style={styles.historyTitle}>Consumo recente</Text>
          <Text style={styles.historySubtitle}>
            {getHistorySubtitle(historySummary.trackedDays, historyPeriod)}
          </Text>
        </View>
        <View style={[styles.bestDaySummary, isExpanded && styles.bestDaySummaryExpanded]}>
          <Text style={styles.bestDaySummaryLabel}>Melhor dia</Text>
          <Text style={styles.bestDaySummaryValue}>{bestDayLabel}</Text>
        </View>
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
              accessibilityLabel={getHistoryFilterAccessibilityLabel(period)}
              activeOpacity={0.85}
            >
              <Text style={[styles.periodText, isSelected && styles.periodTextActive]}>
                {period}d
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {historyRows.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.historyEmpty}>{getHistoryEmptyMessage()}</Text>
        </View>
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
              {getHistoryTotalLabel(historySummary.totalMl)}
            </Text>
          </View>

          <View style={styles.historyList}>
            {historyRows.map((row) => (
              <View
                key={row.key}
                style={[
                  styles.historyRow,
                  row.isToday && styles.historyRowToday,
                  row.isBestDay && styles.historyRowBest,
                ]}
              >
                <View style={styles.historyRowTop}>
                  <Text style={styles.historyDate}>{row.dateLabel}</Text>
                  <View style={styles.historyValueWrap}>
                    {row.isBestDay ? <Text style={styles.bestDayBadge}>Melhor dia</Text> : null}
                    <Text style={styles.historyValue}>{row.valueLabel}</Text>
                  </View>
                </View>
                <View style={styles.historyBarTrack}>
                  <View
                    style={[
                      styles.historyBarFill,
                      { width: row.fillWidth },
                      row.isToday && styles.historyBarFillToday,
                      row.isBestDay && styles.historyBarFillBest,
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
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
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    ...SHADOWS.medium,
  },
  historyHeader: {
    gap: 6,
    marginBottom: 14,
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
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: COLORS.surfacePrimary,
  },
  bestDaySummaryExpanded: {
    maxWidth: '40%',
  },
  bestDaySummaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: COLORS.primary,
  },
  bestDaySummaryValue: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: COLORS.surfaceElevated,
  },
  periodButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfacePrimary,
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
    gap: 10,
    marginBottom: 16,
  },
  summaryItem: {
    width: '48%',
    minHeight: 98,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  emptyState: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyEmpty: {
    color: COLORS.textLight,
    fontSize: 13,
    textAlign: 'center',
  },
  historyList: {
    gap: 10,
  },
  historyRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyRowToday: {
    borderColor: '#31C48D55',
  },
  historyRowBest: {
    borderColor: '#1497C944',
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
    height: 9,
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
