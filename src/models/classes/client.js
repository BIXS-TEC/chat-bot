export default class Client {
  constructor(id, name, phoneNumber, platform, chatbot, context = "nenhum") {
    this.id = id;
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.platform = platform;
    this.chatbot = chatbot;
    // this.chatbot.chatbotPhoneNumber = chatbotPhoneNumber;
    this.chatbot.context = context;
    this.messageHistory = [`${chatbot.currentMessage}`];
    this.orderList = {};
    this.humanChating = false;
    this.messageIds = {};
    this.messageIds.saveResponse = "";
  }

  addProductToOrderList(product) {
    if (!this.orderList[product.id]) {
      this.orderList[product.id] = product;
      this.orderList[product.id].quantity = 1;
    } else {
      this.orderList[product.id].quantity += 1;
    }
  }

  updateClientData(client) {
    this.platform = client.platform;
    Object.assign(this.chatbot, client.chatbot);
    this.messageHistory.push(client.chatbot.currentMessage);
    console.log("\x1b[32m%s\x1b[0m", `\nDados cliente '${client.phoneNumber}' alterado!`);
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
        console.log('this.messageIds: ', this.messageIds);
      }
    } catch (error) {
      throw new Error("Error in saveResponse: ", error);
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

  whoIsThere() {
    console.log(`Hello, im ${this.name}\nMy phone number is ${this.phoneNumber}`);
    return this.name;
  }
}
