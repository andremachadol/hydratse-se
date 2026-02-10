import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ScrollView,
  Keyboard,
  InputAccessoryView, // Trouxe de volta pq é útil no iOS
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../constants/theme';
import { CalculationMode, UserConfig } from '../types';
import { 
  ML_PER_KG, 
  DEFAULT_START_TIME, 
  DEFAULT_END_TIME, 
  DEFAULT_INTERVAL_MINUTES, 
  DEFAULT_NOTIFICATIONS_ENABLED,
  MIN_WEIGHT,
  MAX_WEIGHT
} from '../constants/config';
import * as Storage from '../services/storage';

interface WelcomeScreenProps {
  onFinish: () => void;
}

export default function WelcomeScreen({ onFinish }: WelcomeScreenProps) {
  const [mode, setMode] = useState<CalculationMode>('auto');
  
  // Estados separados
  const [weight, setWeight] = useState('');
  const [manualGoal, setManualGoal] = useState('3000');
  const [manualCup, setManualCup] = useState('500');

  const inputAccessoryViewID = 'doneButtonID';

  const handleStart = async () => {
    Keyboard.dismiss();
    let finalWeight = 0;
    let finalGoal = 0;
    let finalCup = 500;

    if (mode === 'auto') {
      finalWeight = parseFloat(weight.replace(',', '.'));
      if (!finalWeight || finalWeight < MIN_WEIGHT || finalWeight > MAX_WEIGHT) {
        return Alert.alert("Ops", "Informe um peso válido (kg).");
      }
      finalGoal = finalWeight * ML_PER_KG;
    } else {
      // Manual
      const cleanGoal = manualGoal.replace(/[^0-9]/g, '');
      const cleanCup = manualCup.replace(/[^0-9]/g, '');
      
      finalGoal = parseInt(cleanGoal);
      finalCup = parseInt(cleanCup);

      if (!finalGoal || finalGoal < 500) return Alert.alert("Ops", "Meta mínima: 500ml.");
      if (!finalCup || finalCup < 50) return Alert.alert("Ops", "Copo inválido.");
      finalWeight = 70; 
    }

    const newConfig: UserConfig = {
      weight: finalWeight,
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
      intervalMinutes: DEFAULT_INTERVAL_MINUTES,
      dailyGoalMl: finalGoal,
      notificationsEnabled: DEFAULT_NOTIFICATIONS_ENABLED,
      mode: mode,
      manualCupSize: finalCup,
    };

    await Storage.saveConfig(newConfig);
    onFinish();
  };

  return (
    <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        
        <Text style={styles.emoji}>💧</Text>
        <Text style={styles.title}>Bem-vindo ao Hydrate-Se</Text>
        <Text style={styles.subtitle}>Como você prefere planejar sua hidratação?</Text>

        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={[styles.card, mode === 'auto' && styles.cardActive]}
            onPress={() => {
              Keyboard.dismiss();
              setMode('auto');
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.cardIcon}>🤖</Text>
            <Text style={[styles.cardTitle, mode === 'auto' && styles.textActive]}>Automático</Text>
            <Text style={[styles.cardDesc, mode === 'auto' && styles.textActive]}>Pelo peso</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, mode === 'manual' && styles.cardActive]}
            onPress={() => {
              Keyboard.dismiss();
              setMode('manual');
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.cardIcon}>⚙️</Text>
            <Text style={[styles.cardTitle, mode === 'manual' && styles.textActive]}>Manual</Text>
            <Text style={[styles.cardDesc, mode === 'manual' && styles.textActive]}>Você define</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          
          {/* --- BLOCO AUTOMÁTICO --- */}
          {/* Usamos display: 'none' em vez de remover do DOM. Isso mantém o input "vivo" */}
          <View style={mode === 'auto' ? {} : { display: 'none' }}>
            <Text style={styles.label}>Qual seu peso (kg)?</Text>
            <TextInput 
              key="input-weight" // Chave única para evitar conflito
              style={styles.input} 
              placeholder="Ex: 70,5" 
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
              inputAccessoryViewID={inputAccessoryViewID}
            />
            {weight.length > 0 && (
              <Text style={styles.previewText}>
                Meta: <Text style={{fontWeight: 'bold'}}>{(parseFloat(weight.replace(',', '.')||'0') * 35).toFixed(0)} ml</Text>
              </Text>
            )}
          </View>

          {/* --- BLOCO MANUAL --- */}
          <View style={mode === 'manual' ? {} : { display: 'none' }}>
            
            {/* META DIÁRIA */}
            <Text style={styles.label}>Meta Diária (ml)</Text>
            <TextInput 
              key="input-goal" // Chave única
              style={styles.input} 
              placeholder="Ex: 3000" 
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={manualGoal}
              onChangeText={setManualGoal}
              inputAccessoryViewID={inputAccessoryViewID}
            />
            
            {/* TAMANHO GARRAFA */}
            <Text style={[styles.label, {marginTop: 20}]}>Tamanho da Garrafa (ml)</Text>
            <TextInput 
              key="input-cup" // Chave única
              style={styles.input} 
              placeholder="Ex: 500" 
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={manualCup}
              onChangeText={setManualCup}
              inputAccessoryViewID={inputAccessoryViewID}
            />
          </View>

        </View>

        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Começar Jornada 🚀</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Barra de Concluído para fechar teclado no iOS */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.accessory}>
            <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.accessoryButton}>
              <Text style={styles.accessoryText}>Concluído</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60, alignItems: 'center' },
  emoji: { fontSize: 50, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: COLORS.textLight, marginBottom: 30, textAlign: 'center' },
  
  cardsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  card: { 
    width: '48%', 
    backgroundColor: 'rgba(255,255,255,0.6)', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  cardActive: { backgroundColor: COLORS.white, borderColor: COLORS.primary, ...SHADOWS.medium },
  cardIcon: { fontSize: 32, marginBottom: 10 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: COLORS.textDark, marginBottom: 5 },
  cardDesc: { fontSize: 12, color: COLORS.textLight, textAlign: 'center' },
  textActive: { color: COLORS.secondary },

  formContainer: { 
    width: '100%', 
    backgroundColor: COLORS.white, 
    padding: 20, 
    borderRadius: 20, 
    ...SHADOWS.small, 
    marginBottom: 30,
  },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  
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
  button: { width: '100%', height: 60, backgroundColor: COLORS.primary, borderRadius: 30, justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium },
  buttonText: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },

  accessory: { backgroundColor: '#f8f8f8', padding: 10, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#dedede' },
  accessoryButton: { paddingHorizontal: 10 },
  accessoryText: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 }
});