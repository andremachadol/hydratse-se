// src/components/HydrationTips.tsx
import React, { useMemo, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

const TIPS = [
  "💡 Beber água ajuda no foco.",
  "🌊 Sentiu fome? Pode ser sede!",
  "✨ Água melhora a pele.",
  "💧 Mantenha uma garrafa perto.",
  "🍽️ Beba antes das refeições.",
  "🤯 Dor de cabeça? Beba água.",
  "❄️ Água gelada ativa o metabolismo."
];

function HydrationTips() {
  const tip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{tip}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    maxWidth: '80%',
    marginTop: 20,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  
  text: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default memo(HydrationTips);