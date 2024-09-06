import creator from "./creator.js";
import Chatbot from "../../models/classes/chatbot.js";
import { standardizeMessageRequestToDefault, standardizeConfigRequestToDefault } from "../../interfaces/index.js";

/** Estrutura de indentificação da mensagem em ordem:
 * Plataforma - De onde vem?
 * Interação - Qual o tipo de interação?
 * Negócio - Qual bot será acionado?
 * Cliente - Quem é o cliente?
 * Contexto - Qual o contexto do cliente?
 * Ação - O que o cliente quer fazer?
 */
let chatbotList = {};

// Depreciada, apenas para teste, iniciar chatbot ao iniciar servidor
// Função de setup para iniciar o chatbot a partir dados de objetos json
export function systemSetup() {
  return new Promise(async (resolve, reject) => {
    try {
      chatbotList = await creator(); // Retorna a lista de chatbots
      resolve(true);
    } catch (error) {
      console.error("Error in systemSetup:\n", error);
      reject(error);
    }
  });
}

const message = {
  // Tratamento de requisições de mensagens enviadas pelo cliente Whats App (via wppconnect-server)
  handleMessageRequest: async function (request) {
    return new Promise((resolve, reject) => {
      try {
        // console.log("\x1b[36;1m", "\n\n\n\nrequest: ", request, "\n\n\n\n", "\x1b[0m");

        // Padronização do objeto recebido de acordo com a plataforma remetente
        const client = standardizeMessageRequestToDefault(request);
        if (!client) {
          resolve({ statusCode: 200, message: "No data" });
          return;
        }

        // Ignora requisições que demoraram mais de 30 segundos para serem tratadas
        if (Math.floor(Date.now() / 1000) - client.timestamp > 30) {
          resolve({ statusCode: 200, message: "Request took more than 30 seconds to arrive!" });
          return;
        }

        // Identifica o chatbot que o cliente Whats App deseja interagir
        const chatbot = chatbotList[client.chatbot.chatbotPhoneNumber];
        if (!chatbot) throw new Error("Invalid chatbot");

        // Atualiza o valor de "interaction" do cliente da lista de clientes
        if (client.chatbot.interaction === "chatbot" && chatbot.clientList[client.phoneNumber])
          client.chatbot.interaction = chatbot.clientList[client.phoneNumber].chatbot.interaction;

        // Identifica qual a interação desejada pelo cliente
        switch (client.chatbot.interaction) {
          case "chatbot":
          case "cardapio-whatsapp":
          case "cardapio-online":
            // Verifica se o cliente esta conversando com um atendente ou se deseja entrar em um dos 3 contextos padrões
            if (
              !chatbot.clientList[client.phoneNumber]?.chatbot?.humanChating ||
              ["voltar-chatbot", "faq", "atendente"].includes(client.chatbot.itemId)
            ) {
              chatbot.handleOrderMenuFlow(client)
                .then((result) => {
                  // console.log("result: ", JSON.stringify(result));
                  resolve({ statusCode: 200, message: "OK" });
                })
                .catch((err) => {
                  reject(err);
                });
            }
            break;
          // Tratamento de comandos enviados na conversa do próprio numero de Whats App que sincronizou com o chatbot
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
          // Comandos enviados em um grupo de funcionários
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

            // Tratamento de mensagens do Whats App tipo Enquete
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
  // Tratamento de requisições de alteração de dados do chatbot enviadas pelo Gerenciador Assistente Bix
  handleConfigRequest: async function (request) {
    return new Promise(async (resolve, reject) => {
      try {
        // Padronização da mensagem dependendo do remetente
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
          // Tratamento de requisição para notificar que a sessão foi iniciada com sucesso
          case "session-connected": {
            const phoneNumber = findPhoneNumberBySession(client.phoneNumber);
            if (phoneNumber) {
              console.log("checkConnectionSession: ", await chatbotList[phoneNumber].checkConnectionSession());
              setTimeout(() => {
                chatbotList[phoneNumber].initializeGroupList();
              }, 20000);
            } else {
              console.error(`Session ${client.session} not found in chatbotList`);
            }
            break;
          }
          // Tratamento de requisições para alteração de dados do chatbot
          case "update-chatbot": {
            console.log("update-chatbot client: ", client);
            const phoneNumber = formatPhoneNumber(client.phoneNumber);
            console.log("formatPhoneNumber: ", phoneNumber);
            if (!chatbotList[phoneNumber]) {
              console.log(`\x1b[31mChatbot com o número ${phoneNumber} não existe.\x1b[0m`);
              break;
            }
            chatbotList[phoneNumber].updateConfigData(client);
            break;
          }
          // Tratamento de requisição para verificar o status da sessão
          case "check-connection-session": {
            console.log("check-connection-session client: ", client);
            const phoneNumber = formatPhoneNumber(client.phoneNumber);
            console.log("formatPhoneNumber: ", phoneNumber);
            if (!chatbotList[phoneNumber]) {
              console.log(`\x1b[31mChatbot com o número ${phoneNumber} não existe.\x1b[0m`);
              break;
            }
            return await chatbotList[phoneNumber].checkConnectionSession();
          }
        }
      } catch (error) {
        console.log("Error in handleConfigRequest function:\n", error);
        reject(error);
      }
    });
  },

  // Função para instanciar um novo chatbot
  createChatbot: async function (request) {
    const chatbot = {
      id: request.id,
      businessName: request.businessName,
      phoneNumber: formatPhoneNumber(request.phoneNumber),
      clientList: {},
      employeeList: {},
      productList: request.productList,
      config: request.config,
    };

    // Se chatbot ja existe retornar que ja esta conectado
    if (chatbotList[chatbot.phoneNumber] && (await chatbotList[phoneNumber].checkConnectionSession().status) === "Connected")
      return { status: "CONNECTED" };

    chatbotList[chatbot.phoneNumber] = new Chatbot(chatbot);

    // Retornar o QR Code
    const sessionData = await chatbotList[chatbot.phoneNumber].sessionData;
    console.log("createChatbot sessionData: ", sessionData);
    return sessionData;
  },
};

function findPhoneNumberBySession(session) {
  for (let phoneNumber in chatbotList) {
    if (chatbotList[phoneNumber].session === session) {
      return chatbotList[phoneNumber].phoneNumber;
    }
  }
  return null; // Retorna null se não encontrar um objeto com o session especificado
}

function formatPhoneNumber(phoneNumber) {
  phoneNumber = phoneNumber.replace(/\D/g, "");
  const pos = phoneNumber.length - 9;

  return phoneNumber.slice(0, pos) + phoneNumber.slice(pos + 1);
}

export { message, config };
