import creator from "./creator.js";
import standardizeRequestToDefault from "../../interfaces/index.js";

/**
 * Plataforma - De onde vem?
 * Interação - Qual o tipo de interação?
 * Negócio - Qual bot será acionado?
 * Cliente - Quem é o cliente?
 * Contexto - Qual o contexto do cliente?
 * Ação - O que o cliente quer fazer?
 */

const chatbotList = creator();

export async function handleRequest(request) {
  try {
    console.log(request);

    const client = standardizeRequestToDefault(request);
    
    if (Math.floor(Date.now() / 1000) - client.timestamp > 30)
      return

    switch (client.chatbot.interaction) {
      case "adicionais":
        chatbotList[client.chatbot.chatbotPhoneNumber].handleProductAdditionalFlow(client);
      default:
        break;
    }
  } catch (error) {
    console.log("Error in handleRequest function:\n", error);
  }
}
