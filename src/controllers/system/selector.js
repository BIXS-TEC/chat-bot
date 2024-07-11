import creator from "./creator.js";
import Chatbot from "../../models/classes/chatbot.js";
import { standardizeMessageRequestToDefault, standardizeConfigRequestToDefault } from "../../interfaces/index.js";
import { initServer } from "../init/wpp-server.js";
import WppSender from "../../APIs/wppconnect-server/wpp-sender.js";

/**
 * Plataforma - De onde vem?
 * Interação - Qual o tipo de interação?
 * Negócio - Qual bot será acionado?
 * Cliente - Quem é o cliente?
 * Contexto - Qual o contexto do cliente?
 * Ação - O que o cliente quer fazer?
 */
let chatbotList = {};

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

const message = {
  handleMessageRequest: async function (request) {
    return new Promise((resolve, reject) => {
      try {
        console.log("\x1b[36;1m", "\n\n\n\nrequest: ", request, "\n\n\n\n", "\x1b[0m");

        const client = standardizeMessageRequestToDefault(request);
        if (!client) {
          resolve({ statusCode: 200, message: "No data" });
          return;
        }

        if (Math.floor(Date.now() / 1000) - client.timestamp > 30) {
          resolve({ statusCode: 200, message: "Request took more than 30 seconds to arrive!" });
          return;
        }

        const chatbot = chatbotList[client.chatbot.chatbotPhoneNumber];
        if (!chatbot) throw new Error("Invalid chatbot");

        if (client.chatbot.interaction === "chatbot" && chatbot.clientList[client.phoneNumber])
          client.chatbot.interaction = chatbot.clientList[client.phoneNumber].chatbot.interaction;

        switch (client.chatbot.interaction) {
          case "chatbot":
          case "cardapio-whatsapp":
          case "cardapio-online":
            if (
              !chatbot.clientList[client.phoneNumber]?.chatbot?.humanChating ||
              ["voltar-chatbot", "faq", "atendente"].includes(client.chatbot.itemId)
            ) {
              chatbot
                .handleOrderMenuFlow(client)
                .then((result) => {
                  // console.log("result: ", JSON.stringify(result));
                  resolve({ statusCode: 200, message: "OK" });
                })
                .catch((err) => {
                  reject(err);
                });
            }
            break;
          case "admin":
            if (chatbot.clientList[client.chatbot.messageTo]?.chatbot.humanChating) {
              chatbot
                .handleAdminCommand(client)
                .then((result) => {
                  // console.log("result: ", JSON.stringify(result));
                  resolve({ statusCode: 200, message: "OK" });
                })
                .catch((err) => {
                  reject(err);
                });
            }
            break;

          case "group":
            chatbot
              .handleGroupCommand(client)
              .then((result) => {
                // console.log("result: ", JSON.stringify(result));
                resolve({ statusCode: 200, message: "OK" });
              })
              .catch((err) => {
                reject(err);
              });
            break;

          case "poll":
            chatbot
              .saveSatisfactionFeedback(client)
              .then((result) => {
                // console.log("result: ", JSON.stringify(result));
                resolve({ statusCode: 200, message: "OK" });
              })
              .catch((err) => {
                reject(err);
              });
            break;

          default:
            console.log("client.chatbot: ", client);
            resolve({ statusCode: 204, message: `req.chatbot.interaction must be a valid tag. ${client.chatbot.interaction} is not` });
        }
      } catch (error) {
        console.log("Error in handleMessageRequest function:\n", error);
        reject(error);
      }
    });
  },
};

const config = {
  handleConfigRequest: async function (request) {
    return new Promise((resolve, reject) => {
      try {
        const client = standardizeConfigRequestToDefault(request);

        switch (client.chatbot.interaction) {
          case "cardapio-online":
            chatbotList[client.chatbot.chatbotPhoneNumber]
              .saveClientOrder(client)
              .then((result) => {
                // console.log("result: ", result);
                resolve({ statusCode: 200, message: "OK" });
              })
              .catch((err) => {
                reject(err);
              });
            break;
        }
      } catch (error) {
        console.log("Error in handleConfigRequest function:\n", error);
        reject(error);
      }
    });
  },

  createChatbot: async function (request) {
    const response = await WppSender.startSession();
    console.log("createChatbot request:", request);
    const chatbot = {
      id: request.id,
      businessName: request.businessName,
      phoneNumber: request.phoneNumber,
      clientList: {},
      employeeList: {},
      productList: request.productList,
      config: request.config,
    };
    chatbotList[chatbot.phoneNumber] = new Chatbot(chatbot);
    console.log("\x1b[32m chatbotList: ", chatbotList);
    console.log('startSession response: ', response);
    return response;
  },
};

export { message, config };
