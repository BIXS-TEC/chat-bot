import order from "../../interfaces/wa-order.js";
import context from "../data/contexts/index.js";
import sender from "./sender.js";
import Client from "./client.js";
import { WppConnect } from "./wppconnect.js";
import { configureProductsList } from "../utils/time.js";
import mapping from "../../interfaces/gab-parameters.js";

const verbose = true;

export default class Chatbot extends WppConnect {
  constructor({ id, businessName, phoneNumber, clientList, employeeList, productList, config }) {
    super(businessName);
    if (!Array.isArray(productList)) throw new Error("ProductList must be an array!");
    if (!Array.isArray(config.topProductsId)) throw new Error("config.topProductsId must be an array!");

    this.id = id;
    this.businessName = businessName;
    this.phoneNumber = phoneNumber;
    this.botName = "Assistente Virtual";

    this.config = config;

    this.clientList = clientList;
    this.employeeList = employeeList;
    configureProductsList(this, productList);

    this.sessionData = this.chatbotSetup();

    if (verbose) console.log("\x1b[32m%s\x1b[0m", `\nChatbot '${this.businessName}:${this.phoneNumber}' iniciado!`);
  }

  async chatbotSetup() {
    this.initializeModality();
    this.contextList = context.getContextList(this);
    this.initializeSatisfactionPoll();
    this.initializeAdminClient();

    try {
      await this.startNewSession();
      return this.sessionData;
    } catch (error) {
      console.error("Erro durante o setup do chatbot:", error);
    }
  }

