import CryptoJS from "crypto-js";

const mf = {};
export default mf;

mf.buildSection = function (chatbot, title, sectionsName, args = {}) {
  try {
    const sectionMappings = {
      cardapio: {
        rowId: "cardapio",
        title: "Ver cardápio 🍔",
        description: "Monte seu pedido",
      },
      "voltar-cardapio": {
        rowId: "cardapio",
        title: "Voltar ao cardápio 🍔",
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
      "solicitar-fechamento": {
        rowId: "solicitar-fechamento",
        title: "Fechar conta e pagar 🧾",
        description: "",
      },
    };

    if (sectionsName.includes("recorrente")) {
      const approvedOrderList = args.client.approvedOrderList;
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
      if (rows.length) {
        sectionMappings["recorrente"] = rows;
      } else {
        sectionsName.push("incluir-recomendado");
      }
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

mf.checkMessageIDCode = function (currentMessage) {
  try {
    if (typeof currentMessage === "string") {
      const info = currentMessage.replace(/\s/g, "").split("#");
      // console.log('info: ', info);
      if (info.length > 1) {
        const [modality, idNum] = info[info.length - 2].split(":");
        const [, code] = info[info.length - 1].split(":");
        if (modality && idNum && code) {
          const hash = CryptoJS.MD5(idNum).toString();
          // console.log(`checkMessageIDCode:  int:${modality} - id:${idNum} - code:${code} - hash:${hash.slice(-5)}`);
          if (code === hash.slice(-5)) return [modality, idNum];
        }
      }
    }
    return [false, false];
  } catch (error) {
    console.error("Error in checkMessageIDCode:", error);
    return [false, false];
  }
};

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

mf.getAdditionalIdsAndSections = function (chatbot, client) {
  try {
    const addIds = [];
    const obsIds = [];
    const sections = [];
    const orderList = chatbot.clientList[client.phoneNumber].orderList;

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
        const num = clientProduct.quantity < 2 ? "" : `${i + 1}º`;
        const qntAdd = product.additionalList?.length ? `${getAdditionalQuantity(clientProduct.additionalList[i])}/${product.maxAddQt}` : "";
        sections.push({
          title: `Adicionais ${num} ${clientProduct.name} (${qntAdd})`,
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

mf.getProductsAndAdditionalIdsAndSections = function (chatbot, client) {
  try {
    const ids = [];
    const sections = [];
    const orderList = chatbot.clientList[client.phoneNumber].orderList;

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

mf.getOrderMessage = function (client) {
  let totalPrice = 0.0;
  let message = "";
  const orderList = client.orderList;
  // console.log("client.orderList :", JSON.stringify(client.orderList, null, 2));
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
          message += "\n   `tradicional`";
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

mf.getCompleteOrderMessage = function (client) {
  let totalPrice = 0.0;
  let message = "";
  const orderList = client.approvedOrderList;
  console.log("client.orderList :", JSON.stringify(orderList, null, 2));
  for (const productId in orderList) {
    if (
      orderList[productId].additionalList?.length &&
      !orderList[productId].additionalList.every((obj) => Object.keys(obj).length === 0)
    ) {
      for (let i = 0; i < orderList[productId].quantity; i++) {
        message += `\n• ${orderList[productId].name} nº ${i + 1} (R$ ${orderList[productId].price.toFixed(2).replace(".", ",")})`;
        totalPrice += orderList[productId].price;
        if (Object.keys(orderList[productId].additionalList[i]).length) {
          for (const additionalId in orderList[productId].additionalList[i]) {
            const additional = orderList[productId].additionalList[i][additionalId];
            // console.log('\x1b[34;1m%s\x1b[0m','additional: ', additional);
            if (additional.name === "Observação") {
              message += "\n   +`Obs: " + additional.text + "`";
            } else {
              message +=
                "\n   +`" +
                `${additional.name} x${additional.quantity} (R$ ${(additional.price * additional.quantity).toFixed(2).replace(".", ",")})` +
                "`";
              totalPrice += additional.price * additional.quantity;
            }
          }
        } else {
          message += "\n   `tradicional`";
        }
      }
    } else {
      const price = orderList[productId].price;
      const qnt = orderList[productId].quantity;
      message += `\n• ${orderList[productId].name} x${qnt} (R$ ${(price * qnt).toFixed(2).replace(".", ",")})`;
      totalPrice += price * qnt;
    }
  }
  message = `Seu pedido: (Total R$ ${totalPrice.toFixed(2).replace(".", ",")})` + message;
  return message;
};

mf.getLastValidContext = function (messageHistory) {
  for (let i = messageHistory.length - 1; i >= 0; i--) {
    const message = messageHistory[i].split("&&")[0];
    if (!["atendente", "garcom"].includes(message)) {
      return message;
    }
  }
  throw new Error("Error in getLastValidContext: No valid context found!");
};

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