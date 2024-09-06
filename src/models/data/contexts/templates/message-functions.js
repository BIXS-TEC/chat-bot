import CryptoJS from "crypto-js";

const mf = {};
export default mf;

/**
 * Função para construir uma sessão com o padrão do wppconnect para mensagens tipo ListMessage
 * @param {Chatbot} chatbot Chatbot que esta sendo utilizado
 * @param {string} title Titulo da sessão, como será mostrado no Whats App
 * @param {Array<string>} sectionsName Nomes das sessões que devem ser incluidas
 * @param {Object} args Para uso especifico, se necessário para cada caso
 * @returns 
 */
mf.buildSection = function (chatbot, title, sectionsName, args = {}) {
  try {
    const sectionMappings = {
      cardapio: {
        rowId: "cardapio",
        title: "Ver cardápio 🍔",
        description: "Monte seu pedido sem sair do WhatsApp",
      },
      "cardapio-online": {
        rowId: "cardapio-online",
        title: "Ver cardápio online 📋",
        description: "Monte seu pedido em nosso site",
      },
      "voltar-cardapio": {
        rowId: "cardapio",
        title: "Voltar ao cardápio 🍔",
        description: "",
      },
      "menu-opcoes": {
        rowId: "menu-opcoes",
        title: "Menu de opções 🔘",
        description: "",
      },
      atendente: {
        rowId: "atendente",
        title: "Transferir conversa para atendente 📲",
        description: "",
      },
      garcom: {
        rowId: "garcom",
        title: "Solicitar garçom à mesa 🤵",
        description: "",
      },
      faq: {
        rowId: "faq",
        title: "Perguntas Frequentes ❔",
        description: "Horário de funcionamento, localização, eventos etc...",
      },
      adicionais: {
        rowId: "adicionais",
        title: "Incluir adicionais ⭐️",
        description: "",
      },
      "recomendar-produto": {
        rowId: "recomendar-produto",
        title: "Finalizar pedido ✅",
        description: "",
      },
      "editar-pedido": {
        rowId: "editar-pedido",
        title: "Remover item da lista ✏️",
        description: "",
      },
      "finalizar-pedido": {
        rowId: "finalizar-pedido",
        title: "Finalizar pedido ✅",
        description: "",
      },
      "cancelar-pedido": {
        rowId: "confirmar-cancelamento",
        title: "Cancelar este pedido ❌",
        description: "Você será redirecionado para o menu.",
      },
      "solicitar-fechamento": {
        rowId: "solicitar-fechamento",
        title: "Fechar conta e pagar 💲",
        description: "",
      },
    };

    if (sectionsName.includes("recorrente")) {
      const approvedOrderList = args.client.chatbot.approvedOrderList;
      const rows = [];
      for (let productId in approvedOrderList) {
        const category = approvedOrderList[productId].category;
        if (chatbot.config.recurrentCategories.includes(category)) {
          const product = chatbot.getProductById(productId);
          rows.push({
            rowId: `${productId}`,
            title: `${product.name}`,
            description: `R$ ${product.price.toFixed(2).replace(".", ",")}`,
          });
        }
      }
      if (rows.length) sectionMappings["recorrente"] = rows;
    }

    // Adiciona as seções de incluir recomendado dinamicamente
    if (sectionsName.includes("incluir-recomendado")) {
      const rows = Array.from({ length: args.qtdRecommended }, (_, index) => ({
        rowId: `incluir-recomendado${index + 1}`,
        title: `Incluir +${index + 1} no meu pedido`,
        description: `+R$ ${args.recommended.price.toFixed(2).replace(".", ",")} cada`,
      }));
      sectionMappings["incluir-recomendado"] = rows;
    }

    if (sectionsName.includes("pesquisa-satisfacao")) {
      const rows = [
        { rowId: "0", title: "Bom 🤩", description: "" },
        { rowId: "1", title: "Regular 😐", description: "" },
        { rowId: "2", title: "Ruim ☹️", description: "" },
      ];
      sectionMappings["pesquisa-satisfacao"] = rows;
    }

    const rows = sectionsName
      .flatMap((name) => {
        // Verifica se a funcionalidade existe e esta habilitada em chatbot.config.serviceOptions antes de incluir na resposta
        if (sectionMappings[name] && (chatbot.config.serviceOptions[name] || chatbot.config.serviceOptions[name] === undefined)) {
          return sectionMappings[name];
        }
        return [];
      })
      .filter((row) => row !== null);

    return {
      title: title,
      rows: rows,
    };
  } catch (error) {
    console.error("Error in buildSection: ", error);
  }
};

