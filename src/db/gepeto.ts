export async function sendChatMessage(message: string): Promise<string> {
  try {
    // Aqui você pode usar fetch/axios para enviar o texto do usuário para a API do ChatGPT
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer YOUR_API_KEY`, // Substitua pela sua chave de API
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
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
