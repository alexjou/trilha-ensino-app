import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import {
  startRecording,
  stopRecording,
  processAudioMessage,
} from '../../db/gepeto';
import styles from './styles';
import Header from '../../Components/Header';
import { LoadingIndicator } from '../../Components/LoadingIndicator';
import Colors from '../../Constants/Colors';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('Olá! Sou a assistente virtual Tereza, pronta para ajudar a tirar suas dúvidas. Como posso te ajudar hoje?');
  const [loading, setLoading] = useState<boolean>(false);

  const animationRef = useRef<LottieView>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    };
    setupAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      await startRecording();
      setIsRecording(true);
      animationRef.current?.play();
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  };

  const clear = () => {
    setIsRecording(false);
    setLoading(false)
    setAudioUri(null);
    setCurrentText('')
  }

  const handleStopRecording = async () => {
    if (isRecording) {
      try {
        const filePath = await stopRecording();
        setIsRecording(false);
        setAudioUri(filePath);
        animationRef.current?.pause();

        if (filePath) {
          const userMessage: Message = {
            id: Date.now().toString(),
            text: '',
            sender: 'user',
          };
          setMessages((prev) => [...prev, userMessage]);
          setLoading(true)
          const { audioGpt, textGpt } = await processAudioMessage(filePath);
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: textGpt,
            sender: 'bot',
          };
          setMessages((prev) => [...prev, botMessage]);

          setLoading(false)
          handlePlayResponse(textGpt, audioGpt);
        }
      } catch (error) {
        clear()
        console.log('Erro ao parar gravação:', error);
        Alert.alert('Erro', 'Ocorreu um erro, tente novamente.');
      }
    }
  };

  const handlePlayResponse = async (text: string, filePath: string) => {
    if (!filePath) {
      console.error('Erro: o caminho do áudio é null ou indefinido.');
      Alert.alert('Erro', 'O áudio não está disponível para reprodução.');
      return;
    }

    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync({ uri: filePath });
      soundRef.current = soundObject;
      await soundObject.playAsync();
      setIsPlaying(true);

      animateTranscription(text);

      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setCurrentText('');
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
        setCurrentText('');
      });
    } catch (error) {
      clear()
      console.error('Erro ao reproduzir áudio:', error);
      Alert.alert('Erro', 'Erro na requisição, tente novamente.');
    }
  };

  const animateTranscription = (text: string) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setCurrentText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.mainContent}>
        <View style={styles.animationContainer}>
          <LottieView
            ref={animationRef}
            source={require('../../../assets/animations/voice-wave.json')}
            style={styles.animation}
            autoPlay={isRecording || isPlaying}
            loop
          />
          <TouchableOpacity
            onPressIn={handleStartRecording}
            onPressOut={handleStopRecording}
            style={styles.recordButton}
          >
            <Icon
              name={isRecording ? 'stop' : 'microphone'}
              size={40}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.transcriptionContainer}>
          <View>
            {loading ? (
              <LoadingIndicator isLoading={loading} color={Colors.default2} size={50} />
            ) : (
              <Text style={styles.transcriptionText}>
                {currentText || 'Pressione o botão para falar...'}
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
