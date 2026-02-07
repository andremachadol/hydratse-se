// src/components/HydrationTips.tsx
import React, { useState, useEffect, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

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
  const [tip, setTip] = useState("");

  useEffect(() => {
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: 20, // Bem arredondado
    paddingVertical: 10,
    paddingHorizontal: 20,
    
    // O SEGREDO DO TAMANHO AUTOMÁTICO:
    alignSelf: 'center', // O container só ocupa o espaço do texto
    maxWidth: '80%', // Mas não deixa passar de 80% da tela (para não colar na borda)
    
    // Espaçamento vertical para ele "respirar" no meio da tela
    marginTop: 20,
    marginBottom: 20,

    // Sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  text: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default memo(HydrationTips);