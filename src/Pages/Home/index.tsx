import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import styles from "./styles";
import { sendChat } from "../../db/gepeto";
import images from "../../Constants/images";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

export default function Login() {
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.inner}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={90} // Ajuste para iOS
        >
          <ScrollView contentContainerStyle={styles.messagesContainer}>
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

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Digite uma mensagem"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
