import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions,Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Camera } from 'expo-camera';
import {TouchableOpacity} from 'react-native';
import * as Speech from 'expo-speech'; 
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

const { width, height } = Dimensions.get('window');

export default function EyeTrackingScreen() {
  const [isListening, setIsListening] = useState(false);
  const [aiResponse, setAiResponse] = useState("Tap AI Assist to ask me anything!");
  const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [mode, setMode] = useState<'SELECT' | 'PC' | 'MOBILE'>('SELECT');
  const [cursorPos, setCursorPos] = useState({ x: width / 2, y: height / 2 });
  const [color, setColor] = useState<'blue' | 'red'>('blue');
  const [activeView, setActiveView] = useState<'MAIN' | 'MESSAGING' | 'CALLS' | 'CAMERA' | 'AI_MODE'>('MAIN');
  const [typedText, setTypedText] = useState("");
  const [homeColor, setHomeColor] = useState('#6366f1');
  const [isDialing, setIsDialing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
const [msgSubGroup, setMsgSubGroup] = useState<string | null>(null);
  
const [layoutMap, setLayoutMap] = useState<{ [key: string]: { x: number, y: number, w: number, h: number } }>({});
const [recording, setRecording] = useState<Audio.Recording | null>(null);

const startRecording = async () => {
  try {
    
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {
        
      }
      setRecording(null);
    }

    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') return alert("Mic permission needed");

    
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    
    const newRecording = new Audio.Recording();
    await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await newRecording.startAsync();
    
    setRecording(newRecording);
    setIsRecording(true);
    setAiResponse("I am listening... Speak now.");
  } catch (err) {
    console.error('Failed to start recording', err);
   
    setRecording(null);
    setIsRecording(false);
    setAiResponse("Recording Error. Try clicking Stop then Record again.");
  }
};
useEffect(() => {
  
  return () => {
    if (recording) {
      recording.stopAndUnloadAsync().catch(() => {});
    }
  };
}, [recording])

const stopAndTranscribe = async () => {
  if (!recording) return;
  
  setIsRecording(false);
  try {
   
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stored at:', uri);
    
    if (uri) {
     
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64', 
      });

      setAiResponse("Audio Captured! Gemini is listening...");
      
    
      callGeminiWithAudio(base64Audio);
    }
    setRecording(null); 
  } catch (err) {
    console.error("Failed to stop or read recording", err);
    setAiResponse("Error reading audio file. Try again.");
    setRecording(null);
  }
};
const saveLayout = (id: string, event: any) => {
  const { x, y, width, height } = event.nativeEvent.layout;
  
  setLayoutMap(prev => ({ ...prev, [id]: { x, y, w: width, h: height } }));
};
const callGeminiAPI = async (prompt: string) => {
  try {
    const response = await fetch(https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    const data = await response.json();
    console.log("Gemini Raw Data:", JSON.stringify(data)); 

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const resultText = data.candidates[0].content.parts[0].text;
      setAiResponse(resultText); 
      Speech.speak(resultText);
    } 
    else if (data.error) {
      setAiResponse(API Error: ${data.error.message});
    }
    else {
      setAiResponse("Response blocked or empty. Try a different question.");
    }
  } catch (error) {
    setAiResponse("Network failure. Check your connection.");
  }
};
const callGeminiWithAudio = async (base64Audio: string) => {
  try {
    const response = await fetch(https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "The following is a voice message from a paralyzed user. Please listen carefully and provide a helpful and concise response." },
            {
              inline_data: {
                mime_type: "audio/m4a", 
                data: base64Audio
              }
            }
          ]
        }]
      })
    });
    
    const data = await response.json();
    console.log("Audio Response Received:", JSON.stringify(data));

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const resultText = data.candidates[0].content.parts[0].text;
      setAiResponse(resultText); 
      Speech.speak(resultText);
    } else {
      setAiResponse("Gemini heard you but couldn't process the speech. Try again.");
    }
  } catch (error) {
    setAiResponse("Error sending audio. Check your internet connection.");
  }
};
const handleAction = (id: string) => {
  const contacts: { [key: string]: string } = {
    'help': '9415025553',
    'call_mom': '8545820046',
    'call_dad': '700779935',
    'call_bro': '7297838090',
    'call_doc': '9415025553',
    'call_f1': '9415025553',
    'call_f2': '9335101920',
    'call_f3': '7897079339',
  };

  const makeCall = (num: string) => {
    Linking.openURL(tel:${num});
    setActiveView('MAIN'); 
  };
  if (activeView === 'MAIN') {
    if (id === 'msg') {
      setLayoutMap({}); 
      setActiveView('MESSAGING');
      return;
    }
    if (id === 'ai_assist') {
    setLayoutMap({});
    setActiveView('AI_MODE');
    setAiResponse("Hello, I am Gemini. Click record to speak.");
    return;
}
if (id === 'ai_send') {
    setAiResponse("Gemini is thinking...");
   
    const userMessage = typedText.length > 0 ? typedText : "Hello Gemini, system is online. How are you?";
    callGeminiAPI(userMessage); 
    return;
}
    if(id === 'calls' ){
      setLayoutMap({});
      setActiveView('CALLS');
     
      return;
    }
    
    
    if (id === 'camera'){ setActiveView('CAMERA');
      return;
    }
    if (id === 'help') return makeCall(contacts['help']);
    if (id === 'home') setHomeColor(homeColor === '#6366f1' ? '#ffeb3b' : '#6366f1');
    
  } else if (activeView === 'CALLS') {
    if (id === 'sub_back') {
      setLayoutMap({});
      setActiveView('MAIN');
      return;
    }
    

    if (id.startsWith('call_')) {
      makeCall(contacts[id]);
      return;
       
    }
  }
  else if (activeView === 'AI_MODE') {
    if (id === 'sub_back') { 
      setLayoutMap({}); 
      setActiveView('MAIN'); 
      return; 
    }
    if (id === 'ai_toggle') { 
      if (!isRecording) {
        startRecording();
      } else {
        stopAndTranscribe();
      }
      return; 
    }
    if (id === 'ai_send') {
      setAiResponse("Gemini is thinking...");
      
      
      const userQuestion = typedText.length > 0 ? typedText : "System Check: Are you online?";
      callGeminiAPI(userQuestion); 
      
      return;
    }
  }
  else if (activeView === 'MESSAGING') {
    if (id === 'space') {
      setTypedText(prev => prev + " ");
      return;
    }


    if (id.startsWith('group_')) {
      const groupContent = id.replace('group_', '');
      setLayoutMap({});
      setMsgSubGroup(groupContent);
      return;
    }

    
    if (id.startsWith('char_')) {
      const char = id.split('_')[1];
      setTypedText(prev => prev + char);
      setLayoutMap({}); 
      setMsgSubGroup(null); 
      return;
    }

  
    if (id === 'sub_back' || id === 'action_exit') {
      setLayoutMap({}); 
      setMsgSubGroup(null);
      if (id === 'action_exit') setActiveView('MAIN');
      return;
    }
    

    if (id === 'msg_back_options') {
      setLayoutMap({});
      setMsgSubGroup('OPTIONS');
      return;
    }

    if (id === 'action_delete') {
      setTypedText(prev => prev.slice(0, -1));
      setLayoutMap({});
      setMsgSubGroup(null);
      return;
    }
  }
};

