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
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import styles from "./styles";
import {
  playAudio,
  sendChatMessage,
  startRecording,
  stopRecording,
  transcribeAudio,
  convertTextToSpeech,
  processAudioMessage,
} from "../../db/gepeto";
import images from "../../Constants/images";
import Header from "../../Components/Header";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  audioUri?: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentMessagePlaying, setCurrentMessagePlaying] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: "Olá! Como posso te ajudar hoje?",
        sender: "bot",
      },
    ]);
  }, []);

  const handleStartRecording = async () => {
    try {
      const audioPath = await startRecording();
      setIsRecording(true);
      setAudioUri(audioPath);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      Alert.alert("Erro", "Não foi possível iniciar a gravação.");
    }
  };

  const handleStopRecording = async () => {
    if (isRecording) {
      try {
        const filePath = await stopRecording();
        setIsRecording(false);
        setAudioUri(filePath);
      } catch (error) {
        console.error("Erro ao parar gravação:", error);
        Alert.alert("Erro", "Não foi possível finalizar a gravação.");
      }
    }
  };

  const loadAndPlayAudio = async (uri: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setSound(sound);
      setIsPlaying(true);
      setCurrentMessagePlaying(uri);

      sound.setOnPlaybackStatusUpdate(updatePlaybackStatus);
      const status = await sound.getStatusAsync();
      setDuration(status.durationMillis || 0);
    } catch (error) {
      console.error("Erro ao carregar e reproduzir áudio", error);
    }
  };

  const updatePlaybackStatus = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        setCurrentMessagePlaying(null);
        clearInterval(intervalRef.current!);
      } else if (isPlaying) {
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            setPosition((prev) => prev + 100); // Atualiza a posição a cada 100 ms
          }, 100);
        }
      } else {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
      }
    }
  };

  const handlePlayPause = (uri: string) => {
    if (isPlaying && currentMessagePlaying === uri) {
      soundRef.current?.pauseAsync();
      setIsPlaying(false);
      clearInterval(intervalRef.current!);
    } else {
      loadAndPlayAudio(uri);
    }
  };

  const handleSend = async () => {
    if (input.trim() === "" && !audioUri) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      audioUri,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAudioUri(null);

    if (audioUri) {
      const result = await processAudioMessage(audioUri);
      const botMessage: Message = {
        id: Date.now().toString(),
        text: input.trim(),
        sender: "bot",
        audioUri: result,
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

    setInput("");
    setAudioUri(null);
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
            keyboardVerticalOffset={Platform.OS === "ios" ? 105 : 70}
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
                      source={images.robo}
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

                          {currentMessagePlaying === message.audioUri && (
                            <>
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
                              <Text style={styles.timeText}>
                                {Math.floor(position / 1000)}s / {Math.floor(duration / 1000)}s
                              </Text>
                            </>
                          )}
                        </View>
                      )
                    )}
                  </View>

                  {message.sender === "user" && (
                    <Image
                      source={images.User}
                      style={styles.avatar}
                    />
                  )}
                </View>
              ))}
            </ScrollView>

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

              <TouchableOpacity
                style={styles.audioButton}
                onPressIn={handleStartRecording}
                onPressOut={handleStopRecording}
              >
                <Text style={styles.recordButtonText}>
                  {isRecording ? "🔴" : "🎤"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </ImageBackground>
    </SafeAreaView>
  );
}

