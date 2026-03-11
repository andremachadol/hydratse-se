import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

interface HomeHeaderProps {
  streak: number;
  dateLabel: string;
  isExpanded: boolean;
  onOpenSettings: () => void;
}

export default function HomeHeader({
  streak,
  dateLabel,
  isExpanded,
  onOpenSettings,
}: HomeHeaderProps) {
  const streakLabel = streak === 1 ? 'dia seguido' : 'dias seguidos';
  const sidePanelWidth = isExpanded ? 116 : 104;
  const sidePanelHeight = isExpanded ? 92 : 88;

  return (
    <View style={styles.headerContainer}>
      <View
        style={[
          styles.sidePanel,
          { width: sidePanelWidth, height: sidePanelHeight },
          styles.sideCard,
        ]}
        accessibilityLabel={`Sequência de ${streak} dias`}
      >
        <Text style={styles.sideEyebrow}>Sequência</Text>
        <Text style={styles.streakValue}>{streak}</Text>
        <Text style={styles.sideCaption}>{streakLabel}</Text>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.titleEyebrow}>Rotina de hoje</Text>
        <Text
          style={[styles.appName, isExpanded && styles.appNameExpanded]}
          accessibilityRole="header"
        >
          Hidrate-se
        </Text>
        <Text style={styles.dateText}>{dateLabel}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.sidePanel,
          { width: sidePanelWidth, height: sidePanelHeight },
          styles.settingsButton,
        ]}
        onPress={onOpenSettings}
        accessibilityLabel="Abrir configurações"
        accessibilityRole="button"
        activeOpacity={0.85}
      >
        <Text style={styles.sideEyebrow}>Rotina</Text>
        <Text style={styles.settingsLabel}>Ajustes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  sidePanel: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    flexShrink: 0,
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  sideCard: {
    alignItems: 'center',
  },
  sideEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.primary,
    textAlign: 'center',
  },
  streakValue: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  sideCaption: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  titleEyebrow: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  appName: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 27,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  appNameExpanded: {
    fontSize: 31,
  },
  dateText: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  settingsButton: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.secondary,
    textAlign: 'center',
  },
});
