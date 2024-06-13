export default class Client {
  constructor({ id, name, phoneNumber, platform, chatbot}) {
    this.id = id;
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.platform = platform;
    this.chatbot = chatbot;
  }

  updateClientData(client) {
    // console.log("updateClientData client: ", JSON.stringify(client));
    this.platform = client.platform;
    Object.assign(this.chatbot, client.chatbot);
    const itemId = client.chatbot.itemId;
    // console.log('\x1b[32mthis.chatbot.messageHistory:', JSON.stringify(this.chatbot));
    this.chatbot.messageHistory?.push(`${this.chatbot.context}&&${itemId ? itemId : client.chatbot.currentMessage}`);
    console.log(`\x1b[32m\nDados cliente '${client.phoneNumber}' alterado!`);
  }

  addProductToOrderList(product, quantity = 1) {
    const clientProduct = this.chatbot.orderList[product.id];
    if (!clientProduct) {
      const { additionalList, ...noAddProduct } = { ...product };
      if (additionalList && additionalList.length) {
        noAddProduct.additionalList = [];
        for (let i = 0; i < quantity; i++) noAddProduct.additionalList.push({});
      }
      this.chatbot.orderList[product.id] = noAddProduct;
      this.chatbot.orderList[product.id].quantity = quantity;
    } else {
      this.chatbot.orderList[product.id].quantity += quantity;
      if (clientProduct.additionalList && clientProduct.additionalList.length) {
        for (let i = 0; i < quantity; i++) this.chatbot.orderList[product.id].additionalList.push({});
      }
    }
  }

  addAdditionalToOrderList(productId, additional, index, quantity = 1) {
    const product = this.chatbot.orderList[productId];
    // if (!product.additionalList) product.additionalList = [];
    // if (!product.additionalList[index]) product.additionalList[index] = {};
    if (!product.additionalList[index][additional.id]) {
      product.additionalList[index][additional.id] = { ...additional };
      product.additionalList[index][additional.id].quantity = quantity;
    } else {
      product.additionalList[index][additional.id].quantity += quantity;
    }
    // console.log("addAdditionalToOrderList orderList:", JSON.stringify(this.chatbot.orderList, null, 2));
  }

  removeFromOrderList(productId, index, additionalId) {
    console.log("this.chatbot.orderList: ", JSON.stringify(this.chatbot.orderList, null, 2));
    console.log(`productId: ${productId}, index: ${index}, additionalId: ${additionalId}`);
    const clientProduct = this.chatbot.orderList[productId];
    if (additionalId === undefined) {
      this.chatbot.orderList[productId].quantity -= 1;
      if (clientProduct.additionalList?.length) this.chatbot.orderList[productId].additionalList.splice(index, 1);
      if (clientProduct.quantity === 0) delete this.chatbot.orderList[productId];
    } else {
      // console.log("additionalList[index][additionalId]: ", JSON.stringify(this.chatbot.orderList[productId].additionalList[index][additionalId], null, 2));
      if (clientProduct.additionalList[index][additionalId].quantity) {
        this.chatbot.orderList[productId].additionalList[index][additionalId].quantity -= 1;
        if (clientProduct.additionalList[index][additionalId].quantity === 0) {
          delete this.chatbot.orderList[productId].additionalList[index][additionalId];
          // this.chatbot.orderList[productId].additionalList.splice(index, 1);
        }
      } else {
        // Para observações
        delete this.chatbot.orderList[productId].additionalList[index][additionalId];
      }
    }
    // console.log("this.chatbot.orderList: ", JSON.stringify(this.chatbot.orderList, null, 2));
  }

  saveResponse(responseList) {
    try {
      if (this.chatbot.messageIds?.saveResponse) {
        const idList = [];
        for (let response of responseList) {
          // console.log("SaveResponse: ", response.id);
          idList.push(response.id);
        }
        this.chatbot.messageIds[this.chatbot.messageIds.saveResponse] = idList;
        this.chatbot.messageIds.saveResponse = "";
        // console.log("this.chatbot.messageIds: ", this.chatbot.messageIds);
      }
    } catch (error) {
      console.error("Error in saveResponse: ", error);
    }
  }

  saveLastChatbotMessage(responseObjects) {
    if (!responseObjects) return;
    const saveResponse = responseObjects.filter((response) => !response.dontSave);
    if (saveResponse.length) this.chatbot.lastChatbotMessage = saveResponse;
  }

  changeContext(context) {
    try {
      if (typeof context === "string") this.chatbot.context = context;
      else throw new Error("Nome do context deve ser uma string");
    } catch (error) {
      console.error("Erro em changeContext da classe Client", error);
    }
  }

  getLastValidContext() {
    for (let i = this.chatbot.messageHistory.length - 1; i >= 0; i--) {
      const message = this.chatbot.messageHistory[i].split("&&")[0];
      if (!["atendente", "garcom", "voltar-chatbot"].includes(message)) {
        return message;
      }
    }
    throw new Error("Error in getLastValidContext: No valid context found!");
  };
}
