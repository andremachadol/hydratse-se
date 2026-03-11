import React from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import type { CalculationMode } from '../types/index.ts';
import WelcomeModeCard from './WelcomeModeCard';

interface WelcomeIntroPanelProps {
  mode: CalculationMode;
  onSelectMode: (mode: CalculationMode) => void;
}

export default function WelcomeIntroPanel({ mode, onSelectMode }: WelcomeIntroPanelProps) {
  return (
    <View style={styles.introColumn}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Primeira configuração</Text>
        <Text style={styles.title}>Monte sua rotina de hidratação</Text>
        <Text style={styles.subtitle}>
          Escolha se a meta será calculada pelo peso ou definida manualmente.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <WelcomeModeCard
          icon="Auto"
          title="Automático"
          description="Meta por peso"
          isActive={mode === 'auto'}
          onPress={() => {
            Keyboard.dismiss();
            onSelectMode('auto');
          }}
          cardStyle={styles.card}
          activeCardStyle={styles.cardActive}
          titleStyle={styles.cardTitle}
          descriptionStyle={styles.cardDesc}
          activeTextStyle={styles.textActive}
          iconStyle={styles.cardIcon}
        />

        <WelcomeModeCard
          icon="Manual"
          title="Manual"
          description="Você define"
          isActive={mode === 'manual'}
          onPress={() => {
            Keyboard.dismiss();
            onSelectMode('manual');
          }}
          cardStyle={styles.card}
          activeCardStyle={styles.cardActive}
          titleStyle={styles.cardTitle}
          descriptionStyle={styles.cardDesc}
          activeTextStyle={styles.textActive}
          iconStyle={styles.cardIcon}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  introColumn: {
    width: '100%',
  },
  heroCard: {
    width: '100%',
    padding: 22,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.78)',
    marginBottom: 22,
    ...SHADOWS.small,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.primary,
    marginBottom: 8,
  },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.secondary, marginBottom: 10 },
  subtitle: { fontSize: 16, color: COLORS.textLight, lineHeight: 22 },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  card: {
    width: '48%',
    minHeight: 124,
    backgroundColor: 'rgba(255,255,255,0.65)',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: { backgroundColor: COLORS.white, borderColor: COLORS.primary, ...SHADOWS.medium },
  cardIcon: {
    minWidth: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: '#E6F8FD',
  },
  cardTitle: { fontWeight: '800', fontSize: 16, color: COLORS.textDark, marginBottom: 5 },
  cardDesc: { fontSize: 12, color: COLORS.textLight, textAlign: 'center', lineHeight: 18 },
  textActive: { color: COLORS.secondary },
});
