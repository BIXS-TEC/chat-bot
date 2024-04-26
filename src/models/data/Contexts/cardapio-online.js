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

export default function getCardapioOnlineContexts(chatbot) {
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
      return f.faq.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.faq.responseObjects(this, chatbot, client, args);
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
      console.log("\x1b[31;1m%s\x1b[0m", "Encerrando a sessão a pedido do comando via chat adm!");
      closeSession();
    },
    responseObjects: function (client, args = {}) {
      return [{ type: "text", message: `A sessão será encerrada!` }];
    },
  });

  contextSetup(contextList);

  return contextList;
}