/**
 * Verificar se a mensagem possui o tipo da modalidade e o seu numero
 * Utilizado no contexto Bem-Vindo para automatizar o fluxo
 * @param {string} currentMessage 
 * @returns 
 */
mf.checkPreProgrammedMessage = function (currentMessage) {
  try {
    if (typeof currentMessage === "string") {
      const info = currentMessage.replace(/\s/g, "").split("#");
      // console.log('info: ', info);
      if (info.length > 1) {
        const [modality, idNum] = info[info.length - 2].split(":");
        const [, code] = info[info.length - 1].split(":");
        if (modality && idNum && code) {
          const hash = CryptoJS.MD5(idNum + "BIX").toString();
          // console.log(`checkPreProgrammedMessage:  int:${modality} - id:${idNum} - code:${code} - hash:${hash.slice(-5)}`);
          if (code === hash.slice(-5)) return [modality, idNum];
        }
      }
    }
    return [false, false];
  } catch (error) {
    console.error("Error in checkPreProgrammedMessage:", error);
    return [false, false];
  }
};

/**
 * Obter os IDs dos produtos (Para ser registrados)
 * Obter as seções dos produtos separadas por Categoria
 * @param {Chatbot} chatbot 
 * @returns IDs dos produtos, sessões para construção da listMessage
 */
mf.getProductsIdsAndSections = function (chatbot) {
  const ids = [];
  const sections = [];
  for (let category in chatbot.productList) {
    const products = chatbot.productList[category];
    const rows = [];

    for (let productId in products) {
      const product = products[productId];
      ids.push(`${productId}`);
      rows.push({
        rowId: `${product.id}`,
        title: product.name,
        description: `R$ ${product.price.toFixed(2).replace(".", ",")}`,
      });
    }
    sections.push({
      title: category,
      rows: rows,
    });
  }
  return [ids, sections];
};

/**
 * Para o contexto de adicionais
 * Obter os IDs dos produtos e adicionais (Para ser registrados)
 * Obter as seções dos adicionais separadas por Produto
 * @param {Chatbot} chatbot 
 * @param {Client} client 
 * @returns IDs dos adicionais, IDs das observações, sessões para construção da listMessage
 */
