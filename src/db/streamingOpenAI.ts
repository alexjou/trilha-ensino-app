import { CHATGPT_API_KEY } from 'react-native-dotenv';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

// Incluir o token de autenticação diretamente na URL
export const WS_URL = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01&auth=${CHATGPT_API_KEY}`;

// Remover os headers, pois não serão usados na conexão WebSocket
export const WS_OPTIONS = {
  // Podemos manter o OpenAI-Beta aqui se for necessário em algum outro lugar do código
  "OpenAI-Beta": "realtime=v1",
};

export function startSpeechRecognition(onResult: (result: string) => void) {
  Voice.onSpeechResults = (e) => {
    if (e.value && e.value.length > 0) {
      onResult(e.value[0]);
    }
  };

  Voice.start('pt-BR');
}

export function stopSpeechRecognition() {
  Voice.stop();
}

export function speakMessage(message: string) {
  Tts.speak(message);
}