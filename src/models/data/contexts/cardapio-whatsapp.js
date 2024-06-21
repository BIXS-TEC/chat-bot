import Context from "../../classes/context.js";
import { f } from "./templates/cardapio-functions.js";

function contextSetup(contextList, chatbot) {
  const contextNames = [];
  for (const contextName in contextList) {
    contextNames.push(`${contextName}`);
  }

  const uniqueContexts = ["incluir-observacao"];
  contextList["faq"].previousContexts = contextNames;
  contextList["atendente"].previousContexts = contextNames;
  contextList["invalido"].previousContexts = contextNames.filter((name) => !uniqueContexts.includes(name));
  contextList["garcom"].previousContexts = contextNames;
  contextList["informar-id"].activationKeywords = Object.keys(chatbot.modalityIdList);
}

export default function getCardapioWhatsAppContexts(chatbot) {
  const contextList = {};
  /**
    contextList["context-name"] = new Context({
     id: "0",
     name: "context-name",                                 // Same as self contextList index
     previuosContext: ["context-name1", "context-name2"]   // Only such contexts will precede this context
     action: function(),                                   // Data managment of this context, returns args that can be passed to responseObjects()
     activationKeywords: ["key1", "key2"]                  // If more than one context is eligible, words present in activationKeywords will break the tie
     responseObjects: function(),                          // Object containing selectable cases in sendMessage of the Sender class, should return following responseObjects
    });
    
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
    id: "1",
    name: "informar-id",
    previousContexts: ["informar-id"],
    activationRegex: /^.+ #\w+:\d+ #ID:[a-zA-Z0-9]{5}$/,
    action: function (client) {
      return f.informar_id.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.informar_id.responseObjects(this, chatbot, client, args);
    },
  });

  if (chatbot.config.serviceOptions.faq) {
    contextList["faq"] = new Context({
      id: "2",
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
  }

  if (chatbot.config.serviceOptions.atendente) {
    contextList["atendente"] = new Context({
      id: "3",
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

    contextList["voltar-chatbot"] = new Context({
      id: "3",
      name: "voltar-chatbot",
      previousContexts: ["atendente"],
      activationKeywords: ["voltar-chatbot"],
      action: function (client) {
        return f.voltar_chatbot.action(this, chatbot, client);
      },
      responseObjects: function (client, args = {}) {
        return f.voltar_chatbot.responseObjects(this, chatbot, client, args);
      },
    });
  }

  if (chatbot.config.serviceOptions.garcom) {
    contextList["garcom"] = new Context({
      id: "4",
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
  }

  contextList["cardapio"] = new Context({
    id: "5",
    name: "cardapio",
    previousContexts: ["bem-vindo", "editar-pedido", "finalizar-pedido", "adicionais", "atendente", "recorrente", "recomendar-produto"],
    activationKeywords: ["cardapio"],
    action: function (client) {
      return f.cardapio.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.cardapio.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["recomendar-produto"] = new Context({
    id: "6",
    name: "recomendar-produto",
    previousContexts: [],
    activationKeywords: [],
    action: function (client) {
      return f.recomendar_produto.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.recomendar_produto.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["incluir-recomendado"] = new Context({
    id: "7",
    name: "incluir-recomendado",
    previousContexts: ["cardapio", "recorrente"],
    activationKeywords: ["incluir-recomendado1", "incluir-recomendado2", "incluir-recomendado3"],
    action: function (client) {
      return f.incluir_recomendado.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.incluir_recomendado.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["adicionar-produto"] = new Context({
    id: "8",
    name: "adicionar-produto",
    previousContexts: ["cardapio", "atendente"],
    action: function (client) {
      return f.adicionar_produto.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.adicionar_produto.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["adicionais"] = new Context({
    id: "9",
    name: "adicionais",
    previousContexts: ["cardapio", "editar-pedido"],
    activationKeywords: ["adicionais"],
    action: function (client) {
      return f.adicionais.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.adicionais.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["incluir-adicionais"] = new Context({
    id: "10",
    name: "incluir-adicionais",
    previousContexts: ["adicionais"],
    action: function (client) {
      return f.incluir_adicionais.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.incluir_adicionais.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["incluir-observacao"] = new Context({
    id: "11",
    name: "incluir-observacao",
    previousContexts: ["adicionais"],
    action: function (client) {
      return f.incluir_observacao.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.incluir_observacao.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["salvar-observacao"] = new Context({
    id: "12",
    name: "salvar-observacao",
    previousContexts: ["incluir-observacao"],
    activationRegex: /^\w*$/,
    action: function (client) {
      return f.salvar_observacao.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.salvar_observacao.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["editar-pedido"] = new Context({
    id: "13",
    name: "editar-pedido",
    previousContexts: ["cardapio", "adicionais", "recomendar-produto", "recorrente"],
    activationKeywords: ["editar-pedido"],
    action: function (client) {
      return f.editar_pedido.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.editar_pedido.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["remover-item"] = new Context({
    id: "14",
    name: "remover-item",
    previousContexts: ["editar-pedido"],
    action: function (client) {
      return f.remover_item.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.remover_item.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["finalizar-pedido"] = new Context({
    id: "15",
    name: "finalizar-pedido",
    previousContexts: ["cardapio", "recomendar-produto", "editar-pedido", "recorrente"],
    activationKeywords: ["finalizar-pedido"],
    action: function (client) {
      return f.finalizar_pedido.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.finalizar_pedido.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["confirmar-cancelamento"] = new Context({
    id: "16",
    name: "confirmar-cancelamento",
    previousContexts: ["recomendar-produto", "editar-pedido", "recorrente", "adicionais", "cardapio"],
    activationKeywords: ["confirmar-cancelamento"],
    action: function (client) {
      return f.confirmar_cancelamento.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.confirmar_cancelamento.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["cancelar-pedido"] = new Context({
    id: "17",
    name: "cancelar-pedido",
    previousContexts: ["confirmar-cancelamento"],
    activationKeywords: ["sim-cancelar", "nao-cancelar"],
    action: function (client) {
      return f.cancelar_pedido.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.cancelar_pedido.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["recorrente"] = new Context({
    id: "18",
    name: "recorrente",
    previousContexts: ["finalizar-pedido"],
    activationKeywords: ["recorrente"],
    action: function (client) {
      return f.recorrente.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.recorrente.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["incluir-recorrente"] = new Context({
    id: "19",
    name: "incluir-recorrente",
    previousContexts: ["recorrente"],
    activationKeywords: [], // Definidos em action de "recorrente"
    action: function (client) {
      return f.incluir_recorrente.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.incluir_recorrente.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["solicitar-fechamento"] = new Context({
    id: "20",
    name: "solicitar-fechamento",
    previousContexts: ["solicitar-fechamento", "recorrente", "finalizar-pedido"],
    activationKeywords: ["solicitar-fechamento"],
    action: function (client) {
      return f.solicitar_fechamento.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.solicitar_fechamento.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["pesquisa-satisfacao"] = new Context({
    id: "21",
    name: "pesquisa-satisfacao",
    previousContexts: [],
    activationKeywords: [],
    action: function (client) {
      return f.pesquisa_satisfacao.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.pesquisa_satisfacao.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["fechar-conta"] = new Context({
    id: "22",
    name: "fechar-conta",
    previousContexts: ["pesquisa-satisfacao"],
    activationKeywords: ["0", "1", "2"],
    action: function (client) {
      return f.fechar_conta.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.fechar_conta.responseObjects(this, chatbot, client, args);
    },
  });

  contextList["pedidos-vazio"] = new Context({
    id: "23",
    name: "pedidos-vazio",
    previousContexts: [],
    activationKeywords: [],
    action: function (client) {
      return f.pedidos_vazio.action(this, chatbot, client);
    },
    responseObjects: function (client, args = {}) {
      return f.pedidos_vazio.responseObjects(this, chatbot, client, args);
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

  contextSetup(contextList, chatbot);

  return contextList;
}
