import order from "../../interfaces/wa-order.js";
import context from "../data/contexts/index.js";
import group from "../data/groups.js";
import sender from "./sender.js";
import Client from "./client.js";

const verbose = true;

export default class Chatbot {
  constructor(id, businessName, phoneNumber, url, clientList, productList, groupList) {
    this.id = id;
    this.businessName = businessName;
    this.phoneNumber = phoneNumber;
    this.botName = "Assistente Virtual";

    this.config = {
      flow: ["WhatsApp"], // Opções: ['WhatsApp', 'PrintWeb']
      modality: ["Mesa"], // Opções: ['Mesa', 'Comanda']
      serviceOptions: {
        atendente: true,
        garcom: true,
        faq: true,
      },
      groupNames: ["Cozinha", "Bar", "Garçom", "Atendente"],
      url: {
        faq: url.faq,
        cardapio: url.cardapio,
      },
    };

    this.identifiers = Array.from({ length: 1000 }, (_, index) => String(index));

    this.clientList = clientList;
    this.productList = productList;
    this.contextList = context.getContextList(this);

    group.initializeGroupList(this);

    this.clientList[this.phoneNumber] = new Client({
      id: 0,
      name: this.businessName,
      phoneNumber: this.phoneNumber,
      platform: "wppconnect",
      context: "admin",
      humanChating: true,
      chatbot: {
        currentMessage: "start",
        messageType: "chat",
        interaction: "adicionais",
        chatbotPhoneNumber: this.phoneNumber,
      },
    });

    if (verbose) console.log("\x1b[32m%s\x1b[0m", `\nChatbot '${this.businessName}:${this.phoneNumber}' iniciado!`);
  }

  async handleAdminCommand(client) {
    return new Promise((resolve, reject) => {
      try {
        // console.log("handleAdminCommand client:", client);
        this.clientList[this.phoneNumber].updateClientData(client);

        if (client.chatbot.messageTo === this.phoneNumber) {
          console.log("\x1b[31m%s\x1b[0m", "Admin command not implemented yet");
          resolve();
        } else {
          const command = this.contextList["admin"][client.chatbot.currentMessage];
          if (command) {
            command
              .runContext(this.clientList[client.chatbot.messageTo])
              .then((response) => {
                this.clientList[client.phoneNumber].saveLastChatbotMessage(response.responseObjects);
                sender
                  .sendMessage(response)
                  .then((requestResponseList) => {
                    this.clientList[client.phoneNumber].saveResponse(requestResponseList);
                    console.log("\x1b[36m%s\x1b[0m", `Cliente: [${client.platform}] ${JSON.stringify(this.clientList[client.phoneNumber])}`);
                    resolve(response);
                  })
                  .catch((error) => {
                    console.log("Erro em sendMessage: ", error);
                    reject(error);
                  });
              })
              .catch((error) => {
                console.log("Erro ao processar contexto: ", error);
                reject(error);
              });
          }
        }
      } catch (error) {
        console.error("Error in handleAdminCommand:", error);
        return error;
      }
    });
  }

  async handleOrderMenuFlow(client) {
    if (!this.clientList[client.phoneNumber]) {
      this.addClientToList(client);
    } else {
      this.clientList[client.phoneNumber].updateClientData(client);
    }

    const matchedContextName = this.findBestContext(this.clientList[client.phoneNumber]);

    // console.log("interaction: ", client.chatbot.interaction);
    return new Promise((resolve, reject) => {
      this.contextList[client.chatbot.interaction][matchedContextName]
        .runContext(this.clientList[client.phoneNumber])
        .then((response) => {
          this.clientList[client.phoneNumber].saveLastChatbotMessage(response.responseObjects);
          sender
            .sendMessage(response)
            .then((requestResponseList) => {
              this.clientList[client.phoneNumber].saveResponse(requestResponseList);
              console.log("\x1b[36m%s\x1b[0m", `Cliente: [${client.platform}] ${JSON.stringify(this.clientList[client.phoneNumber])}`);
              resolve(response);
            })
            .catch((error) => {
              console.log("Erro em sendMessage: ", error);
              reject(error);
            });
        })
        .catch((error) => {
          console.log("Erro ao processar contexto: ", error);
          reject(error);
        });
    });
  }

  findBestContext(client) {
    const matchedContext = [];
    const interaction = client.chatbot.interaction;

    try {
      /* Procura quais contextos aceitam o contexto atual (ultima mensagem) do cliente */
      for (const contextName in this.contextList[interaction]) {
        if (this.contextList[interaction][contextName].previousContexts.includes(client.chatbot.context)) {
          matchedContext.push(this.contextList[interaction][contextName]);
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
      console.log("keyword: ", keyword, "; messageType: ", client.chatbot.messageType);
      console.log(
        "matchedContexts: ",
        matchedContext.map((context) => context.name)
      );

      const matchedContextCopy = [...matchedContext];
      for (const context of matchedContextCopy) {
        if (
          matchedContext.length > 1 &&
          !context.activationKeywords.includes(keyword) &&
          !(context.activationRegex && context.activationRegex.test(keyword))
        ) {
          matchedContext.splice(matchedContext.indexOf(context), 1);
        }
      }

      /* Contextos adicionados primeiro a contextList tem prioridade */
      this.clientList[client.phoneNumber].context = matchedContext[0].name;
      console.log("\x1b[36m%s\x1b[0m", "\nMatched context: ", matchedContext[0].name);
      console.log("\x1b[36m%s\x1b[0m", "\nActivations keywords: ", matchedContext[0].activationKeywords);

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

  getRecommendedProduct() {
    return this.productList["Bebidas"][4];
  }

  addClientToList(client) {
    //incluir verificação de objeto
    try {
      if (!this.clientList[client.phoneNumber] && verbose) console.log("\x1b[32m%s\x1b[0m", `\nCliente '${client.phoneNumber}' adicionado!`);
      else if (this.clientList[client.phoneNumber] && verbose) console.log("\x1b[32m%s\x1b[0m", `\nCliente '${client.phoneNumber}' alterado!`);
      this.clientList[client.phoneNumber] = new Client({
        id: client.id,
        name: client.name,
        phoneNumber: client.phoneNumber,
        platform: client.platform,
        chatbot: client.chatbot,
      });
      return true;
    } catch (error) {
      console.log("Error on addClientToList function", error);
    }
  }

  sendClientOrder(client) {
    if (this.config.flow.includes("PrintWeb")) {
      throw new Error("Enviar pedido para PrintWeb ainda não diponível");
    }
    if (this.config.flow.includes("WhatsApp")) {
      return order.convertToMessage(client);
    }
    return;
  }

  removeClient(phoneNumber) {
    delete this.clientList[phoneNumber];
    if (verbose) console.log(`\nCliente removido: ${phoneNumber}`);
  }
}
