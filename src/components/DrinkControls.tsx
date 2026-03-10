import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../constants/theme';

interface DrinkControlsProps {
  onDrink: () => void;
  onUndo: () => void;
  onReset: () => void;
  drinkSize: number;
  goalReached: boolean;
  hasHistory: boolean;
}

function DrinkControls({ onDrink, onUndo, onReset, drinkSize, goalReached, hasHistory }: DrinkControlsProps) {
  const primaryLabel = goalReached ? 'Objetivo concluído' : `+ ${drinkSize} ml`;
  const primaryHint = goalReached ? 'Hoje está completo' : 'Registrar agora';

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
        accessibilityHint={goalReached ? 'A meta de hoje já foi batida' : 'Toque para registrar seu próximo gole'}
        disabled={goalReached}
      >
        <LinearGradient
          colors={goalReached ? ['#2FCB8F', '#1FA971'] : [COLORS.primary, COLORS.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainButton}
        >
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
              accessibilityLabel="Desfazer último registro"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>Desfazer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, styles.resetButton]}
              onPress={onReset}
              accessibilityLabel="Zerar registros do dia"
              accessibilityRole="button"
            >
              <Text style={[styles.secondaryButtonText, styles.resetText]}>Zerar dia</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Seu histórico de hoje vai aparecer aqui.</Text>
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
    paddingHorizontal: 24,
    marginBottom: 20,
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
    minHeight: 84,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  mainButtonText: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
  },
  subText: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.86)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    backgroundColor: 'rgba(255,255,255,0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
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
    backgroundColor: 'rgba(255,255,255,0.86)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2EDF2',
  },
  resetButton: {
    backgroundColor: '#FFF4F4',
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

export default memo(DrinkControls);
