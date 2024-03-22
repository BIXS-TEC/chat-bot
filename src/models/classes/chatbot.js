import Client from "./client.js";

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

    if (verbose) console.log("\x1b[32m%s\x1b[0m", `\nChatbot '${this.businessName}:${this.phoneNumber}' iniciado!`);
  }

  async handleProductAditionalFlow(client) {
    console.log("\x1b[36m%s\x1b[0m", `Cliente padronizado: [${client.platform}] ${JSON.stringify(client, null, 2)}`);
    if (!this.clientList[client.phoneNumber]) {
      this.addClientToList(client);
    } else {
      this.clientList[client.phoneNumber].message = client.message; // Criar um metodo na classe client para fazer isso e salvar as msg anteriores
    }

    const matchedContextName = this.findBestContext(this.clientList[client.phoneNumber]);
    this.clientList[client.phoneNumber].context = matchedContextName;
    console.log("\x1b[36m%s\x1b[0m", "\nMatched context: ", matchedContextName);

    return new Promise((resolve, reject) => {
      this.contextList[matchedContextName]
        .runContext(this, this.clientList[client.phoneNumber])
        .then((response) => {
          resolve(this.formatResponse(response));
        })
        .catch((error) => {
          console.log("Erro ao processar o contexto: ", error);
          reject(error);
        });
    });
  }

  formatResponse(response) {
    return response.message;
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
      for (let i = matchedContext.length - 1; i >= 0; i--) {
        if (matchedContext.length > 1) {
          if (!matchedContext[i].activationKeywords.includes(client.chatbot.currentMessage)) {
            matchedContext.splice(i, 1);
          }
        }
      }

      /* Contextos adicionados primeiro a matchedContext tem prioridade */
      return matchedContext[0].name;
    } catch (error) {
      console.log("Error in findBestContext function", error);
    }
  }

  addClientToList(client) {
    //incluir verificação de objeto
    try {
      if (!this.clientList[client.phoneNumber] && verbose) console.log("\x1b[32m%s\x1b[0m", `\nCliente '${client.phoneNumber}' adicionado!`);
      else if (this.clientList[client.phoneNumber] && verbose) console.log("\x1b[32m%s\x1b[0m", `\nCliente '${client.phoneNumber}' alterado!`);
      this.clientList[client.phoneNumber] = new Client(client.id, client.name, client.phoneNumber, client.platform, this.phoneNumber, client.message);
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