const handleMessage = (event: any) => {
  try {
    const data = JSON.parse(event.nativeEvent.data);
    const cursorX = data.x * width;
    const cursorY = data.y * height;

    if (data.x !== undefined && data.y !== undefined) {
      setCursorPos({ x: cursorX, y: cursorY });
    }


    if (data.executed_action === "click") {
      const gridYOffset = (height * 0.12) + 30; 
      
     
      const targetId = Object.keys(layoutMap).find(id => {
        const layout = layoutMap[id];
        const btnTop = layout.y + gridYOffset;
        const btnBottom = layout.y + layout.h + gridYOffset;

        return (
          cursorX >= layout.x && cursorX <= layout.x + layout.w &&
          cursorY >= btnTop && cursorY <= btnBottom
        );
      });

      if (targetId) {
        console.log("Verified Click on:", targetId);
        handleAction(targetId);
      }
    }
  } catch (e) { console.log("Frontend Data Error:", e); }
};



  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No access to camera</Text>;
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

 
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils"></script>
        <style>
            body { margin: 0; background: black; overflow: hidden; }
            /* CURSOR SIZE & VISIBILITY FIX */
          

            /* Dynamic Opacity: PC Mode mein video gayab (0), Mobile mein dikhega (0.5) */
            video { 
                transform: scaleX(-1); 
                width: 100vw; height: 100vh; 
                object-fit: cover; 
                opacity: ${mode === 'PC' ? 0 : 1}; 
            }
        </style>
    </head>
    <body>
        
        <video id="webcam" autoplay playsinline></video>
        <script>
            let socket;