mf.getAdditionalIdsAndSections = function (chatbot, client) {
  try {
    const addIds = [];
    const obsIds = [];
    const sections = [];
    const orderList = chatbot.clientList[client.phoneNumber].chatbot.orderList;

    for (const productId in orderList) {
      const product = chatbot.getProductById(productId);
      const clientProduct = orderList[productId];
      for (let i = 0; i < clientProduct.quantity; i++) {
        const rows = [];
        // console.log('clientProduct.additionalList.length: ', clientProduct.additionalList.length);
        // console.log('product.maxAddQt: ', product.maxAddQt);
        if (product.additionalList?.length && getAdditionalQuantity(clientProduct.additionalList[i]) < product.maxAddQt) {
          const additionalList = product.additionalList[0];
          for (let additionalId in additionalList) {
            const additional = additionalList[additionalId];
            const id = `${productId}:${i}:${additionalId}`;
            addIds.push(id);
            rows.push({
              rowId: id,
              title: additional.name,
              description: `+R$ ${additional.price.toFixed(2).replace(".", ",")}`,
            });
          }
        }
        obsIds.push(`${productId}:${i}:observation`);
        rows.push({
          rowId: `${productId}:${i}:observation`,
          title: `${clientProduct.additionalList?.[i]?.observation ? "Alterar" : "Incluir"} observação`,
          description: 'Ex: "Retirar um ingrediente", "Copo com gelo e limão" ...',
        });
        const num = clientProduct.quantity < 2 ? "" : `${i + 1}º `;
        const qntAdd = product.additionalList?.length ? `(${getAdditionalQuantity(clientProduct.additionalList[i])}/${product.maxAddQt})` : "";
        sections.push({
          title: `Adicionais ${num}${clientProduct.name} ${qntAdd}`,
          rows: rows,
        });
      }
    }

    // console.log("getProductsAdditionalIds ids: ", addIds);
    return [addIds, obsIds, sections];
  } catch (error) {
    console.error("Error in getProductsAdditionalIds: ", error);
  }
};

/**
 * Para o contexto de editar pedido, o qual...
 * Inclui IDs produtos, adicionais e observações
 * @param {*} chatbot 
 * @param {*} client 
 * @returns IDs produtos, adicionais, observações e sessões para construção da listMessage
 */
mf.getProductsAndAdditionalIdsAndSections = function (chatbot, client) {
  try {
    const ids = [];
    const sections = [];
    const orderList = chatbot.clientList[client.phoneNumber].chatbot.orderList;

    for (const productId in orderList) {
      let rows = [];
      const clientProduct = orderList[productId];
      // console.log("clientProduct :", JSON.stringify(clientProduct, null, 2));
      for (let i = 0; i < clientProduct.quantity; i++) {
        rows = [];
        ids.push(`${productId}:${i}`);
        rows.push({
          rowId: `${productId}:${i}`,
          title: `Remover ${clientProduct.name}`,
          description: `R$ ${clientProduct.price.toFixed(2).replace(".", ",")}`,
        });
        if (clientProduct.additionalList?.length) {
          for (let additionalId in clientProduct.additionalList[i]) {
            const additional = clientProduct.additionalList[i][additionalId];
            ids.push(`${productId}:${i}:${additionalId}`);
            rows.push({
              rowId: `${productId}:${i}:${additionalId}`,
              title: `Remover ${additional.name}`,
              description: additionalId === "observation" ? additional.text : `R$ ${additional.price.toFixed(2).replace(".", ",")}`,
            });
          }
        }
        sections.push({
          title: `${clientProduct.name} (${i + 1}º/${clientProduct.quantity})`,
          rows: rows,
        });
      }
    }
    // console.log("getProductsAndAdditionalIdsAndSections:\nids: ", ids, "\nsections: ", sections);
    return [ids, sections];
  } catch (error) {
    console.error("Error in getProductsAndAdditionalIdsAndSections: ", error);
  }
};

/**
 * Transforma a lista de produtos atual do cliente em uma mensagem
 * @param {Client} client 
 * @returns 
 */
mf.getOrderMessage = function (client) {
  let totalPrice = 0.0;
  let message = "";
  const orderList = client.chatbot.orderList;
  
  if (!Object.keys(orderList).length) return message;

  for (const productId in orderList) {
    if (
      orderList[productId].additionalList &&
      orderList[productId].additionalList.length &&
      !orderList[productId].additionalList.every((obj) => Object.keys(obj).length === 0)
    ) {
      for (let i = 0; i < orderList[productId].quantity; i++) {
        message += `\n• ${orderList[productId].name} nº ${i + 1}`;
        totalPrice += orderList[productId].price;
        if (Object.keys(orderList[productId].additionalList[i]).length) {
          for (const additionalId in orderList[productId].additionalList[i]) {
            const additional = orderList[productId].additionalList[i][additionalId];
            // console.log('\x1b[34;1m%s\x1b[0m','additional: ', additional);
            if (additional.name === "Observação") {
              message += "\n   +`Obs: " + additional.text + "`";
            } else {
              message += "\n   +`" + `${additional.name} x${additional.quantity}` + "`";
              totalPrice += additional.price * additional.quantity;
            }
          }
        } else {
          message += "\n   `-tradicional`";
        }
      }
    } else {
      message += `\n• ${orderList[productId].name} x${orderList[productId].quantity}`;
      totalPrice += orderList[productId].price * orderList[productId].quantity;
    }
  }

  message = `Seu pedido: (Total R$ ${totalPrice.toFixed(2).replace(".", ",")})` + message;
  return message;
};

