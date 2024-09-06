import order from "../../interfaces/wa-order.js";
import context from "../data/contexts/index.js";
import sender from "./sender.js";
import Client from "./client.js";
import { WppConnect } from "./wppconnect.js";
import { configureProductsList } from "../utils/time.js";
import mapping from "../../interfaces/gab-parameters.js";

const verbose = true;

// Cada instancia da classe Chatbot, e um chatbot único
export default class Chatbot extends WppConnect {
  constructor({ id, businessName, phoneNumber, clientList, employeeList, productList, config }) {
    super(businessName);
    // Verificação de tipo
    if (!Array.isArray(productList)) throw new Error("ProductList must be an array!");
    if (!Array.isArray(config.topProductsId)) throw new Error("config.topProductsId must be an array!");

    this.id = id; // ID do chatbot, utilizado apenas para banco de dados (não implementado)
    this.businessName = businessName; // Nome do estabelecimento (Aparecerá no perfil do Whats App)
    this.phoneNumber = phoneNumber; // Numero do chatbot sincronizado
    this.botName = "Assistente Virtual"; // Nome do assistente (Apenas estetico; não implementado)

    this.config = config; // Configurações especificas de funcionalidade do chatbot, consulte src\models\data\chatbot.js

    this.clientList = clientList; // Lista de clientes, geralmente iniciada vazia
    this.employeeList = employeeList; // Lista de funcionarios, geralmente iniciada vazia (por enquanto possui apenas o admin)
    configureProductsList(this, productList); // Configuração das listas de produtos

    this.sessionData = this.chatbotSetup(); // Inicialização da session do chatbot no wppconnect-server

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

  /**
   * Tratamento de comandos enviados pelo admin (próprio numero do chatbot)
   * @param {Objeto padronizado} admClient
   * @returns
   */
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

  /**
   * Tratamento de mensagens enviadas pelo cliente pelo Whats App na conversa com o chatbot
   * @param {Objeto padronizado} client
   * @returns response
   */
  async handleOrderMenuFlow(client) {
    // Se cliente não existe cria, caso contrário atualiza seus dados
    if (!this.clientList[client.phoneNumber]) {
      this.addClientToList(client);
    } else {
      this.clientList[client.phoneNumber].updateClientData(client);
    }

    console.log("handleOrderMenuFlow client:", JSON.stringify(this.clientList[client.phoneNumber]));
    // Encontrar o contexto que se encaixa com a mensagem enviada pelo cliente
    const matchedContextName = this.findBestContext(this.clientList[client.phoneNumber]);

    // console.log("interaction: ", client.chatbot.interaction);
    // Enviar para o cliente na conversa, a mensagem criada no contexto
    return await this.sendContextMessage(matchedContextName, this.clientList[client.phoneNumber]);
  }

  /**
   * Tratamento de mensagens enviadas nos grupos
   * @param {Objeto padronizado} client
   * @returns
   */
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

  /**
   * Envia a mensagem do contexto informado em contextName
   * @param {string} contextName
   * @param {Objeto padronizado} client
   * @param {string} interaction
   * @returns
   */
  async sendContextMessage(contextName, client, interaction = client.chatbot.interaction) {
    // console.log('sendContextMessage client: ', client);
    console.log("sendContextMessage contextName: ", contextName);
    if (!this.contextList[interaction][contextName]) return;
    // Se for o admin que esta solicitando o envio, o objeto de envio deve ser o cliente
    // Se for o cliente que esta solicitando o seu próprio objeto é utilizado
    const useClient = interaction === "admin" ? this.clientList[client.chatbot.messageTo] : client;
    try {
      // Executar o contexto
      const response = await this.contextList[interaction][contextName].runContext(useClient);
      // Salvar a ultima mensagem enviada pelo chatbot, caso não seja o admin
      if (interaction !== "admin") useClient.saveLastChatbotMessage(response.responseObjects);
      // Envia a requisição para envio da mensagem a conversa
      const requestResponseList = await sender.sendMessage(this, response);
      // salva a responsta da requisição
      useClient.saveResponse(requestResponseList);
      console.log("\x1b[36m%s\x1b[0m", `Cliente: [${useClient.platform}] ${JSON.stringify(useClient)}`);
      return response;
    } catch (error) {
      console.error("Erro em sendContextMessage: ", error);
    }
  }

  /**
   * Encontra o melhor contexto para o cliente baseado no seu contexto anterior e na sua mensagem atual
   * @param {Objeto padronizado} client
   * @returns
   */
  findBestContext(client) {
    const matchedContext = [];
    const interaction = client.chatbot.interaction;

    try {
      // Procura quais contextos aceitam o contexto atual (ultima mensagem) do cliente
      for (const contextName in this.contextList[interaction]) {
        if (this.contextList[interaction][contextName].previousContexts.includes(client.chatbot.context)) {
          matchedContext.push(this.contextList[interaction][contextName]);
        }
      }

      if (matchedContext.length === 0) throw new Error(`\x1b[35mNenhum contexto esta configurado para suceder o contexto ${client.chatbot.context}`);

      // Salva a keyword dependendo do tipo da mensagem
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

      // Exclui contextos da lista que não possuem a mensagem atual do cliente como keyword
      // Pelo menos um contexto é mantido
      const matchedContextCopy = [...matchedContext];
      for (const context of matchedContextCopy) {
        if (
          matchedContext.length > 1 &&
          !context.activationKeywords.includes(keyword) && // Contextos podem ter palavras-chave como ativação ou...
          !(context.activationRegex && context.activationRegex.test(keyword)) // ...uma expressão regular 
        ) {
          // Pega o primeiro contexto a atender os requisitos de identificação
          // Contextos adicionados primeiro a contextList tem prioridade
          matchedContext.splice(matchedContext.indexOf(context), 1);
        }
      }

      // this.clientList[client.phoneNumber].chatbot.context = matchedContext[0].name;
      console.log("\x1b[36m%s\x1b[0m", "Matched context: ", matchedContext[0].name);
      console.log("\x1b[36m%s\x1b[0m", "Activations keywords: ", matchedContext[0].activationKeywords);

      return matchedContext[0].name;
    } catch (error) {
      console.log("Error in findBestContext function", error);
    }
  }

  /**
   * Obter grupo a partir do ID
   * Consulte objeto exemplo no final do arquivo src\interfaces\wppconnect.js
   * @param {string} groupId
   * @returns
   */
  getGroupById(groupId) {
    for (let group of this.groupList) {
      if (group.chatId === groupId) {
        return group;
      }
    }
    return null; // or return 'Group not found';
  }

  /**
   * Pegar objeto do produto pelo ID a partir da lista de produtos do chatbot
   * @param {number} id
   * @returns product object
   */
  getProductById(id) {
    for (let category in this.productList) {
      if (id in this.productList[category]) {
        return this.productList[category][id];
      }
    }
    console.warn(`Aviso: Produto não encontrado (${id})!`);
    return null; // Retorna null caso o produto não seja encontrado
  }

  /**
   * Depreciada
   * @returns produto padrão para recomendação
   */
  getRecommendedProduct() {
    for (let productName in this.productList["Bebidas"]) return this.productList["Bebidas"][productName];
  }

  /**
   * Incluir um novo cliente a lista de clientes
   */
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
          messageHistory: [`${context}&&${client.chatbot.currentMessage}`], // Junção do contexto com a mensagem atual separados por "&&"
          orderList: {},  // Lista atual de pedidos
          approvedOrderList: {}, // Lista de produtos que ja foram enviados para preparação (não permanece apos fechar a conta)
          interaction: "cardapio-whatsapp",
          humanChating: false, // Se esta conversando com um atendente
          messageIds: { saveResponse: "" },
          timeouts: { // Timers associados ao cliente
            recurrent: { trigged: false, time: this.config.recurrentTime } // Tempo para enviar a mensagem de produtos recorrentes
          },
        }),
      });
      return true;
    } catch (error) {
      console.log("Error on addClientToList function", error);
    }
  }

  // Incluir um novo funcionário a lista de funcionários
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

  /**
   * Atualizar dados de configuração, geralmente enviado do Gerenciador Assistente Bix
   * Aceita alterar um dado por vez
   * @param {Objeto padronizado} c 
   * @returns true or false
   */
  updateConfigData(c) {
    if (typeof c !== "object" || !c.field || c.value === undefined) {
      console.log("\x1b[31m%s\x1b[0m", "Parâmetro inválido fornecido a updateConfigData!");
      return false;
    }

    console.log(`field: ${c.field} - value: ${c.value}`);

    // Mapping importado de src\interfaces\gab-parameters.js
    const mappedPath = mapping[c.field];
    if (!mappedPath) {
      console.log("\x1b[31m%s\x1b[0m", "Parâmetro não mapeado fornecido a updateConfigData!");
      return false;
    }

    const keys = mappedPath.split(".");
    let target = this;

    // Encontrar a localização do parametro a ser alterado
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

  /**
   * Enviar o pedido do cliente para os sistemas integrados
   * Atualmete apenas Grupo "Pedidos" do Whats App
   * @param {Objeto padronizado} client 
   * @returns 
   */
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

  /**
   * Excluir o objeto do cliente
   * TO DO: salvar no banco de dados antes de deletar
   * @param {string} phoneNumber 
   */
  removeClient(phoneNumber) {
    delete this.clientList[phoneNumber];
    if (verbose) console.log(`\nCliente removido: ${phoneNumber}`);
  }

  /**
   * Criar categoria de produtos mais pedidos
   * @param {Array} topProductsId Lista dos IDs dos produtos mais pedidos
   * @returns
   */
  createTopProductsCategory(topProductsId) {
    try {
      if (!this.productList["Mais Pedidos"]) {
        // Se não existir
        const topProducts = { "Mais Pedidos": {} };

        for (let productId of topProductsId) {
          topProducts["Mais Pedidos"][productId] = this.getProductById(productId);
        }

        if (!Object.keys(topProducts["Mais Pedidos"]).length) return;

        // Dependendo da configuração se é para trabalhar apenas com os mais pedidos ou a base de dados completa
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

  /**
   * Inicializar tipo da modalidade e valores validos
   */
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

  /**
   * Inicializar objeto do admin (mesmo numero do chatbot)
   */
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

  /**
   * Inicializar parametros para pesquisa de satisfação
   */
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
