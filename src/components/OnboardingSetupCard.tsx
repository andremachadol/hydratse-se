import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  DEFAULT_END_TIME,
  DEFAULT_INTERVAL_MINUTES,
  DEFAULT_START_TIME,
} from '../constants/config';
import { COLORS, SHADOWS } from '../constants/theme';
import { ONBOARDING_SETUP_COPY } from '../constants/uiCopy';
import type { CalculationMode } from '../types/index.ts';

interface OnboardingSetupCardProps {
  mode: CalculationMode;
  weight: string;
  autoGoalPreview: string;
  manualGoal: string;
  manualCup: string;
  inputAccessoryViewID: string;
  onWeightChange: (value: string) => void;
  onManualGoalChange: (value: string) => void;
  onManualCupChange: (value: string) => void;
  onStart: () => void;
}

export default function OnboardingSetupCard({
  mode,
  weight,
  autoGoalPreview,
  manualGoal,
  manualCup,
  inputAccessoryViewID,
  onWeightChange,
  onManualGoalChange,
  onManualCupChange,
  onStart,
}: OnboardingSetupCardProps) {
  const modeCopy = ONBOARDING_SETUP_COPY.modes[mode];

  return (
    <View style={styles.formColumn}>
      <View style={styles.formContainer}>
        <Text style={styles.formEyebrow}>{ONBOARDING_SETUP_COPY.formEyebrow}</Text>
        <Text style={styles.formTitle}>{modeCopy.title}</Text>
        <Text style={styles.formDescription}>{modeCopy.summary}</Text>

        {mode === 'auto' ? (
          <View>
            <Text style={styles.label}>{ONBOARDING_SETUP_COPY.auto.weightLabel}</Text>
            <TextInput
              key="input-weight"
              style={styles.input}
              placeholder={ONBOARDING_SETUP_COPY.auto.weightPlaceholder}
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={onWeightChange}
              inputAccessoryViewID={inputAccessoryViewID}
            />

            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>{ONBOARDING_SETUP_COPY.auto.previewLabel}</Text>
              <Text style={styles.previewValue}>
                {weight.length > 0 ? autoGoalPreview : ONBOARDING_SETUP_COPY.auto.previewEmpty}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.fieldGroup}>
            <View>
              <Text style={styles.label}>{ONBOARDING_SETUP_COPY.manual.goalLabel}</Text>
              <TextInput
                key="input-goal"
                style={styles.input}
                placeholder={ONBOARDING_SETUP_COPY.manual.goalPlaceholder}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                value={manualGoal}
                onChangeText={onManualGoalChange}
                inputAccessoryViewID={inputAccessoryViewID}
              />
            </View>

            <View>
              <Text style={[styles.label, styles.spacedLabel]}>
                {ONBOARDING_SETUP_COPY.manual.cupLabel}
              </Text>
              <TextInput
                key="input-cup"
                style={styles.input}
                placeholder={ONBOARDING_SETUP_COPY.manual.cupPlaceholder}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                value={manualCup}
                onChangeText={onManualCupChange}
                inputAccessoryViewID={inputAccessoryViewID}
              />
            </View>
          </View>
        )}

        <View style={styles.setupSummary}>
          <Text style={styles.setupSummaryTitle}>{ONBOARDING_SETUP_COPY.summaryTitle}</Text>
          <Text style={styles.setupSummaryText}>
            {ONBOARDING_SETUP_COPY.summaryWindowPrefix} {DEFAULT_START_TIME}{' '}
            {ONBOARDING_SETUP_COPY.summaryWindowSeparator} {DEFAULT_END_TIME}
          </Text>
          <Text style={styles.setupSummaryText}>
            {ONBOARDING_SETUP_COPY.summaryReminderPrefix} {DEFAULT_INTERVAL_MINUTES}{' '}
            {ONBOARDING_SETUP_COPY.summaryReminderSuffix}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={onStart} activeOpacity={0.9}>
        <Text style={styles.buttonText}>{ONBOARDING_SETUP_COPY.startButtonLabel}</Text>
        <Text style={styles.buttonCaption}>{ONBOARDING_SETUP_COPY.startButtonCaption}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formColumn: {
    width: '100%',
  },
  formContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 22,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    ...SHADOWS.medium,
    marginBottom: 22,
  },
  formEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  formTitle: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  formDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textLight,
    marginBottom: 18,
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  spacedLabel: {
    marginTop: 18,
  },
  input: {
    backgroundColor: COLORS.surface,
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.black,
  },
  previewCard: {
    marginTop: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: COLORS.surfacePrimary,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  previewValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  setupSummary: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 6,
  },
  setupSummaryTitle: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  setupSummaryText: {
    color: COLORS.textLight,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    width: '100%',
    minHeight: 76,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    ...SHADOWS.primary,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  buttonCaption: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.86)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