/**
 * Transforma a lista de produtos completa do cliente em uma mensagem
 * Completa: Pedidos que já foram enviados para preparo/entregues
 * @param {Client} client 
 * @returns 
 */
mf.getCompleteOrderMessage = function (client) {
  let totalPrice = 0.0;
  let message = "";
  const orderList = client.chatbot.approvedOrderList;
  // console.log("client.orderList :", JSON.stringify(orderList, null, 2));
  for (const productId in orderList) {
    const product = orderList[productId];
    if (product.additionalList?.length) {
      //&& !product.additionalList.every((obj) => Object.keys(obj).length === 0)) {
      let prodNum = 1;
      for (let orderNum = 0; orderNum < product.additionalList.length; orderNum++) {
        // message += product.additionalList.length>1 ? `\n Pedido nº ${orderNum + 1} :` : '';
        for (let i = 0; i < product.additionalList[orderNum].length; i++) {
          message += `\n• ${product.name} nº${prodNum++} R$ ${product.price.toFixed(2).replace(".", ",")}`;
          totalPrice += product.price;
          if (Object.keys(product.additionalList[orderNum][i]).length) {
            for (const additionalId in product.additionalList[orderNum][i]) {
              const additional = product.additionalList[orderNum][i][additionalId];
              // console.log("\x1b[34;1m%s\x1b[0m", "additional: ", additional);
              if (additional.name === "Observação") {
                message += "\n   +`Obs: " + additional.text + "`";
              } else {
                message +=
                  "\n   +`" +
                  `${additional.name} x${additional.quantity} +${(additional.price * additional.quantity).toFixed(2).replace(".", ",")}` +
                  "`";
                totalPrice += additional.price * additional.quantity;
              }
            }
          } else {
            message += "\n   `tradicional`";
          }
        }
      }
    } else {
      const price = product.price;
      const qnt = product.quantity;
      message += `\n• ${product.name} x${qnt} R$ ${(price * qnt).toFixed(2).replace(".", ",")}`;
      totalPrice += price * qnt;
    }
  }
  client.chatbot.totalPrice = totalPrice;
  message = `Seu pedido: (Total R$ ${totalPrice.toFixed(2).replace(".", ",")})` + message;
  return message;
};

/**
 * Enviar mensagem de produtos recorrentes após o tempo configurado
 * @param {Chatbot} chatbot 
 * @param {Client} client 
 */
mf.recurrentTimeOut = function (chatbot, client) {
  if (!client.chatbot.timeouts["recurrent"].trigged) {
    setTimeout(() => {
      if (client.chatbot.context === "finalizar-pedido") {
        chatbot.sendContextMessage("recorrente", client);
      }
    }, client.chatbot.timeouts["recurrent"].time);
  }
};

/**
 * Obter quantos adicionais foram incluidos
 * @param {Object<Additional>} additionalList 
 * @returns 
 */
function getAdditionalQuantity(additionalList) {
  let quantity = 0;
  for (const additionalId in additionalList) {
    const additional = additionalList[additionalId];
    if (additional.quantity) {
      quantity += additional.quantity;
    }
  }
  return quantity;
}
