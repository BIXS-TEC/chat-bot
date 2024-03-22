import standardizeRequestToDefault from "../../interfaces/index.js";
import { startWppConnection } from "../init/wppconnect.js";
import creator from "./creator.js";

/**
 * Plataforma - De onde vem?
 * Interação - Qual o tipo de interação?
 * Negócio - Qual bot será acionado?
 * Cliente - Quem é o cliente?
 * Contexto - Qual o contexto do cliente?
 * Ação - O que o cliente quer fazer?
 */

startWppConnection();
const chatbotList = creator();

export async function handleRequest(request) {
  try {
    const client = standardizeRequestToDefault(request);

    switch (client.chatbot.interaction) {
      case "adicionais":
        const response = await chatbotList[client.chatbot.chatbotPhoneNumber].handleProductAditionalFlow(client);
        return response;

      default:
        break;
    }
  } catch (error) {
    console.log("Error in handleRequest function:\n", error);
  }
}
