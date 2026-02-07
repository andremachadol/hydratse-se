// src/components/ProgressRing.tsx
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface ProgressRingProps {
  consumed: number;
  goal: number;
  percentage: number;
}

function ProgressRing({ consumed, goal, percentage }: ProgressRingProps) {
  const radius = 100; // Raio do círculo
  const strokeWidth = 20; // Espessura da linha
  const circumference = 2 * Math.PI * radius; // 2 * PI * R
  
  // --- A MÁGICA VISUAL ---
  // Para o desenho, travamos em 100% (se for 120%, desenha cheio e pronto)
  const visualPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (visualPercentage / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg height="250" width="250" viewBox="0 0 250 250">
        {/* Círculo de Fundo (Cinza Claro) */}
        <Circle
          cx="125"
          cy="125"
          r={radius}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Círculo de Progresso (Azul) */}
        <Circle
          cx="125"
          cy="125"
          r={radius}
          stroke={COLORS.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin="125, 125"
        />
      </Svg>
      
      {/* Texto Centralizado */}
      <View style={styles.textContainer}>
        {/* O Texto mostra a porcentagem REAL (pode ser 150%) */}
        <Text style={styles.percentageText}>{percentage}%</Text>
        <Text style={styles.amountText}>{consumed} / {goal} ml</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  textContainer: { position: 'absolute', alignItems: 'center' },
  percentageText: { fontSize: 48, fontWeight: 'bold', color: COLORS.primary },
  amountText: { fontSize: 16, color: COLORS.textLight, marginTop: 5 },
});

export default memo(ProgressRing);