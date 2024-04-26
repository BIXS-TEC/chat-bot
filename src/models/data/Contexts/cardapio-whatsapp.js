import Context from "../../classes/context.js";
import { f } from "./templates/cardapio-functions.js";

function contextSetup(contextList) {
  const contextNames = [];
  for (const contextName in contextList) {
    contextNames.push(`${contextName}`);
  }

  contextList["faq"].previousContexts = contextNames;
  contextList["atendente"].previousContexts = contextNames;
  contextList["invalido"].previousContexts = contextNames;
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
      } catch (error) {
        console.error('Erro em action no contexto "cardápio"', error);
      }
    },
    responseObjects: function (client, args = {}) {
      try {

        return [
          {
            type: "text",
            message: `Faça seu pedido em nosso Cardápio Online\nQualquer dúvida estarei a disposição!\n\nAcesse o cardápio clicando link abaixo`,
          },
          {
            type: "linkPreview",
            url: chatbot.url.cardapio,
          },
        ];
      } catch (error) {
        console.error('Erro em responseObjects no contexto "cardápio"', error);
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
        [chatbot.contextList[client.chatbot.interaction]["remover-item"].activationKeywords, sections] = chatbot.getProductsAndAdditionalIdsAndSections(client); // Melhorar performace
        console.log('chatbot.contextList[interaction]["remover-item"].activationKeywords : ', chatbot.contextList[client.chatbot.interaction]["remover-item"].activationKeywords);

        let message = chatbot.clientList[client.phoneNumber].getOrderMessage();
        message += "\n\nSelecione um item para REMOVER ou outra opção";
        //"\n\nSelecione uma das opções\n* `Remover itens da lista`\n\n* `Para incluir novos itens selecione 'Ver cardápio'`\n\n* `Para concluir selecione 'Finalizar pedido'`";
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

  contextSetup(contextList);

  return contextList;
}
