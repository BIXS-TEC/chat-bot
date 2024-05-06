import { closeSession } from "@wppconnect/server/dist/controller/sessionController.js";
import { buildSection, checkMessageIDCode } from "./message-functions.js";

export const f = {};

/**
  f.context_name = {};

  f.context_name.action = function (context, chatbot, client) {
    try {
      //
      return;
    } catch (error) {
      console.error(`Erro no contexto "${context.name}"`, error);
    }
  };

  f.context_name.responseObjects = function (context, chatbot, client, args = {}) {
    try {
      return [];
    } catch (error) {
      console.error(`Erro no contexto "${context.name}"`, error);
    }
  }
 */

/** Bem-vindo */

f.bem_vindo = {};

// Mensagem exemplo: 'Olá gostaria de ver as opções! #Mesa:3 #ID:7baf3'
// https://api.whatsapp.com/send/?phone=554891620244&text=Ol%C3%A1+gostaria+de+ver+as+op%C3%A7%C3%B5es%21+%23Mesa%3A%203
f.bem_vindo.action = function (context, chatbot, client) {
  try {
    const [modality, id] = checkMessageIDCode(client.chatbot.currentMessage);
    if (id && modality) {
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
    console.log("client.messageHistory: ", !client.messageHistory.map((msg) => msg.includes("informar-id"))[0]);
    let message = `*Olá ${client.name}!*\nBem-vindo ao _*${chatbot.businessName}*_\n\n`;
    if (client.chatbot.modalityId && client.chatbot.modality) {
      return [
        {
          type: "listMessage",
          description: message + "Selecione uma das opções a partir do botão abaixo", //"`Por favor, selecione uma das opções a partir do botão abaixo`",
          buttonText: "SELECIONE UMA OPÇÃO",
          sections: [buildSection(chatbot, "Escolha uma das opções", ["cardapio", "garcom", "atendente", "faq"])],
        },
      ];
    } else {
      return [
        {
          type: "text",
          message:
            message +
            "Puxa...\nA mensagem que você enviou não possui o numero da sua _Mesa_ ou _Comanda_.\n\n*Por favor, informe o numero da sua mesa ou comanda.*",
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
    if (chatbot.identifiers.includes(client.chatbot.currentMessage.match(/\d+/)[0])) {
      chatbot.clientList[client.phoneNumber].changeContext("bem-vindo");
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
          sections: [buildSection(chatbot, "Escolha uma das opções", ["cardapio", "garcom", "atendente", "faq"])],
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
    chatbot.clientList[client.phoneNumber].changeContext(context.name);
    setTimeout(() => {
      chatbot.clientList[client.phoneNumber].setHumanChat(true);
    }, 500);
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.atendente.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    return [
      { type: "text", message: "Ok!\n Já vou te transferir para um de nossos atendentes!\n\nSó um minuto que já vamos te chamar." },
      {
        type: "text",
        message: "Ok!\n Já vou te transferir para um de nossos atendentes!\n\nSó um minuto que já vamos te chamar.",
        groupPhone: chatbot.groupList,
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
    return [{ type: "text", message: "Ok!\nUm garçom foi notificado e já irá atende-lo, por favor aguarde." }];
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

/** Recomendar produto */

f.recomendar_produto = {};

f.recomendar_produto.action = function (context, chatbot, client) {
  try {
    try {
      chatbot.clientList[client.phoneNumber].changeContext(context.name);
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
        buttonText: "Incluir ou finalizar",
        sections: [
          buildSection(chatbot, `Selecione a quantidade de ${recommended.name}`, ["incluir-recomendado"], {
            recommended: recommended,
            qtdRecommended: 3,
          }),
          buildSection(chatbot, "🔽 Outras opções", ["editar-pedido", "finalizar-pedido", "garcom", "atendente"]),
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
    chatbot.clientList[client.phoneNumber].addProductToOrderList(recommended, parseInt(quantity));
    return;
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
  }
};

f.incluir_recomendado.responseObjects = function (context, chatbot, client, args = {}) {
  try {
    const recommended = chatbot.getRecommendedProduct();
    let message = chatbot.clientList[client.phoneNumber].getOrderMessage();

    message += `\n\nInclua mais ${recommended.name} ou selecione outra opção`; // "\n\nGostaria de incluir mais?\n* `Para incluir selecione a quantidade.`\n\n* `Ou selecione a opção de editar ou finalizar.`";

    return [
      {
        type: "listMessage",
        description: message,
        buttonText: "Incluir ou finalizar",
        sections: [
          buildSection(chatbot, `Selecione a quantidade de ${recommended.name}`, ["incluir-recomendado"], {
            recommended: recommended,
            qtdRecommended: 3,
          }),
          buildSection(chatbot, "🔽 Outras opções", ["editar-pedido", "finalizar-pedido", "garcom", "atendente"]),
        ],
      },
    ];
  } catch (error) {
    console.error(`Erro no contexto "${context.name}"`, error);
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
    message.push(chatbot.clientList[client.phoneNumber].chatbot.lastChatbotMessage);
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
