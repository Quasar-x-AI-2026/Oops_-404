import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, Linking, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Camera } from 'expo-camera';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

const { width, height } = Dimensions.get('window');

export default function EyeTrackingScreen() {
  const [mode, setMode] = useState<'SELECT' | 'PC' | 'MOBILE'>('SELECT');
  const [activeView, setActiveView] = useState<'MAIN' | 'MESSAGING' | 'CALLS' | 'CAMERA' | 'AI_MODE'>('MAIN');
  const [cursorPos, setCursorPos] = useState({ x: width / 2, y: height / 2 });

  if(mode === 'SELECT'){
    return(
      <View style={styles.selectionContainer}>
        <Text style={styles.title}>QuasarAI - Mode Select</Text>
        <TouchableOpacity style={[styles.modeBtn, {backgroundColor: '#4f46e5'}]} onPress={() => setMode('PC')}>
          <Text style={styles.btnText}>PC Control Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeBtn, {backgroundColor: '#059669'}]} onPress={() => setMode('MOBILE')}>
          <Text style={styles.btnText}>Mobile Dashboard</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  selectionContainer: { position: 'absolute', bottom: 40, left: 20, right: 20, padding: 20, borderRadius: 20, backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  title: { fontSize: 22, fontWeight: '700', color: '#ffffff', textAlign: 'center', marginBottom: 20 },
  modeBtn: { paddingVertical: 14, borderRadius: 14, marginBottom: 14, alignItems: 'center' },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});