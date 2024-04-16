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
      return {
        listMessage: {
          description:
            `*Olá ${client.name}!*\nBem-vindo ao _*${chatbot.businessName}*_\n\n` + "`Por favor, selecione uma das opções a partir do botão abaixo`",
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
      };
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
      return {
        text: {
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
        linkPreview: {
          url: "https://printweb.vlks.com.br/",
        },
      };
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
      return { text: { message: "Ok!\n Já vou te transferir para um de nossos atendentes!\n\nSó um minuto que já vamos te chamar." } };
    },
  });

  contextList["cardapio"] = new Context({
    id: "3",
    name: "cardapio",
    previousContexts: ["bem-vindo", "editar-pedido", "finalizar-pedido", "adicionais"],
    activationKeywords: ["cardapio"],
    itemsList: {
      buttonText: "Ver Cardápio 🍔",
    },
    action: function (chatbot, client) {
      try {
        chatbot.clientList[client.phoneNumber].changeContext(this.name);

        /* Atualiza a lista de activationKeywords do contexto 'adicionar-produto' */
        let sections = [];
        [chatbot.contextList["adicionar-produto"].activationKeywords, sections] = chatbot.getProductsIdsAndSections(); // retornar para responseObjects com obj sections
        chatbot.contextList["adicionar-produto"].activationKeywords.push("adicionar-produto");

        return { sections: sections };
      } catch (error) {
        console.error('Erro em action no contexto "cardápio"', error);
      }
    },
    responseObjects: function (chatbot, client, args = {}) {
      try {
        const sections = args.sections;
        sections.push({
          title: "🔽 Outras opções",
          rows: [
            {
              rowId: "atendente",
              title: "Falar com um atendente 📲",
              description: "Tranferir para um atendente, caso precise resolver um problema específico",
            },
          ],
        });

        /* Caso tenha sido redirecionado pelo contexto "editar-produto" e ja contenha itens na lista */
        if (Object.keys(chatbot.clientList[client.phoneNumber].orderList).length) {
          sections[sections.length - 1].rows.unshift(
            {
              rowId: "adicionais",
              title: "Finalizar e incluir adicionais ⭐️",
              description: "Inclua adicionais em seu pedido!",
            },
            {
              rowId: "editar-pedido",
              title: "Editar pedido ✏️",
              description: "Mudou de ideia? Remova um item da sua lista!",
            },
            {
              rowId: "recomendar-produto",
              title: "Finalizar pedido ✅",
              description: "Se estiver tudo pronto, finalize seu pedido!",
            }
          );
        }

        return {
          listMessage: {
            description: "Utilize a lista abaixo para montar seu pedido\n\n*Selecione QUANTAS VEZES QUISER!* 🤩😋",
            buttonText: "Ver Cardápio 🍔",
            sections: sections,
          },
        };
      } catch (error) {
        console.error('Erro em responseObjects no contexto "cardápio"', error);
      }
    },
  });

  contextList["adicionar-produto"] = new Context({
    id: "4",
    name: "adicionar-produto",
    previousContexts: ["cardapio", "atendente"],
    action: function (chatbot, client) {
      const id = parseInt(client.chatbot.itemId);
      let product = chatbot.getProductById(id);
      chatbot.clientList[client.phoneNumber].addProductToOrderList(product);
      chatbot.clientList[client.phoneNumber].changeContext("cardapio");
    },
    responseObjects: function (chatbot, client, args = {}) {
      try {
        let message = chatbot.clientList[client.phoneNumber].getOrderMessage();
        message +=
          "\n\nSelecione umas das opções\n* `Inclua mais itens`\n\n* `Finalizar e incluir adicionais`\n\n* `Ou selecione editar ou finalizar pedido`";
        const [, sections] = chatbot.getProductsIdsAndSections();
        sections.push({
          title: "🔽 Outras opções",
          rows: [
            {
              rowId: "adicionais",
              title: "Finalizar e incluir adicionais ⭐️",
              description: "Inclua adicionais em seu pedido!",
            },
            {
              rowId: "editar-pedido",
              title: "Editar pedido ✏️",
              description: "Mudou de ideia? Remova um item da sua lista!",
            },
            {
              rowId: "recomendar-produto",
              title: "Finalizar pedido ✅",
              description: "Se estiver tudo pronto, finalize seu pedido!",
            },
            {
              rowId: "atendente",
              title: "Falar com um atendente 📲",
              description: "Tranferir para um atendente, caso precise resolver um problema específico",
            },
          ],
        });

        return {
          listMessage: {
            description: message,
            buttonText: "Ver Cardápio 🍔",
            sections: sections,
          },
        };
      } catch (error) {
        console.error('Erro em responseObjects no contexto "adicionar-produto"', error);
      }
    },
  });

  contextList["adicionais"] = new Context({
    id: "5",
    name: "adicionais",
    previousContexts: ["cardapio", "editar-pedido"],
    activationKeywords: ["adicionais"],
    action: function (chatbot, client) {
      try {
        chatbot.clientList[client.phoneNumber].changeContext(this.name);

        /* Atualiza a lista de activationKeywords do contexto 'adicionais' */
        let sections = [];
        [chatbot.contextList["incluir-adicionais"].activationKeywords, sections] = chatbot.getAdditionalIdsAndSections(client);
        console.log('sections: ', sections);
        return { sections: sections };
      } catch (error) {
        console.error("Error in action [adicionais]", error);
      }
    },
    responseObjects: function (chatbot, client, args = {}) {
      try {
        console.log("args.sections: ", args.sections);
        const sections = args.sections;
        sections.push({
          title: "🔽 Outras opções",
          rows: [
            {
              rowId: "editar-pedido",
              title: "Editar pedido ✏️",
              description: "Mudou de ideia? Remova um item da sua lista!",
            },
            {
              rowId: "recomendar-produto",
              title: "Finalizar pedido ✅",
              description: "Se estiver tudo pronto, finalize seu pedido!",
            },
            {
              rowId: "atendente",
              title: "Falar com um atendente 📲",
              description: "Tranferir para um atendente, caso precise resolver um problema específico",
            },
          ],
        });

        return {
          listMessage: {
            description: "Selecione o adicional que deseja incluir!\n* `Para incluir clique no botão`\n\n* `Ou selecione editar ou finalizar pedido`",
            buttonText: "Ver Adicionais",
            sections: sections,
          },
        };
      } catch (error) {
        console.error("Error in responseObjects [adicionais]", error);
      }
    },
  });

  contextList["incluir-adicionais"] = new Context({
    id: "6",
    name: "incluir-adicionais",
    previousContexts: ["adicionais"],
    action: function (chatbot, client) {
      try {
        const [productId, index, additionalId] = client.chatbot.itemId.split(":").map((num) => parseInt(num));
        // console.log("productId, index, additionalId: ", productId, index, additionalId);
        const additional = chatbot.getProductById(productId).additionalList[0][additionalId];
        // console.log("additional: ", additional);
        client.addAdditionalToOrderList(productId, additional, index);
      } catch (error) {
        console.error("Error in action [incluir-adicionais]", error);
      }
    },
    responseObjects: function (chatbot, client, args = {}) {
      try {
        let message = chatbot.clientList[client.phoneNumber].getOrderMessage();
        const [, sections] = chatbot.getAdditionalIdsAndSections(client); // Melhorar performace
        console.log('sections: ', sections);
        sections.push({
          title: "🔽 Outras opções",
          rows: [
            {
              rowId: "editar-pedido",
              title: "Editar pedido ✏️",
              description: "Mudou de ideia? Remova um item da sua lista!",
            },
            {
              rowId: "recomendar-produto",
              title: "Finalizar pedido ✅",
              description: "Se estiver tudo pronto, finalize seu pedido!",
            },
            {
              rowId: "atendente",
              title: "Falar com um atendente 📲",
              description: "Tranferir para um atendente, caso precise resolver um problema específico",
            },
          ],
        });

        return {
          listMessage: {
            description:
              message +
              "\n\nGostaria de incluir mais adicionais em seu pedido?\n* `Para incluir clique no botão`\n\n* `Ou selecione editar ou finalizar pedido`",
            buttonText: "Ver Adicionais",
            sections: sections,
          },
        };
      } catch (error) {
        console.error("Erro in responseObjects [incluir-adicionais]", error);
      }
    },
  });

  contextList["recomendar-produto"] = new Context({
    id: "7",
    name: "recomendar-produto",
    previousContexts: ["cardapio", "adicionais", "editar-pedido"],
    activationKeywords: ["recomendar-produto"],
    action: function (chatbot, client) {
      try {
        chatbot.clientList[client.phoneNumber].changeContext(this.name);
      } catch (error) {
        console.error("Erro in action [recomendar-produto]", error);
      }
    },
    responseObjects: function (chatbot, client, args = {}) {
      try {
        const recommended = chatbot.getRecommendedProduct();
        let message = `Sabe o que vai muito bem com seu pedido?\n\n*${recommended.name}!!!*🤩😋\n\nGostaria de incluir em seu pedido?`;
        message += "\n* `Selecione uma opção abaixo`";
        return {
          listMessage: {
            description: message,
            buttonText: "Incluir ou finalizar",
            sections: [
              {
                title: `Selecione a quantidade de ${recommended.name}`,
                rows: [
                  {
                    rowId: "incluir-recomendado1",
                    title: "Incluir +1 no meu pedido",
                    description: `+R$ ${recommended.price.toFixed(2).replace(".", ",")}`,
                  },
                  {
                    rowId: "incluir-recomendado2",
                    title: "Incluir +2 no meu pedido",
                    description: `+R$ ${recommended.price.toFixed(2).replace(".", ",")} cada`,
                  },
                  {
                    rowId: "incluir-recomendado3",
                    title: "Incluir +3 no meu pedido",
                    description: `+R$ ${recommended.price.toFixed(2).replace(".", ",")} cada`,
                  },
                ],
              },
              {
                title: "🔽 Outras opções",
                rows: [
                  {
                    rowId: "editar-pedido",
                    title: "Editar pedido ✏️",
                    description: "Mudou de ideia? Remova um item da sua lista!",
                  },
                  {
                    rowId: "finalizar-pedido",
                    title: "Finalizar pedido ✅",
                    description: "Se estiver tudo pronto, finalize seu pedido!",
                  },
                  {
                    rowId: "atendente",
                    title: "Falar com um atendente 📲",
                    description: "Tranferir para um atendente, caso precise resolver um problema específico",
                  },
                ],
              },
            ],
          },
        };
      } catch (error) {
        console.error("Error in responseObjects [recomendar-produto]", error);
      }
    },
  });

  contextList["incluir-recomendado"] = new Context({
    id: "8",
    name: "incluir-recomendado",
    previousContexts: ["recomendar-produto"],
    activationKeywords: ["incluir-recomendado1", "incluir-recomendado2", "incluir-recomendado3"],
    action: function (chatbot, client) {
      try {
        const quantity = client.chatbot.itemId[client.chatbot.itemId.length - 1].split(":").map((num) => parseInt(num));
        const recommended = chatbot.getRecommendedProduct();
        chatbot.clientList[client.phoneNumber].addProductToOrderList(recommended, parseInt(quantity));
      } catch (error) {
        console.error("Erro em action", error);
      }
    },
    responseObjects: function (chatbot, client, args = {}) {
      try {
        const recommended = chatbot.getRecommendedProduct();
        let message = chatbot.clientList[client.phoneNumber].getOrderMessage();

        message += "\n\nGostaria de incluir mais?\n* `Para incluir selecione a quantidade.`\n\n* `Ou selecione a opção de editar ou finalizar.`";

        return {
          listMessage: {
            description: message,
            buttonText: "Incluir ou finalizar",
            sections: [
              {
                title: `Selecione a quantidade de ${recommended.name}`,
                rows: [
                  {
                    rowId: "incluir-recomendado1",
                    title: "Incluir +1 no meu pedido",
                    description: `+R$ ${recommended.price.toFixed(2).replace(".", ",")}`,
                  },
                  {
                    rowId: "incluir-recomendado2",
                    title: "Incluir +2 no meu pedido",
                    description: `+R$ ${recommended.price.toFixed(2).replace(".", ",")} cada`,
                  },
                  {
                    rowId: "incluir-recomendado3",
                    title: "Incluir +3 no meu pedido",
                    description: `+R$ ${recommended.price.toFixed(2).replace(".", ",")} cada`,
                  },
                ],
              },
              {
                title: "🔽 Outras opções",
                rows: [
                  {
                    rowId: "editar-pedido",
                    title: "Editar pedido ✏️",
                    description: "Mudou de ideia? Remova um item da sua lista!",
                  },
                  {
                    rowId: "finalizar-pedido",
                    title: "Finalizar pedido ✅",
                    description: "Se estiver tudo pronto, finalize seu pedido!",
                  },
                  {
                    rowId: "atendente",
                    title: "Falar com um atendente 📲",
                    description: "Tranferir para um atendente, caso precise resolver um problema específico",
                  },
                ],
              },
            ],
          },
        };
      } catch (error) {
        console.error("Erro em responseObjects", error);
      }
    },
  });

  contextList["editar-pedido"] = new Context({
    id: "9",
    name: "editar-pedido",
    previousContexts: ["cardapio", "adicionais", "recomendar-produto"],
    activationKeywords: ["editar-pedido"],
    action: function (chatbot, client) {
      try {
        chatbot.clientList[client.phoneNumber].changeContext(this.name);
      } catch (error) {
        console.error("Error em action", error);
      }
    },
    responseObjects: function (chatbot, client, args = {}) {
      try {
        /* Atualiza a lista de activationKeywords do contexto 'remover-item' */
        let sections = [];
        [chatbot.contextList["remover-item"].activationKeywords, sections] = chatbot.getProductsAndAdditionalIdsAndSections(client); // Melhorar performace
        console.log('chatbot.contextList["remover-item"].activationKeywords : ', chatbot.contextList["remover-item"].activationKeywords);

        let message = chatbot.clientList[client.phoneNumber].getOrderMessage();
        message +=
          "\n\nSelecione uma das opções\n* `Remover itens da lista`\n\n* `Para incluir novos itens selecione 'Ver cardápio'`\n\n* `Para concluir selecione 'Finalizar pedido'`";
        sections.push({
          title: "🔽 Outras opções",
          rows: [
            {
              rowId: "cardapio",
              title: "Ver cardápio 🍔",
              description: "Volte ao cardápio para adicionar mais itens em seu pedido!",
            },
            {
              rowId: "adicionais",
              title: "Finalizar e incluir adicionais ⭐️",
              description: "Inclua adicionais em seu pedido!",
            },
            {
              rowId: "recomendar-produto",
              title: "Finalizar pedido ✅",
              description: "Se estiver tudo pronto, finalize seu pedido!",
            },
            {
              rowId: "atendente",
              title: "Falar com um atendente 📲",
              description: "Tranferir para um atendente, caso precise resolver um problema específico",
            },
          ],
        });

        return {
          listMessage: {
            description: message,
            buttonText: "Editar ou Finalizar",
            sections: sections,
          },
        };
      } catch (error) {
        console.error("Erro em responseObjects", error);
      }
    },
  });

  contextList["remover-item"] = new Context({
    id: "10",
    name: "remover-item",
    previousContexts: ["editar-pedido"],
    action: function (chatbot, client) {
      const [productId, index, additionalId] = client.chatbot.itemId.split(":").map((num) => parseInt(num));
      chatbot.clientList[client.phoneNumber].removeFromOrderList(productId, index, additionalId);
    },
    responseObjects: function (chatbot, client, args = {}) {
      try {
        let sections = [];
        [, sections] = chatbot.getProductsAndAdditionalIdsAndSections(client); // Melhorar performace

        let message = chatbot.clientList[client.phoneNumber].getOrderMessage();
        message +=
          "\n\nItem removido!\nSelecione uma das opções\n* `Remover outros itens`\n\n* `Para incluir novos itens selecione 'Ver cardápio'`\n\n* `Para concluir selecione 'Finalizar pedido'`";
        sections.push({
          title: "🔽 Outras opções",
          rows: [
            {
              rowId: "cardapio",
              title: "Ver cardápio 🍔",
              description: "Volte ao cardápio para adicionar mais itens em seu pedido!",
            },
            {
              rowId: "recomendar-produto",
              title: "Finalizar pedido ✅",
              description: "Se estiver tudo pronto, finalize seu pedido!",
            },
            {
              rowId: "atendente",
              title: "Falar com um atendente 📲",
              description: "Tranferir para um atendente, caso precise resolver um problema específico",
            },
          ],
        });

        return {
          listMessage: {
            description: message,
            buttonText: "Editar ou Finalizar",
            sections: sections,
          },
        };
      } catch (error) {
        console.error("Erro em responseObjects", error);
      }
    },
  });

  contextList["finalizar-pedido"] = new Context({
    id: "11",
    name: "finalizar-pedido",
    previousContexts: ["recomendar-produto", "editar-pedido"],
    activationKeywords: ["finalizar-pedido"],
    action: function (chatbot, client) {
      chatbot.clientList[client.phoneNumber].changeContext(this.name);
      chatbot.clientList[client.phoneNumber]
        .sendClientOrder()
        .then((result) => {
          chatbot.clientList[client.phoneNumber].orderList = {};
        })
        .catch((err) => {
          console.log('Error in action [finalizar-pedido]:', err);
        });
    },
    responseObjects: function (chatbot, client, args = {}) {
      const sections = [
        {
          title: "🔽 Selecione uma das opções",
          rows: [
            {
              rowId: "cardapio",
              title: "Ver cardápio 🍔",
              description: "Volte ao cardápio para adicionar mais itens em seu pedido!",
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
      ];

      return {
        text: {
          message:
            "Seu pedido foi processado e já esta sendo preparado!!!\n\nO tempo de espera é de +- 30 minutos\n\n*Agradecemos pela preferência!* 😊",
        },
        listMessage: {
          description: "Continue pedido!",
          buttonText: "Selecione uma das opções",
          sections: sections,
        },
      };
    },
  });

  contextList["invalido"] = new Context({
    id: "999",
    name: "invalido",
    previousContexts: [], // Initialized as all context names in chatbot constructor
    activationKeywords: [],
    action: function (chatbot, client) {
      console.log(`Mensagem invalida do cliente [${client.phoneNumber}]:${client.chatbot.currentMessage}`);
      setTimeout(function() {
        chatbot.handleProductAdditionalFlow(client);
      }, 500);
    },
    responseObjects: function (chatbot, client, args = {}) {
      return { text: { message: `Desculpe, mas esse comando é invalido!\nPor favor, selecione uma das opções acima.` } };
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
      return { text: { message: `A sessão será encerrada!` } };
    },
  });

  return contextList;
}

console.log("\nContext List:\n", getContextList());
