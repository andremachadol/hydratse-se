// src/components/SettingsModal.js
import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert 
} from 'react-native';
import { X, Calculator } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

import { UserConfig } from '../types';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newConfig: UserConfig) => void;
  currentConfig: UserConfig;}

export default function SettingsModal({ visible, onClose, onSave, currentConfig }: SettingsModalProps) {
  const [tempGoal, setTempGoal] = useState('');
  const [tempCup, setTempCup] = useState('');
  const [tempWeight, setTempWeight] = useState('');

  // Atualiza os campos quando abre o modal
  useEffect(() => {
    if (visible) {
      setTempGoal(currentConfig.dailyGoalMl.toString());
      setTempCup(currentConfig.perDrinkMl.toString());
    }
  }, [visible, currentConfig]);

  const handleSave = () => {
    if (!tempGoal || !tempCup) return;
    onSave({ dailyGoalMl: parseInt(tempGoal), perDrinkMl: parseInt(tempCup) });
    onClose();
  };

  const calculateByWeight = () => {
    if (!tempWeight) return;
    const weight = parseFloat(tempWeight.replace(',', '.'));
    if (!weight || weight <= 0) return Alert.alert("Ops", "Peso inválido");

    const suggestion = Math.ceil((weight * 35) / 50) * 50; // 35ml/kg arredondado
    Alert.alert("Sugestão", `Baseado no peso: ${suggestion}ml`, [
      { text: "Usar", onPress: () => setTempGoal(suggestion.toString()) }
    ]);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <View style={styles.content}>
              
              {/* Cabeçalho */}
              <View style={styles.header}>
                <Text style={styles.title}>Configurações</Text>
                <TouchableOpacity onPress={onClose}><X color={COLORS.textDark} size={24} /></TouchableOpacity>
              </View>

              {/* Calculadora */}
              <View style={styles.calcBox}>
                <Text style={styles.calcLabel}>Calcular pelo peso:</Text>
                <View style={styles.row}>
                  <TextInput 
                    style={[styles.input, { flex: 1, marginTop: 0 }]} 
                    placeholder="kg" 
                    keyboardType="decimal-pad"
                    value={tempWeight}
                    onChangeText={setTempWeight}
                  />
                  <TouchableOpacity style={styles.calcBtn} onPress={calculateByWeight}>
                    <Calculator color={COLORS.white} size={20} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Inputs Principais */}
              <Text style={styles.label}>Meta Diária (ml)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={tempGoal} 
                onChangeText={setTempGoal} 
              />

              <Text style={styles.label}>Tamanho do Copo (ml)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={tempCup} 
                onChangeText={setTempCup} 
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Salvar Alterações</Text>
              </TouchableOpacity>

            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  innerContainer: { flex: 1, justifyContent: 'flex-end' },
  content: { backgroundColor: COLORS.white, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  calcBox: { backgroundColor: '#F0F9FF', padding: 15, borderRadius: 10 },
  calcLabel: { color: COLORS.secondary, fontWeight: 'bold', marginBottom: 5 },
  row: { flexDirection: 'row', gap: 10 },
  calcBtn: { backgroundColor: COLORS.secondary, width: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 15 },
  label: { marginTop: 10, fontWeight: '600', color: COLORS.textLight },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, marginTop: 5, fontSize: 16, backgroundColor: '#FAFAFA' },
  saveBtn: { backgroundColor: COLORS.secondary, padding: 15, borderRadius: 10, marginTop: 25, alignItems: 'center' },
  saveText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});