import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

const TIPS = [
  'Beber água ajuda na atenção ao longo do dia.',
  'Se a fome aparece cedo demais, pode ser sede.',
  'Deixar a garrafa à vista reduz o esquecimento.',
  'Um copo antes das refeições costuma facilitar a rotina.',
  'Dor de cabeça leve pode ser sinal de hidratação baixa.',
  'Pequenos goles frequentes costumam funcionar melhor que grandes pausas.',
  'Começar cedo evita correr atrás da meta no fim do dia.',
];

export default function HydrationInsightCard() {
  const tip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], []);

  return (
    <View style={styles.container}>
      <View style={styles.eyebrowPill}>
        <Text style={styles.eyebrow}>Dica rápida</Text>
      </View>
      <Text style={styles.text}>{tip}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  eyebrowPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.surfacePrimary,
    marginBottom: 8,
  },
  eyebrow: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  text: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
