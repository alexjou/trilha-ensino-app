import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { CHATGPT_API_KEY, GOOGLE_API_KEY } from 'react-native-dotenv';

let recording: Audio.Recording | null = null;

export async function startRecording() {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permissão de gravação negada.");
    }

    recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();
  } catch (error) {
    console.error("Erro ao iniciar gravação:", error);
  }
}

export async function stopRecording(): Promise<string | null> {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recording = null;
      return uri;
    }
    return "";
  } catch (error) {
    console.error("Erro ao parar gravação:", error);
    return "";
  }
}

export async function transcribeAudio(audioUri: string): Promise<string> {
  try {
    // Lê o arquivo de áudio em Base64
    const audioFile = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Faz a requisição para a API do Google Speech-to-Text
    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        config: {
          encoding: "LINEAR16", // Certifique-se de que o áudio esteja nesse formato
          sampleRateHertz: 16000, // Taxa de amostragem correta
          languageCode: "pt-BR", // Define o idioma
        },
        audio: {
          content: audioFile, // Envia o áudio em Base64
        },
      }),
    });

    const data = await response.json();

    // Verifica a resposta da API e retorna a transcrição
    if (response.ok && data.results) {
      const transcript = data.results.map((result: any) => result.alternatives[0].transcript).join('\n');
      return transcript;
    } else {
      console.error("Erro na resposta da API do Google:", data);
      throw new Error(data.error?.message || "Erro ao transcrever áudio.");
    }
  } catch (error) {
    // throw new Error("Erro ao transcrever áudio.");
    return 'erro'
  }
}

export async function convertTextToSpeech(text: string): Promise<string> {
  try {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "pt-BR", ssmlGender: "FEMALE" }, // Configure o idioma e a voz
        audioConfig: { audioEncoding: "MP3" },
      }),
    });

    const data = await response.json();
    if (response.ok) {
      const audioContent = data.audioContent;
      const audioUri = FileSystem.documentDirectory + "response.mp3";
      await FileSystem.writeAsStringAsync(audioUri, audioContent, { encoding: FileSystem.EncodingType.Base64 });
      return audioUri;
    } else {
      throw new Error("Erro ao converter texto em fala.");
    }
  } catch (error) {
    console.error("Erro:", error);
    return "";
  }
}

export async function processAudioMessage(audioUri: string): Promise<string> {
  console.log('entrou')
  try {
    console.log('1', audioUri)
    const transcript = await transcribeAudio(audioUri);
    console.log('2', transcript)
    const chatResponse = await sendChatMessage(transcript);
    console.log('3', chatResponse)
    const mensageToAudio = await convertTextToSpeech(chatResponse)
    console.log('4', mensageToAudio)
    return mensageToAudio;
  } catch (error) {
    console.error("Erro ao processar mensagem de áudio:", error);
    return "Erro ao processar a mensagem de áudio.";
  }
}

export async function playAudio(audioUri: string) {
  try {
    const sound = new Audio.Sound();
    await sound.loadAsync({ uri: audioUri });
    await sound.playAsync();
  } catch (error) {
    console.error("Erro ao tocar áudio:", error);
  }
}

export async function sendChatMessage(message: string): Promise<string> {
  console.log('teste: ', message)
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CHATGPT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }], // Estrutura correta para o gpt-3.5-turbo
        max_tokens: 150, // Ajuste conforme necessário
      }),
    });

    const data = await response.json();
    console.log(data)
    if (response.ok) {
      return data.choices[0].message.content; // Acessa o conteúdo da resposta do modelo
    } else {
      throw new Error(data.error.message || "Erro na API");
    }
  } catch (error) {
    console.error("Error:", error);
    return "Desculpe, houve um erro ao processar sua solicitação.";
  }
}

export async function sendChat(message: string): Promise<string> {
  // Simulação de respostas com base nas escolhas do usuário
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("olá") || lowerMessage.includes("oi")) {
    return "Olá! Como posso te ajudar hoje?\n1. Saber mais sobre o produto\n2. Suporte técnico\n3. Falar com um atendente";
  }

  if (lowerMessage.includes("1")) {
    return "Aqui estão mais informações sobre o nosso produto: é um app para conectar pessoas com ecoturismo.\nO que você deseja?\n1. Ver preços\n2. Saber como funciona\n3. Falar com um atendente";
  }

  if (lowerMessage.includes("2")) {
    return "Você está com problemas técnicos? Por favor, descreva o problema para que eu possa te ajudar.";
  }

  if (lowerMessage.includes("3")) {
    return "Conectando você com um atendente... Por favor, aguarde um momento.";
  }

  return "Desculpe, não entendi sua mensagem. Por favor, escolha uma das opções acima.";
}
