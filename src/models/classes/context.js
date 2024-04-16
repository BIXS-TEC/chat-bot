export default class Context {
  /**
   *
   * @param {number} id - Context ID
   * @param {string} name - Context name
   * @param {Array.<string>} previousContexts - The list of context names that precede this context
   * @param {Function} response - The response the context will return
   * @param {Function} action - The actions in term of data manipulation the context do
   * @param {Array.<string>} [activationKeywords=[]] - The keywords that specifies the triggering of this context
   * @param {Array.<string>} [buttons=[]] - (optional) The list of buttons to be sent within the message
   */
  constructor({ id, name, type, previousContexts, action, activationKeywords, responseObjects }) {
    if (typeof action !== "function") throw new Error("\x1b[31m%s\x1b[0m", `O parâmetro action deve ser uma função [context: ${this.name}].`);
    // if (buttons.length > 0) this.checkButtonsRestrictions(buttons);

    this.id = id;
    this.name = name;
    this.previousContexts = Array.isArray(previousContexts) ? previousContexts : [previousContexts];
    this.action = action;
    this.activationKeywords = Array.isArray(activationKeywords) ? activationKeywords : [activationKeywords];
    this.responseObjects = responseObjects;
  }

  async runContext(chatbot, client) {
    try {
      const args = this.action(chatbot, client);
      console.log('args: ', args);

      const response = {};
      response.clientPhone = client.phoneNumber;
      response.platform = client.platform;
      response.responseObjects = args ? this.responseObjects(chatbot, client, args) : this.responseObjects(chatbot, client);

      return response;
    } catch (error) {
      console.error(`Erro em runContext [${this.name}]: `, error);
    }
  }

  checkButtonsRestrictions(buttons) {
    for (let button of buttons) {
      if (!button) throw new Error("\x1b[31m%s\x1b[0m", `Titulo do botão ${typeof button}.`);
      if (typeof button.text !== "string") throw new Error("\x1b[31m%s\x1b[0m", "Os titulos dos botões devem ser do tipo string.");
      if (button.length > 20) throw new Error("\x1b[31m%s\x1b[0m", "Os titulos dos botões devem ter no máximo 20 caracteres.");
    }
    return true;
  }

  checkResponseRestrictions() {}

  checkActionRestrictions() {}
}
