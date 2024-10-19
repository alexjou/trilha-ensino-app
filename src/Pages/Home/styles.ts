import { StyleSheet } from "react-native";
import Colors from "../../Constants/Colors";

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: Colors.default,
  },
  backgroundImage: {
    backgroundColor: "#e5ddd5",
    flex: 1,
    resizeMode: "cover", // Cobrir toda a área de fundo
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
  },
  messagesContainer: {
    paddingHorizontal: 10,
    // paddingVertical: 20,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 5,
    marginTop: 25
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 10,
  },
  userBubble: {
    backgroundColor: "#DCF8C6", // Verde claro (estilo do WhatsApp)
    alignSelf: "flex-end",
  },
  botBubble: {
    backgroundColor: "#FFF", // Bolha do bot em branco
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: Colors.default,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderColor: Colors.border_color,
    borderWidth: 1,
    backgroundColor: "#f1f1f1",
    marginRight: 10,
  },
  sendButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.default2, // Cor do botão de enviar (verde WhatsApp)
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  sendButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  audioButton: {
    backgroundColor: Colors.default2, // Azul claro para o botão de áudio
    borderRadius: 30,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  recordButtonText: {
    fontSize: 20,
    color: '#FFF',
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  playPauseButton: {
    marginRight: 10,
  },
  playPauseText: {
    fontSize: 24,
  },
  slider: {
    width: 200,
    height: 40,
  },
  timeText: {
    fontSize: 12,
    color: "#555",
  },
});

export default styles;
