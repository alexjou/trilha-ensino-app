import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import useWebSocket from 'react-native-use-websocket';
import { WS_URL, WS_OPTIONS, startSpeechRecognition, stopSpeechRecognition, speakMessage } from '../../db/streamingOpenAI';
import AnimatedBubble from '../../Components/AnimatedBubble';
import { useNavigationHandler } from '../../Hooks/navigation';
import styles from './styles';

export default function Home() {
  const navigate = useNavigationHandler();
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<{ id: string; text: string; sender: 'user' | 'bot' }[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleAssistantResponse = useCallback((response: any) => {
    if (typeof response === 'string') {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: response, sender: 'bot' }]);
      speakMessage(response);
    } else if (response.type === 'message' && response.content) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: response.content, sender: 'bot' }]);
      speakMessage(response.content);
    } else if (response.error) {
      console.error('Error from server:', response.error);
      Alert.alert('Erro', 'Ocorreu um erro na comunicação com o servidor.');
    }
  }, []);

  const { sendMessage } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("Connected to server.");
      setIsConnected(true);
      sendMessage(JSON.stringify({
        type: "response.create",
        response: {
          modalities: ["text"],
          instructions: "You are a helpful AI assistant. Respond concisely and accurately.",
        },
      }));
    },
    onMessage: (event) => {
      try {
        const message = JSON.parse(event.data);
        handleAssistantResponse(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    },
    onError: (event) => {
      console.error('WebSocket error:', event);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Por favor, tente novamente mais tarde.');
      setIsConnected(false);
    },
    onClose: () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    },
  });

  useEffect(() => {
    if (isListening && isConnected) {
      startSpeechRecognition((transcript) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: transcript, sender: 'user' }]);
        sendMessage(JSON.stringify({
          type: "message.create",
          message: {
            content: transcript,
          },
        }));
      });
    } else {
      stopSpeechRecognition();
    }

    return () => {
      stopSpeechRecognition();
    };
  }, [isListening, isConnected, sendMessage]);

  const handleToggleListening = () => {
    if (!isConnected) {
      Alert.alert('Não conectado', 'Aguarde a conexão com o servidor antes de iniciar.');
      return;
    }
    setIsListening(prev => !prev);
  };

  return (
    <View style={styles.container}>
      {/* <AnimatedBubble messages={messages} /> */}
      <TouchableOpacity onPress={handleToggleListening} style={styles.microphoneButton}>
        <Text style={styles.microphoneButtonText}>
          {isListening ? 'Parar de ouvir' : 'Começar a ouvir'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}