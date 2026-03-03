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
  InputAccessoryView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../constants/theme';
import { CalculationMode, DayProgress, UserConfig } from '../types';
import {
  ML_PER_KG,
  DEFAULT_START_TIME,
  DEFAULT_END_TIME,
  DEFAULT_INTERVAL_MINUTES,
  DEFAULT_NOTIFICATIONS_ENABLED,
  SAFE_MAX_ML_PER_HOUR,
  MIN_WEIGHT,
  MAX_WEIGHT,
} from '../constants/config';
import { calculateSafeGoalForRemainingWindow, isLateStartToday } from '../utils/dailyGoal';
import { getTodayDate, timeToMinutes } from '../utils/time';
import * as Storage from '../services/storage';

interface WelcomeScreenProps {
  onFinish: () => void;
}

export default function WelcomeScreen({ onFinish }: WelcomeScreenProps) {
  const [mode, setMode] = useState<CalculationMode>('auto');
  const [weight, setWeight] = useState('');
  const [manualGoal, setManualGoal] = useState('3000');
  const [manualCup, setManualCup] = useState('500');

  const inputAccessoryViewID = 'doneButtonID';

  const askLateStartGoalStrategy = async (): Promise<'keep' | 'adjust'> => {
    if (Platform.OS === 'web') {
      const adjust = window.confirm(
        'Sua jornada de hidratacao ja comecou hoje. Clique em OK para ajustar apenas a meta de hoje.'
      );
      return adjust ? 'adjust' : 'keep';
    }

    return new Promise((resolve) => {
      Alert.alert(
        'Jornada ja iniciada',
        'Sua janela de hidratacao ja comecou hoje. Deseja ajustar somente a meta de hoje por seguranca?',
        [
          { text: 'Manter meta normal', onPress: () => resolve('keep') },
          { text: 'Ajustar meta de hoje', onPress: () => resolve('adjust') },
        ],
        { cancelable: false }
      );
    });
  };

  const handleStart = async () => {
    Keyboard.dismiss();
    let finalWeight = 0;
    let finalGoal = 0;
    let finalCup = 500;

    if (mode === 'auto') {
      finalWeight = parseFloat(weight.replace(',', '.'));
      if (!finalWeight || finalWeight < MIN_WEIGHT || finalWeight > MAX_WEIGHT) {
        return Alert.alert('Ops', 'Informe um peso valido (kg).');
      }
      finalGoal = finalWeight * ML_PER_KG;
    } else {
      const cleanGoal = manualGoal.replace(/[^0-9]/g, '');
      const cleanCup = manualCup.replace(/[^0-9]/g, '');

      finalGoal = parseInt(cleanGoal, 10);
      finalCup = parseInt(cleanCup, 10);

      if (!finalGoal || finalGoal < 500) return Alert.alert('Ops', 'Meta minima: 500ml.');
      if (!finalCup || finalCup < 50) return Alert.alert('Ops', 'Copo invalido.');
      finalWeight = 70;
    }

    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const startMins = timeToMinutes(DEFAULT_START_TIME);
    const endMins = timeToMinutes(DEFAULT_END_TIME);

    let todayGoalOverrideMl: number | undefined;
    if (isLateStartToday(nowMins, startMins, endMins)) {
      const strategy = await askLateStartGoalStrategy();
      if (strategy === 'adjust') {
        const safeGoalToday = calculateSafeGoalForRemainingWindow(
          finalGoal,
          nowMins,
          endMins,
          SAFE_MAX_ML_PER_HOUR
        );

        if (safeGoalToday > 0 && safeGoalToday < finalGoal) {
          todayGoalOverrideMl = safeGoalToday;
          Alert.alert(
            'Meta de hoje ajustada',
            `Hoje sua meta sera ${safeGoalToday}ml. Amanha volta para a meta normal automaticamente.`
          );
        } else {
          Alert.alert(
            'Sem ajuste necessario',
            'Nao foi necessario ajustar a meta de hoje. A meta normal sera mantida.'
          );
        }
      }
    }

    const newConfig: UserConfig = {
      weight: finalWeight,
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
      intervalMinutes: DEFAULT_INTERVAL_MINUTES,
      dailyGoalMl: finalGoal,
      notificationsEnabled: DEFAULT_NOTIFICATIONS_ENABLED,
      mode,
      manualCupSize: finalCup,
    };

    const savedConfig = await Storage.saveConfig(newConfig);
    if (!savedConfig) {
      return Alert.alert('Erro', 'Nao foi possivel salvar suas configuracoes. Tente novamente.');
    }

    const initialProgress: DayProgress = {
      consumedMl: 0,
      drinks: [],
      streak: 0,
      lastDrinkDate: '',
      goalOverrideMl: todayGoalOverrideMl,
      goalOverrideDate: todayGoalOverrideMl ? getTodayDate() : undefined,
    };
    const savedProgress = await Storage.saveProgress(initialProgress);
    if (!savedProgress) {
      return Alert.alert('Erro', 'Nao foi possivel preparar o progresso inicial. Tente novamente.');
    }

    onFinish();
  };

  return (
    <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.emoji}>💧</Text>
        <Text style={styles.title}>Bem-vindo ao Hydrate-Se</Text>
        <Text style={styles.subtitle}>Como voce prefere planejar sua hidratacao?</Text>

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
            <Text style={[styles.cardTitle, mode === 'auto' && styles.textActive]}>Automatico</Text>
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
            <Text style={[styles.cardDesc, mode === 'manual' && styles.textActive]}>Voce define</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={mode === 'auto' ? {} : { display: 'none' }}>
            <Text style={styles.label}>Qual seu peso (kg)?</Text>
            <TextInput
              key="input-weight"
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
                Meta:{' '}
                <Text style={{ fontWeight: 'bold' }}>
                  {(parseFloat(weight.replace(',', '.') || '0') * 35).toFixed(0)} ml
                </Text>
              </Text>
            )}
          </View>

          <View style={mode === 'manual' ? {} : { display: 'none' }}>
            <Text style={styles.label}>Meta diaria (ml)</Text>
            <TextInput
              key="input-goal"
              style={styles.input}
              placeholder="Ex: 3000"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={manualGoal}
              onChangeText={setManualGoal}
              inputAccessoryViewID={inputAccessoryViewID}
            />

            <Text style={[styles.label, { marginTop: 20 }]}>Tamanho da garrafa (ml)</Text>
            <TextInput
              key="input-cup"
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
          <Text style={styles.buttonText}>Comecar Jornada 🚀</Text>
        </TouchableOpacity>
      </ScrollView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.accessory}>
            <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.accessoryButton}>
              <Text style={styles.accessoryText}>Concluido</Text>
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
    borderColor: 'transparent',
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
  button: {
    width: '100%',
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  buttonText: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },

  accessory: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#dedede',
  },
  accessoryButton: { paddingHorizontal: 10 },
  accessoryText: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 },
});
