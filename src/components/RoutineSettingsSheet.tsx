import React from 'react';
import {
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
import { COLORS, SHADOWS } from '../constants/theme';
import { ROUTINE_SETTINGS_COPY } from '../constants/uiCopy';
import { useRoutineSettingsController } from '../hooks/useRoutineSettingsController';
import type { TrackerMutationResult, UserConfig } from '../types';
import { presentAppActionFeedback } from '../utils/appActionFeedback';
import { showAlertAsync } from '../utils/showAlertAsync';

interface RoutineSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newConfig: UserConfig) => Promise<TrackerMutationResult>;
  currentConfig: UserConfig;
}

export default function RoutineSettingsSheet({
  visible,
  onClose,
  onSave,
  currentConfig,
}: RoutineSettingsSheetProps) {
  const { width, height } = useWindowDimensions();
  const modalWidth = Math.min(width - 24, width >= 840 ? 620 : 480);
  const maxModalHeight = Math.min(height - 28, 760);
  const {
    mode,
    weight,
    manualGoal,
    manualCup,
    startTime,
    endTime,
    interval,
    notificationsEnabled,
    autoGoalPreview,
    setMode,
    handleWeightChange,
    handleManualGoalChange,
    handleManualCupChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleIntervalChange,
    handleNotificationsChange,
    handleSave,
  } = useRoutineSettingsController({
    visible,
    currentConfig,
    onSave,
  });

  const handleSubmit = async () => {
    const result = await handleSave();
    await presentAppActionFeedback(result, {
      presentDialog: showAlertAsync,
      onSuccess: onClose,
    });
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.modalView, { width: modalWidth, maxHeight: maxModalHeight }]}>
              <View style={styles.header}>
                <View style={styles.headerCopy}>
                  <Text style={styles.headerEyebrow}>{ROUTINE_SETTINGS_COPY.headerEyebrow}</Text>
                  <Text style={styles.modalTitle}>{ROUTINE_SETTINGS_COPY.headerTitle}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.85}>
                  <Text style={styles.closeText}>{ROUTINE_SETTINGS_COPY.closeButtonLabel}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>{ROUTINE_SETTINGS_COPY.modeSectionTitle}</Text>
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[styles.tabButton, mode === 'auto' && styles.tabActive]}
                      onPress={() => setMode('auto')}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.tabText, mode === 'auto' && styles.tabTextActive]}>
                        {ROUTINE_SETTINGS_COPY.modeOptions.auto}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.tabButton, mode === 'manual' && styles.tabActive]}
                      onPress={() => setMode('manual')}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.tabText, mode === 'manual' && styles.tabTextActive]}>
                        {ROUTINE_SETTINGS_COPY.modeOptions.manual}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {mode === 'auto' ? (
                    <View>
                      <Text style={styles.label}>{ROUTINE_SETTINGS_COPY.weightLabel}</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="decimal-pad"
                        value={weight}
                        onChangeText={handleWeightChange}
                        placeholder={ROUTINE_SETTINGS_COPY.weightPlaceholder}
                        placeholderTextColor={COLORS.textMuted}
                      />
                      <View style={styles.inlineInfoCard}>
                        <Text style={styles.inlineInfoLabel}>
                          {ROUTINE_SETTINGS_COPY.autoGoalLabel}
                        </Text>
                        <Text style={styles.inlineInfoValue}>{autoGoalPreview}</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.fieldStack}>
                      <View>
                        <Text style={styles.label}>{ROUTINE_SETTINGS_COPY.manualGoalLabel}</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="number-pad"
                          value={manualGoal}
                          onChangeText={handleManualGoalChange}
                          placeholder={ROUTINE_SETTINGS_COPY.manualGoalPlaceholder}
                          placeholderTextColor={COLORS.textMuted}
                        />
                      </View>
                      <View>
                        <Text style={[styles.label, styles.spacedLabel]}>
                          {ROUTINE_SETTINGS_COPY.manualCupLabel}
                        </Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="number-pad"
                          value={manualCup}
                          onChangeText={handleManualCupChange}
                          placeholder={ROUTINE_SETTINGS_COPY.manualCupPlaceholder}
                          placeholderTextColor={COLORS.textMuted}
                        />
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.sectionCard}>
                  <View style={styles.switchRow}>
                    <View style={styles.switchCopy}>
                      <Text style={styles.sectionTitle}>
                        {ROUTINE_SETTINGS_COPY.remindersTitle}
                      </Text>
                      <Text style={styles.sectionDescription}>
                        {ROUTINE_SETTINGS_COPY.remindersDescription}
                      </Text>
                    </View>
                    <Switch
                      trackColor={{ false: COLORS.switchTrackOff, true: COLORS.primaryLight }}
                      thumbColor={notificationsEnabled ? COLORS.primary : COLORS.switchThumbOff}
                      onValueChange={handleNotificationsChange}
                      value={notificationsEnabled}
                    />
                  </View>

                  <View style={styles.scheduleRow}>
                    <View style={styles.scheduleField}>
                      <Text style={styles.label}>{ROUTINE_SETTINGS_COPY.startTimeLabel}</Text>
                      <TextInput
                        style={styles.input}
                        value={startTime}
                        onChangeText={handleStartTimeChange}
                        keyboardType="number-pad"
                        maxLength={5}
                        placeholder={ROUTINE_SETTINGS_COPY.startTimePlaceholder}
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                    <View style={styles.scheduleField}>
                      <Text style={styles.label}>{ROUTINE_SETTINGS_COPY.endTimeLabel}</Text>
                      <TextInput
                        style={styles.input}
                        value={endTime}
                        onChangeText={handleEndTimeChange}
                        keyboardType="number-pad"
                        maxLength={5}
                        placeholder={ROUTINE_SETTINGS_COPY.endTimePlaceholder}
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>

                  <Text style={[styles.label, !notificationsEnabled && styles.disabledLabel]}>
                    {ROUTINE_SETTINGS_COPY.intervalLabel}
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
                        onPress={() => notificationsEnabled && handleIntervalChange(minutes)}
                        disabled={!notificationsEnabled}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.intervalText,
                            interval === minutes && styles.intervalTextSelected,
                          ]}
                        >
                          {minutes} {ROUTINE_SETTINGS_COPY.intervalUnit}
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
                  <Text style={styles.buttonText}>{ROUTINE_SETTINGS_COPY.cancelButtonLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSave]}
                  onPress={() => void handleSubmit()}
                  activeOpacity={0.9}
                >
                  <Text style={styles.buttonText}>{ROUTINE_SETTINGS_COPY.saveButtonLabel}</Text>
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
