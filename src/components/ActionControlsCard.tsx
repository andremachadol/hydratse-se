import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../constants/theme';

interface ActionControlsCardProps {
  onDrink: () => void;
  onUndo: () => void;
  onReset: () => void;
  drinkSize: number;
  goalReached: boolean;
  hasHistory: boolean;
}

export default function ActionControlsCard({
  onDrink,
  onUndo,
  onReset,
  drinkSize,
  goalReached,
  hasHistory,
}: ActionControlsCardProps) {
  const primaryEyebrow = goalReached ? 'Rotina do dia' : 'Próximo registro';
  const primaryLabel = goalReached ? 'Meta concluída' : `+ ${drinkSize} ml`;
  const primaryHint = goalReached
    ? 'Você pode apenas manter o ritmo leve.'
    : 'Sugestão baseada na sua configuração';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onDrink}
        activeOpacity={0.9}
        style={[styles.shadowContainer, goalReached && styles.shadowContainerDisabled]}
        accessibilityLabel={
          goalReached ? 'Meta de hidratação concluída' : `Registrar ${drinkSize} mililitros de água`
        }
        accessibilityRole="button"
        accessibilityHint={
          goalReached ? 'A meta de hoje já foi batida' : 'Toque para registrar seu próximo gole'
        }
        disabled={goalReached}
      >
        <LinearGradient
          colors={goalReached ? ['#2FCB8F', '#1FA971'] : [COLORS.primary, COLORS.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainButton}
        >
          <Text style={styles.mainButtonEyebrow}>{primaryEyebrow}</Text>
          <Text style={styles.mainButtonText}>{primaryLabel}</Text>
          <Text style={styles.subText}>{primaryHint}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.bottomRow}>
        {hasHistory ? (
          <>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onUndo}
              activeOpacity={0.85}
              accessibilityLabel="Desfazer último registro"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>Desfazer último</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, styles.resetButton]}
              onPress={onReset}
              activeOpacity={0.85}
              accessibilityLabel="Reiniciar registros do dia"
              accessibilityRole="button"
            >
              <Text style={[styles.secondaryButtonText, styles.resetText]}>Reiniciar hoje</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Seu primeiro registro do dia libera o histórico e o botão de desfazer.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  shadowContainer: {
    width: '100%',
    borderRadius: 26,
    ...SHADOWS.primary,
    marginBottom: 18,
  },
  shadowContainerDisabled: {
    shadowOpacity: 0.18,
    elevation: 3,
  },
  mainButton: {
    width: '100%',
    minHeight: 96,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  mainButtonEyebrow: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mainButtonText: {
    color: COLORS.white,
    marginTop: 8,
    fontSize: 29,
    fontWeight: '800',
  },
  subText: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  bottomRow: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  placeholder: {
    width: '100%',
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeholderText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetButton: {
    backgroundColor: COLORS.surfaceDanger,
    borderColor: '#FFD8D8',
  },
  secondaryButtonText: {
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: 14,
  },
  resetText: {
    color: COLORS.danger,
  },
});
