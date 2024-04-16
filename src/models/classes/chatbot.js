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

    this.contextList["faq"].previousContexts = this.getAllContextNames();
    this.contextList["atendente"].previousContexts = this.getAllContextNames();
    this.contextList["invalido"].previousContexts = this.getAllContextNames();
    console.log('this.contextList["invalido"].previousContexts :', this.contextList["invalido"].previousContexts);

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
          if (this.clientList[client.phoneNumber].humanChating) {
            resolve(null);
          } else {
            this.MessageSender.sendMessage(message)
              .then((responseList) => {
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
          console.log("Erro ao processar contexto: ", error);
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

      console.log(matchedContext.map((context) => context.name));
      const matchedContextCopy = [...matchedContext];

      for (const context of matchedContextCopy) {
        if (matchedContext.length > 1 && !context.activationKeywords.includes(keyword)) {
          matchedContext.splice(matchedContext.indexOf(context), 1);
        }
      }

      /* Contextos adicionados primeiro a contextList tem prioridade */
      this.clientList[client.phoneNumber].context = matchedContext[0].name;
      console.log("\x1b[36m%s\x1b[0m", "\nMatched context: ", matchedContext[0].name);

      return matchedContext[0].name;
    } catch (error) {
      console.log("Error in findBestContext function", error);
    }
  }

  getProductById(id) {
    for (let category in this.productList) {
      if (id in this.productList[category]) {
        return this.productList[category][id];
      }
    }
    throw new Error("Error em getProductById. Produto não encontrado!\n", error);
  }

  getProductsIdsAndSections() {
    const ids = [];
    const sections = [];
    for (let category in this.productList) {
      const products = this.productList[category];
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
  }

  getAdditionalIdsAndSections(client) {
    try {
      const ids = [];
      const sections = [];
      const orderList = this.clientList[client.phoneNumber].orderList;

      for (const productId in orderList) {
        const product = this.getProductById(productId);
        if (product.additionalList && product.additionalList.length) {
          const additionalList = product.additionalList[0];
          console.log("additionalList: ", additionalList);
          const clientProduct = orderList[productId];
          console.log("clientProduct: ", clientProduct);
          for (let i = 0; i < clientProduct.quantity; i++) {
            const rows = [];
            for (let additionalId in additionalList) {
              const additional = additionalList[additionalId];
              console.log("additionalId: ", additionalId);
              ids.push(`${productId}:${i}:${additionalId}`);
              rows.push({
                rowId: `${productId}:${i}:${additionalId}`,
                title: additional.name,
                description: `+R$ ${additional.price.toFixed(2).replace(".", ",")}`,
              });
            }
            sections.push({
              title: `${clientProduct.name} nº ${i + 1}`,
              rows: rows,
            });
          }
        }
      }

      if (sections.length === 0) {
        sections.push({
          title: `Não há adicionais para os itens do seu pedido`,
          rows: [
            {
              rowId: "cardapio",
              title: "Ver cardápio 🍔",
              description: "Volte ao cardápio para adicionar mais itens em seu pedido!",
            },
          ],
        });
      }

      console.log("getProductsAdditionalIds ids: ", ids);
      return [ids, sections];
    } catch (error) {
      console.error("Error in getProductsAdditionalIds: ", error);
    }
  }

  getProductsAndAdditionalIdsAndSections(client) {
    try {
      const ids = [];
      const sections = [];
      const orderList = this.clientList[client.phoneNumber].orderList;

      for (const productId in orderList) {
        let rows = [];
        const clientProduct = orderList[productId];
        console.log("clientProduct :", JSON.stringify(clientProduct, null, 2));
        for (let i = 0; i < clientProduct.quantity; i++) {
          rows = [];
          ids.push(`${productId}:${i}`);
          rows.push({
            rowId: `${productId}:${i}`,
            title: clientProduct.name,
            description: `R$ ${clientProduct.price.toFixed(2).replace(".", ",")}`,
          });
          if (clientProduct.additionalList && clientProduct.additionalList.length) {
            for (let additionalId in clientProduct.additionalList[i]) {
              const additional = clientProduct.additionalList[i][additionalId];
              ids.push(`${productId}:${i}:${additionalId}`);
              rows.push({
                rowId: `${productId}:${i}:${additionalId}`,
                title: additional.name,
                description: `R$ ${additional.price.toFixed(2).replace(".", ",")}`,
              });
            }
          }
          sections.push({
            title: `${clientProduct.name} nº ${i + 1}`,
            rows: rows,
          });
        }
      }
      console.log("getProductsAndAdditionalIdsAndSections:\nids: ", ids, "\nsections: ", sections);
      return [ids, sections];
    } catch (error) {
      console.error("Error in getProductsAndAdditionalIdsAndSections: ", error);
    }
  }

  getRecommendedProduct() {
    return this.productList["Bebidas"][4];
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

  getAllContextNames() {
    const contextNames = [];
    for (const contextName in this.contextList) {
      contextNames.push(`${contextName}`);
    }
    return contextNames;
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
