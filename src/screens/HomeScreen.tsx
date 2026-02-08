// src/screens/HomeScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import ProgressRing from '../components/ProgressRing';
import DrinkControls from '../components/DrinkControls';
import SettingsModal from '../components/SettingsModal';
import HydrationTips from '../components/HydrationTips';
import SplashAnimation from '../components/SplashAnimation';

import { COLORS } from '../constants/theme';
import { useWaterTracker } from '../hooks/useWaterTracker';

// --- CONFIGURAÇÃO MANUAL DE ESPAÇAMENTO ---
const ESPACO_TOPO_ANEL = 20;
const ESPACO_ANEL_META = 30;
const ESPACO_META_DICA = 30;
const ESPACO_DICA_BOTAO = 30;

export default function HomeScreen() {
  const { config, progress, nextDrinkAmount, isLoading, saveConfig, addDrink, undoLastDrink, resetDay } = useWaterTracker();
  const [modalVisible, setModalVisible] = useState(false);
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  // Calcula porcentagem
  const percentage = useMemo(() => {
    return config.dailyGoalMl > 0 
      ? Math.round((progress.consumedMl / config.dailyGoalMl) * 100)
      : 0;
  }, [progress.consumedMl, config.dailyGoalMl]);

  // SPLASH SCREEN (Mostra enquanto carrega ou anima)
  if (isLoading || !isSplashFinished) {
    return <SplashAnimation onFinish={() => setIsSplashFinished(true)} isLoading={isLoading} />;
  }

  // TELA PRINCIPAL
  return (
    <LinearGradient 
      colors={COLORS.backgroundGradient} 
      style={styles.container}
    >
      <StatusBar style="dark" /> 
      
      {/* --- HEADER --- */}
      <View style={styles.headerContainer}>
        <View style={styles.streakContainer}>
           <Text style={styles.streakIcon}>🔥</Text>
           <Text style={styles.streakText}>{progress.streak}</Text>
        </View>
        <Text style={styles.appName}>Hydrate-Se 💧</Text>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* --- CONTEÚDO CENTRAL --- */}
      <View style={styles.contentContainer}>
        
        {/* Anel */}
        <View style={{ marginTop: ESPACO_TOPO_ANEL }}>
          <ProgressRing 
            consumed={progress.consumedMl} 
            goal={config.dailyGoalMl} 
            percentage={percentage} 
          />
        </View>

        {/* Meta + Texto */}
        <TouchableOpacity 
          onPress={() => setModalVisible(true)} 
          style={[styles.metaContainer, { marginTop: ESPACO_ANEL_META }]}
          activeOpacity={0.7}
        >
          <Text style={styles.metaText}>
            Meta do Dia: {config.dailyGoalMl}ml
          </Text>
          <Text style={styles.hintText}>
            Clique em configurações para ajustar a sua jornada
          </Text>
        </TouchableOpacity>

        {/* Dicas */}
        <View style={{ marginTop: ESPACO_META_DICA, width: '100%' }}>
          <HydrationTips />
        </View>

        {/* Botões de Controle */}
        <View style={{ marginTop: ESPACO_DICA_BOTAO, width: '100%' }}>
          <DrinkControls 
            onDrink={addDrink} 
            onUndo={undoLastDrink}
            onReset={resetDay}
            drinkSize={nextDrinkAmount}
            hasHistory={progress.drinks.length > 0}
          />
        </View>

      </View>

      {/* --- MODAL --- */}
      <SettingsModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={saveConfig}
        currentConfig={config}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    paddingTop: 60,
    backgroundColor: '#FFF', // Fallback caso o gradiente falhe
  },
  
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    marginBottom: 10,
    height: 50,
  },

  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },

  streakContainer: { width: 50, flexDirection: 'row', alignItems: 'center' },
  streakIcon: { fontSize: 20 },
  streakText: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary, marginLeft: 4 },
  
  appName: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: COLORS.secondary,
    textAlign: 'center',
    flex: 1, 
  },

  settingsButton: { width: 50, alignItems: 'flex-end' },
  settingsIcon: { fontSize: 26 },

  metaContainer: { 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  metaText: { fontSize: 20, color: COLORS.secondary, fontWeight: '600', textAlign: 'center' },
  hintText: { fontSize: 12, color: COLORS.textLight, marginTop: 5, textAlign: 'center', opacity: 0.8 },
});