import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import {
  DEFAULT_END_TIME,
  DEFAULT_INTERVAL_MINUTES,
  DEFAULT_START_TIME,
} from '../constants/config';
import type { CalculationMode } from '../types/index.ts';

interface WelcomeSetupPanelProps {
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

export default function WelcomeSetupPanel({
  mode,
  weight,
  manualGoal,
  manualCup,
  inputAccessoryViewID,
  onWeightChange,
  onManualGoalChange,
  onManualCupChange,
  onStart,
}: WelcomeSetupPanelProps) {
  return (
    <View style={styles.formColumn}>
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Seus dados iniciais</Text>

        {mode === 'auto' ? (
          <View>
            <Text style={styles.label}>Qual seu peso (kg)?</Text>
            <TextInput
              key="input-weight"
              style={styles.input}
              placeholder="Ex: 70,5"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={onWeightChange}
              inputAccessoryViewID={inputAccessoryViewID}
            />
            {weight.length > 0 ? (
              <Text style={styles.previewText}>
                Meta:{' '}
                <Text style={styles.previewValue}>
                  {(parseFloat(weight.replace(',', '.') || '0') * 35).toFixed(0)} ml
                </Text>
              </Text>
            ) : null}
          </View>
        ) : (
          <View>
            <Text style={styles.label}>Meta diária (ml)</Text>
            <TextInput
              key="input-goal"
              style={styles.input}
              placeholder="Ex: 3000"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={manualGoal}
              onChangeText={onManualGoalChange}
              inputAccessoryViewID={inputAccessoryViewID}
            />

            <Text style={[styles.label, styles.spacedLabel]}>Tamanho do copo ou garrafa (ml)</Text>
            <TextInput
              key="input-cup"
              style={styles.input}
              placeholder="Ex: 500"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={manualCup}
              onChangeText={onManualCupChange}
              inputAccessoryViewID={inputAccessoryViewID}
            />
          </View>
        )}

        <View style={styles.setupSummary}>
          <Text style={styles.setupSummaryTitle}>Configuração inicial</Text>
          <Text style={styles.setupSummaryText}>
            Janela padrão: {DEFAULT_START_TIME} às {DEFAULT_END_TIME}
          </Text>
          <Text style={styles.setupSummaryText}>
            Lembretes a cada {DEFAULT_INTERVAL_MINUTES} min, se a permissão for concedida
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>Começar jornada</Text>
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
    padding: 20,
    borderRadius: 24,
    ...SHADOWS.small,
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 16,
  },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  spacedLabel: { marginTop: 20 },
  input: {
    backgroundColor: COLORS.surface,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: '#000000',
  },
  previewText: { marginTop: 10, color: COLORS.primary, textAlign: 'right' },
  previewValue: { fontWeight: 'bold' },
  setupSummary: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E7EFF3',
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
    height: 62,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  buttonText: { color: COLORS.white, fontSize: 19, fontWeight: '800' },
});
