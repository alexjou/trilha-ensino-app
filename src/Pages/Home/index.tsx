import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  StyleSheet,
} from "react-native";
import { Audio } from "expo-av"; // Biblioteca para gravação e reprodução de áudio
import Slider from "@react-native-community/slider"; // Biblioteca para o slider de progresso do áudio
import styles from "./styles";
import {
  playAudio,
  sendChatMessage,
  startRecording,
  stopRecording,
  transcribeAudio,
  convertTextToSpeech,
  processAudioMessage,
} from "../../db/gepeto"; // Certifique-se de que essas funções estão corretamente exportadas
import images from "../../Constants/images"; // Inclui todas as imagens
import Header from "../../Components/Header";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  audioUri?: string; // Para armazenar o URI do áudio
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // Controle do estado de reprodução
  const [position, setPosition] = useState<number>(0); // Posição atual do áudio
  const [duration, setDuration] = useState<number>(0); // Duração total do áudio
  const [currentMessagePlaying, setCurrentMessagePlaying] = useState<string | null>(null); // Para controlar qual áudio está tocando

  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Mensagem inicial do bot
    setMessages([
      {
        id: "1",
        text: "Olá! Como posso te ajudar hoje?",
        sender: "bot",
      },
    ]);
  }, []);

  // Função para iniciar a gravação
  const handleStartRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permissão necessária", "Precisamos de permissão para usar o microfone.");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  // Função para parar a gravação
  const handleStopRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri); // Salva o URI do áudio gravado
        setRecording(null); // Reseta o estado de gravação
      } catch (err) {
        console.error("Failed to stop recording", err);
      }
    }
  };

  // Função para carregar e reproduzir áudio
  const loadAndPlayAudio = async (uri: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        updatePlaybackStatus
      );
      soundRef.current = sound;
      setSound(sound);
      setIsPlaying(true);
      setCurrentMessagePlaying(uri);

      // Carregar duração do áudio
      const status = await sound.getStatusAsync();
      setDuration(status.durationMillis || 0);
    } catch (error) {
      console.error("Erro ao carregar e reproduzir áudio", error);
    }
  };

  // Atualizar o status do áudio
  const updatePlaybackStatus = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        setCurrentMessagePlaying(null);
      }
    }
  };

  // Função para lidar com play/pause
  const handlePlayPause = (uri: string) => {
    if (isPlaying && currentMessagePlaying === uri) {
      soundRef.current?.pauseAsync();
      setIsPlaying(false);
    } else {
      loadAndPlayAudio(uri);
    }
  };

  // Função para enviar mensagem
  const handleSend = async () => {
    if (input.trim() === "" && !audioUri) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      audioUri, // Adiciona o URI do áudio se existir
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // Limpar o campo de input
    setAudioUri(null); // Limpa o URI do áudio após enviar
    // Enviar mensagem para o ChatGPT e receber a resposta

    if (audioUri) {
      const result = await processAudioMessage(audioUri)

      const botMessage: Message = {
        id: Date.now().toString(),
        text: input.trim(),
        sender: "bot",
        audioUri: result, // Adiciona o URI do áudio se existir
      };
      setMessages((prev) => [...prev, botMessage]);

    } else {
      const response = await sendChatMessage(input);

      const botMessage: Message = {
        id: Date.now().toString(),
        text: response,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    }

    setInput(""); // Limpar o campo de input
    setAudioUri(null); // Limpa o URI do áudio após enviar
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ImageBackground
        source={images.Frame}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.inner}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 105 : 70} // Ajuste para iOS
          >
            <ScrollView
              contentContainerStyle={styles.messagesContainer}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    message.sender === "user"
                      ? styles.userRow
                      : styles.botRow,
                  ]}
                >
                  {message.sender === "bot" && (
                    <Image
                      source={images.robo} // Avatar do bot
                      style={styles.avatar}
                    />
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      message.sender === "user"
                        ? styles.userBubble
                        : styles.botBubble,
                    ]}
                  >
                    {message.text ? (
                      <Text style={styles.messageText}>{message.text}</Text>
                    ) : (
                      message.audioUri && (
                        <View style={styles.audioContainer}>
                          <TouchableOpacity
                            onPress={() => handlePlayPause(message.audioUri!)}
                            style={styles.playPauseButton}
                          >
                            <Text style={styles.playPauseText}>
                              {isPlaying && currentMessagePlaying === message.audioUri
                                ? "⏸️"
                                : "▶️"}
                            </Text>
                          </TouchableOpacity>

                          {/* Slider de progresso do áudio */}
                          {currentMessagePlaying === message.audioUri && (
                            <Slider
                              style={styles.slider}
                              minimumValue={0}
                              maximumValue={duration}
                              value={position}
                              minimumTrackTintColor="#34b7f1"
                              maximumTrackTintColor="#000000"
                              thumbTintColor="#34b7f1"
                              onSlidingComplete={async (value) => {
                                if (soundRef.current) {
                                  await soundRef.current.setPositionAsync(value);
                                  setPosition(value);
                                }
                              }}
                            />
                          )}

                          <Text style={styles.timeText}>
                            {Math.floor(position / 1000)}s / {Math.floor(duration / 1000)}s
                          </Text>
                        </View>
                      )
                    )}
                  </View>

                  {message.sender === "user" && (
                    <Image
                      source={images.User} // Avatar do usuário
                      style={styles.avatar}
                    />
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Input, botão de enviar e gravação de áudio */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Digite uma mensagem"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Text style={styles.sendButtonText}>Enviar</Text>
              </TouchableOpacity>

              {/* Botão de gravação de áudio */}
              <TouchableOpacity
                style={styles.audioButton}
                onPressIn={handleStartRecording}
                onPressOut={handleStopRecording}
              >
                <Text style={styles.recordButtonText}>🎤</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </ImageBackground>
    </SafeAreaView>
  );
}
