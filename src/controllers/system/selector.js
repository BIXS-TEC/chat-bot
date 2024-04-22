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
  return new Promise((resolve, reject) => {
    try {
      // console.log(request);

      const client = standardizeRequestToDefault(request);

      if (Math.floor(Date.now() / 1000) - client.timestamp > 30)
        resolve({ statusCode: 408, message: "Request took more than 30 seconds to arrive!" });

      switch (client.chatbot.interaction) {
        case "cardapio-whatsapp":
        case "cardapio-online":
          chatbotList[client.chatbot.chatbotPhoneNumber]
            .handleOrderMenuFlow(client)
            .then((result) => {
              console.log('result: ', result);
              resolve({ statusCode: 200, message: "OK" });
            })
            .catch((err) => {
              reject(err);
            });
            break;
        default:
          console.log('client.chatbot: ', client.chatbot);
          resolve({ statusCode: 204, message: `req.chatbot.interaction must be a valid tag. ${client.chatbot.interaction} is not` })
      }
    } catch (error) {
      console.log("Error in handleRequest function:\n", error);
      reject("Error in handleRequest function:\n", error);
    }
  });
}
