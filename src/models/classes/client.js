export default class Client {
  constructor({ id, name, phoneNumber, platform, chatbot, context = "nenhum", humanChating = false }) {
    this.id = id;
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.platform = platform;
    this.chatbot = chatbot;
    this.chatbot.context = context;
    this.messageHistory = [`${context}&&${chatbot.currentMessage}`];
    this.orderList = {};
    this.approvedOrderList = {};
    this.humanChating = humanChating;
    this.messageIds = { saveResponse: "" };
  }

  updateClientData(client) {
    // console.log("updateClientData client: ", JSON.stringify(client));
    this.platform = client.platform;
    Object.assign(this.chatbot, client.chatbot);
    const itemId = client.chatbot.itemId;
    this.messageHistory.push(`${this.chatbot.context}&&${itemId ? itemId : client.chatbot.currentMessage}`);
    console.log("\x1b[32m%s\x1b[0m", `\nDados cliente '${client.phoneNumber}' alterado!`);
  }

  addProductToOrderList(product, quantity = 1) {
    const clientProduct = this.orderList[product.id];
    if (!clientProduct) {
      const { additionalList, ...noAddProduct } = { ...product };
      if (additionalList && additionalList.length) {
        noAddProduct.additionalList = [];
        for (let i = 0; i < quantity; i++) noAddProduct.additionalList.push({});
      }
      this.orderList[product.id] = noAddProduct;
      this.orderList[product.id].quantity = quantity;
    } else {
      this.orderList[product.id].quantity += quantity;
      if (clientProduct.additionalList && clientProduct.additionalList.length) {
        for (let i = 0; i < quantity; i++) this.orderList[product.id].additionalList.push({});
      }
    }
  }

  addAdditionalToOrderList(productId, additional, index, quantity = 1) {
    const product = this.orderList[productId];
    // if (!product.additionalList) product.additionalList = [];
    // if (!product.additionalList[index]) product.additionalList[index] = {};
    if (!product.additionalList[index][additional.id]) {
      product.additionalList[index][additional.id] = { ...additional };
      product.additionalList[index][additional.id].quantity = quantity;
    } else {
      product.additionalList[index][additional.id].quantity += quantity;
    }
    // console.log("addAdditionalToOrderList orderList:", JSON.stringify(this.orderList, null, 2));
  }

  removeFromOrderList(productId, index, additionalId) {
    console.log("this.orderList: ", JSON.stringify(this.orderList, null, 2));
    console.log(`productId: ${productId}, index: ${index}, additionalId: ${additionalId}`);
    const clientProduct = this.orderList[productId];
    if (additionalId === undefined) {
      this.orderList[productId].quantity -= 1;
      if (clientProduct.additionalList?.length) this.orderList[productId].additionalList.splice(index, 1);
      if (clientProduct.quantity === 0) delete this.orderList[productId];
    } else {
      // console.log("additionalList[index][additionalId]: ", JSON.stringify(this.orderList[productId].additionalList[index][additionalId], null, 2));
      if (clientProduct.additionalList[index][additionalId].quantity) {
        this.orderList[productId].additionalList[index][additionalId].quantity -= 1;
        if (clientProduct.additionalList[index][additionalId].quantity === 0) {
          delete this.orderList[productId].additionalList[index][additionalId];
          // this.orderList[productId].additionalList.splice(index, 1);
        }
      } else {
        // Para observações
        delete this.orderList[productId].additionalList[index][additionalId];
      }
    }
    // console.log("this.orderList: ", JSON.stringify(this.orderList, null, 2));
  }

  saveResponse(responseList) {
    try {
      if (this.messageIds.saveResponse) {
        const idList = [];
        for (let response of responseList) {
          // console.log("SaveResponse: ", response.id);
          idList.push(response.id);
        }
        this.messageIds[this.messageIds.saveResponse] = idList;
        this.messageIds.saveResponse = "";
        // console.log("this.messageIds: ", this.messageIds);
      }
    } catch (error) {
      throw new Error("Error in saveResponse: ", error);
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

  setHumanChat(isChating) {
    this.humanChating = isChating;
  }
}