function connect() {
    socket = new WebSocket('ws://localhost:8000/ws');
    
    socket.onclose = () => {
        console.log("Socket closed. Reconnecting in 2s...");
        setTimeout(connect, 2000); // Auto-reconnect logic
    };

    socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
    };
}
connect(); 
            const video = document.getElementById('webcam');
            

            const SENSITIVITY = 3.5; 
            let blinkCounter = 0;

            const faceMesh = new FaceMesh({locateFile: (file) => \https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/\${file}\});
            faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5 });
            
            faceMesh.onResults((results) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
        const landmarks = results.multiFaceLandmarks[0];
        const nose = landmarks[1];

        let mappedX = 0.5 + (nose.x - 0.5) * SENSITIVITY;
        let mappedY = 0.5 + (nose.y - 0.5) * SENSITIVITY;
        mappedX = Math.max(0, Math.min(1, mappedX));
        mappedY = Math.max(0, Math.min(1, mappedY));

        const eyeDist = Math.abs(landmarks[159].y - landmarks[145].y);
        let currentAction = (eyeDist < 0.020) ? "click" : "move";

        
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ 
                x: mappedX, 
                y: mappedY, 
                action: currentAction, 
                target: "${mode}" 
            }));
        }
    }
});

socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    // Ye data ab Python backend se smoothing ho kar aa raha hai
    window.ReactNativeWebView.postMessage(JSON.stringify(data));
};

            

            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
                .then(stream => { 
                    video.srcObject = stream;
                    const camera = new Camera(video, {
                        onFrame: async () => { await faceMesh.send({image: video}); },
                        width: 640, height: 480
                    });
                    camera.start();
                });
        </script>
    </body>
    </html>
  `;

  const isHovered = (id: string) => {
  const layout = layoutMap[id];
  if (!layout) return false;
  
  
  const gridYOffset = (height * 0.12) + 30;
  
  return (
    cursorPos.x >= layout.x && 
    cursorPos.x <= layout.x + layout.w &&
    cursorPos.y >= layout.y + gridYOffset && 
    cursorPos.y <= layout.y + gridYOffset + layout.h
  );
};
  const renderGridItems = () => {
  let items: any[] = [];

  if (activeView === 'MAIN') {
    items = [
      { label: 'HOME', color: homeColor, id: 'home' },
      { label: 'HELP', color: '#22c55e', id: 'help' },
      { label: 'AI ASSIST', color: '#ef4444', id: 'ai_assist' },
      { label: 'SETTINGS', color: '#f97316', id: 'settings' },
      { label: 'ENTERTAINMENT', color: '#0ea5e9', id: 'ent' },
      { label: 'CAMERA', color: '#8b5cf6', id: 'camera' },
      { label: 'MESSAGING', color: '#ec4899', id: 'msg' },
      { label: 'CALLS', color: '#06b6d4', id: 'calls' },
    ];
  }else if (activeView === 'AI_MODE') {
  items = [

    { label: isRecording ? 'STOP' : 'RECORD', id: 'ai_toggle', color: isRecording ? '#ef4444' : '#22c55e' }, // Row 3 Left
    { label: 'SEND', id: 'ai_send', color: '#6366f1' }, // Row 3 Right
    { label: 'BACK HOME', id: 'sub_back', color: '#777' }, // Row 4 Left
    { label: '', id: 'empty5', color: 'transparent' }, // Row 4 Right (Invisible)
  ];
}
  else if (activeView === 'CALLS') {
    if (isDialing) {
  items = [{ label: 'CANCEL CALL / BACK', id: 'cancel_dial', color: 'red' }];
} else{
    items = [
      { label: 'MOM', id: 'call_mom', color: '#06b6d4' },
      { label: 'DAD', id: 'call_dad', color: '#06b6d4' },
      { label: 'DOCTOR', id: 'call_doc', color: '#06b6d4' },
      { label: 'BROTHER', id: 'call_bro', color: '#06b6d4' },
      { label: 'FRIEND 1', id: 'call_f1', color: '#06b6d4' },
      { label: 'FRIEND 2', id: 'call_f2', color: '#06b6d4' },
      { label: 'FRIEND 3', id: 'call_f3', color: '#06b6d4' },
      { label: 'BACK', id: 'sub_back', color: 'red' },
    ];
  }
}
   else if (activeView === 'MESSAGING') {
    if (!msgSubGroup) {
      
      items = [
        { label: 'A B C D E F G', color: '#6366f1', id: 'group_ABCDEFG' },
        { label: 'H I J K L M N', color: '#22c55e', id: 'group_HIJKLMN' },
        { label: 'O P Q R S T U', color: '#ef4444', id: 'group_OPQRSTU' },
        { label: 'V W X Y Z . ?', color: '#f97316', id: 'group_VWXYZ.?' },
        { label: '1 2 3 4 5 6 7', color: '#0ea5e9', id: 'group_1234567' },
        { label: '8 9 0 + - * /', color: '#8b5cf6', id: 'group_890+-*/' },
        { label: 'SPACE', color: '#777', id: 'space' },
        { label: 'DELETE/BACK', color: 'red', id: 'msg_back_options' },
      ];
    } else if (msgSubGroup === 'OPTIONS') {
     
       items = [
         { label: 'DELETE CHAR', color: '#ef4444', id: 'action_delete' },
         { label: 'EXIT MESSAGING', color: 'red', id: 'action_exit' },
         { label: '', color: 'black', id: 'empty' },
         { label: '', color: 'black', id: 'empty' },
         { label: '', color: 'black', id: 'empty' },
         { label: '', color: 'black', id: 'empty' },
         { label: '', color: 'black', id: 'empty' },
         { label: 'CANCEL', color: '#777', id: 'sub_back' },
       ];
    }
     else {
    
      const letters = msgSubGroup.split("");
      items = letters.map(char => ({ label: char, color: '#444', id: char_${char} }));
      
      
      while(items.length < 7) items.push({ label: '', color: '#222', id: 'empty' });
      items.push({ label: 'BACK', color: 'red', id: 'sub_back' });
    }
  }

return items.map((item) => {
  const isActualButton = item.label !== ''; 
  const hovered = isActualButton && isHovered(item.id);

  return (
    <TouchableOpacity 
      key={${activeView}_${msgSubGroup}_${item.id}} 
      onPress={() => handleAction(item.id)} 
      onLayout={(e) => saveLayout(item.id, e)}
      activeOpacity={0.7}
      disabled={!isActualButton}
      style={[
        styles.gridBlock, 
        { backgroundColor: item.color },
        !isActualButton && { borderWidth: 0, opacity: 0 },
        hovered && { 
          borderColor: '#ffff00', 
          borderWidth: 6,
          zIndex: 10,
          elevation: 15,
          shadowColor: '#ffff00',
          shadowRadius: 10,
        }
      ]}
    >
      <Text style={[styles.gridLabel, hovered && { fontSize: 18, color: '#ffff00' }]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
});
};
  return (
    <View style={styles.container}>
    {/* Mode === 'MOBILE' */}
    {mode === 'MOBILE' && (
  <View style={styles.dashboardContainer}>
  
  
  <View style={styles.dynamicHeader}>
    {activeView === 'MESSAGING' ? (
      <Text style={styles.headerText}>{typedText || "Start typing..."}</Text>
    ) : (
      <Text style={styles.headerTitle}>ThirdEye AI</Text>
    )}
  </View>
  {activeView === 'AI_MODE' && (
  <View style={styles.aiFullScreen}>
    
    
    <View style={styles.dynamicHeader}>
       <Text style={styles.headerText} numberOfLines={3}>{aiResponse}</Text>
    </View>

   
    <View style={[styles.jarvisContainer, { flex: 0.4 }]}>
      <View style={[styles.aiCircle, styles.glowOuter]} />
      <View style={styles.aiCore}>
        <Text style={styles.aiStatusText}>
          {isRecording ? "LISTENING" : "READY"}
        </Text>
      </View>
    </View>

    <View style={[styles.gridContainer, { flex: 0.6 }]}>
      {renderGridItems()}
    </View>

  </View>
)}


  {activeView !== 'CAMERA' ? (
    <View style={styles.gridContainer}>
      {renderGridItems()}
    </View>
  ) : (
    
    <View style={styles.cameraOverlay}>
      <TouchableOpacity style={styles.backBtn} onPress={() => setActiveView('MAIN')}>
        <Text style={styles.btnText}>BACK</Text>
      </TouchableOpacity>
    </View>
  )}
</View>
)}

    
      <WebView 
        originWhitelist={['*']}
        source={{ html: htmlContent,
          baseUrl: 'http://localhost'
         }}
        style={{ flex: 1 , backgroundColor:'transparent',position:'absolute',width:width,height:height,zIndex:5}}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        transparent= {true}
        mediaPlaybackRequiresUserAction={false}
        onPermissionRequest={(event) => event.grant()}
         onMessage={handleMessage}
         startInLoadingState={true}
        renderLoading={() => <View style={styles.container} />}
 
       automaticallyAdjustContentInsets={false}

      incognito={false}
      /><View
  style={[
    styles.nativeCursor,
    { left: cursorPos.x, top: cursorPos.y },
  ]}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  selectionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 20,

   
    backgroundColor: 'rgba(0, 0, 0, 0.55)',

  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  dashboardContainer: { 
  ...StyleSheet.absoluteFillObject, 
  backgroundColor: 'transparent', 
  padding: 5,
  zIndex: 1, 
},
gridContainer: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
gridBlock: { 
  width: '50%',
  height: '25%', 
  margin: '0%',
  borderRadius: 15,
  borderWidth:3,
  borderColor:'#ffff',
  
  justifyContent: 'center',
  alignItems: 'center'
},
gridLabel: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
textDisplayArea: { 
  height: 80, backgroundColor: '#1a1a1a', margin: 10, borderRadius: 10, justifyContent: 'center', padding: 10 
},
displayText: { color: '#fff', fontSize: 18 },
cameraOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
backBtn: { backgroundColor: 'red', padding: 20, borderRadius: 10 },

  modeBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: 'center',

   
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },nativeCursor: {
  position: 'absolute',
  width: 35,
  height: 35,
  borderRadius: 50,
  backgroundColor: 'rgba(255,0,0,0.9)',
  borderWidth: 3,
  borderColor: '#fff',
  zIndex: 9999,
  pointerEvents: 'none',
  transform: [{ translateX: -17.5 }, { translateY: -17.5 }],
},


  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  
testOverlay: {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  justifyContent: 'center', 
  alignItems: 'center',
  zIndex: 1,
},
testElement: {
  width: width / 2.8,   
  height: height / 8, 
 
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 12,
  borderWidth: 2,
  borderColor: 'white',
},
overlayWebView: {
  position: 'absolute',
  top: 0, left: 0,
  width: width, height: height,
  backgroundColor: 'transparent',
  zIndex: 100, 
  pointerEvents: 'none', 
},dynamicHeader: {
  height: height * 0.12, 
  width: '100%',
  backgroundColor: 'rgba(0,0,0,0.7)',
  justifyContent: 'center',
  alignItems: 'center',
  borderBottomWidth: 1,
  borderBottomColor: '#444',
  marginTop: 30, 
},
headerTitle: {
  color: '#6366f1',
  fontSize: 28,
  fontWeight: '900',
  letterSpacing: 2,
  textTransform: 'uppercase',
},
headerText: {
  color: '#fff',
  fontSize: 20,
  fontWeight: '600',
  paddingHorizontal: 15,
},
aiFullScreen: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', zIndex: 100 },
jarvisContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
aiCircle: {
  position: 'absolute',
  width: 180, height: 180,
  borderRadius: 90,
  borderWidth: 2,
  borderColor: '#00f2ff',
},
glowOuter: {
  width: 220, 
  height: 220,
  borderRadius: 110,
  borderWidth: 8,
  borderColor: 'rgba(0, 242, 255, 0.2)',
  position: 'absolute',
  transform: [{ scale: 1.1 }], 
},
aiCore: {
  width: 140, height: 140,
  borderRadius: 70,
  backgroundColor: 'rgba(0, 242, 255, 0.1)',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#00f2ff',
},
aiStatusText: { color: '#00f2ff', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
aiControls: { height: height * 0.25, flexDirection: 'row' }
});