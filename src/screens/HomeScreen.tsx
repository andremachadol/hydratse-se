// App.js - O Maestro da Orquestra 🎻
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Flame, Bell } from 'lucide-react-native';

// Importando nossas peças organizadas
import { COLORS, TIPS } from './../constants/theme';
import { useWaterTracker } from './../hooks/useWaterTracker';
import ProgressRing from './../components/ProgressRing';
import DrinkControls from './../components/DrinkControls';
import SettingsModal from './../components/SettingsModal';

export default function App() {
  // 1. Puxa a lógica do Hook
  const { config, progress, saveConfig, addDrink, undoLastDrink, resetDay } = useWaterTracker();
  
  // 2. Estados visuais simples (Modais, Dicas)
  const [modalVisible, setModalVisible] = useState(false);
  const [tip, setTip] = useState(TIPS[0]);
  const [nextReminder, setNextReminder] = useState('');

  // Efeito para atualizar dica e relógio
  useEffect(() => {
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    const updateTime = () => {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      setNextReminder(`${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
    };
    updateTime();
  }, []);

  // Calculando porcentagem para o anel
  const percentage = config.dailyGoalMl > 0 
    ? Math.round((progress.consumedMl / config.dailyGoalMl) * 100) 
    : 0;

  return (
    <LinearGradient colors={COLORS.backgroundGradient} style={styles.container}>
      <StatusBar style="dark" />

      {/* --- CABEÇALHO --- */}
      <View style={styles.header}>
        <View style={styles.streakBadge}>
          <Flame color={COLORS.accent} size={20} fill={COLORS.accent} />
          <Text style={styles.streakText}>{progress.streak || 0} dias</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconBtn}>
          <Settings color={COLORS.secondary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* --- GRÁFICO (Componente) --- */}
        <ProgressRing 
          consumed={progress.consumedMl} 
          goal={config.dailyGoalMl} 
          percentage={percentage} 
        />

        {/* --- CARD DE LEMBRETE --- */}
        <View style={styles.reminderCard}>
          <Bell color={COLORS.secondary} size={20} />
          <Text style={styles.reminderLabel}>Próximo gole:</Text>
          <Text style={styles.reminderTime}>{nextReminder}</Text>
        </View>

        {/* --- BOTÕES DE CONTROLE (Componente) --- */}
        <DrinkControls 
          onDrink={addDrink}
          onUndo={undoLastDrink}
          onReset={resetDay}
          drinkSize={config.perDrinkMl}
          hasHistory={progress.drinks && progress.drinks.length > 0}
        />

        {/* --- DICA DO DIA --- */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Dica do dia</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>

      </ScrollView>

      {/* --- MODAL DE CONFIG (Componente) --- */}
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
  container: { flex: 1 },
  header: { marginTop: 50, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, elevation: 2 },
  streakText: { marginLeft: 5, fontWeight: 'bold', color: COLORS.textDark },
  iconBtn: { padding: 8, backgroundColor: COLORS.white, borderRadius: 50, elevation: 2 },
  content: { alignItems: 'center', paddingBottom: 50 },
  reminderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: 15, elevation: 2, marginBottom: 25 },
  reminderLabel: { marginLeft: 10, color: COLORS.textLight, marginRight: 5 },
  reminderTime: { fontWeight: 'bold', color: COLORS.secondary, fontSize: 16 },
  tipCard: { marginTop: 40, backgroundColor: 'rgba(255,255,255,0.6)', padding: 20, borderRadius: 15, width: '90%' },
  tipTitle: { fontWeight: 'bold', color: COLORS.secondary, marginBottom: 5 },
  tipText: { color: COLORS.textLight, fontStyle: 'italic' },
});