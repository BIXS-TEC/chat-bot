import Client from "./client.js";
import { MessageSender } from "./sender.js";

const verbose = true;

export default class Chatbot {
  constructor(id, businessName, phoneNumber, clientList, productList, contextList) {
    this.id = id;
    this.businessName = businessName;
    this.phoneNumber = phoneNumber;
    this.clientList = clientList;
    this.productList = productList;
    this.contextList = contextList;
    this.botName = "Assistente Virtual";
    this.MessageSender = new MessageSender();

    this.clientList[this.phoneNumber] = new Client(
      0,
      this.businessName,
      this.phoneNumber,
      "wppconnect",
      {
        currentMessage: "start",
        messageType: "chat",
        interaction: "adicionais",
        chatbotPhoneNumber: this.phoneNumber,
      },
      "adm"
    );

    if (verbose) console.log("\x1b[32m%s\x1b[0m", `\nChatbot '${this.businessName}:${this.phoneNumber}' iniciado!`);
  }

  /**
   *  {
        "id": "id",
        "name": "Client Name",
        "phoneNumber": "55DD########",
        "platform": "plataformName",
        "chatbot": {
          "currentMessage": "text",
          "interaction": "interaction title",
          "chatbotPhoneNumber": "55DD########"
        }
      }
   * 
   * @param {*} Sender 
   * @param {*} client 
   * @returns 
   */
  async handleProductAdditionalFlow(client) {
    console.log("\x1b[35m%s\x1b[0m", `Cliente padronizado: [${JSON.stringify(client, null, 2)}]`);
    if (!this.clientList[client.phoneNumber]) {
      this.addClientToList(client);
    } else {
      this.clientList[client.phoneNumber].updateClientData(client);
    }
    console.log("\x1b[36m%s\x1b[0m", `Cliente padronizado: [${client.platform}] ${JSON.stringify(this.clientList[client.phoneNumber], null, 2)}`);

    const matchedContextName = this.findBestContext(this.clientList[client.phoneNumber]);

    return new Promise((resolve, reject) => {
      this.contextList[matchedContextName]
        .runContext(this, this.clientList[client.phoneNumber])
        .then((message) => {
          console.log("Context message data: \n", JSON.stringify(message, null, 2));
          if (this.clientList[client.phoneNumber].humanChating) {
            resolve(null);
          } else {
            this.MessageSender.sendMessage(message)
              .then((responseList) => {
                console.log("responseList: ", responseList);
                this.clientList[client.phoneNumber].saveResponse(responseList);
                resolve(message);
              })
              .catch((error) => {
                console.log("Erro em sendMessage: ", error);
                reject(error);
              });
          }
        })
        .catch((error) => {
          console.log("Erro em runContext: ", error);
          reject(error);
        });
    });
  }

  findBestContext(client) {
    const matchedContext = [];

    try {
      /* Procura quais contextos aceitam o contexto atual (ultima mensagem) do cliente */
      for (const contextName in this.contextList) {
        if (this.contextList[contextName].previousContexts.includes(client.chatbot.context)) {
          matchedContext.push(this.contextList[contextName]);
        }
      }

      if (matchedContext.length === 0)
        throw new Error("\x1b[35m%s\x1b[0m", `Nenhum contexto esta configurado para suceder o contexto ${client.context}`);

      /* Exclui contextos da lista que não possuem a mensagem atual do cliente como keyword */
      /* Pelo menos um contexto é mantido */
      const keyword = (() => {
        switch (client.chatbot.messageType) {
          case "chat":
            return client.chatbot.currentMessage;
          case "list_response":
            return client.chatbot.itemId;
          default:
            break;
        }
      })();
      console.log("keyword: ", keyword, "----", client.chatbot.messageType);

      console.log("matchedContext: ", matchedContext);
      for (let i = matchedContext.length - 1; i >= 0; i--) {
        if (matchedContext.length > 1 && !matchedContext[i].activationKeywords.includes(keyword)) {
          console.log(matchedContext[i].name, " removido!");
          matchedContext.splice(i, 1);
        }
      }

      /* Contextos adicionados primeiro a matchedContext tem prioridade */
      this.clientList[client.phoneNumber].context = matchedContext[0].name;
      console.log("\x1b[36m%s\x1b[0m", "\nMatched context: ", matchedContext[0].name);

      return matchedContext[0].name;
    } catch (error) {
      console.log("Error in findBestContext function", error);
    }
  }

  getSectionProductList() {
    const sections = [];
    for (let category in this.productList) {
      const products = this.productList[category];
      const rows = [];

      for (let productId in products) {
        const product = products[productId];
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
    return sections;
  }

  getProductIds() {
    const ids = [];

    for (const category in this.productList) {
      for (const productId in this.productList[category]) {
        ids.push(`${this.productList[category][productId].id}`);
      }
    }
    return ids;
  }

  getProductById(id) {
    for (let category in this.productList) {
      if (id in this.productList[category]) {
        return this.productList[category][id];
      }
    }
    return null;
  }

  addClientToList(client) {
    //incluir verificação de objeto
    try {
      if (!this.clientList[client.phoneNumber] && verbose) console.log("\x1b[32m%s\x1b[0m", `\nCliente '${client.phoneNumber}' adicionado!`);
      else if (this.clientList[client.phoneNumber] && verbose) console.log("\x1b[32m%s\x1b[0m", `\nCliente '${client.phoneNumber}' alterado!`);
      this.clientList[client.phoneNumber] = new Client(client.id, client.name, client.phoneNumber, client.platform, client.chatbot);
      return true;
    } catch (error) {
      console.log("Error on addClientToList function", error);
    }
  }

  getClientList() {
    if (verbose) console.log(`\nClientes de ${this.name}:\n${JSON.stringify(this.clientList, null, 2)}`);
    return this.clientList;
  }

  removeClient(phoneNumber) {
    delete this.clientList[phoneNumber];
    if (verbose) console.log(`\nCliente removido: ${phoneNumber}`);
  }
}
