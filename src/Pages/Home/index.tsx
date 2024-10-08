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
  const [isTyping, setIsTyping] = useState<boolean>(false); // Para controlar o efeito de digitação

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

  // Função para simular digitação letra por letra
  const simulateTyping = (text: string) => {
    setIsTyping(true); // Inicia o efeito de digitação
    let index = 0;
    let botMessage = "";

    const typingInterval = setInterval(() => {
      if (index < text.length) {
        botMessage += text[index];
        index++;

        // Atualiza a última mensagem do bot em tempo real
        setMessages((prevMessages) =>
          prevMessages.map((msg, idx) =>
            msg.sender === "bot" && idx === prevMessages.length - 1
              ? { ...msg, text: botMessage }
              : msg
          )
        );
      } else {
        clearInterval(typingInterval);
        setIsTyping(false); // Termina o efeito de digitação
      }
    }, 50); // Atraso de 50ms entre cada letra
  };

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

    // Adiciona a resposta vazia e simula a digitação
    const botMessage: Message = {
      id: Date.now().toString(),
      text: "",
      sender: "bot"
    };

    setMessages((prev) => [...prev, botMessage]);
    simulateTyping(response); // Simula a digitação
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
