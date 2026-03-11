import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  Modal,
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

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newConfig: UserConfig) => Promise<boolean>;
  currentConfig: UserConfig;
}

export default function SettingsModal({
  visible,
  onClose,
  onSave,
  currentConfig,
}: SettingsModalProps) {
  const { width } = useWindowDimensions();
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

  const modalWidth = Math.min(width - 24, width >= 840 ? 560 : 420);

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { width: modalWidth }]}>
            <Text style={styles.modalTitle}>Ajustar rotina</Text>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, mode === 'auto' && styles.tabActive]}
                onPress={() => setMode('auto')}
              >
                <Text style={[styles.tabText, mode === 'auto' && styles.tabTextActive]}>
                  Automático
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, mode === 'manual' && styles.tabActive]}
                onPress={() => setMode('manual')}
              >
                <Text style={[styles.tabText, mode === 'manual' && styles.tabTextActive]}>
                  Manual
                </Text>
              </TouchableOpacity>
            </View>

            {mode === 'auto' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Seu Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={(text) => setWeight(formatWeightInput(text))}
                  placeholder="Ex: 70,00"
                />
                <Text style={styles.helperText}>
                  Meta calculada: {(parseFloat(weight.replace(',', '.') || '0') * 35).toFixed(0)} ml
                </Text>
              </View>
            ) : (
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Meta diária (ml)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={manualGoal}
                    onChangeText={(text) => setManualGoal(formatIntegerInput(text))}
                    placeholder="3000"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Sua Garrafa (ml)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={manualCup}
                    onChangeText={(text) => setManualCup(formatIntegerInput(text))}
                    placeholder="500"
                  />
                </View>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Lembretes de hidratação</Text>
              <Switch
                trackColor={{ false: COLORS.switchTrackOff, true: COLORS.primaryLight }}
                thumbColor={notificationsEnabled ? COLORS.primary : COLORS.switchThumbOff}
                onValueChange={setNotificationsEnabled}
                value={notificationsEnabled}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Início do dia</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={(text) => setStartTime(formatTimeInput(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                  placeholder="08:00"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Fim do dia</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={(text) => setEndTime(formatTimeInput(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                  placeholder="18:00"
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

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={onClose}>
                <Text style={styles.textStyle}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={() => void handleSave()}
              >
                <Text style={styles.textStyle}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: COLORS.secondary },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    padding: 4,
  },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.white, ...SHADOWS.small },
  tabText: { color: COLORS.textLight, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  inputGroup: { width: '100%', marginBottom: 15 },
  row: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  label: { fontSize: 14, color: COLORS.textLight, marginBottom: 5, fontWeight: '600' },
  disabledLabel: { opacity: 0.5 },
  input: {
    width: '100%',
    height: 45,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: COLORS.surface,
  },
  helperText: { fontSize: 12, color: COLORS.primary, marginTop: 4, textAlign: 'right' },
  divider: { width: '100%', height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  switchContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  intervalContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  intervalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: COLORS.white,
  },
  intervalBtnSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  intervalBtnDisabled: { opacity: 0.5 },
  intervalText: { color: COLORS.textLight, fontWeight: '600' },
  intervalTextSelected: { color: 'white' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: { borderRadius: 10, padding: 12, elevation: 2, flex: 0.45, alignItems: 'center' },
  buttonSave: { backgroundColor: COLORS.primary },
  buttonCancel: { backgroundColor: COLORS.danger },
  textStyle: { color: 'white', fontWeight: 'bold' },
});
