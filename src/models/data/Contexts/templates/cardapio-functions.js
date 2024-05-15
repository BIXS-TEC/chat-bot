import { closeSession } from "@wppconnect/server/dist/controller/sessionController.js";
import mf from "./message-functions.js";

export const f = {};

/**
  f.context_name = {};

  f.context_name.action = function (context, chatbot, client) {
    try {
      //
      return;
    } catch (error) {
      console.error(`Erro em action no contexto "${context.name}"`, error);
    }
  };

  f.context_name.responseObjects = function (context, chatbot, client, args = {}) {
    try {
      return [];
    } catch (error) {
      console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
    }
  }
 */

/** Bem-vindo */

f.bem_vindo = {};

// Mensagem exemplo: 'Olá gostaria de ver as opções! #Mesa:3 #ID:7baf3'
// https://api.whatsapp.com/send/?phone=554891620244&text=Ol%C3%A1+gostaria+de+ver+as+op%C3%A7%C3%B5es%21+%23Mesa%3A%203
f.bem_vindo.action = function (context, chatbot, client) {
  try {
    const [modality, id] = mf.checkMessageIDCode(client.chatbot.currentMessage);
    console.log('modality: ', modality, 'id:', id);
    if (chatbot.config.modality.includes(modality)) {
      client.changeContext(context.name);
      client.chatbot.modalityId = id;
      client.chatbot.modality = modality;
      return;
    }
    client.changeContext("informar-id");
    return;
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.bem_vindo.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    // console.log("client.messageHistory: ", !client.messageHistory.map((msg) => msg.includes("informar-id"))[0]);
    let message = `*Olá ${client.name}!*\nBem-vindo ao _*${chatbot.businessName}*_\n\n`;
    console.log('modality:', client.chatbot.modalityId, client.chatbot.modality)
    if (client.chatbot.modalityId && client.chatbot.modality) {
      return [
        {
          type: "listMessage",
          description: message + "Selecione uma das opções a partir do botão abaixo", //"`Por favor, selecione uma das opções a partir do botão abaixo`",
          buttonText: "SELECIONE UMA OPÇÃO",
          sections: [mf.buildSection(chatbot, "Escolha uma das opções", ["cardapio", "garcom", "atendente", "faq"])],
        },
      ];
    } else {
      return [
        {
          type: "text",
          message: message + "*Por favor, informe o numero da sua mesa ou comanda.*",
        },
      ];
    }
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Informar ID */

f.informar_id = {};

f.informar_id.action = function (context, chatbot, client) {
  try {
    const modalityId = client.chatbot.currentMessage.match(/\d+/)[0];
    if (chatbot.identifiers.includes(modalityId)) {
      client.changeContext("bem-vindo");
      client.chatbot.modalityId = modalityId;
      client.chatbot.modality = chatbot.config.modality;
      return { includes: true };
    }
    return { includes: false };
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.informar_id.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    if (args.includes) {
      return [
        {
          type: "listMessage",
          description: "Agora sim, tudo pronto!!\n\nSelecione uma das opções a partir do botão abaixo", //"`Por favor, selecione uma das opções a partir do botão abaixo`",
          buttonText: "Clique para ver as opções",
          sections: [mf.buildSection(chatbot, "Escolha uma das opções", ["cardapio", "garcom", "atendente", "faq"])],
        },
      ];
    }
    return [
      {
        type: "text",
        message: "Ops...\n Esse não é um numero válido\n\nPor favor, insira o numero da sua mesa",
      },
    ];
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** FAQ */

f.faq = {};

f.faq.action = function (context, chatbot, client) {
  try {
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.faq.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    return [
      {
        type: "text",
        message: `_*Perguntas Frequentes*_

*Horário de funcionamento*:
* seg-sex 11:00 as 20:00
* sab-dom 11:00 as 23:00

*Endereço Local*:
Av. Paulista, 3527 - Bela Vista, São Paulo

Mais informações no link abaixo`,
      },
      {
        type: "linkPreview",
        url: chatbot.config.url.faq,
      },
    ];
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** Atendente */

f.atendente = {};

f.atendente.action = function (context, chatbot, client) {
  try {
    client.changeContext(context.name);
    setTimeout(() => {
      client.setHumanChat(true);
    }, 500);
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.atendente.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    console.log("contact: ", chatbot.groupList["Atendente"].contact);
    return [
      { type: "text", message: "Ok!\n Já vou te transferir para um de nossos atendentes!\n\nSó um minuto que já vamos te chamar." },
      {
        type: "text",
        message: `Cliente [${client.phoneNumber}] solicitou atendimento!\n*Clique para responde-lo.*`,
        groupPhone: chatbot.groupList["Atendente"].contact,
        isGroup: true,
      },
      {
        type: "contactVcard",
        contactsId: client.id,
        groupPhone: chatbot.groupList["Atendente"].contact,
        isGroup: true,
      },
    ];
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** Garçom */

f.garcom = {};

f.garcom.action = function (context, chatbot, client) {
  try {
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.garcom.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    return [
      { type: "text", message: "Ok!\nUm garçom foi notificado e já irá atende-lo, por favor aguarde." },
      {
        type: "text",
        message: `*Mesa ${client.chatbot.modalityId}* solicitou um garçom!`,
        groupPhone: chatbot.groupList["Garçom"].contact,
        isGroup: true,
      },
    ];
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** Cardapio */

f.cardapio = {};

f.cardapio.action = function (context, chatbot, client) {
  try {
    client.changeContext(context.name);

    /* Atualiza a lista de activationKeywords do contexto 'adicionar-produto' */
    let sections = [];
    [chatbot.contextList[client.chatbot.interaction]["adicionar-produto"].activationKeywords, sections] = mf.getProductsIdsAndSections(chatbot); // retornar para responseObjects com obj sections
    chatbot.contextList[client.chatbot.interaction]["adicionar-produto"].activationKeywords.push("adicionar-produto");

    return { sections: sections };
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.cardapio.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    const sections = args.sections;

    /* Caso tenha sido redirecionado pelo contexto "editar-produto" e ja contenha itens na lista */
    if (Object.keys(client.orderList).length) {
      sections.push(mf.buildSection(chatbot, "🔽 Outras opções", ["adicionais", "editar-pedido", "recomendar-produto", "garcom", "atendente"]));
    } else {
      sections.push(mf.buildSection(chatbot, "🔽 Outras opções", ["garcom", "atendente"]));
    }

    return [
      {
        type: "listMessage",
        description: "Utilize a lista abaixo para montar seu pedido\n\n*Selecione QUANTAS VEZES QUISER!* 🤩😋",
        buttonText: "SELECIONE UMA OPÇÃO",
        sections: sections,
      },
    ];
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Adicionar produto */

f.adicionar_produto = {};

f.adicionar_produto.action = function (context, chatbot, client) {
  try {
    const id = parseInt(client.chatbot.itemId);
    let product = chatbot.getProductById(id);
    client.addProductToOrderList(product);
    client.changeContext("cardapio");
    return;
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.adicionar_produto.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    let message = mf.getOrderMessage(client);
    message += "\n\nSelecione umas das opções do botão abaixo";
    const [, sections] = mf.getProductsIdsAndSections(chatbot);
    sections.push(mf.buildSection(chatbot, "🔽 Outras opções", ["adicionais", "editar-pedido", "recomendar-produto", "garcom", "atendente"]));

    return [
      {
        type: "listMessage",
        description: message,
        buttonText: "SELECIONE UMA OPÇÃO",
        sections: sections,
      },
    ];
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Adicionais */

f.adicionais = {};

f.adicionais.action = function (context, chatbot, client) {
  try {
    client.changeContext(context.name);

    /* Atualiza a lista de activationKeywords do contexto 'adicionais' */
    const [addIds, obsIds, sections] = mf.getAdditionalIdsAndSections(chatbot, client);
    chatbot.contextList[client.chatbot.interaction]["incluir-adicionais"].activationKeywords = addIds;
    chatbot.contextList[client.chatbot.interaction]["incluir-observacao"].activationKeywords = obsIds;
    console.log("sections: ", sections);
    return { sections: sections };
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.adicionais.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    // console.log("args.sections: ", args.sections);
    const sections = args.sections;
    sections.push(mf.buildSection(chatbot, "🔽 Outras opções", ["editar-pedido", "recomendar-produto", "garcom", "atendente"]));

    return [
      {
        type: "listMessage",
        description: "Selecione o adicional que deseja incluir!",
        buttonText: "SELECIONE UMA OPÇÃO",
        sections: sections,
      },
    ];
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Incluir adicionais */

f.incluir_adicionais = {};

f.incluir_adicionais.action = function (context, chatbot, client) {
  try {
    const [productId, index, additionalId] = client.chatbot.itemId.split(":").map((num) => parseInt(num));
    // console.log("productId, index, additionalId: ", productId, index, additionalId);
    const additional = chatbot.getProductById(productId).additionalList[0][additionalId];
    // console.log("additional: ", additional);
    client.addAdditionalToOrderList(productId, additional, index);
    return;
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.incluir_adicionais.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    let message = mf.getOrderMessage(client);
    const [, , sections] = mf.getAdditionalIdsAndSections(chatbot, client); // Melhorar performace
    sections.push(mf.buildSection(chatbot, "🔽 Outras opções", ["editar-pedido", "recomendar-produto", "garcom", "atendente"]));

    return [
      {
        type: "listMessage",
        description: message + "\n\nInclua mais adicionais em seu pedido ou selecione outra opção",
        buttonText: "SELECIONE UMA OPÇÃO",
        sections: sections,
      },
    ];
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Incluir observação */

f.incluir_observacao = {};

f.incluir_observacao.action = function (context, chatbot, client) {
  try {
    client.changeContext(context.name);
    return;
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.incluir_observacao.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    const [productId, ,] = client.chatbot.itemId.split(":");
    return [
      {
        type: "text",
        message: `Por favor, escreva a observação para ${client.orderList[productId].name}.`,
      },
    ];
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Salvar observação */

f.salvar_observacao = {};

f.salvar_observacao.action = function (context, chatbot, client) {
  try {
    client.changeContext("adicionais");
    console.log("last message: ", client.messageHistory[client.messageHistory.length - 2]);
    const [, code] = client.messageHistory[client.messageHistory.length - 2].split("&&");
    const [productId, index, ] = code.split(":");
    // const additionalList = client.orderList[productId].additionalList;
    if (!client.orderList[productId].additionalList) client.orderList[productId].additionalList = [];
    if (!client.orderList[productId].additionalList[index]) client.orderList[productId].additionalList[index] = [];
    client.orderList[productId].additionalList[index]["observation"] = {
      text: client.chatbot.currentMessage,
      name: 'Observação'
    };

    return;
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.salvar_observacao.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    let message = mf.getOrderMessage(client);
    const [, , sections] = mf.getAdditionalIdsAndSections(chatbot, client); // Melhorar performace
    sections.push(mf.buildSection(chatbot, "🔽 Outras opções", ["editar-pedido", "recomendar-produto", "garcom", "atendente"]));

    return [
      {
        type: "listMessage",
        description: message + "\n\nObservação incluida!",
        buttonText: "SELECIONE UMA OPÇÃO",
        sections: sections,
      },
    ];
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Recomendar produto */

f.recomendar_produto = {};

f.recomendar_produto.action = function (context, chatbot, client) {
  try {
    try {
      client.changeContext(context.name);
    } catch (error) {
      console.error("Erro in action [recomendar-produto]", error);
    }
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.recomendar_produto.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    const recommended = chatbot.getRecommendedProduct();
    let message = `Sabe o que vai muito bem com seu pedido?\n\n*${recommended.name}!!!*🤩😋\n\nGostaria de incluir em seu pedido?`;
    message += "\nSelecione incluir ou outra opção"; // "\n* `Selecione uma opção abaixo`";
    return [
      {
        type: "listMessage",
        description: message,
        buttonText: "INCLUIR OU FINALIZAR",
        sections: [
          mf.buildSection(chatbot, `Selecione a quantidade de ${recommended.name}`, ["incluir-recomendado"], {
            recommended: recommended,
            qtdRecommended: 3,
          }),
          mf.buildSection(chatbot, "🔽 Outras opções", ["editar-pedido", "finalizar-pedido", "garcom", "atendente"]),
        ],
      },
    ];
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** Incluir recomendado */

f.incluir_recomendado = {};

f.incluir_recomendado.action = function (context, chatbot, client) {
  try {
    const quantity = client.chatbot.itemId[client.chatbot.itemId.length - 1].split(":").map((num) => parseInt(num));
    const recommended = chatbot.getRecommendedProduct();
    client.addProductToOrderList(recommended, parseInt(quantity));
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.incluir_recomendado.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    const recommended = chatbot.getRecommendedProduct();
    let message = mf.getOrderMessage(client);

    message += `\n\nInclua mais ${recommended.name} ou selecione outra opção`; // "\n\nGostaria de incluir mais?\n* `Para incluir selecione a quantidade.`\n\n* `Ou selecione a opção de editar ou finalizar.`";

    return [
      {
        type: "listMessage",
        description: message,
        buttonText: "Incluir ou finalizar",
        sections: [
          mf.buildSection(chatbot, `Selecione a quantidade de ${recommended.name}`, ["incluir-recomendado"], {
            recommended: recommended,
            qtdRecommended: 3,
          }),
          mf.buildSection(chatbot, "🔽 Outras opções", ["editar-pedido", "finalizar-pedido", "garcom", "atendente"]),
        ],
      },
    ];
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** Editar pedido */

f.editar_pedido = {};

f.editar_pedido.action = function (context, chatbot, client) {
  try {
    client.changeContext(context.name);
    return;
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.editar_pedido.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    /* Atualiza a lista de activationKeywords do contexto 'remover-item' */
    let sections = [];
    [chatbot.contextList[client.chatbot.interaction]["remover-item"].activationKeywords, sections] =
      mf.getProductsAndAdditionalIdsAndSections(chatbot, client); // Melhorar performace

    let message = mf.getOrderMessage(client);
    message += "\n\nSelecione um item para REMOVER ou outra opção";
    sections.push(mf.buildSection(chatbot, "🔽 Outras opções", ["voltar-cardapio", "adicionais", "recomendar-produto", "garcom", "atendente"]));

    return [
      {
        type: "listMessage",
        description: message,
        buttonText: "Editar ou Finalizar",
        sections: sections,
      },
    ];
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Remover item */

f.remover_item = {};

f.remover_item.action = function (context, chatbot, client) {
  try {
    const [productId, index, additionalId] = client.chatbot.itemId.split(":").map((num) => parseInt(num));
    client.removeFromOrderList(productId, index, additionalId);
    return;
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.remover_item.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    let sections = [];
    [, sections] = mf.getProductsAndAdditionalIdsAndSections(chatbot, client); // Melhorar performace

    let message = mf.getOrderMessage(client);
    message += "\n\nItem removido!\nSelecione uma das opções";
    sections.push(mf.buildSection(chatbot, "🔽 Outras opções", ["voltar-cardapio", "recomendar-produto", "garcom", "atendente"]));

    return [
      {
        type: "listMessage",
        description: message,
        buttonText: "Editar ou Finalizar",
        sections: sections,
      },
    ];
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Finalizar pedido */

f.finalizar_pedido = {};

f.finalizar_pedido.action = function (context, chatbot, client) {
  try {
    client.changeContext(context.name);
    const order = chatbot.sendClientOrder(client);
    return { order: order };
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.finalizar_pedido.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    const sections = [];
    sections.push(mf.buildSection(chatbot, "🔽 Selecione uma das opções", ["voltar-cardapio", "garcom", "atendente", "faq"]));

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
      {
        type: "text",
        message: args.order,
        groupPhone: chatbot.groupList["Cozinha"].contact,
        isGroup: true,
      },
    ];
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Invalido */

f.invalido = {};

f.invalido.action = function (context, chatbot, client) {
  try {
    console.log(`Mensagem invalida do cliente [${client.phoneNumber}]: ${client.chatbot.currentMessage}`);
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.invalido.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    const message = [{ type: "text", message: `Desculpe, mas esse comando é inválido!\nPor favor, selecione uma das opções.` }];
    message.push(client.chatbot.lastChatbotMessage);
    console.log("lastChatbotMessage: ", message);
    return message;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** End Session */

f.end_session = {};

f.end_session.action = function (context, chatbot, client) {
  try {
    console.log("\x1b[31;1m%s\x1b[0m", "Encerrando a sessão a pedido do comando via chat adm!");
    closeSession();
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.end_session.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    return [{ type: "text", message: `A sessão será encerrada!` }];
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};
