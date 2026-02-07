// src/components/HydrationTips.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

const TIPS = [
  "💡 Dica: Beber água ajuda na concentração.",
  "🌊 Dica: Sentiu fome? Pode ser apenas sede!",
  "✨ Dica: Água melhora a pele e o cabelo.",
  "💧 Dica: Mantenha uma garrafa sempre por perto.",
  "🍽️ Dica: Beber antes das refeições ajuda na digestão.",
  "🤯 Dica: Dor de cabeça? Tente beber um copo d'água.",
  "❄️ Dica: Água gelada acelera levemente o metabolismo."
];

export default function HydrationTips() {
  const [tip, setTip] = useState("");

  useEffect(() => {
    const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
    setTip(randomTip);
  }, []);

  if (!tip) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{tip}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fundo branco levemente translúcido
    borderRadius: 15, // Arredondado
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 15, // Espaçamento para não grudar nem em cima nem embaixo
    width: '85%', // Largura confortável
    alignSelf: 'center', // Garante que fique no centro
    
    // Sombra suave para destacar do fundo degradê
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  text: {
    color: COLORS.secondary, // Cor do texto principal
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});