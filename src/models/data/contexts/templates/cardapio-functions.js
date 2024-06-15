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
// https://api.whatsapp.com/send/?phone=554891487526&text=Ol%C3%A1+gostaria+de+ver+as+op%C3%A7%C3%B5es%21+%23Mesa%3A%203
f.bem_vindo.action = function (context, chatbot, client) {
  try {
    client.changeContext("informar-id");
    const [modality, id] = mf.checkMessageIDCode(client.chatbot.currentMessage);
    // console.log("modality: ", modality, "id:", id);
    let status = "invalid";
    if (chatbot.config.modality.includes(modality) && Object.keys(chatbot.modalityIdList).includes(id)) {
      status = "valid";
      if (!chatbot.modalityIdList[id].occupied && !chatbot.modalityIdList[id].inactive) {
        chatbot.modalityIdList[id].occupied = true;
        client.chatbot.modalityId = id;
        client.chatbot.modality = modality;
        client.changeContext(context.name);
        status = "accepted";
      }
    }
    return { status: status };
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.bem_vindo.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    // console.log("modality:", client.chatbot.modalityId, client.chatbot.modality);
    const welcome = {
      type: "text",
      message: `*Olá ${client.name}!*\nBem-vindo ao _*${chatbot.businessName}*_`,
      dontSave: true,
    };
    if (args.status === "accepted") {
      return [
        welcome,
        {
          type: "listMessage",
          description: `${client.chatbot.modality}: ${client.chatbot.modalityId}\n\nSelecione uma opção no botão abaixo`,
          buttonText: "VER OPÇÕES",
          sections: [mf.buildSection(chatbot, "Escolha uma das opções", ["cardapio", "garcom", "atendente", "faq"])],
        },
      ];
    } else {
      let modality = chatbot.config.modality[0];
      const len = chatbot.config.modality.length;
      if (len > 1) {
        for (let i = 1; i < len - 1; i++) {
          modality += `, ${chatbot.config.modality[i]}`;
        }
        modality += ` ou ${chatbot.config.modality[len - 1]}`;
      }
      if (args.status === "invalid") {
        return [
          welcome,
          {
            type: "text",
            message: `*Por favor, informe o numero da sua ${modality}.*`,
          },
        ];
      }
      if (args.status === "valid") {
        return [
          welcome,
          {
            type: "text",
            message: `Esta ${modality} esta ocupada!\nPor favor, informe o valor correto da sua ${modality} *ou escaneie novamente o QR Code.*`,
          },
        ];
      }
    }
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Informar ID */

f.informar_id = {};

f.informar_id.action = function (context, chatbot, client) {
  try {
    const [modality, id] = mf.checkMessageIDCode(client.chatbot.currentMessage);
    // console.log("modality: ", modality, "id:", id);
    let status = "invalid";
    if (chatbot.config.modality.includes(modality) && Object.keys(chatbot.modalityIdList).includes(id)) {
      status = "valid";
      if (!chatbot.modalityIdList[id].occupied && !chatbot.modalityIdList[id].inactive) {
        chatbot.modalityIdList[id].occupied = true;
        client.chatbot.modalityId = id;
        client.chatbot.modality = modality;
        client.changeContext("bem-vindo");
        status = "accepted";
      }
    } else {
      const modalityId = client.chatbot.currentMessage.match(/\d+/)[0];
      if (Object.keys(chatbot.modalityIdList).includes(modalityId)) {
        status = "valid";
        if (!chatbot.modalityIdList[modalityId].occupied && !chatbot.modalityIdList[modalityId].inactive) {
          chatbot.modalityIdList[modalityId].occupied = true;
          client.chatbot.modalityId = modalityId;
          client.chatbot.modality = chatbot.config.modality.join("/");
          client.changeContext("bem-vindo");
          status = "accepted";
        }
      }
    }
    return { status: status };
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.informar_id.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    if (args.status === "accepted") {
      return [
        {
          type: "listMessage",
          description: `${client.chatbot.modality}: ${client.chatbot.modalityId}\n\nSelecione uma opção no botão abaixo`,
          buttonText: "VER OPÇÕES",
          sections: [mf.buildSection(chatbot, "Escolha uma das opções", ["cardapio", "garcom", "atendente", "faq"])],
        },
      ];
    } else {
      let modality = chatbot.config.modality[0];
      const len = chatbot.config.modality.length;
      if (len > 1) {
        for (let i = 1; i < len - 1; i++) {
          modality += `, ${chatbot.config.modality[i]}`;
        }
        modality += ` ou ${chatbot.config.modality[len - 1]}`;
      }
      if (args.status === "invalid") {
        return [
          {
            type: "text",
            message: `*Por favor, informe o numero da sua ${modality}.*`,
          },
        ];
      }
      if (args.status === "valid") {
        return [
          {
            type: "text",
            message: `Esta ${modality} esta ocupada!\nPor favor, informe o valor correto da sua ${modality} *ou escaneie novamente o QR Code.*`,
          },
        ];
      }
    }
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
    // console.log("faq lastChatbotMessage: ", client.chatbot.lastChatbotMessage);
    const returnMessage = [...client.chatbot.lastChatbotMessage];
    returnMessage.unshift({
      type: "text",
      dontSave: true,
      message: `_*Perguntas Frequentes*_

*Horário de funcionamento*:
* seg-sex 11:00 as 20:00
* sab-dom 11:00 as 23:00

*Endereço Local*:
Av. Paulista, 3527 - Bela Vista, São Paulo

Mais informações no link abaixo
${chatbot.config.url.faq}`,
    });
    return returnMessage;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** Atendente */

f.atendente = {};

f.atendente.action = function (context, chatbot, client) {
  try {
    // console.log("\x1b[36m%s\x1b[0m", `f.atendente.action Cliente: ${JSON.stringify(client)}`);
    const saveResponse = client.chatbot.lastChatbotMessage.filter((response) => !response.dontSave);
    // console.log(`f.atendente.action saveResponse: ${JSON.stringify(saveResponse)}`);
    if (saveResponse.length && !["atendente"].includes(client.chatbot.context)) client.chatbot.lastResponseBeforeAtendente = saveResponse;
    client.changeContext(context.name);
    setTimeout(() => {
      client.chatbot.humanChating = true;
    }, 500);
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.atendente.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    // console.log("contact: ", chatbot.groupList["Atendente"].chatId);
    return [
      { type: "text", message: "Ok!\n Já vou te transferir para um de nossos atendentes!\n\nSó um minuto que já vamos te chamar.", dontSave: true },
      {
        type: "listMessage",
        description: "Quando quiser, selecione a opção para voltar ao chatbot.",
        buttonText: "SELECIONE UMA OPÇÃO",
        sections: [
          {
            title: "Selecione uma opção",
            rows: [
              {
                rowId: "voltar-chatbot",
                title: "Voltar ao chatbot de onde parei. ↩️",
                description: "",
              },
              {
                rowId: "atendente",
                title: "Não fui atendido ainda, chamar atendente novamente! ⚠️",
                description: "",
              },
              {
                rowId: "faq",
                title: "Perguntas Frequentes ❔",
                description: "",
              },
            ],
          },
        ],
      },
      {
        type: "text",
        message: `# Cliente [${client.phoneNumber}] solicitou atendimento!\n*Clique para responde-lo.*`,
        groupPhone: chatbot.groupList["Atendente"].chatId,
        isGroup: true,
        dontSave: true,
      },
      {
        type: "contactVcard",
        contactsId: client.id,
        groupPhone: chatbot.groupList["Atendente"].chatId,
        isGroup: true,
        dontSave: true,
      },
    ];
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** Voltar ao chatbot */

f.voltar_chatbot = {};

f.voltar_chatbot.action = function (context, chatbot, client) {
  try {
    client.chatbot.humanChating = false;
    client.changeContext(client.getLastValidContext());
    return true;
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.voltar_chatbot.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    // console.log("lastResponseBeforeAtendente: ", client.chatbot.lastResponseBeforeAtendente);
    const returnMessage = [
      {
        type: "text",
        message: "Vamos continuar de onde paramos?",
        dontSave: true,
      },
    ];
    returnMessage.push(...client.chatbot.lastResponseBeforeAtendente);
    // console.log("returnMessage :", returnMessage);
    return returnMessage;
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
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
    const message = [...client.chatbot.lastChatbotMessage];
    message.unshift(
      {
        type: "text",
        message: "Um garçom foi notificado e já irá atende-lo, por favor aguarde.\n\nVocê pode continuar enquanto isso!",
        dontSave: true,
      },
      {
        type: "text",
        message: `# *Mesa ${client.chatbot.modalityId}* solicitou um garçom!\nCliente: ${client.name}`,
        groupPhone: chatbot.groupList["Garçom"].chatId,
        isGroup: true,
        dontSave: true,
      }
    );
    return message;
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
    let description = "\n\n*Selecione um por vez*";

    /* Caso tenha sido redirecionado pelo contexto "editar-produto" e ja contenha itens na lista */
    if (Object.keys(client.chatbot.orderList).length) {
      let message = mf.getOrderMessage(client);
      description = message + description;
      sections.push(
        mf.buildSection(chatbot, "🔽 Outras opções", ["adicionais", "editar-pedido", "recomendar-produto", "garcom", "atendente", "cancelar-pedido"])
      );
    } else {
      description = "Monte seu pedido!" + description;
      sections.push(mf.buildSection(chatbot, "🔽 Outras opções", ["garcom", "atendente"]));
    }

    return [
      {
        type: "listMessage",
        description: description,
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
    // message += "\n\nSelecione umas das opções do botão abaixo";
    const [, sections] = mf.getProductsIdsAndSections(chatbot);
    sections.push(
      mf.buildSection(chatbot, "🔽 Outras opções", ["adicionais", "editar-pedido", "recomendar-produto", "garcom", "atendente", "cancelar-pedido"])
    );

    return [
      {
        type: "listMessage",
        description: message,
        buttonText: "INCLUIR MAIS OU CONCLUIR",
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
    // console.log("sections: ", sections);
    return { sections: sections };
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.adicionais.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    // console.log("args.sections: ", args.sections);
    let message = mf.getOrderMessage(client);
    const sections = args.sections;
    sections.push(
      mf.buildSection(chatbot, "🔽 Outras opções", [
        "voltar-cardapio",
        "editar-pedido",
        "recomendar-produto",
        "garcom",
        "atendente",
        "cancelar-pedido",
      ])
    );

    return [
      {
        type: "listMessage",
        description: message + "\n\nSelecione adicionais especificos para cada item!",
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
    sections.push(
      mf.buildSection(chatbot, "🔽 Outras opções", [
        "voltar-cardapio",
        "editar-pedido",
        "recomendar-produto",
        "garcom",
        "atendente",
        "cancelar-pedido",
      ])
    );

    return [
      {
        type: "listMessage",
        description: message,
        buttonText: "INCLUIR MAIS OU CONCLUIR",
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
        message: `Por favor, escreva a observação para ${client.chatbot.orderList[productId].name}.`,
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
    // console.log("last message: ", client.messageHistory[client.messageHistory.length - 2]);
    const [, code] = client.chatbot.messageHistory[client.chatbot.messageHistory.length - 2].split("&&");
    const [productId, index] = code.split(":");
    // const additionalList = client.chatbot.orderList[productId].additionalList;
    if (!client.chatbot.orderList[productId].additionalList) client.chatbot.orderList[productId].additionalList = [];
    if (!client.chatbot.orderList[productId].additionalList[index]) client.chatbot.orderList[productId].additionalList[index] = {};
    client.chatbot.orderList[productId].additionalList[index]["observation"] = {
      text: client.chatbot.currentMessage,
      name: "Observação",
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
    sections.push(mf.buildSection(chatbot, "🔽 Outras opções", ["editar-pedido", "recomendar-produto", "garcom", "atendente", "cancelar-pedido"]));

    return [
      {
        type: "listMessage",
        description: message + "\n\nObservação incluida!",
        buttonText: "INCLUIR MAIS OU CONCLUIR",
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
      console.error(`Erro in action "${context.name}"`, error);
    }
    return;
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.recomendar_produto.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    const recommended = chatbot.getRecommendedProduct();
    let message = `Sabe o que vai muito bem com seu pedido?\n\n*${recommended.name}!!!*🤩😋`;
    message += "\n\nInclua em seu pedido!";
    return [
      {
        type: "listMessage",
        description: message,
        buttonText: "INCLUIR OU FINALIZAR",
        sections: [
          mf.buildSection(chatbot, `Incluir quantas ${recommended.name}?`, ["incluir-recomendado"], {
            recommended: recommended,
            qtdRecommended: 3,
          }),
          mf.buildSection(chatbot, "🔽 Outras opções", [
            "voltar-cardapio",
            Object.keys(client.chatbot.orderList).length ? "editar-pedido" : "",
            Object.keys(client.chatbot.orderList).length ? "finalizar-pedido" : "",
            "garcom",
            "atendente",
            "cancelar-pedido",
          ]),
        ],
      },
    ];
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Incluir recomendado */

f.incluir_recomendado = {};

f.incluir_recomendado.action = function (context, chatbot, client) {
  try {
    client.changeContext("recomendar-produto");
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

    // message += `\n\nInclua mais ${recommended.name} ou selecione outra opção`;

    return [
      {
        type: "listMessage",
        description: message,
        buttonText: "INCLUIR MAIS OU FINALIZAR",
        sections: [
          mf.buildSection(chatbot, `Incluir mais quantas ${recommended.name}?`, ["incluir-recomendado"], {
            recommended: recommended,
            qtdRecommended: 3,
          }),
          mf.buildSection(chatbot, "🔽 Outras opções", [
            "voltar-cardapio",
            "editar-pedido",
            "finalizar-pedido",
            "garcom",
            "atendente",
            "cancelar-pedido",
          ]),
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
    [chatbot.contextList[client.chatbot.interaction]["remover-item"].activationKeywords, sections] = mf.getProductsAndAdditionalIdsAndSections(
      chatbot,
      client
    ); // Melhorar performace

    let message = mf.getOrderMessage(client);
    message += "\n\nSelecione um item para REMOVER ou outra opção";
    sections.push(
      mf.buildSection(chatbot, "🔽 Outras opções", ["voltar-cardapio", "adicionais", "recomendar-produto", "garcom", "atendente", "cancelar-pedido"])
    );

    return [
      {
        type: "listMessage",
        description: message,
        buttonText: "REMOVER OU FINALIZAR",
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
    const [productId, index, additionalId] = client.chatbot.itemId.split(":");
    client.removeFromOrderList(productId, parseInt(index), additionalId);
    return;
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.remover_item.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    if (!Object.keys(client.chatbot.orderList).length) {
      setTimeout(() => {
        chatbot.sendContextMessage("cardapio", client);
      }, 200);
      return [
        {
          type: "text",
          message: "Item removido!\nSua lista de pedidos está vazia.",
        },
      ];
    }
    let sections = [];
    [, sections] = mf.getProductsAndAdditionalIdsAndSections(chatbot, client); // Melhorar performace

    let message = mf.getOrderMessage(client);
    message += "\n\nItem removido!";
    sections.push(mf.buildSection(chatbot, "🔽 Outras opções", ["voltar-cardapio", "recomendar-produto", "garcom", "atendente", "cancelar-pedido"]));

    return [
      {
        type: "listMessage",
        description: message,
        buttonText: "REMOVER OU FINALIZAR",
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
    if (!Object.keys(client.chatbot.orderList).length) {
      chatbot.sendContextMessage("pedidos-vazio", client);
      chatbot.sendContextMessage("cardapio", client);
      return { isEmpty: true };
    }
    const orderMessage = chatbot.sendClientOrder(client);
    console.log("f.finalizar_pedido.action orderMessage:", orderMessage);
    mf.recurrentTimeOut(chatbot, client);
    return { orderMessage: orderMessage };
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.finalizar_pedido.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    if (args.isEmpty) return [];
    const sections = [];
    sections.push(mf.buildSection(chatbot, "🔽 Selecione uma das opções", ["voltar-cardapio", "solicitar-fechamento", "garcom", "atendente", "faq"]));

    return [
      {
        type: "text",
        message: "Seu pedido já esta sendo preparado!!!\n\nO tempo de espera é de +- *30 minutos*\n\nAgradecemos pela preferência! 😊",
      },
      {
        type: "listMessage",
        description: "Continue pedindo!",
        buttonText: "SELECIONE UMA OPÇÃO",
        sections: sections,
      },
      {
        type: "text",
        message: args.orderMessage,
        groupPhone: chatbot.groupList["Cozinha"].chatId,
        isGroup: true,
        dontSave: true,
      },
    ];
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Cancelar Pedido */

f.cancelar_pedido = {};

f.cancelar_pedido.action = function (context, chatbot, client) {
  try {
    client.chatbot.orderList = {};
    client.changeContext("finalizar-pedido");
    mf.recurrentTimeOut(chatbot, client);
    return;
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.cancelar_pedido.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    const sections = [];
    sections.push(
      mf.buildSection(chatbot, "🔽 Selecione uma das opções", [
        "voltar-cardapio",
        Object.keys(client.chatbot.approvedOrderList).length ? "solicitar-fechamento" : "",
        "garcom",
        "atendente",
        "faq",
      ])
    );

    return [
      {
        type: "listMessage",
        description: "Seu pedido foi cancelado!",
        buttonText: "SELECIONE UMA OPÇÃO",
        sections: sections,
      },
    ];
  } catch (error) {
    console.error(`Erro em responseObjects no contexto "${context.name}"`, error);
  }
};

/** Recorrente */

f.recorrente = {};

f.recorrente.action = function (context, chatbot, client) {
  if (!Object.keys(client.chatbot.approvedOrderList).length) return { noProducts: true };
  // Atualizar activationKeywords de "incluir-recorrente"
  const activationKeywords = [];
  for (let productId in client.chatbot.approvedOrderList) {
    const category = client.chatbot.approvedOrderList[productId].category;
    if (chatbot.config.recurrentCategories.includes(category)) {
      activationKeywords.push(productId);
    }
  }
  if (!activationKeywords.length) return { noProducts: true };
  client.changeContext(context.name);
  chatbot.contextList["cardapio-whatsapp"]["incluir-recorrente"].activationKeywords = activationKeywords;
};

f.recorrente.responseObjects = function (context, chatbot, client, args = {}) {
  if (args.noProducts) return [];
  const recurrent = mf.buildSection(chatbot, `Selecione uma bebida.`, ["recorrente"], { client });
  let message = "";
  for (let row of recurrent.rows) {
    message += `\n*${row.title}*`;
  }
  return [
    {
      type: "listMessage",
      description: `Gostaria de pedir novamente?${message}`,
      buttonText: "SELECIONE UMA OPÇÃO",
      sections: [recurrent, mf.buildSection(chatbot, "🔽 Outras opções", ["cardapio", "solicitar-fechamento", "garcom", "atendente", "faq"])],
    },
  ];
};

/** Incluir recorrente */

f.incluir_recorrente = {};

f.incluir_recorrente.action = function (context, chatbot, client) {
  try {
    client.changeContext("recorrente");
    const id = parseInt(client.chatbot.itemId);
    let product = chatbot.getProductById(id);
    client.addProductToOrderList(product);
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.incluir_recorrente.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    let message = mf.getOrderMessage(client);

    return [
      {
        type: "listMessage",
        description: message,
        buttonText: "SELECIONE UMA DAS OPÇÕES",
        sections: [
          mf.buildSection(chatbot, "Selecione uma bebida", ["recorrente"], { client }),
          mf.buildSection(chatbot, "🔽 Outras opções", [
            "cardapio",
            "editar-pedido",
            "finalizar-pedido",
            "garcom",
            "atendente",
            "cancelar-pedido",
          ]),
        ],
      },
    ];
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** Solicitar fechamento de conta */

f.solicitar_fechamento = {};

f.solicitar_fechamento.action = function (context, chatbot, client) {
  try {
    client.changeContext(context.name);
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.solicitar_fechamento.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    let message = mf.getCompleteOrderMessage(client);

    const returnMessage = [
      {
        type: "text",
        message: message,
      },
      {
        type: "text",
        message: chatbot.config.groupNames.includes("Garçom")
          ? "Um garçom irá trazer a conta.\nPor favor, aguarde."
          : "Por favor, dirija-se ao caixa para o pagamento.",
      },
      {
        type: "text",
        message: `# Cliente [${client.phoneNumber}] ${client.chatbot.modality}: ${client.chatbot.modalityId} solicitou fechamento de conta.\nTotal: R$ ${client.chatbot.totalPrice}`,
        groupPhone: chatbot.groupList["Caixa"].chatId,
        isGroup: true,
        dontSave: true,
      },
    ];
    if (chatbot.config.groupNames.includes("Garçom")) {
      returnMessage.push({
        type: "text",
        message: `# Cliente [${client.phoneNumber}] ${client.chatbot.modality}: ${client.chatbot.modalityId} solicitou fechamento de conta.\nTotal: R$ ${client.chatbot.totalPrice}`,
        groupPhone: chatbot.groupList["Garçom"].chatId,
        isGroup: true,
        dontSave: true,
      });
    }
    return returnMessage;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** Pesquisa de satisfação */

f.pesquisa_satisfacao = {};

f.pesquisa_satisfacao.action = function (context, chatbot, client) {
  try {
    client.changeContext(context.name);
    console.log("PESQUISA DE SATISFAÇÃO client: ", client);
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.pesquisa_satisfacao.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    return [
      {
        type: "listMessage",
        description: "Por favor, avalie nosso atendimento!",
        buttonText: "AVALIAR",
        sections: [mf.buildSection(chatbot, "O que você achou do nosso atendimento?", ["pesquisa-satisfacao"])],
      },
    ];
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** Fechar conta */

f.fechar_conta = {};

f.fechar_conta.action = function (context, chatbot, client) {
  try {
    client.changeContext(context.name);
    // Salvar dados em um arquivo
    chatbot.satisfactionPoll[client.chatbot.itemId].count += 1;
    chatbot.satisfactionPoll[client.chatbot.itemId].voters.push(client.phoneNumber);
    console.log("pesquisa: ", chatbot.satisfactionPoll);
    // Salvar cliente no historico do chatbot
    setTimeout(() => {
      delete chatbot.clientList[client.phoneNumber];
    }, 1000);
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.fechar_conta.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    return [
      {
        type: "text",
        message: "Obrigado pela avaliação!\n\nAgradecemos pela preferência.\n*Volte sempre!* 😊",
      },
    ];
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** Pedidos vazio */

f.pedidos_vazio = {};

f.pedidos_vazio.action = function (context, chatbot, client) {
  try {
    return;
  } catch (error) {
    console.error(`Erro em action no contexto "${context.name}"`, error);
  }
};

f.pedidos_vazio.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    return [
      {
        type: "text",
        message: "Sua lista de pedidos está vazia!\nPor favor, adicione um item para finalizar.",
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
    const message = client.chatbot.lastChatbotMessage;
    message.unshift({ type: "text", message: `Por favor, selecione uma das opções.`, dontSave: true });
    // console.log("lastChatbotMessage: ", message);
    return message;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};
