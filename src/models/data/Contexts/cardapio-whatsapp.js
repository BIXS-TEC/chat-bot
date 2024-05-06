import Context from "../../classes/context.js";
import { f } from "./templates/cardapio-functions.js";
import { buildSection } from "./templates/message-functions.js";

function contextSetup(contextList, chatbot) {
  const contextNames = [];
  for (const contextName in contextList) {
    contextNames.push(`${contextName}`);
  }

  contextList["faq"].previousContexts = contextNames;
  contextList["atendente"].previousContexts = contextNames;
  contextList["invalido"].previousContexts = contextNames;
  contextList["garcom"].previousContexts = contextNames;
  contextList["informar-id"].activationKeywords = chatbot.identifiers;
}

export default function getCardapioWhatsAppContexts(chatbot) {
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
    action: function (client) {
      return f.bem_vindo.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.bem_vindo.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["informar-id"] = new Context({
    id: "0",
    name: "informar-id",
    previousContexts: ["informar-id"],
    action: function (client) {
      return f.informar_id.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.informar_id.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["faq"] = new Context({
    id: "1",
    name: "faq",
    previousContexts: [], // Initialized as all context names in chatbot constructor
    activationKeywords: ["faq"],
    action: function (client) {
      return f.faq.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.faq.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["atendente"] = new Context({
    id: "2",
    name: "atendente",
    previousContexts: [], // Initialized as all context names in chatbot constructor
    activationKeywords: ["atendente"],
    action: function (client) {
      return f.atendente.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.atendente.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["garcom"] = new Context({
    id: "2",
    name: "garcom",
    previousContexts: [], // Initialized as all context names in chatbot constructor
    activationKeywords: ["garcom"],
    action: function (client) {
      return f.garcom.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.garcom.responseObjects(this, chatbot, client, args);
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
    action: function (client) {
      try {
        chatbot.clientList[client.phoneNumber].changeContext(this.name);

        /* Atualiza a lista de activationKeywords do contexto 'adicionar-produto' */
        let sections = [];
        [chatbot.contextList[client.chatbot.interaction]["adicionar-produto"].activationKeywords, sections] = chatbot.getProductsIdsAndSections(); // retornar para responseObjects com obj sections
        chatbot.contextList[client.chatbot.interaction]["adicionar-produto"].activationKeywords.push("adicionar-produto");

        return { sections: sections };
      } catch (error) {
        console.error('Erro em action no contexto "cardápio"', error);
      }
    },
    responseObjects: function (client, args = {}) {
      try {
        const sections = args.sections;

        /* Caso tenha sido redirecionado pelo contexto "editar-produto" e ja contenha itens na lista */
        if (Object.keys(chatbot.clientList[client.phoneNumber].orderList).length) {
          sections.push(buildSection(chatbot, "🔽 Outras opções", ["adicionais", "editar-pedido", "recomendar-produto", "garcom", "atendente"]));
        } else {
          sections.push(buildSection(chatbot, "🔽 Outras opções", ["garcom", "atendente"]));
        }

        return [
          {
            type: "listMessage",
            description: "Utilize a lista abaixo para montar seu pedido\n\n*Selecione QUANTAS VEZES QUISER!* 🤩😋",
            buttonText: "Ver Cardápio 🍔",
            sections: sections,
          },
        ];
      } catch (error) {
        console.error('Erro em responseObjects no contexto "cardápio"', error);
      }
    },
  });
  
  contextList["adicionar-produto"] = new Context({
    id: "4",
    name: "adicionar-produto",
    previousContexts: ["cardapio", "atendente"],
    action: function (client) {
      const id = parseInt(client.chatbot.itemId);
      let product = chatbot.getProductById(id);
      chatbot.clientList[client.phoneNumber].addProductToOrderList(product);
      chatbot.clientList[client.phoneNumber].changeContext("cardapio");
    },
    responseObjects: function (client, args = {}) {
      try {
        let message = chatbot.clientList[client.phoneNumber].getOrderMessage();
        message += "\n\nSelecione umas das opções do botão abaixo"; // \n* `Inclua mais itens`\n\n* `Finalizar e incluir adicionais`\n\n* `Ou selecione editar ou finalizar pedido`";
        const [, sections] = chatbot.getProductsIdsAndSections();
        sections.push(buildSection(chatbot, "🔽 Outras opções", ["adicionais", "editar-pedido", "recomendar-produto", "garcom", "atendente"]));

        return [
          {
            type: "listMessage",
            description: message,
            buttonText: "Ver Cardápio 🍔",
            sections: sections,
          },
        ];
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
    action: function (client) {
      try {
        chatbot.clientList[client.phoneNumber].changeContext(this.name);

        /* Atualiza a lista de activationKeywords do contexto 'adicionais' */
        let sections = [];
        [chatbot.contextList[client.chatbot.interaction]["incluir-adicionais"].activationKeywords, sections] = chatbot.getAdditionalIdsAndSections(client);
        console.log("sections: ", sections);
        return { sections: sections };
      } catch (error) {
        console.error("Error in action [adicionais]", error);
      }
    },
    responseObjects: function (client, args = {}) {
      try {
        console.log("args.sections: ", args.sections);
        const sections = args.sections;
        sections.push(buildSection(chatbot, "🔽 Outras opções", ["editar-pedido", "recomendar-produto", "garcom", "atendente"]));

        return [
          {
            type: "listMessage",
            description: "Selecione o adicional que deseja incluir!", //\n* `Para incluir clique no botão`\n\n* `Ou selecione editar ou finalizar pedido`",
            buttonText: "Ver Adicionais",
            sections: sections,
          },
        ];
      } catch (error) {
        console.error("Error in responseObjects [adicionais]", error);
      }
    },
  });
  contextList["incluir-adicionais"] = new Context({
    id: "6",
    name: "incluir-adicionais",
    previousContexts: ["adicionais"],
    action: function (client) {
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
    responseObjects: function (client, args = {}) {
      try {
        let message = chatbot.clientList[client.phoneNumber].getOrderMessage();
        const [, sections] = chatbot.getAdditionalIdsAndSections(client); // Melhorar performace
        console.log("sections: ", sections);
        sections.push(buildSection(chatbot, "🔽 Outras opções", ["editar-pedido", "recomendar-produto", "garcom", "atendente"]));

        return [
          {
            type: "listMessage",
            description: message + "\n\nInclua mais adicionais em seu pedido ou selecione outra opção", //\n* `Para incluir clique no botão`\n\n* `Ou selecione editar ou finalizar pedido`",
            buttonText: "Ver Adicionais",
            sections: sections,
          },
        ];
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
    action: function (client) {
      return f.recomendar_produto.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.recomendar_produto.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["incluir-recomendado"] = new Context({
    id: "8",
    name: "incluir-recomendado",
    previousContexts: ["recomendar-produto"],
    activationKeywords: ["incluir-recomendado1", "incluir-recomendado2", "incluir-recomendado3"],
    action: function (client) {
      return f.incluir_recomendado.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.incluir_recomendado.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["editar-pedido"] = new Context({
    id: "9",
    name: "editar-pedido",
    previousContexts: ["cardapio", "adicionais", "recomendar-produto"],
    activationKeywords: ["editar-pedido"],
    action: function (client) {
      try {
        chatbot.clientList[client.phoneNumber].changeContext(this.name);
      } catch (error) {
        console.error("Error em action", error);
      }
    },
    responseObjects: function (client, args = {}) {
      try {
        /* Atualiza a lista de activationKeywords do contexto 'remover-item' */
        let sections = [];
        [chatbot.contextList[client.chatbot.interaction]["remover-item"].activationKeywords, sections] =
          chatbot.getProductsAndAdditionalIdsAndSections(client); // Melhorar performace
        console.log(
          'chatbot.contextList[interaction]["remover-item"].activationKeywords : ',
          chatbot.contextList[client.chatbot.interaction]["remover-item"].activationKeywords
        );

        let message = chatbot.clientList[client.phoneNumber].getOrderMessage();
        message += "\n\nSelecione um item para REMOVER ou outra opção";
        //"\n\nSelecione uma das opções\n* `Remover itens da lista`\n\n* `Para incluir novos itens selecione 'Ver cardápio'`\n\n* `Para concluir selecione 'Finalizar pedido'`";
        sections.push(buildSection(chatbot, "🔽 Outras opções", ["voltar-cardapio", "adicionais", "recomendar-produto", "garcom", "atendente"]));

        return [
          {
            type: "listMessage",
            description: message,
            buttonText: "Editar ou Finalizar",
            sections: sections,
          },
        ];
      } catch (error) {
        console.error("Erro em responseObjects", error);
      }
    },
  });

  contextList["remover-item"] = new Context({
    id: "10",
    name: "remover-item",
    previousContexts: ["editar-pedido"],
    action: function (client) {
      const [productId, index, additionalId] = client.chatbot.itemId.split(":").map((num) => parseInt(num));
      chatbot.clientList[client.phoneNumber].removeFromOrderList(productId, index, additionalId);
    },
    responseObjects: function (client, args = {}) {
      try {
        let sections = [];
        [, sections] = chatbot.getProductsAndAdditionalIdsAndSections(client); // Melhorar performace

        let message = chatbot.clientList[client.phoneNumber].getOrderMessage();
        message += "\n\nItem removido!\nSelecione uma das opções";
        // "\n\nItem removido!\nSelecione uma das opções\n* `Remover outros itens`\n\n* `Para incluir novos itens selecione 'Ver cardápio'`\n\n* `Para concluir selecione 'Finalizar pedido'`";
        sections.push(buildSection(chatbot, "🔽 Outras opções", ["voltar-cardapio", "recomendar-produto", "garcom", "atendente"]));

        return [
          {
            type: "listMessage",
            description: message,
            buttonText: "Editar ou Finalizar",
            sections: sections,
          },
        ];
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
    action: function (client) {
      chatbot.clientList[client.phoneNumber].changeContext(this.name);
      chatbot.clientList[client.phoneNumber]
        .sendClientOrder()
        .then((result) => {
          chatbot.clientList[client.phoneNumber].orderList = {};
        })
        .catch((err) => {
          console.log("Error in action [finalizar-pedido]:", err);
        });
    },
    responseObjects: function (client, args = {}) {
      const sections = [];
      sections.push(buildSection(chatbot, "🔽 Selecione uma das opções", ["voltar-cardapio", "garcom", "atendente", "faq"]));

      return [
        {
          type: "text",
          message: "Seu pedido já esta sendo preparado!!!\n\nO tempo de espera é de +- *30 minutos*\n\nAgradecemos pela preferência! 😊",
        },
        {
          type: "listMessage",
          description: "Continue pedindo!",
          buttonText: "Selecione uma das opções",
          sections: sections,
        },
      ];
    },
  });

  contextList["invalido"] = new Context({
    id: "999",
    name: "invalido",
    previousContexts: [], // Initialized as all context names in chatbot constructor
    activationKeywords: [],
    action: function (client) {
      return f.invalido.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.invalido.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["end-session"] = new Context({
    id: "1000",
    name: "end-session",
    previousContexts: ["adm"],
    activationKeywords: ["#end-session"],
    action: function (client) {
      return f.end_session.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.end_session.responseObjects(this, chatbot, client, args);
    },
  });

  contextSetup(contextList, chatbot);

  return contextList;
}
