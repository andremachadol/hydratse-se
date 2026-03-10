// src/components/DrinkControls.tsx
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
  return (
    <View style={styles.container}>
      
      {/* BOTÃO PRINCIPAL (Estilo Antigo Restaurado) */}
      <TouchableOpacity
        onPress={onDrink}
        activeOpacity={0.8}
        style={[styles.shadowContainer, goalReached && styles.shadowContainerDisabled]}
        accessibilityLabel={drinkSize > 0 ? `Beber ${drinkSize} mililitros de água` : 'Meta de hidratação atingida'}
        accessibilityRole="button"
        accessibilityHint={goalReached ? 'Meta do dia concluida' : 'Toque para registrar consumo de água'}
        disabled={goalReached}
      >
        <LinearGradient
          colors={goalReached ? [COLORS.textLight, COLORS.textLight] : [COLORS.primary, COLORS.primaryLight]}
          style={styles.mainButton}
        >
          <Text style={styles.mainButtonText}>
            {drinkSize > 0 ? `+ ${drinkSize} ml` : "Meta Batida!"}
          </Text>
          <Text style={styles.subText}>{goalReached ? 'Objetivo concluido' : 'Beber Agora'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* ÁREA RESERVADA (Mantida para evitar o pulo) */}
      <View style={styles.bottomRow}>
        {hasHistory ? (
          <>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onUndo}
              accessibilityLabel="Desfazer último registro"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>↩ Desfazer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, styles.resetButton]}
              onPress={onReset}
              accessibilityLabel="Zerar registros do dia"
              accessibilityRole="button"
            >
              <Text style={[styles.secondaryButtonText, styles.resetText]}>🗑️ Zerar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  shadowContainer: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 25,
  },
  shadowContainerDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },

  // Estilo restaurado: Botão largo e arredondado (Pílula), não círculo gigante
  mainButton: {
    width: 200, 
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  mainButtonText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  
  subText: {
    color: '#E0E0E0', // Um pouco mais claro
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // Área dos Botões Secundários (FIXA)
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    height: 50,
    alignItems: 'center',
  },

  placeholder: {
    height: 50,
    width: '100%',
  },

  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
  },

  resetButton: {
    backgroundColor: COLORS.surfaceDanger,
  },

  secondaryButtonText: {
    color: COLORS.textLight,
    fontWeight: '600',
    fontSize: 14,
  },

  resetText: {
    color: COLORS.danger,
  },
});

export default memo(DrinkControls);
