import { closeSession } from "@wppconnect/server/dist/controller/sessionController.js";
import Context from "../classes/context.js";
import { text } from "stream/consumers";

export default function getContextList() {
  const contextList = {};

  /**
   * contextList["context-name"] = new Context({
   *  id: "0",
   *  name: "context-name",                                 // Same as self contextList index
   *  previuosContext: ["context-name1", "context-name2"]   // Only such contexts will precede this context
   *  action: function(),                                   // Data managment in this context, does not return anything (unless for async handling)
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
        client.changeContext(contextList["bem-vindo"].name);
      } catch (error) {
        throw new Error('Erro no contexto "bem-vindo"', error);
      }
    },
    responseObjects: function (chatbot, client) {
      return {
        listMessage: {
          description: `Olá ${client.name}!\nEu sou o ${chatbot.botName}.\n\nEm que posso ajuda-lo?`,
          buttonText: "Clique para ver as opções",
          sections: [
            {
              title: "Escolha uma das opções",
              rows: [
                {
                  rowId: "ver-cardapio",
                  title: "Ver cardápio",
                  description: "Mostrar lista de opções",
                },
                {
                  rowId: "atendente",
                  title: "Falar com atendente",
                  description: "Enviar cartão de contato",
                },
                {
                  rowId: "faq",
                  title: "Perguntas Frequentes",
                  description: "Horário de funcionamento, localização, eventos etc...",
                },
              ],
            },
          ],
        },
      };
    },
  });

  contextList["faq"] = new Context({
    id: "1",
    name: "faq",
    previousContexts: ["bem-vindo", "cardapio", "faq"],
    activationKeywords: ["faq"],
    action: function (chatbot, client) {
      client.changeContext(contextList["faq"].name);
    },
    responseObjects: function (chatbot, client) {
      return {
        text: {
          message: `_*Perguntas Frequentes*_

*Horário de funcionamento*:
seg-sex 11:00 as 20:00
sab-dom 11:00 as 23:00

*Endereço Local*:
Av. Paulista, 3527 - Bela Vista, São Paulo

*Proxímos eventos*:
•Night Show - Blues ao vivo
12/05 - 19:00
•Dazaranha - ao vivo
20/05 - 19:00

Mais informações no link abaixo`,
        },
        linkPreview: {
          url: "https://printweb.vlks.com.br/",
        },
      };
    },
  });

  contextList["atendente"] = new Context({
    id: "2",
    name: "atendente",
    previousContexts: ["bem-vindo", "faq", "cardapio", "adicionar-produto", "atendente"],
    activationKeywords: ["atendente"],
    action: function (chatbot, client) {
      setTimeout(() => {
        chatbot.clientList[client.phoneNumber].setHumanChat(true);
      }, 500);
    },
    responseObjects: function (chatbot, client) {
      return { text: { message: "Ok!\n Já vou te transferir para um de nossos atendentes!\n\nSó um minuto que já vamos te chamar." } };
    },
  });

  contextList["cardapio"] = new Context({
    id: "3",
    name: "cardapio",
    previousContexts: ["bem-vindo", "faq"],
    activationKeywords: ["ver-cardapio"],
    itemsList: {
      buttonText: "Ver Cardápio",
    },
    action: function (chatbot, client) {
      try {
        client.changeContext(contextList["cardapio"].name);

        /* Atualiza a lista de activationKeywords do contexto 'adicionar-produto' */
        chatbot.contextList["adicionar-produto"].activationKeywords = chatbot.getProductIds();
        console.log("adicionar-produto activationKeywords atualizado: ", chatbot.contextList["adicionar-produto"].activationKeywords);
        client.messageIds.saveResponse = "cardapio";
      } catch (error) {
        throw new Error('Erro em action no contexto "cardápio"', error);
      }
    },
    responseObjects: (chatbot, client) => {
      try {
        /* Cria a lista de produtos para list-message com base em productList */
        const sections = chatbot.getSectionProductList();

        return {
          listMessage: {
            description: `Utilize a lista abaixo para montar seu pedido.\n\n*Selecione quantas vezes quiser!*🤩😋`,
            buttonText: "Ver Cardápio",
            sections: sections,
          },
        };
      } catch (error) {
        throw new Error('Erro em responseObjects no contexto "cardápio"', error);
      }
    },
  });

  contextList["adicionar-produto"] = new Context({
    id: "4",
    name: "adicionar-produto",
    previousContexts: ["cardapio", "faq", "atendente"],
    action: function (chatbot, client) {
      const id = parseInt(client.chatbot.itemId);
      let product = chatbot.getProductById(id);
      chatbot.clientList[client.phoneNumber].addProductToOrderList(product);
    },
    responseObjects: function (chatbot, client) {
      try {
        let message = "*Seu pedido*:";

        const orderList = chatbot.clientList[client.phoneNumber].orderList;
        for (let productId in orderList) {
          console.log("orderList[productId].name", orderList[productId].name);
          message += `\n> ${orderList[productId].quantity} • ${orderList[productId].name}`;
        }
        message += `\n\nFinalize enviando "ok" ou então _*PEÇA MAIS*_ no botão abaixo`;

        return {
          listMessage: {
            description: message,
            buttonText: "Ver Cardápio",
            sections: chatbot.getSectionProductList(),
          },
        };
      } catch (error) {
        throw new Error('Erro em responseObjects no contexto "adicionar-produto"', error);
      }
    },
  });

  contextList["finalizar-produtos"] = new Context({
    id: "5",
    name: "finalizar-produtos",
    activationKeywords: ["ok"],
    previousContexts: ["cardapio", "faq", "atendente"],
    action: function (chatbot, client) {},
    responseObjects: function (chatbot, client) {
      try {
        return {
          listMessage: {
            description: 'Perfeito!\n\nGostaria de incluir adicionais em seu pedido?\n\nPara incluir clique no botão.\n\n*Para ir para o pagamento envie "ok".*',
            buttonText: "Ver Adicionais",
            sections: [
              {
                title: "title",
                rows: [
                  {
                    rowId: "rowId",
                    title: "title",
                    description: "description",
                  },
                ],
              },
            ],
          },
        };
      } catch (error) {
        throw new Error('Erro em responseObjects no contexto "finalizar-produtos"', error);
      }
    },
  });

  contextList["end-session"] = new Context({
    id: "1000",
    name: "end-session",
    type: "text",
    previousContexts: ["adm"],
    activationKeywords: ["#end-session"],
    action: function (chatbot, client) {
      console.log("\x1b[31;1m%s\x1b[0m", "Encerrando a sessão a pedido do comando via chat adm!");
      closeSession();
    },
    responseObjects: function (chatbot, client) {
      return { text: { message: `A sessão será encerrada!` } };
    },
  });

  return contextList;
}

console.log("\nContext List:\n", getContextList());
