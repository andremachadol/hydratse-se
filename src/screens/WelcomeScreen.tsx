import React, { useState } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../constants/theme';
import WelcomeModeCard from '../components/WelcomeModeCard';
import { CalculationMode, UserConfig } from '../types';
import {
  DEFAULT_START_TIME,
  DEFAULT_END_TIME,
  DEFAULT_INTERVAL_MINUTES,
  DEFAULT_NOTIFICATIONS_ENABLED,
  SAFE_MAX_ML_PER_HOUR,
  ML_PER_KG,
  MIN_WEIGHT,
  MAX_WEIGHT,
} from '../constants/config';
import { calculateSafeGoalForRemainingWindow, isLateStartToday } from '../utils/dailyGoal';
import { getTodayDate, timeToMinutes } from '../utils/time';
import { buildInitialProgress, resolveOnboardingInputs } from '../utils/onboarding';
import { formatIntegerInput, formatWeightInput } from '../utils/configValidation';
import { ensureNotificationPermission } from '../utils/notifications';
import * as Storage from '../services/storage';

interface WelcomeScreenProps {
  onFinish: () => void;
}

const COMPACT_MAX_WIDTH = 460;
const MEDIUM_MAX_WIDTH = 760;
const EXPANDED_MAX_WIDTH = 1080;

