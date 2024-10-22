import AudioRecorderPlayer, { AudioEncoderAndroidType, AudioSourceAndroidType, AVEncoderAudioQualityIOSType, AVEncodingOption } from 'react-native-audio-recorder-player';
import { PermissionsAndroid, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { CHATGPT_API_KEY, GOOGLE_API_KEY } from 'react-native-dotenv';

let recording: Audio.Recording | null = null;

export async function startRecording(): Promise<void> {
  try {
    console.log('Requesting permissions..');
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    console.log('Starting recording..');
    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recording = newRecording;
    console.log('Recording started');
  } catch (err) {
    console.error('Failed to start recording', err);
    throw err;
  }
}

export async function stopRecording(): Promise<string> {
  if (!recording) {
    throw new Error('No active recording');
  }

  console.log('Stopping recording..');
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  console.log('Recording stopped and stored at', uri);

  // Convertendo para MP3 (nota: esta é uma simulação, pois expo-av não suporta diretamente MP3)
  const mp3Uri = `${FileSystem.documentDirectory}recording.mp3`;
  await FileSystem.copyAsync({
    from: uri,
    to: mp3Uri
  });

  recording = null;
  return mp3Uri;
}

export async function transcribeAudio(audioPath: string): Promise<string> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(audioPath);
    if (!fileInfo.exists) {
      throw new Error('Arquivo de áudio não encontrado.');
    }

    const formData = new FormData();
    formData.append('file', {
      uri: audioPath,
      type: 'audio/mp3',
      name: 'audio.mp3',
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    // Faz a requisição para a API da OpenAI Whisper
    const response = await fetch(`https://api.openai.com/v1/audio/transcriptions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CHATGPT_API_KEY}`,
      },
      body: formData,
    });

    const data = await response.json();

    // Verifica a resposta da API e retorna a transcrição
    if (response.ok) {
      return data.text;
    } else {
      console.error("Erro na resposta da API da OpenAI:", data);
      throw new Error(data.error?.message || "Erro ao transcrever áudio.");
    }
  } catch (error) {
    console.error("Erro ao transcrever áudio:", error);
    return 'Erro ao transcrever áudio.';
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
