// src/components/ProgressRing.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Definimos o que esse componente ACEITA receber
interface ProgressRingProps {
  consumed: number;
  goal: number;
  percentage: number;
}

export default function ProgressRing({ consumed, goal, percentage }: ProgressRingProps) {
  const radius = 100;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  
  const circleProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const strokeDashoffset = circumference - (circumference * (percentage / 100));

    Animated.timing(circleProgress, {
      toValue: strokeDashoffset,
      duration: 1000,
      useNativeDriver: false, // Lembra da correção? Mantivemos aqui!
    }).start();
  }, [percentage]);

  return (
    <View style={styles.container}>
      <Svg width={250} height={250} viewBox="0 0 250 250">
        <Circle 
          cx="125" cy="125" r={radius} stroke={COLORS.border} strokeWidth={strokeWidth} fill="transparent" 
        />
        <G rotation="-90" origin="125, 125">
          <AnimatedCircle
            cx="125" cy="125" r={radius} stroke={COLORS.primary} strokeWidth={strokeWidth} fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={circleProgress} strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.percentageText}>{percentage}%</Text>
        <Text style={styles.litersText}>
          {(consumed / 1000).toFixed(1)}L / {(goal / 1000).toFixed(1)}L
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', marginVertical: 30 },
  textContainer: { position: 'absolute', alignItems: 'center' },
  percentageText: { fontSize: 40, fontWeight: 'bold', color: COLORS.secondary },
  litersText: { fontSize: 14, color: COLORS.textLight, marginTop: 5 },
});