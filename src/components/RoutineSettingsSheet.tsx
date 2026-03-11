import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import type { CalculationMode, UserConfig } from '../types';
import { COLORS, SHADOWS } from '../constants/theme';
import {
  formatIntegerInput,
  formatTimeInput,
  formatWeightInput,
  resolveUserConfigForm,
} from '../utils/configValidation';

interface RoutineSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newConfig: UserConfig) => Promise<boolean>;
  currentConfig: UserConfig;
}

export default function RoutineSettingsSheet({
  visible,
  onClose,
  onSave,
  currentConfig,
}: RoutineSettingsSheetProps) {
  const { width, height } = useWindowDimensions();
  const [mode, setMode] = useState<CalculationMode>('auto');
  const [weight, setWeight] = useState('');
  const [manualGoal, setManualGoal] = useState('');
  const [manualCup, setManualCup] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [interval, setInterval] = useState(60);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (!visible) return;

    setMode(currentConfig.mode || 'auto');
    setWeight(currentConfig.weight.toString());
    setManualCup(currentConfig.manualCupSize?.toString() || '500');
    setManualGoal(currentConfig.dailyGoalMl.toString());
    setStartTime(currentConfig.startTime);
    setEndTime(currentConfig.endTime);
    setInterval(currentConfig.intervalMinutes);
    setNotificationsEnabled(currentConfig.notificationsEnabled ?? true);
  }, [visible, currentConfig]);

  const handleSave = async () => {
    const resolvedConfig = resolveUserConfigForm({
      mode,
      weightInput: weight,
      manualGoalInput: manualGoal,
      manualCupInput: manualCup,
      startTime,
      endTime,
      intervalMinutes: interval,
      notificationsEnabled,
    });

    if (!resolvedConfig.ok) {
      Alert.alert('Erro', resolvedConfig.errorMessage);
      return;
    }

    if (resolvedConfig.warningMessage) {
      Alert.alert('Atenção', resolvedConfig.warningMessage);
    }

    try {
      const saved = await onSave(resolvedConfig.value);
      if (saved) {
        onClose();
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar as configurações.');
    }
  };

  const modalWidth = Math.min(width - 24, width >= 840 ? 620 : 480);
  const maxModalHeight = Math.min(height - 28, 760);
  const autoGoalPreview = `${(parseFloat(weight.replace(',', '.') || '0') * 35).toFixed(0)} ml`;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.modalView, { width: modalWidth, maxHeight: maxModalHeight }]}>
              <View style={styles.header}>
                <View style={styles.headerCopy}>
                  <Text style={styles.headerEyebrow}>Ajustes da rotina</Text>
                  <Text style={styles.modalTitle}>Refine sua hidratação</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.85}>
                  <Text style={styles.closeText}>Fechar</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Modo de cálculo</Text>
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[styles.tabButton, mode === 'auto' && styles.tabActive]}
                      onPress={() => setMode('auto')}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.tabText, mode === 'auto' && styles.tabTextActive]}>
                        Automático
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.tabButton, mode === 'manual' && styles.tabActive]}
                      onPress={() => setMode('manual')}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.tabText, mode === 'manual' && styles.tabTextActive]}>
                        Manual
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {mode === 'auto' ? (
                    <View>
                      <Text style={styles.label}>Seu peso (kg)</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="decimal-pad"
                        value={weight}
                        onChangeText={(text) => setWeight(formatWeightInput(text))}
                        placeholder="Ex: 70,5"
                        placeholderTextColor={COLORS.textMuted}
                      />
                      <View style={styles.inlineInfoCard}>
                        <Text style={styles.inlineInfoLabel}>Meta estimada</Text>
                        <Text style={styles.inlineInfoValue}>{autoGoalPreview}</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.fieldStack}>
                      <View>
                        <Text style={styles.label}>Meta diária (ml)</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="number-pad"
                          value={manualGoal}
                          onChangeText={(text) => setManualGoal(formatIntegerInput(text))}
                          placeholder="3000"
                          placeholderTextColor={COLORS.textMuted}
                        />
                      </View>
                      <View>
                        <Text style={[styles.label, styles.spacedLabel]}>Copo ou garrafa (ml)</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="number-pad"
                          value={manualCup}
                          onChangeText={(text) => setManualCup(formatIntegerInput(text))}
                          placeholder="500"
                          placeholderTextColor={COLORS.textMuted}
                        />
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.sectionCard}>
                  <View style={styles.switchRow}>
                    <View style={styles.switchCopy}>
                      <Text style={styles.sectionTitle}>Lembretes</Text>
                      <Text style={styles.sectionDescription}>
                        Ative para manter a rotina distribuída ao longo do dia.
                      </Text>
                    </View>
                    <Switch
                      trackColor={{ false: COLORS.switchTrackOff, true: COLORS.primaryLight }}
                      thumbColor={notificationsEnabled ? COLORS.primary : COLORS.switchThumbOff}
                      onValueChange={setNotificationsEnabled}
                      value={notificationsEnabled}
                    />
                  </View>

                  <View style={styles.scheduleRow}>
                    <View style={styles.scheduleField}>
                      <Text style={styles.label}>Início do dia</Text>
                      <TextInput
                        style={styles.input}
                        value={startTime}
                        onChangeText={(text) => setStartTime(formatTimeInput(text))}
                        keyboardType="number-pad"
                        maxLength={5}
                        placeholder="08:00"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                    <View style={styles.scheduleField}>
                      <Text style={styles.label}>Fim do dia</Text>
                      <TextInput
                        style={styles.input}
                        value={endTime}
                        onChangeText={(text) => setEndTime(formatTimeInput(text))}
                        keyboardType="number-pad"
                        maxLength={5}
                        placeholder="18:00"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>

                  <Text style={[styles.label, !notificationsEnabled && styles.disabledLabel]}>
                    Intervalo entre lembretes
                  </Text>
                  <View style={styles.intervalContainer}>
                    {[30, 60].map((minutes) => (
                      <TouchableOpacity
                        key={minutes}
                        style={[
                          styles.intervalBtn,
                          interval === minutes && styles.intervalBtnSelected,
                          !notificationsEnabled && styles.intervalBtnDisabled,
                        ]}
                        onPress={() => notificationsEnabled && setInterval(minutes)}
                        disabled={!notificationsEnabled}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.intervalText,
                            interval === minutes && styles.intervalTextSelected,
                          ]}
                        >
                          {minutes} min
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonCancel]}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSave]}
                  onPress={() => void handleSave()}
                  activeOpacity={0.9}
                >
                  <Text style={styles.buttonText}>Salvar ajustes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 34, 48, 0.42)',
    paddingHorizontal: 12,
  },
  modalView: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    ...SHADOWS.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  headerCopy: {
    flex: 1,
  },
  headerEyebrow: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalTitle: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  closeButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: COLORS.surfacePrimary,
  },
  closeText: {
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: 8,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  sectionDescription: {
    marginTop: 4,
    color: COLORS.textLight,
    fontSize: 13,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 14,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  tabText: {
    color: COLORS.textLight,
    fontWeight: '700',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  fieldStack: {
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 6,
    fontWeight: '700',
  },
  spacedLabel: {
    marginTop: 16,
  },
  input: {
    width: '100%',
    minHeight: 48,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: COLORS.surfaceElevated,
    color: COLORS.black,
  },
  inlineInfoCard: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: COLORS.surfacePrimary,
  },
  inlineInfoLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inlineInfoValue: {
    marginTop: 6,
    color: COLORS.secondary,
    fontSize: 20,
    fontWeight: '800',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  switchCopy: {
    flex: 1,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  scheduleField: {
    flex: 1,
  },
  disabledLabel: {
    opacity: 0.5,
    marginTop: 16,
  },
  intervalContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  intervalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
  },
  intervalBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  intervalBtnDisabled: {
    opacity: 0.5,
  },
  intervalText: {
    color: COLORS.textLight,
    fontWeight: '700',
  },
  intervalTextSelected: {
    color: COLORS.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 14,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSave: {
    flex: 1.3,
    backgroundColor: COLORS.primary,
  },
  buttonCancel: {
    flex: 1,
    backgroundColor: COLORS.surfaceDanger,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '800',
  },
});
