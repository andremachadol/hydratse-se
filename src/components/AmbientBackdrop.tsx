import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/theme';

interface AmbientBackdropProps {
  variant?: 'home' | 'welcome';
}

export default function AmbientBackdrop({ variant = 'home' }: AmbientBackdropProps) {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View
        style={[
          styles.orb,
          styles.orbLarge,
          styles.orbPrimary,
          variant === 'home' ? styles.orbLargeHome : styles.orbLargeWelcome,
        ]}
      />
      <View
        style={[
          styles.orb,
          styles.orbMedium,
          styles.orbSecondary,
          variant === 'home' ? styles.orbMediumHome : styles.orbMediumWelcome,
        ]}
      />
      <View
        style={[
          styles.orb,
          styles.orbSmall,
          styles.orbAccent,
          variant === 'home' ? styles.orbSmallHome : styles.orbSmallWelcome,
        ]}
      />
      <View style={[styles.ring, variant === 'home' ? styles.ringHome : styles.ringWelcome]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbLarge: {
    width: 280,
    height: 280,
  },
  orbMedium: {
    width: 190,
    height: 190,
  },
  orbSmall: {
    width: 124,
    height: 124,
  },
  orbPrimary: {
    backgroundColor: COLORS.backgroundOrbPrimary,
  },
  orbSecondary: {
    backgroundColor: COLORS.backgroundOrbSecondary,
  },
  orbAccent: {
    backgroundColor: COLORS.backgroundOrbAccent,
  },
  orbLargeHome: {
    top: -78,
    right: -92,
  },
  orbMediumHome: {
    top: 180,
    left: -74,
  },
  orbSmallHome: {
    bottom: 112,
    right: 18,
  },
  orbLargeWelcome: {
    top: -96,
    left: -74,
  },
  orbMediumWelcome: {
    top: 228,
    right: -58,
  },
  orbSmallWelcome: {
    bottom: 108,
    left: 22,
  },
  ring: {
    position: 'absolute',
    width: 236,
    height: 236,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.42)',
  },
  ringHome: {
    bottom: 146,
    left: -112,
  },
  ringWelcome: {
    bottom: 158,
    right: -108,
  },
});
