import React from 'react';
import { Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ONBOARDING_OVERVIEW_COPY } from '../constants/uiCopy';
import { COLORS, SHADOWS } from '../constants/theme';
import type { CalculationMode } from '../types/index.ts';

interface OnboardingOverviewPanelProps {
  mode: CalculationMode;
  onSelectMode: (mode: CalculationMode) => void;
}

export default function OnboardingOverviewPanel({
  mode,
  onSelectMode,
}: OnboardingOverviewPanelProps) {
  return (
    <View style={styles.introColumn}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>{ONBOARDING_OVERVIEW_COPY.heroEyebrow}</Text>
        <Text style={styles.title}>{ONBOARDING_OVERVIEW_COPY.title}</Text>
        <Text style={styles.subtitle}>{ONBOARDING_OVERVIEW_COPY.subtitle}</Text>

        <View style={styles.benefitRow}>
          {ONBOARDING_OVERVIEW_COPY.benefits.map((benefit) => (
            <View key={benefit} style={styles.benefitPill}>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.cardsContainer}>
        {ONBOARDING_OVERVIEW_COPY.modeOptions.map((option) => {
          const isActive = mode === option.mode;

          return (
            <TouchableOpacity
              key={option.mode}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => {
                Keyboard.dismiss();
                onSelectMode(option.mode);
              }}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.cardEyebrow, isActive && styles.cardEyebrowActive]}>
                {option.eyebrow}
              </Text>
              <Text style={[styles.cardTitle, isActive && styles.cardTitleActive]}>
                {option.title}
              </Text>
              <Text style={[styles.cardDesc, isActive && styles.cardDescActive]}>
                {option.description}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    padding: 24,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.82)',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    ...SHADOWS.medium,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    lineHeight: 37,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    lineHeight: 23,
  },
  benefitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },
  benefitPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.surfacePrimary,
  },
  benefitText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginBottom: 18,
  },
  card: {
    flex: 1,
    minHeight: 170,
    backgroundColor: 'rgba(255,255,255,0.68)',
    padding: 16,
    borderRadius: 22,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  cardActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  cardEyebrow: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: COLORS.surfacePrimary,
  },
  cardEyebrowActive: {
    color: COLORS.secondary,
  },
  cardTitle: {
    marginTop: 16,
    fontWeight: '800',
    fontSize: 20,
    color: COLORS.textDark,
  },
  cardTitleActive: {
    color: COLORS.secondary,
  },
  cardDesc: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  cardDescActive: {
    color: COLORS.textDark,
  },
});
