import { closeSession } from "@wppconnect/server/dist/controller/sessionController.js";
import Context from "../../classes/context.js";

function contextSetup(contextList) {
  const contextNames = [];
  for (const contextName in contextList) {
    contextNames.push(`${contextName}`);
  }

  contextList["faq"].previousContexts = contextNames;
  contextList["atendente"].previousContexts = contextNames;
  contextList["invalido"].previousContexts = contextNames;
}

export default function getCardapioOnlineContexts() {
  const contextList = {};

  /**
   * contextList["context-name"] = new Context({
   *  id: "0",
   *  name: "context-name",                                 // Same as self contextList index
   *  previuosContext: ["context-name1", "context-name2"]   // Only such contexts will precede this context
   *  action: function(),                                   // Data managment of this context, returns args that can be passed to responseObjects()
   *  activationKeywords: ["key1", "key2"]                  // If more than one context is eligible, words present in activationKeywords will break the tie
   *  responseObjects: function(),                          // Object containing selectable cases in sendMessage of the Sender class, should return following responseObjects
   * });
   * 
    responseObjects: {
      listMessage:
      {
        description: "description",
        buttonText: "buttonText",
        sections: [
          {
            title: "title",
            rows: [
              {
                rowId: "rowId",
                title: "title",
                description: "description",
              },
              ...
            ],
          },
          ...
        ],
      },
      text: { 
        message: "message" 
      },
      linkPreview: {
        url: "https://example.com.br/",
        caption: "caption" // Optional
      },
      replyMessage: {
        message: "message",
        messageId: "messageId"
      }
    }
   */

  contextList["bem-vindo"] = new Context({
    id: "0",
    name: "bem-vindo",
    previousContexts: ["nenhum"],
    action: function (chatbot, client) {
      try {
        chatbot.clientList[client.phoneNumber].changeContext(this.name);
      } catch (error) {
        console.error('Erro no contexto "bem-vindo"', error);
      }
    },
    responseObjects: function (chatbot, client, args = {}) {
      return [
        {
          type: "listMessage",
          description: `*Olá ${client.name}!*\nBem-vindo ao _*${chatbot.businessName}*_\n\n` + "Selecione uma das opções a partir do botão abaixo", //"`Por favor, selecione uma das opções a partir do botão abaixo`",
          buttonText: "Clique para ver as opções",
          sections: [
            {
              title: "Escolha uma das opções",
              rows: [
                {
                  rowId: "cardapio",
                  title: "Ver cardápio 🍔",
                  description: "Fazer um pedido",
                },
                {
                  rowId: "atendente",
                  title: "Falar com um atendente 📲",
                  description: "Tranferir para um atendente, caso precise resolver um problema específico",
                },
                {
                  rowId: "faq",
                  title: "Perguntas Frequentes ❔",
                  description: "Horário de funcionamento, localização, eventos etc...",
                },
              ],
            },
          ],
        },
      ];
    },
  });

  contextList["faq"] = new Context({
    id: "1",
    name: "faq",
    previousContexts: [], // Initialized as all context names in chatbot constructor
    activationKeywords: ["faq"],
    action: function (chatbot, client) {
      // função para previousContexts = todos os contextos
    },
    responseObjects: function (chatbot, client, args = {}) {
      return [
        {
          type: "text",
          message: `_*Perguntas Frequentes*_
    
*Horário de funcionamento*:
* seg-sex 11:00 as 20:00
* sab-dom 11:00 as 23:00

*Endereço Local*:
Av. Paulista, 3527 - Bela Vista, São Paulo

*Proxímos eventos*:
* Night Show - Blues ao vivo
12/05 - 19:00
* Dazaranha - ao vivo
20/05 - 19:00

Mais informações no link abaixo`,
        },
        {
          type: "linkPreview",
          url: "https://printweb.vlks.com.br/",
        },
      ];
    },
  });

  contextList["atendente"] = new Context({
    id: "2",
    name: "atendente",
    previousContexts: [], // Initialized as all context names in chatbot constructor
    activationKeywords: ["atendente"],
    action: function (chatbot, client) {
      chatbot.clientList[client.phoneNumber].changeContext(this.name);
      setTimeout(() => {
        chatbot.clientList[client.phoneNumber].setHumanChat(true);
      }, 500);
    },
    responseObjects: function (chatbot, client, args = {}) {
      return [{ type: "text", message: "Ok!\n Já vou te transferir para um de nossos atendentes!\n\nSó um minuto que já vamos te chamar." }];
    },
  });

  contextList["invalido"] = new Context({
    id: "999",
    name: "invalido",
    previousContexts: [], // Initialized as all context names in chatbot constructor
    activationKeywords: [],
    action: function (chatbot, client) {
      console.log(`Mensagem invalida do cliente [${client.phoneNumber}]: ${client.chatbot.currentMessage}`);
    },
    responseObjects: function (chatbot, client, args = {}) {
      const message = chatbot.clientList[client.phoneNumber].chatbot.lastChatbotMessage;
      message.unshift({ type: "text", message: `Desculpe, mas esse comando é inválido!\nPor favor, selecione uma das opções.` });
      console.log("Context [invalido] message: ", message);
      return message;
    },
  });

  contextList["end-session"] = new Context({
    id: "1000",
    name: "end-session",
    previousContexts: ["adm"],
    activationKeywords: ["#end-session"],
    action: function (chatbot, client) {
      console.log("\x1b[31;1m%s\x1b[0m", "Encerrando a sessão a pedido do comando via chat adm!");
      closeSession();
    },
    responseObjects: function (chatbot, client, args = {}) {
      return [{ type: "text", message: `A sessão será encerrada!` }];
    },
  });

  contextSetup(contextList);

  return contextList;
}
