import order from "../../interfaces/wa-order.js";
import context from "../data/contexts/index.js";
import group from "../data/groups.js";
import sender from "./sender.js";
import Client from "./client.js";

const verbose = true;

export default class Chatbot {
  constructor({ id, businessName, phoneNumber, clientList, productList, config }) {
    this.id = id;
    this.businessName = businessName;
    this.phoneNumber = phoneNumber;
    this.botName = "Assistente Virtual";

    this.config = config;

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

  async handleAdminCommand(admClient) {
    try {
      console.log("handleAdminCommand client:", admClient);
      this.clientList[admClient.phoneNumber].updateClientData(admClient);

      if (admClient.chatbot.messageTo === admClient.phoneNumber) {
        console.log("\x1b[31m%s\x1b[0m", "Admin command not implemented yet");
        return;
      } else {
        return await this.sendContextMessage(admClient.chatbot.currentMessage, admClient);
      }
    } catch (error) {
      console.error("Error in handleAdminCommand:", error);
      return error;
    }
  }

  async handleOrderMenuFlow(client) {
    if (!this.clientList[client.phoneNumber]) {
      this.addClientToList(client);
    } else {
      this.clientList[client.phoneNumber].updateClientData(client);
    }

    const matchedContextName = this.findBestContext(this.clientList[client.phoneNumber]);

    // console.log("interaction: ", client.chatbot.interaction);
    return await this.sendContextMessage(matchedContextName, this.clientList[client.phoneNumber]);
  }

  async sendContextMessage(contextName, client) {
    if (this.contextList[client.chatbot.interaction][contextName]) {
      const useClient = client.chatbot.interaction === 'admin' ? this.clientList[client.chatbot.messageTo] : client;
      console.log("\x1b[36m%s\x1b[0m", `Cliente: [${useClient.platform}] ${JSON.stringify(useClient)}`);
      this.contextList[client.chatbot.interaction][contextName]
      .runContext(useClient)
      .then((response) => {
        console.log("\x1b[36m%s\x1b[0m", `Cliente: [${useClient.platform}] ${JSON.stringify(useClient)}`);
        if (client.chatbot.interaction !== "admin") useClient.saveLastChatbotMessage(response.responseObjects);
          sender
            .sendMessage(response)
            .then((requestResponseList) => {
              useClient.saveResponse(requestResponseList);
              console.log("\x1b[36m%s\x1b[0m", `Cliente: [${useClient.platform}] ${JSON.stringify(useClient)}`);
              return response;
            })
            .catch((error) => {
              console.log("Erro em sendMessage: ", error);
              return error;
            });
        })
        .catch((error) => {
          console.log("Erro ao processar contexto: ", error);
          return error;
        });
    }
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
      console.log('\x1b[33;1m', "keyword: ", keyword, "; messageType: ", client.chatbot.messageType, '\x1b[0m');
      console.log(
        "matchedContexts: ",
        JSON.stringify(matchedContext.map((context) => context.name))
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
      console.log("\x1b[36m%s\x1b[0m", "Matched context: ", matchedContext[0].name);
      console.log("\x1b[36m%s\x1b[0m", "Activations keywords: ", matchedContext[0].activationKeywords);

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
    return this.productList["Bebidas"][1663289];
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
      const clientCopy = { ...client };
      client.orderList = {};
      return order.convertToMessage(clientCopy);
    }
    return;
  }

  removeClient(phoneNumber) {
    delete this.clientList[phoneNumber];
    if (verbose) console.log(`\nCliente removido: ${phoneNumber}`);
  }
}
