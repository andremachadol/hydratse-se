import React, { useState } from 'react';
import {
  Alert,
  InputAccessoryView,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AmbientBackdrop from '../components/AmbientBackdrop';
import OnboardingOverviewPanel from '../components/OnboardingOverviewPanel';
import OnboardingSetupCard from '../components/OnboardingSetupCard';
import { COLORS } from '../constants/theme';
import { ML_PER_KG, MAX_WEIGHT, MIN_WEIGHT } from '../constants/config';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import type { CalculationMode } from '../types';
import { resolveOnboardingInputs } from '../utils/onboarding';
import { formatIntegerInput, formatWeightInput } from '../utils/configValidation';

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
  const shellMaxWidth = isExpanded
    ? EXPANDED_MAX_WIDTH
    : isMedium
      ? MEDIUM_MAX_WIDTH
      : COMPACT_MAX_WIDTH;
  const inputAccessoryViewID = 'doneButtonID';

  const askLateStartGoalStrategy = async (): Promise<'keep' | 'adjust'> => {
    if (Platform.OS === 'web') {
      const adjust = window.confirm(
        'Sua janela de hidratação já começou hoje. Clique em OK para ajustar apenas a meta de hoje.',
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
        { cancelable: false },
      );
    });
  };

  const { submitSetup } = useOnboardingFlow({ askLateStartStrategy: askLateStartGoalStrategy });

  const handleStart = async () => {
    Keyboard.dismiss();
    const resolvedInputs = resolveOnboardingInputs(mode, weight, manualGoal, manualCup, ML_PER_KG, {
      minWeight: MIN_WEIGHT,
      maxWeight: MAX_WEIGHT,
    });

    if (!resolvedInputs.ok) {
      Alert.alert('Ops', resolvedInputs.errorMessage);
      return;
    }

    if (resolvedInputs.warningMessage) {
      Alert.alert('Atenção', resolvedInputs.warningMessage);
    }

    const result = await submitSetup({
      mode,
      finalWeight: resolvedInputs.value.weight,
      finalGoal: resolvedInputs.value.goalMl,
      finalCup: resolvedInputs.value.cupMl,
    });

    if (!result.ok) {
      Alert.alert('Erro', result.errorMessage);
      return;
    }

    result.notices.forEach((notice) => {
      Alert.alert(notice.title, notice.message);
    });

    onFinish();
  };

  const introSection = <OnboardingOverviewPanel mode={mode} onSelectMode={setMode} />;
  const setupSection = (
    <OnboardingSetupCard
      mode={mode}
      weight={weight}
      manualGoal={manualGoal}
      manualCup={manualCup}
      inputAccessoryViewID={inputAccessoryViewID}
      onWeightChange={(value) => setWeight(formatWeightInput(value))}
      onManualGoalChange={(value) => setManualGoal(formatIntegerInput(value))}
      onManualCupChange={(value) => setManualCup(formatIntegerInput(value))}
      onStart={() => void handleStart()}
    />
  );

  return (
    <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
      <AmbientBackdrop variant="welcome" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.screenShell, { maxWidth: shellMaxWidth }]}>
          {isExpanded ? (
            <View style={styles.expandedLayout}>
              <View style={styles.introColumnExpanded}>{introSection}</View>
              <View style={styles.formColumnExpanded}>{setupSection}</View>
            </View>
          ) : (
            <>
              {introSection}
              {setupSection}
            </>
          )}
        </View>
      </ScrollView>

      {Platform.OS === 'ios' ? (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.accessory}>
            <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.accessoryButton}>
              <Text style={styles.accessoryText}>Concluído</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
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
  introColumnExpanded: {
    flex: 0.95,
  },
  formColumnExpanded: {
    flex: 1.05,
  },
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
