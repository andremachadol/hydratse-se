import React, { useCallback } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AmbientBackdrop from '../components/AmbientBackdrop';
import OnboardingOverviewPanel from '../components/OnboardingOverviewPanel';
import OnboardingSetupCard from '../components/OnboardingSetupCard';
import {
  DEFAULT_WARNING_TITLE,
  LATE_START_GOAL_CONFIRMATION_DESCRIPTOR,
  ONBOARDING_SUCCESS_ACKNOWLEDGE_LABEL,
} from '../constants/interactionDescriptors.ts';
import { COLORS } from '../constants/theme';
import { ONBOARDING_SETUP_COPY } from '../constants/uiCopy';
import { useResponsiveShellLayout } from '../hooks/useResponsiveShellLayout';
import { useWelcomeSetupController } from '../hooks/useWelcomeSetupController';
import { presentAppActionFeedback } from '../utils/appActionFeedback';
import { showAlertAsync } from '../utils/showAlertAsync';
import { showConfirmAsync } from '../utils/showConfirmAsync';

interface WelcomeScreenProps {
  onFinish: () => void;
}

const COMPACT_MAX_WIDTH = 460;
const MEDIUM_MAX_WIDTH = 760;
const EXPANDED_MAX_WIDTH = 1080;

export default function WelcomeScreen({ onFinish }: WelcomeScreenProps) {
  const layout = useResponsiveShellLayout({
    compactMaxWidth: COMPACT_MAX_WIDTH,
    mediumMaxWidth: MEDIUM_MAX_WIDTH,
    expandedMaxWidth: EXPANDED_MAX_WIDTH,
  });
  const {
    mode,
    weight,
    autoGoalPreview,
    manualGoal,
    manualCup,
    inputAccessoryViewID,
    setMode,
    handleWeightChange,
    handleManualGoalChange,
    handleManualCupChange,
    handleStart,
  } = useWelcomeSetupController();

  const askLateStartGoalStrategy = useCallback(async (): Promise<'keep' | 'adjust'> => {
    return showConfirmAsync(LATE_START_GOAL_CONFIRMATION_DESCRIPTOR);
  }, []);

  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();

    const result = await handleStart(askLateStartGoalStrategy);
    await presentAppActionFeedback(result, {
      presentDialog: showAlertAsync,
      onSuccess: onFinish,
      successAcknowledgeLabel: ONBOARDING_SUCCESS_ACKNOWLEDGE_LABEL,
      warningTitle: DEFAULT_WARNING_TITLE,
    });
  }, [askLateStartGoalStrategy, handleStart, onFinish]);

  const introSection = <OnboardingOverviewPanel mode={mode} onSelectMode={setMode} />;
  const setupSection = (
    <OnboardingSetupCard
      mode={mode}
      weight={weight}
      autoGoalPreview={autoGoalPreview}
      manualGoal={manualGoal}
      manualCup={manualCup}
      inputAccessoryViewID={inputAccessoryViewID}
      onWeightChange={handleWeightChange}
      onManualGoalChange={handleManualGoalChange}
      onManualCupChange={handleManualCupChange}
      onStart={() => void handleSubmit()}
    />
  );

  return (
    <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
      <AmbientBackdrop variant="welcome" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.screenShell, { maxWidth: layout.shellMaxWidth }]}>
          {layout.isExpanded ? (
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
              <Text style={styles.accessoryText}>{ONBOARDING_SETUP_COPY.accessoryDoneLabel}</Text>
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
