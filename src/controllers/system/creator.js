import getChatbotList from "../../models/data/chatbot.js";

// Função para inicializar a lista de chatbots a partir de arquivos estaticos json
export default async function creator() {
  return new Promise(async (resolve, reject) => {
    try {
      const chatbotList = getChatbotList();
      resolve(chatbotList);
    } catch (error) {
      console.error("Error in creator:\n", error);
      reject(error);
    }
  });
}