  async handleAdminCommand(admClient) {
    try {
      // console.log("handleAdminCommand client:", admClient);
      this.employeeList[admClient.phoneNumber].updateClientData(admClient);

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

    console.log("handleOrderMenuFlow client:", JSON.stringify(this.clientList[client.phoneNumber]));
    const matchedContextName = this.findBestContext(this.clientList[client.phoneNumber]);

    // console.log("interaction: ", client.chatbot.interaction);
    return await this.sendContextMessage(matchedContextName, this.clientList[client.phoneNumber]);
  }

  async handleGroupCommand(client) {
    const groupName = Object.values(this.groupList).find((group) => group.chatId === client.chatbot.messageTo).name;
    // console.log("groupName :", groupName);
    if (!this.employeeList[client.phoneNumber]) {
      this.addEmployeeToList(client);
    } else {
      this.employeeList[client.phoneNumber].updateClientData(client);
    }
    return await this.sendContextMessage(groupName, this.employeeList[client.phoneNumber]);
  }

  async sendContextMessage(contextName, client, interaction = client.chatbot.interaction) {
    // console.log('sendContextMessage client: ', client);
    console.log("sendContextMessage contextName: ", contextName);
    if (!this.contextList[interaction][contextName]) return;
    const useClient = interaction === "admin" ? this.clientList[client.chatbot.messageTo] : client;
    try {
      const response = await this.contextList[interaction][contextName].runContext(useClient);
      if (interaction !== "admin") useClient.saveLastChatbotMessage(response.responseObjects);
      const requestResponseList = await sender.sendMessage(this, response);
      useClient.saveResponse(requestResponseList);
      console.log("\x1b[36m%s\x1b[0m", `Cliente: [${useClient.platform}] ${JSON.stringify(useClient)}`);
      return response;
    } catch (error) {
      console.error("Erro em sendContextMessage: ", error);
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

      if (matchedContext.length === 0) throw new Error(`\x1b[35mNenhum contexto esta configurado para suceder o contexto ${client.chatbot.context}`);

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
      console.log("\x1b[33;1m", "keyword: ", keyword, "; messageType: ", client.chatbot.messageType, "\x1b[0m");
      // console.log("matchedContexts: ", JSON.stringify(matchedContext.map((context) => context.name)));

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
      // this.clientList[client.phoneNumber].chatbot.context = matchedContext[0].name;
      console.log("\x1b[36m%s\x1b[0m", "Matched context: ", matchedContext[0].name);
      console.log("\x1b[36m%s\x1b[0m", "Activations keywords: ", matchedContext[0].activationKeywords);

      return matchedContext[0].name;
    } catch (error) {
      console.log("Error in findBestContext function", error);
    }
  }

  getGroupById(groupId) {
    for (let group of this.groupList) {
      if (group.chatId === groupId) {
        return group;
      }
    }
    return null; // or return 'Group not found';
  }

  getProductById(id) {
    for (let category in this.productList) {
      if (id in this.productList[category]) {
        return this.productList[category][id];
      }
    }
    console.warn(`Aviso: Produto não encontrado (${id})!`);
    return null; // Retorna null caso o produto não seja encontrado
  }

  getRecommendedProduct() {
    for (let productName in this.productList["Bebidas"]) return this.productList["Bebidas"][productName];
  }

  addClientToList(client, context = "nenhum") {
    //incluir verificação de objeto
    try {
      if (!this.clientList[client.phoneNumber] && verbose) console.log("\x1b[32m%s\x1b[0m", `\nCliente '${client.phoneNumber}' adicionado!`);
      else if (this.clientList[client.phoneNumber] && verbose) console.log("\x1b[32m%s\x1b[0m", `\nCliente '${client.phoneNumber}' alterado!`);
      this.clientList[client.phoneNumber] = new Client({
        id: client.id,
        name: client.name,
        phoneNumber: client.phoneNumber,
        platform: client.platform,
        chatbot: Object.assign(client.chatbot, {
          context: context,
          messageHistory: [`${context}&&${client.chatbot.currentMessage}`],
          orderList: {},
          approvedOrderList: {},
          interaction: "cardapio-whatsapp",
          humanChating: false,
          messageIds: { saveResponse: "" },
          timeouts: { recurrent: { trigged: false, time: this.config.recurrentTime } },
        }),
      });
      return true;
    } catch (error) {
      console.log("Error on addClientToList function", error);
    }
  }

  addEmployeeToList(client, context = "nenhum") {
    //incluir verificação de objeto
    try {
      if (!this.employeeList[client.phoneNumber] && verbose) console.log("\x1b[32m%s\x1b[0m", `\nCliente '${client.phoneNumber}' adicionado!`);
      else if (this.employeeList[client.phoneNumber] && verbose) console.log("\x1b[32m%s\x1b[0m", `\nCliente '${client.phoneNumber}' alterado!`);
      this.employeeList[client.phoneNumber] = new Client({
        id: client.id,
        name: client.name,
        phoneNumber: client.phoneNumber,
        platform: client.platform,
        chatbot: Object.assign(client.chatbot, {
          context: context,
          messageHistory: [`${context}&&${client.chatbot.currentMessage}`],
          orderList: {},
          approvedOrderList: {},
          humanChating: false,
          messageIds: { saveResponse: "" },
          timeouts: { recurrent: { trigged: false, time: this.config.recurrentTime } },
        }),
      });
      return true;
    } catch (error) {
      console.log("Error on addClientToList function", error);
    }
  }

  updateConfigData(c) {
    if (typeof c !== "object" || !c.field || c.value === undefined) {
      console.log("\x1b[31m%s\x1b[0m", "Parâmetro inválido fornecido a updateConfigData!");
      return false;
    }

    console.log(`field: ${c.field} - value: ${c.value}`);

    const mappedPath = mapping[c.field];
    if (!mappedPath) {
      console.log("\x1b[31m%s\x1b[0m", "Parâmetro não mapeado fornecido a updateConfigData!");
      return false;
    }

    const keys = mappedPath.split(".");
    let target = this;

    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]];
      if (target === undefined) {
        console.log("\x1b[31m%s\x1b[0m", "Caminho não encontrado em updateConfigData!");
        return false;
      }
    }

    target[keys[keys.length - 1]] = c.value;
    console.log("target: ", target[keys[keys.length - 1]]);

    return true;
  }

  sendClientOrder(client) {
    if (this.config.flow.includes("PrintWeb")) {
      throw new Error("Enviar pedido para PrintWeb ainda não diponível");
    }
    if (this.config.flow.includes("WhatsApp")) {
      const clientCopy = order.uniteClientProducts(client);
      return order.convertToMessage(clientCopy);
    }
    return;
  }

  removeClient(phoneNumber) {
    delete this.clientList[phoneNumber];
    if (verbose) console.log(`\nCliente removido: ${phoneNumber}`);
  }

  createTopProductsCategory(topProductsId) {
    try {
      if (!this.productList["Mais Pedidos"]) {
        const topProducts = { "Mais Pedidos": {} };

        for (let productId of topProductsId) {
          topProducts["Mais Pedidos"][productId] = this.getProductById(productId);
        }

        if (!Object.keys(topProducts["Mais Pedidos"]).length) return;

        if (this.config.serviceOptions.onlyTopProducts) {
          this.productList = { ...topProducts };
        } else {
          this.productList = { ...topProducts, ...this.productList };
        }
      }
    } catch (error) {
      console.error("Error in createTopProductsCategory: ", error);
    }
  }

  initializeModality() {
    const { min, max, excludedValues } = this.config.tableInterval;

    this.modalityIdList = Array.from({ length: max - min + 1 }).reduce((acc, _, index) => {
      const tableNumber = min + index;

      acc[String(tableNumber)] = {
        occupied: false,
        inactive: excludedValues.includes(tableNumber),
      };

      return acc;
    }, {});
  }

  initializeAdminClient() {
    this.employeeList[this.phoneNumber] = new Client({
      id: 0,
      name: this.businessName,
      phoneNumber: this.phoneNumber,
      platform: "wppconnect",
      chatbot: {
        humanChating: true,
        currentMessage: "start",
        context: "admin",
        messageType: "chat",
        interaction: "adicionais",
        chatbotPhoneNumber: this.phoneNumber,
        humanChating: true,
        messageHistory: [],
      },
    });
  }

  initializeSatisfactionPoll() {
    if (this.config.serviceOptions.pesquisaSatisfacao) {
      this.satisfactionPoll = {
        0: {
          title: "Bom",
          count: 0,
          voters: [],
        },
        1: {
          title: "Regular",
          count: 0,
          voters: [],
        },
        2: {
          title: "Ruim",
          count: 0,
          voters: [],
        },
      };
    }
  }
}
