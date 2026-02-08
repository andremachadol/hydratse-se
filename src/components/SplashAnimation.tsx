// src/components/SplashAnimation.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';
import { Audio } from 'expo-av';
import { COLORS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const MIN_SPLASH_MS = 1500;

interface SplashAnimationProps {
  onFinish: () => void;
  isLoading: boolean;
}

export default function SplashAnimation({ onFinish, isLoading }: SplashAnimationProps) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const soundRef = useRef<Audio.Sound | null>(null);
  const onFinishRef = useRef(onFinish);
  const minTimeReached = useRef(false);
  const dataReady = useRef(!isLoading);
  const hasTriggeredFadeOut = useRef(false);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Completa o enchimento rapidamente e faz fade-out
  const triggerFadeOut = () => {
    if (hasTriggeredFadeOut.current) return;
    hasTriggeredFadeOut.current = true;

    fillAnim.stopAnimation();
    // Completa o enchimento restante em 300ms
    Animated.timing(fillAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start(() => {
        onFinishRef.current();
      });
    });
  };

  // Quando loading termina, verifica se já pode sair
  useEffect(() => {
    dataReady.current = !isLoading;
    if (!isLoading && minTimeReached.current) {
      triggerFadeOut();
    }
  }, [isLoading]);

  useEffect(() => {
    // Animação de enchimento (dura até 3s, mas pode ser interrompida antes)
    Animated.timing(fillAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();

    // Carrega e toca o som em paralelo (não bloqueia a animação)
    loadAndPlaySound();

    // Após o tempo mínimo, verifica se os dados já carregaram
    const minTimer = setTimeout(() => {
      minTimeReached.current = true;
      if (dataReady.current) {
        triggerFadeOut();
      }
    }, MIN_SPLASH_MS);

    return () => {
      clearTimeout(minTimer);
      fillAnim.stopAnimation();
      fadeAnim.stopAnimation();
      if (soundRef.current) {
        soundRef.current.stopAsync().then(() => {
          soundRef.current?.unloadAsync();
        });
      }
    };
  }, []);

  const loadAndPlaySound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/filling.mp3')
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch {
      // Falha no som não impede a animação
    }
  };

  const waterHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
        <View style={styles.cupContainer}>
          <View style={styles.cupOutline}>
            <View style={styles.waterContainer}>
              <Animated.View
                style={[
                  styles.water,
                  { height: waterHeight }
                ]}
              />
            </View>
          </View>
          <View style={styles.reflection} />
        </View>
        <Text style={styles.loadingText}>Hidratando o sistema...</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cupContainer: {
    width: 120,
    height: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 40,
  },
  cupOutline: {
    width: '100%',
    height: '100%',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: 'rgba(255,255,255, 0.8)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255, 0.1)',
  },
  waterContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  water: {
    width: '100%',
    backgroundColor: COLORS.primary,
    opacity: 0.8,
  },
  reflection: {
    position: 'absolute',
    width: 8,
    height: '70%',
    backgroundColor: 'rgba(255,255,255, 0.3)',
    right: 20,
    top: 20,
    borderRadius: 5,
  },
  loadingText: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    opacity: 0.8,
  }
});
