import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback, Switch } from 'react-native';
import { UserConfig, CalculationMode } from '../types';
import { COLORS, SHADOWS } from '../constants/theme';
import { MIN_WEIGHT, MAX_WEIGHT, HEALTH_WARNING_WEIGHT, ML_PER_KG } from '../constants/config';
import { timeToMinutes } from '../utils/time';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newConfig: UserConfig) => void;
  currentConfig: UserConfig;
}

export default function SettingsModal({ visible, onClose, onSave, currentConfig }: SettingsModalProps) {
  // Estados
  const [mode, setMode] = useState<CalculationMode>('auto');
  const [weight, setWeight] = useState('');
  const [manualGoal, setManualGoal] = useState('');
  const [manualCup, setManualCup] = useState('');
  
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [interval, setInterval] = useState(60);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (visible) {
      setMode(currentConfig.mode || 'auto');
      setWeight(currentConfig.weight.toString());
      setManualCup(currentConfig.manualCupSize?.toString() || '500');
      // No modo manual, a meta atual é a meta manual. No auto, calculamos na hora de salvar.
      setManualGoal(currentConfig.dailyGoalMl.toString());
      
      setStartTime(currentConfig.startTime);
      setEndTime(currentConfig.endTime);
      setInterval(currentConfig.intervalMinutes);
      setNotificationsEnabled(currentConfig.notificationsEnabled ?? true);
    }
  }, [visible, currentConfig]);

  // Formatações
  const formatNumber = (text: string) => text.replace(/\D/g, ''); // Só números inteiros para ml
  
  const handleWeightChange = (text: string) => {
     // (Mantém lógica de peso com vírgula do código anterior...)
     const digits = text.replace(/\D/g, '');
     const limited = digits.slice(0, 5);
     if (limited === '') { setWeight(''); return; }
     const numValue = parseInt(limited, 10) / 100;
     setWeight(numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleSave = () => {
    // Validação de horários
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      Alert.alert("Erro", "Use o formato HH:MM (ex: 08:00).");
      return;
    }

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      Alert.alert("Erro", "O horário de acordar deve ser antes do horário de dormir.");
      return;
    }

    let newConfig: UserConfig = {
        mode,
        startTime,
        endTime,
        intervalMinutes: interval,
        notificationsEnabled,
        weight: parseFloat(weight.replace(',', '.')) || 0,
        manualCupSize: parseInt(manualCup) || 500,
        dailyGoalMl: 0,
    };

    if (mode === 'auto') {
        const weightNum = parseFloat(weight.replace(',', '.'));
        if (!weightNum || isNaN(weightNum)) {
          return Alert.alert("Erro", "Digite um peso válido.");
        }
        if (weightNum < MIN_WEIGHT || weightNum > MAX_WEIGHT) {
          return Alert.alert("Erro", `Peso deve estar entre ${MIN_WEIGHT}kg e ${MAX_WEIGHT}kg.`);
        }
        if (weightNum > HEALTH_WARNING_WEIGHT) {
          Alert.alert("Atenção", "Peso muito elevado, considere consultar um médico.");
        }
        newConfig.dailyGoalMl = weightNum * ML_PER_KG;
    } else {
        const goal = parseInt(manualGoal);
        const cup = parseInt(manualCup);
        if (!goal || goal < 500) return Alert.alert("Erro", "Meta diária muito baixa (mínimo 500ml).");
        if (!cup || cup < 50) return Alert.alert("Erro", "Tamanho do copo inválido.");

        newConfig.dailyGoalMl = goal;
        newConfig.manualCupSize = cup;
    }

    onSave(newConfig);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Configurar Jornada</Text>

            {/* --- SELETOR DE MODO (TABS) --- */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tabButton, mode === 'auto' && styles.tabActive]} 
                    onPress={() => setMode('auto')}
                >
                    <Text style={[styles.tabText, mode === 'auto' && styles.tabTextActive]}>🤖 Automático</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabButton, mode === 'manual' && styles.tabActive]} 
                    onPress={() => setMode('manual')}
                >
                    <Text style={[styles.tabText, mode === 'manual' && styles.tabTextActive]}>⚙️ Manual</Text>
                </TouchableOpacity>
            </View>

            {/* CONTEÚDO DINÂMICO BASEADO NO MODO */}
            
            {mode === 'auto' ? (
                // --- MODO AUTO (Só pede peso) ---
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Seu Peso (kg)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="number-pad"
                        value={weight}
                        onChangeText={handleWeightChange}
                        placeholder="Ex: 70,00"
                    />
                    <Text style={styles.helperText}>Meta calculada: {(parseFloat(weight.replace(',', '.') || '0') * 35).toFixed(0)} ml</Text>
                </View>
            ) : (
                // --- MODO MANUAL (Pede Meta e Copo) ---
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Meta Diária (ml)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="number-pad"
                            value={manualGoal}
                            onChangeText={(t) => setManualGoal(formatNumber(t))}
                            placeholder="3000"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Sua Garrafa (ml)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="number-pad"
                            value={manualCup}
                            onChangeText={(t) => setManualCup(formatNumber(t))}
                            placeholder="500"
                        />
                    </View>
                </View>
            )}

            {/* --- CONFIGURAÇÕES COMUNS (Notificações e Horários) --- */}
            <View style={styles.divider} />
            
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Lembretes de Hidratação</Text>
              <Switch
                trackColor={{ false: "#767577", true: COLORS.primaryLight }}
                thumbColor={notificationsEnabled ? COLORS.primary : "#f4f3f4"}
                onValueChange={setNotificationsEnabled}
                value={notificationsEnabled}
              />
            </View>

            {/* Horários (Só mostra se notificação estiver ativa, ou sempre, você decide. Deixei sempre visível) */}
             <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Acordar</Text>
                <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} maxLength={5} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Dormir</Text>
                <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} maxLength={5} />
              </View>
            </View>

            {/* Intervalo */}
            <Text style={[styles.label, !notificationsEnabled && { opacity: 0.5 }]}>Intervalo entre goles:</Text>
            <View style={styles.intervalContainer}>
                {[30, 60].map(m => (
                    <TouchableOpacity 
                        key={m} 
                        style={[styles.intervalBtn, interval === m && styles.intervalBtnSelected, !notificationsEnabled && {opacity: 0.5}]}
                        onPress={() => notificationsEnabled && setInterval(m)}
                        disabled={!notificationsEnabled}
                    >
                        <Text style={[styles.intervalText, interval === m && styles.intervalTextSelected]}>{m} min</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Botões Salvar/Cancelar */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={onClose}>
                <Text style={styles.textStyle}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonSave]} onPress={handleSave}>
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
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', backgroundColor: COLORS.white, borderRadius: 20, padding: 20, alignItems: 'center', ...SHADOWS.medium },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: COLORS.secondary },
  
  // ESTILOS DAS ABAS
  tabContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: COLORS.surfaceLight, borderRadius: 10, padding: 4 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.white, ...SHADOWS.small },
  tabText: { color: COLORS.textLight, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary, fontWeight: 'bold' },

  inputGroup: { width: '100%', marginBottom: 15 },
  row: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  label: { fontSize: 14, color: COLORS.textLight, marginBottom: 5, fontWeight: '600' },
  input: { width: '100%', height: 45, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, fontSize: 16, backgroundColor: COLORS.surface },
  helperText: { fontSize: 12, color: COLORS.primary, marginTop: 4, textAlign: 'right' },
  
  divider: { width: '100%', height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  
  switchContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  
  intervalContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 20 },
  intervalBtn: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, alignItems: 'center', marginHorizontal: 5, backgroundColor: COLORS.white },
  intervalBtnSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  intervalText: { color: COLORS.textLight, fontWeight: '600' },
  intervalTextSelected: { color: 'white' },
  
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: { borderRadius: 10, padding: 12, elevation: 2, flex: 0.45, alignItems: 'center' },
  buttonSave: { backgroundColor: COLORS.primary },
  buttonCancel: { backgroundColor: COLORS.danger },
  textStyle: { color: 'white', fontWeight: 'bold' },
});