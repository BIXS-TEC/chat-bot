export default class Client {
  constructor(id, name, phoneNumber, platform, chatbot, context = "nenhum") {
    this.id = id;
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.platform = platform;
    this.chatbot = chatbot;
    this.chatbot.context = context;
    this.messageHistory = [`${context}&&${chatbot.currentMessage}`];
    this.orderList = {};
    this.humanChating = false;
    this.messageIds = {saveResponse: ""};
  }

  updateClientData(client) {
    console.log("updateClientData client: ", JSON.stringify(client));
    this.platform = client.platform;
    Object.assign(this.chatbot, client.chatbot);
    const itemId = client.chatbot.itemId;
    this.messageHistory.push(`${this.chatbot.context}&&${itemId ? itemId : client.chatbot.currentMessage}`);
    console.log("\x1b[32m%s\x1b[0m", `\nDados cliente '${client.phoneNumber}' alterado!`);
  }

  addProductToOrderList(product, quantity = 1) {
    if (!this.orderList[product.id]) {
      const { additionalList, ...noAddProduct } = { ...product };
      this.orderList[product.id] = noAddProduct;
      this.orderList[product.id].quantity = quantity;
    } else {
      this.orderList[product.id].quantity += quantity;
    }
  }

  addAdditionalToOrderList(productId, additional, index, quantity = 1) {
    const product = this.orderList[productId];
    if (!product.additionalList) product.additionalList = [];
    if (!product.additionalList[index]) product.additionalList[index] = {};
    if (!product.additionalList[index][additional.id]) {
      product.additionalList[index][additional.id] = { ...additional };
      product.additionalList[index][additional.id].quantity = quantity;
    } else {
      product.additionalList[index][additional.id].quantity += quantity;
    }
    console.log("addAdditionalToOrderList orderList:", JSON.stringify(this.orderList, null, 2));
  }

  removeFromOrderList(productId, index, additionalId) {
    console.log("this.orderList: ", JSON.stringify(this.orderList, null, 2));
    if (additionalId === undefined) {
      this.orderList[productId].quantity -= 1;
      if (this.orderList[productId].additionalList) this.orderList[productId].additionalList.splice(index, 1);
      if (this.orderList[productId].quantity === 0) {
        delete this.orderList[productId];
      }
    } else {
      console.log("additionalList[index][additionalId]: ", JSON.stringify(this.orderList[productId].additionalList[index][additionalId], null, 2));
      delete this.orderList[productId].additionalList[index][additionalId];
      this.orderList[productId].additionalList.splice(index, 1);
    }
    console.log("this.orderList: ", JSON.stringify(this.orderList, null, 2));
  }

  getOrderMessage() {
    let message = "Seu pedido:";
    const orderList = this.orderList;
    console.log("this.orderList :", JSON.stringify(this.orderList, null, 2));
    for (const productId in orderList) {
      if (orderList[productId].additionalList) {
        for (let i = 0; i < orderList[productId].quantity; i++) {
          message += `\n• ${orderList[productId].name} nº ${i + 1}`;
          if (orderList[productId].additionalList[i]) {
            for (const additionalId in orderList[productId].additionalList[i]) {
              const additional = orderList[productId].additionalList[i][additionalId];
              message += "\n> +`" + `${additional.name} x${additional.quantity}` + "`";
            }
          } else {
            message += "\n> `tradicional`";
          }
        }
      } else {
        message += `\n• ${orderList[productId].name} x${orderList[productId].quantity}`;
      }
    }
    return message;
  }

  saveResponse(responseList) {
    try {
      if (this.messageIds.saveResponse) {
        const idList = [];
        for (let response of responseList) {
          console.log("SaveResponse: ", response.id);
          idList.push(response.id);
        }
        this.messageIds[this.messageIds.saveResponse] = idList;
        this.messageIds.saveResponse = "";
        console.log("this.messageIds: ", this.messageIds);
      }
    } catch (error) {
      throw new Error("Error in saveResponse: ", error);
    }
  }

  saveLastChatbotMessage(responseObjects) {
    if (this.chatbot.context !== "invalido") {
      this.chatbot.lastChatbotMessage = responseObjects[0];
      console.log('saveLastChatbotMessage: ', responseObjects);
    }
  }

  changeContext(context) {
    try {
      if (typeof context === "string") this.chatbot.context = context;
      else throw new Error("Nome do context deve ser uma string");
    } catch (error) {
      console.log("Erro em changeContext da classe Client", error);
    }
  }

  setHumanChat(isChating) {
    this.humanChating = isChating;
  }

  async sendClientOrder() {
    return new Promise((resolve, reject) => {
      try {
        console.log('\x1b[32;1m%s\x1b[0m', `Pedido de [${this.phoneNumber}] enviado para o banco:`);
        console.log('\x1b[34;1m%s\x1b[0m', JSON.stringify(this.orderList));
        resolve(true);
      } catch (error) {
        console.log("Error in sendClientOrder: ", error);
        reject(error);
      }
    });
  }
}