export default function WelcomeScreen({ onFinish }: WelcomeScreenProps) {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<CalculationMode>('auto');
  const [weight, setWeight] = useState('');
  const [manualGoal, setManualGoal] = useState('3000');
  const [manualCup, setManualCup] = useState('500');

  const isExpanded = width >= 840;
  const isMedium = width >= 600 && width < 840;
  const shellMaxWidth = isExpanded ? EXPANDED_MAX_WIDTH : isMedium ? MEDIUM_MAX_WIDTH : COMPACT_MAX_WIDTH;

  const inputAccessoryViewID = 'doneButtonID';

  const askLateStartGoalStrategy = async (): Promise<'keep' | 'adjust'> => {
    if (Platform.OS === 'web') {
      const adjust = window.confirm(
        'Sua janela de hidratação já começou hoje. Clique em OK para ajustar apenas a meta de hoje.'
      );
      return adjust ? 'adjust' : 'keep';
    }

    return new Promise((resolve) => {
      Alert.alert(
        'Jornada já iniciada',
        'Sua janela de hidratação já começou hoje. Deseja ajustar somente a meta de hoje por segurança?',
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
    const resolvedInputs = resolveOnboardingInputs(
      mode,
      weight,
      manualGoal,
      manualCup,
      ML_PER_KG,
      { minWeight: MIN_WEIGHT, maxWeight: MAX_WEIGHT }
    );
    if (!resolvedInputs.ok) {
      return Alert.alert('Ops', resolvedInputs.errorMessage);
    }
    const { weight: finalWeight, goalMl: finalGoal, cupMl: finalCup } = resolvedInputs.value;
    if (resolvedInputs.warningMessage) {
      Alert.alert('Atenção', resolvedInputs.warningMessage);
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
            `Hoje sua meta será ${safeGoalToday} ml. Amanhã volta para a meta normal automaticamente.`
          );
        } else {
          Alert.alert(
            'Sem ajuste necessário',
            'Não foi necessário ajustar a meta de hoje. A meta normal será mantida.'
          );
        }
      }
    }

    let notificationsEnabled = DEFAULT_NOTIFICATIONS_ENABLED;
    if (notificationsEnabled) {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        notificationsEnabled = false;
        Alert.alert(
          'Lembretes desativados',
          'A permissão de notificações não foi concedida. Você pode ativar depois nas configurações do dispositivo.'
        );
      }
    }

    const newConfig: UserConfig = {
      weight: finalWeight,
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
      intervalMinutes: DEFAULT_INTERVAL_MINUTES,
      dailyGoalMl: finalGoal,
      notificationsEnabled,
      mode,
      manualCupSize: finalCup,
    };

    const savedConfig = await Storage.saveConfig(newConfig);
    if (!savedConfig) {
      return Alert.alert('Erro', 'Não foi possível salvar suas configurações. Tente novamente.');
    }

    const initialProgress = buildInitialProgress(todayGoalOverrideMl, getTodayDate());
    const savedProgress = await Storage.saveProgress(initialProgress);
    if (!savedProgress) {
      return Alert.alert('Erro', 'Não foi possível preparar o progresso inicial. Tente novamente.');
    }

    onFinish();
  };

  return (
    <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.screenShell, { maxWidth: shellMaxWidth }]}>
          {isExpanded ? (
            <View style={styles.expandedLayout}>
              <View style={[styles.introColumn, styles.introColumnExpanded]}>
                <View style={styles.heroCard}>
                  <Text style={styles.heroEyebrow}>Primeira configuração</Text>
                  <Text style={styles.title}>Monte sua rotina de hidratação</Text>
                  <Text style={styles.subtitle}>
                    Escolha se a meta será calculada pelo peso ou definida manualmente.
                  </Text>
                </View>

                <View style={styles.cardsContainer}>
                  <WelcomeModeCard
                    icon="Auto"
                    title="Automático"
                    description="Meta por peso"
                    isActive={mode === 'auto'}
                    onPress={() => {
                      Keyboard.dismiss();
                      setMode('auto');
                    }}
                    cardStyle={styles.card}
                    activeCardStyle={styles.cardActive}
                    titleStyle={styles.cardTitle}
                    descriptionStyle={styles.cardDesc}
                    activeTextStyle={styles.textActive}
                    iconStyle={styles.cardIcon}
                  />

                  <WelcomeModeCard
                    icon="Manual"
                    title="Manual"
                    description="Você define"
                    isActive={mode === 'manual'}
                    onPress={() => {
                      Keyboard.dismiss();
                      setMode('manual');
                    }}
                    cardStyle={styles.card}
                    activeCardStyle={styles.cardActive}
                    titleStyle={styles.cardTitle}
                    descriptionStyle={styles.cardDesc}
                    activeTextStyle={styles.textActive}
                    iconStyle={styles.cardIcon}
                  />
                </View>
              </View>

              <View style={[styles.formColumn, styles.formColumnExpanded]}>
                <View style={styles.formContainer}>
                  <Text style={styles.formTitle}>Seus dados iniciais</Text>

                  <View style={mode === 'auto' ? {} : { display: 'none' }}>
                    <Text style={styles.label}>Qual seu peso (kg)?</Text>
                    <TextInput
                      key="input-weight"
                      style={styles.input}
                      placeholder="Ex: 70,5"
                      placeholderTextColor="#999"
                      keyboardType="decimal-pad"
                      value={weight}
                      onChangeText={(text) => setWeight(formatWeightInput(text))}
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
                    <Text style={styles.label}>Meta diária (ml)</Text>
                    <TextInput
                      key="input-goal"
                      style={styles.input}
                      placeholder="Ex: 3000"
                      placeholderTextColor="#999"
                      keyboardType="number-pad"
                      value={manualGoal}
                      onChangeText={(text) => setManualGoal(formatIntegerInput(text))}
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
                      onChangeText={(text) => setManualCup(formatIntegerInput(text))}
                      inputAccessoryViewID={inputAccessoryViewID}
                    />
                  </View>

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

                <TouchableOpacity style={styles.button} onPress={handleStart}>
                  <Text style={styles.buttonText}>Começar jornada</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.introColumn}>
                <View style={styles.heroCard}>
                  <Text style={styles.heroEyebrow}>Primeira configuração</Text>
                  <Text style={styles.title}>Monte sua rotina de hidratação</Text>
                  <Text style={styles.subtitle}>
                    Escolha se a meta será calculada pelo peso ou definida manualmente.
                  </Text>
                </View>

                <View style={styles.cardsContainer}>
                  <WelcomeModeCard
                    icon="Auto"
                    title="Automático"
                    description="Meta por peso"
                    isActive={mode === 'auto'}
                    onPress={() => {
                      Keyboard.dismiss();
                      setMode('auto');
                    }}
                    cardStyle={styles.card}
                    activeCardStyle={styles.cardActive}
                    titleStyle={styles.cardTitle}
                    descriptionStyle={styles.cardDesc}
                    activeTextStyle={styles.textActive}
                    iconStyle={styles.cardIcon}
                  />

                  <WelcomeModeCard
                    icon="Manual"
                    title="Manual"
                    description="Você define"
                    isActive={mode === 'manual'}
                    onPress={() => {
                      Keyboard.dismiss();
                      setMode('manual');
                    }}
                    cardStyle={styles.card}
                    activeCardStyle={styles.cardActive}
                    titleStyle={styles.cardTitle}
                    descriptionStyle={styles.cardDesc}
                    activeTextStyle={styles.textActive}
                    iconStyle={styles.cardIcon}
                  />
                </View>
              </View>

              <View style={styles.formColumn}>
                <View style={styles.formContainer}>
                  <Text style={styles.formTitle}>Seus dados iniciais</Text>

                  <View style={mode === 'auto' ? {} : { display: 'none' }}>
                    <Text style={styles.label}>Qual seu peso (kg)?</Text>
                    <TextInput
                      key="input-weight"
                      style={styles.input}
                      placeholder="Ex: 70,5"
                      placeholderTextColor="#999"
                      keyboardType="decimal-pad"
                      value={weight}
                      onChangeText={(text) => setWeight(formatWeightInput(text))}
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
                    <Text style={styles.label}>Meta diária (ml)</Text>
                    <TextInput
                      key="input-goal"
                      style={styles.input}
                      placeholder="Ex: 3000"
                      placeholderTextColor="#999"
                      keyboardType="number-pad"
                      value={manualGoal}
                      onChangeText={(text) => setManualGoal(formatIntegerInput(text))}
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
                      onChangeText={(text) => setManualCup(formatIntegerInput(text))}
                      inputAccessoryViewID={inputAccessoryViewID}
                    />
                  </View>

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

                <TouchableOpacity style={styles.button} onPress={handleStart}>
                  <Text style={styles.buttonText}>Começar jornada</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

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
  scrollContent: { padding: 20, paddingTop: 44, paddingBottom: 28, alignItems: 'center' },
  screenShell: {
    width: '100%',
    alignSelf: 'center',
  },
  expandedLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
  },
  introColumn: {
    width: '100%',
  },
  introColumnExpanded: {
    flex: 0.95,
  },
  formColumn: {
    width: '100%',
  },
  formColumnExpanded: {
    flex: 1.05,
  },
  heroCard: {
    width: '100%',
    padding: 22,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.78)',
    marginBottom: 22,
    ...SHADOWS.small,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.primary,
    marginBottom: 8,
  },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.secondary, marginBottom: 10 },
  subtitle: { fontSize: 16, color: COLORS.textLight, lineHeight: 22 },
  cardsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 18 },
  card: {
    width: '48%',
    minHeight: 124,
    backgroundColor: 'rgba(255,255,255,0.65)',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: { backgroundColor: COLORS.white, borderColor: COLORS.primary, ...SHADOWS.medium },
  cardIcon: {
    minWidth: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: '#E6F8FD',
  },
  cardTitle: { fontWeight: '800', fontSize: 16, color: COLORS.textDark, marginBottom: 5 },
  cardDesc: { fontSize: 12, color: COLORS.textLight, textAlign: 'center', lineHeight: 18 },
  textActive: { color: COLORS.secondary },
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
