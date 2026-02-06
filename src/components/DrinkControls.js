// src/components/DrinkControls.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Droplet, Undo2, Trash2 } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

export default function DrinkControls({ onDrink, onUndo, onReset, drinkSize, hasHistory }) {
  return (
    <View style={styles.container}>
      
      {/* Botão Principal: BEBER */}
      <TouchableOpacity style={styles.drinkBtn} onPress={onDrink}>
        <Droplet color={COLORS.white} size={32} fill={COLORS.white} />
        <Text style={styles.drinkBtnText}>Beber {drinkSize}ml</Text>
      </TouchableOpacity>

      {/* Botões Secundários (só aparecem se tiver histórico) */}
      {hasHistory && (
        <View style={styles.secondaryButtons}>
          <TouchableOpacity style={styles.actionBtn} onPress={onUndo}>
            <Undo2 color={COLORS.textLight} size={20} />
            <Text style={styles.actionBtnText}>Desfazer</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionBtn} onPress={onReset}>
            <Trash2 color={COLORS.danger} size={20} />
            <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>Zerar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%' },
  drinkBtn: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.primary, 
    paddingVertical: 18, 
    paddingHorizontal: 40, 
    borderRadius: 30, 
    alignItems: 'center', 
    shadowColor: COLORS.primary, 
    shadowOffset: { width: 0, height: 5 }, 
    shadowOpacity: 0.4, 
    elevation: 8 
  },
  drinkBtnText: { color: COLORS.white, fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  
  secondaryButtons: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 20, 
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    padding: 5, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.1 
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20 },
  actionBtnText: { marginLeft: 8, color: COLORS.textLight, fontSize: 14, fontWeight: '600' },
  divider: { width: 1, height: 20, backgroundColor: COLORS.border },
});