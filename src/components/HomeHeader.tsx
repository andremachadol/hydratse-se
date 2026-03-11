import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

interface HomeHeaderProps {
  streak: number;
  isExpanded: boolean;
  onOpenSettings: () => void;
}

export default function HomeHeader({ streak, isExpanded, onOpenSettings }: HomeHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.streakPill} accessibilityLabel={`Sequência de ${streak} dias`}>
        <Text style={styles.streakIcon}>🔥</Text>
        <Text style={styles.streakText}>{streak}</Text>
      </View>
      <Text
        style={[styles.appName, isExpanded && styles.appNameExpanded]}
        accessibilityRole="header"
      >
        Hidrate-se
      </Text>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={onOpenSettings}
        accessibilityLabel="Abrir configurações"
        accessibilityRole="button"
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  streakPill: {
    minWidth: 58,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.78)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    ...SHADOWS.small,
  },
  streakIcon: { fontSize: 18 },
  streakText: { fontSize: 15, fontWeight: '700', color: COLORS.secondary },
  appName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  appNameExpanded: {
    fontSize: 30,
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  settingsIcon: { fontSize: 21 },
});
