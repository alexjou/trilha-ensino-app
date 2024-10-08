import React, { useState, useEffect } from "react";
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
  Keyboard
} from "react-native";
import styles from "./styles";
import { sendChat } from "../../db/gepeto";
import images from "../../Constants/images"; // Inclui todas as imagens
import Header from "../../Components/Header";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    // Mensagem inicial do bot
    setMessages([
      {
        id: "1",
        text: "Olá! Como posso te ajudar hoje?",
        sender: "bot"
      }
    ]);
  }, []);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user"
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // Limpar o campo de input

    // Enviar mensagem para o ChatGPT e receber a resposta
    const response = await sendChat(input);

    const botMessage: Message = {
      id: Date.now().toString(),
      text: response,
      sender: "bot"
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ImageBackground
        source={images.Frame}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.1 }}
      >
        {/* Envolvendo todo o conteúdo com TouchableWithoutFeedback para fechar o teclado */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* Usando KeyboardAvoidingView para evitar sobreposição do teclado */}
          <KeyboardAvoidingView
            style={styles.inner}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 105 : 70} // Ajuste para iOS
          >
            {/* Incluíndo o ScrollView para que o conteúdo role quando o teclado aparecer */}
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
                      : styles.botRow
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
                        : styles.botBubble
                    ]}
                  >
                    <Text style={styles.messageText}>{message.text}</Text>
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

            {/* Input e botão de enviar */}
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
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </ImageBackground>
    </SafeAreaView>
  );
}
