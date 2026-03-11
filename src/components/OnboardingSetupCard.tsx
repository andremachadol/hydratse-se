import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import {
  DEFAULT_END_TIME,
  DEFAULT_INTERVAL_MINUTES,
  DEFAULT_START_TIME,
} from '../constants/config';
import type { CalculationMode } from '../types/index.ts';

interface OnboardingSetupCardProps {
  mode: CalculationMode;
  weight: string;
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
  manualGoal,
  manualCup,
  inputAccessoryViewID,
  onWeightChange,
  onManualGoalChange,
  onManualCupChange,
  onStart,
}: OnboardingSetupCardProps) {
  const autoGoalPreview =
    weight.length > 0
      ? `${(parseFloat(weight.replace(',', '.') || '0') * 35).toFixed(0)} ml`
      : 'Preencha o peso';
  const modeSummary =
    mode === 'auto'
      ? 'A meta será recalculada a partir do peso informado.'
      : 'Você define a meta diária e o tamanho base de cada registro.';

  return (
    <View style={styles.formColumn}>
      <View style={styles.formContainer}>
        <Text style={styles.formEyebrow}>Configuração inicial</Text>
        <Text style={styles.formTitle}>
          {mode === 'auto' ? 'Informe seu peso' : 'Defina sua meta manual'}
        </Text>
        <Text style={styles.formDescription}>{modeSummary}</Text>

        {mode === 'auto' ? (
          <View>
            <Text style={styles.label}>Qual seu peso (kg)?</Text>
            <TextInput
              key="input-weight"
              style={styles.input}
              placeholder="Ex: 70,5"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={onWeightChange}
              inputAccessoryViewID={inputAccessoryViewID}
            />

            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Meta estimada</Text>
              <Text style={styles.previewValue}>{autoGoalPreview}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.fieldGroup}>
            <View>
              <Text style={styles.label}>Meta diária (ml)</Text>
              <TextInput
                key="input-goal"
                style={styles.input}
                placeholder="Ex: 3000"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                value={manualGoal}
                onChangeText={onManualGoalChange}
                inputAccessoryViewID={inputAccessoryViewID}
              />
            </View>

            <View>
              <Text style={[styles.label, styles.spacedLabel]}>
                Tamanho do copo ou garrafa (ml)
              </Text>
              <TextInput
                key="input-cup"
                style={styles.input}
                placeholder="Ex: 500"
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
          <Text style={styles.setupSummaryTitle}>Ajustes padrão</Text>
          <Text style={styles.setupSummaryText}>
            Janela inicial: {DEFAULT_START_TIME} às {DEFAULT_END_TIME}
          </Text>
          <Text style={styles.setupSummaryText}>
            Lembretes a cada {DEFAULT_INTERVAL_MINUTES} min, se a permissão for concedida
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={onStart} activeOpacity={0.9}>
        <Text style={styles.buttonText}>Começar jornada</Text>
        <Text style={styles.buttonCaption}>Você pode revisar tudo nas configurações depois.</Text>
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
