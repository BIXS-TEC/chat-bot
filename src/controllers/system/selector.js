import creator from "./creator.js";
import { standardizeMessageRequestToDefault, standardizeDataRequestToDefault} from "../../interfaces/index.js";

/**
 * Plataforma - De onde vem?
 * Interação - Qual o tipo de interação?
 * Negócio - Qual bot será acionado?
 * Cliente - Quem é o cliente?
 * Contexto - Qual o contexto do cliente?
 * Ação - O que o cliente quer fazer?
 */

let chatbotList;

export function systemSetup() {
  return new Promise(async (resolve, reject) => {
    try {
      chatbotList = await creator();
      resolve(true);
    } catch (error) {
      console.error("Error in systemSetup:\n", error);
      reject(error);
    }
  });
}

export async function handleMessageRequest(request) {
  return new Promise((resolve, reject) => {
    try {
      // console.log('request: ', request);

      const client = standardizeMessageRequestToDefault(request);
      if (!client){
        resolve({ statusCode: 200, message: "OK" });
        return;
      }

      if (Math.floor(Date.now() / 1000) - client.timestamp > 30)
        resolve({ statusCode: 408, message: "Request took more than 30 seconds to arrive!" });

      switch (client.chatbot.interaction) {
        case "cardapio-whatsapp":
        case "cardapio-online":
          chatbotList[client.chatbot.chatbotPhoneNumber]
            .handleOrderMenuFlow(client)
            .then((result) => {
              console.log("result: ", JSON.stringify(result));
              resolve({ statusCode: 200, message: "OK" });
            })
            .catch((err) => {
              reject(err);
            });
          break;

        default:
          console.log("client.chatbot: ", client.chatbot);
          resolve({ statusCode: 204, message: `req.chatbot.interaction must be a valid tag. ${client.chatbot.interaction} is not` });
      }
    } catch (error) {
      console.log("Error in handleMessageRequest function:\n", error);
      reject(error);
    }
  });
}

export async function handleDataRequest(request) {
  return new Promise((resolve, reject) => {
    try {
      const client = standardizeDataRequestToDefault(request);

      switch (client.chatbot.interaction) {
        case "cardapio-online":
          chatbotList[client.chatbot.chatbotPhoneNumber]
            .saveClientOrder(client)
            .then((result) => {
              console.log("result: ", result);
              resolve({ statusCode: 200, message: "OK" });
            })
            .catch((err) => {
              reject(err);
            });
          break;
      }
    } catch (error) {
      console.log("Error in handleDataRequest function:\n", error);
      reject(error);
    }
  });
}
