// src/components/SettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { UserConfig } from '../types';
import { COLORS } from '../constants/theme';
import { MIN_WEIGHT, MAX_WEIGHT, HEALTH_WARNING_WEIGHT, ML_PER_KG } from '../constants/config';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newConfig: UserConfig) => void;
  currentConfig: UserConfig;
}

export default function SettingsModal({ visible, onClose, onSave, currentConfig }: SettingsModalProps) {
  // Estados para os novos campos
  const [weight, setWeight] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [interval, setInterval] = useState(60); // 30 ou 60 minutos

  // Carrega os dados atuais quando abre o modal
  useEffect(() => {
    if (visible) {
      setWeight(currentConfig.weight.toString());
      setStartTime(currentConfig.startTime);
      setEndTime(currentConfig.endTime);
      setInterval(currentConfig.intervalMinutes);
    }
  }, [visible, currentConfig]);

  // Formata peso automaticamente: digitar "7050" vira "70,50"
  const handleWeightChange = (text: string) => {
    // Remove tudo que não é número
    const digits = text.replace(/\D/g, '');

    // Limita a 5 dígitos (999,99 = 99999)
    const limited = digits.slice(0, 5);

    if (limited === '') {
      setWeight('');
      return;
    }

    // Converte para número e formata com 2 casas decimais
    const numValue = parseInt(limited, 10) / 100;
    const formatted = numValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setWeight(formatted);
  };

  const handleSave = () => {
    // Validação de peso
    const weightNum = parseFloat(weight.replace(',', '.'));
    if (!weightNum || isNaN(weightNum)) {
      Alert.alert("Erro", "Digite um peso válido.");
      return;
    }

    if (weightNum < MIN_WEIGHT || weightNum > MAX_WEIGHT) {
      Alert.alert("Erro", `Peso deve estar entre ${MIN_WEIGHT}kg e ${MAX_WEIGHT}kg.`);
      return;
    }

    // Alerta de saúde para peso acima de 200kg
    if (weightNum > HEALTH_WARNING_WEIGHT) {
      Alert.alert("⚠️ Atenção", "Você está muito pesado, procure um médico.");
    }

    // Regex simples para garantir formato HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      Alert.alert("Erro", "Use o formato HH:MM (ex: 08:00).");
      return;
    }

    // Validação: horário de acordar deve ser antes do horário de dormir
    const timeToMinutes = (time: string): number => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      Alert.alert("Erro", "O horário de acordar deve ser antes do horário de dormir.");
      return;
    }

    // Salva a nova configuração
    onSave({
      weight: weightNum,
      startTime,
      endTime,
      intervalMinutes: interval,
      dailyGoalMl: weightNum * ML_PER_KG,
    });
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Configurar Jornada</Text>

          {/* Campo Peso */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Seu Peso (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={weight}
              onChangeText={handleWeightChange}
              placeholder="Ex: 70,00"
              maxLength={6}
            />
          </View>

          {/* Campos de Horário (Lado a Lado) */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Horário Inicial</Text>
              <TextInput
                style={styles.input}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="08:00"
                maxLength={5}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Horário Final</Text>
              <TextInput
                style={styles.input}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="22:00"
                maxLength={5}
              />
            </View>
          </View>

          {/* Seleção de Intervalo */}
          <Text style={styles.label}>Lembrar a cada:</Text>
          <View style={styles.intervalContainer}>
            <TouchableOpacity 
              style={[styles.intervalBtn, interval === 30 && styles.intervalBtnSelected]}
              onPress={() => setInterval(30)}
            >
              <Text style={[styles.intervalText, interval === 30 && styles.intervalTextSelected]}>30 min</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.intervalBtn, interval === 60 && styles.intervalBtnSelected]}
              onPress={() => setInterval(60)}
            >
              <Text style={[styles.intervalText, interval === 60 && styles.intervalTextSelected]}>1 Hora</Text>
            </TouchableOpacity>
          </View>

          {/* Botões de Ação */}
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
  modalView: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: COLORS.secondary },
  
  inputGroup: { width: '100%', marginBottom: 15 },
  row: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  label: { fontSize: 14, color: COLORS.textLight, marginBottom: 5, fontWeight: '600' },
  input: { width: '100%', height: 50, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, fontSize: 16, backgroundColor: '#F9F9F9' },
  
  intervalContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 25 },
  intervalBtn: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, alignItems: 'center', marginHorizontal: 5, backgroundColor: '#FFF' },
  intervalBtnSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  intervalText: { color: COLORS.textLight, fontWeight: '600' },
  intervalTextSelected: { color: 'white' },

  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: { borderRadius: 10, padding: 15, elevation: 2, flex: 0.45, alignItems: 'center' },
  buttonSave: { backgroundColor: COLORS.primary },
  buttonCancel: { backgroundColor: COLORS.danger },
  textStyle: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
});