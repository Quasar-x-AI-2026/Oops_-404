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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  
  const [layoutMap, setLayoutMap] = useState<{ [key: string]: { x: number, y: number, w: number, h: number } }>({});
  const [homeColor, setHomeColor] = useState('#6366f1');

  // Function to save button coordinates automatically
  const saveLayout = (id: string, event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setLayoutMap(prev => ({ ...prev, [id]: { x, y, w: width, h: height } }));
  };

  // Logic to check if the cursor is currently over a button
  const isHovered = (id: string) => {
    const layout = layoutMap[id];
    if (!layout) return false;
    const gridYOffset = (height * 0.12) + 30; // Offset for the top header
    return (
      cursorPos.x >= layout.x &&
      cursorPos.x <= layout.x + layout.w &&
      cursorPos.y >= layout.y + gridYOffset &&
      cursorPos.y <= layout.y + gridYOffset + layout.h
    );
  };
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.x !== undefined && data.y !== undefined) {
        setCursorPos({ x: data.x * width, y: data.y * height });
      }
    } catch (e) { console.log("Data Error:", e); }
  };
  

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
  webViewLayer: { flex: 1, backgroundColor: 'transparent', position: 'absolute', width: width, height: height, zIndex: 5 },
  nativeCursor: {
    position: 'absolute',
    width: 35, height: 35, borderRadius: 50,
    backgroundColor: 'rgba(255,0,0,0.9)', borderWidth: 3, borderColor: '#fff',
    zIndex: 9999, pointerEvents: 'none', transform: [{ translateX: -17.5 }, { translateY: -17.5 }],
  },
});