import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

const TIPS = [
  'Beber água ajuda na atenção ao longo do dia.',
  'Se a fome aparecer cedo demais, pode ser sede.',
  'Deixar a garrafa à vista reduz o esquecimento.',
  'Um copo antes das refeições costuma facilitar a rotina.',
  'Dor de cabeça leve pode ser sinal de hidratação baixa.',
  'Pequenos goles frequentes costumam funcionar melhor que grandes pausas.',
  'Começar cedo evita correr atrás da meta no fim do dia.',
];

function HydrationTips() {
  const tip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], []);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Dica rápida</Text>
      <Text style={styles.text}>{tip}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E7F2F6',
    ...SHADOWS.small,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  text: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});

export default memo(HydrationTips);
