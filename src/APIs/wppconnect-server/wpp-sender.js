import axios from "axios";
import path from "../../server.js";

/**
 * Consultar https://wppconnect.io/pt-BR/swagger/wppconnect-server/
 */
export default class WppSender {
  constructor() {
    this.token = null;
    this.session = null;
    this.secretKey = null; // Inicializado na classe WppConnect
  }

  async generateWPPToken() {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://${path}/api/${this.session}/${this.secretKey}/generate-token`,
      headers: {
        Accept: "*/*",
      },
    };
    console.log('generateWPPToken url:', config.url);

    try {
      const response = await axios.request(config);
      console.log("\x1b[32;1m%s\x1b[0m", "Token gerado com sucesso!");
      console.log("Token: ", response.data.token);
      return response.data;
    } catch (error) {
      console.error("Error generating WPP token:", error.data);
      throw new Error("Error generating WPP token");
    }
  }

  async startSession(waitQrCode = false) {
    let data = JSON.stringify({
      webhook: null,
      waitQrCode: waitQrCode,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://${path}/api/${this.session}/start-session`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      console.log("\x1b[32;1m%s\x1b[0m", `Sessão [${this.session}] iniciada!`);
      // console.log(JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao iniciar a sessão!");
    }
  }

  async closeSession() {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://${path}/api/${this.session}/close-session`,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };

    try {
      const response = await axios.request(config);
      console.log("Session closed: ", JSON.stringify(response.data));
      return response;
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao fechar a sessão!");
    }
  }

  async statusSession() {
    console.log("using Session status function");
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `http://${path}/api/${this.session}/status-session`,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };

    try {
      const response = await axios.request(config);
      console.log("Session status: ", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao fechar a sessão!");
    }
  }

  async checkConnectionSession() {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `http://${path}/api/${this.session}/check-connection-session`,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };

    try {
      const response = await axios.request(config);
      console.log("Session connection status: ", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao fechar a sessão!");
    }
  }

  async createGroup(name, participants, retryCount = 0) {
    try {
      let data = JSON.stringify({
        name: name,
        participants: participants,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://${path}/api/${this.session}/create-group`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: data,
      };

      let response = await axios.request(config);
      console.log(`Grupo criado [${name}]!`);
      return response;
    } catch (error) {
      console.log("Erro in createGroup", error);
      if (retryCount > 0) {
        return this.createGroup(token, name, participants, retryCount - 1);
      } else {
        throw error;
      }
    }
  }

  async getAllGroups(retryCount = 0) {
    try {
      let data = JSON.stringify({
        onlyGroups: true,
      });

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://${path}/api/${this.session}/list-chats`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: data,
      };

      const response = await axios.request(config);
      // console.log('getAllGroups response:', response.data);
      return response.data;
    } catch (error) {
      console.log("Erro in getAllGroups");
      if (retryCount > 0) {
        return this.getAllGroups(retryCount - 1);
      } else {
        throw error;
      }
    }
  }

  /**
   * {
   *   phone: '55DD########',
   *   message: 'Text Message',
   *   isNewsletter: false,
   *   isGroup: false
   * }
   * @param {*} phone
   * @param {*} message
   * @param {*} isNewsletter
   * @param {*} isGroup
   */
  async sendMessage(phone, WppMessage, retryCount = 3) {
    return new Promise(async (resolve, reject) => {
      let data = JSON.stringify({
        phone: phone,
        message: WppMessage.message,
        isNewsletter: WppMessage.isNewsletter,
        isGroup: WppMessage.isGroup,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://${path}/api/${this.session}/send-message`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log(`Mensagem enviada [${phone}]!`);
          // console.log(`${JSON.stringify(response.data.response[0], null, 2)}`);
          resolve(response.data.response[0]);
        })
        .catch((error) => {
          console.log("Erro in sendMessage", error);
          if (retryCount > 0) {
            this.sendMessage(phone, WppMessage, retryCount - 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject(error);
          }
        });
    });
  }

  /**
   * {
      phone: phone,
      isGroup: isGroup,
      description: description,
      buttonText: buttonText,
      sections: [
        {
          title: 'Section 1',
          rows: [
            {
              rowId: 'my_custom_id',
              title: 'Test 1',
              description: 'Description 1'
            },
            {
              rowId: '2',
              title: 'Test 11',
              description: 'Description 2'
            }
          ]
        }
      ]
   * }
   * @param {*} phone 
   * @param {*} description 
   * @param {*} buttonText 
   * @param {*} sections 
   * @param {*} isGroup 
   */
  async sendListMessage(phone, WppMessage, retryCount = 3) {
    // Sections options must have between 1 and 10 options - Error: Sections options must have between 1 and 10 options
    return new Promise(async (resolve, reject) => {
      const data = JSON.stringify({
        phone: phone,
        isGroup: WppMessage.isGroup,
        description: WppMessage.description,
        buttonText: WppMessage.buttonText,
        sections: WppMessage.sections,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://${path}/api/${this.session}/send-list-message`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log(`Mensagem enviada [${phone}]!`);
          // console.log(`${JSON.stringify(response.data.response[0], null, 2)}`);
          resolve(response.data.response[0]);
        })
        .catch((error) => {
          console.log("Erro in sendListMessage", error);
          if (retryCount > 0) {
            this.sendListMessage(phone, WppMessage, retryCount - 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject(error);
          }
        });
    });
  }

  async sendReplyMessage(phone, WppMessage, retryCount = 3) {
    return new Promise(async (resolve, reject) => {
      let data = JSON.stringify({
        phone: phone,
        message: message,
        messageId: messageId,
        isGroup: isGroup,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://${path}/api/${this.session}/send-reply`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log(`Mensagem enviada [${phone}]!`);
          resolve(response.data.response[0]);
        })
        .catch((error) => {
          console.log("Error in sendReplyMessage", error);
          if (retryCount > 0) {
            this.sendReplyMessage(phone, WppMessage, retryCount - 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject(error);
          }
        });
    });
  }

  async sendLinkPreviewMessage(phone, WppMessage, retryCount = 3) {
    return new Promise(async (resolve, reject) => {
      let data = {
        phone: phone,
        url: WppMessage.url,
      };

      if (WppMessage.caption) data.caption = WppMessage.caption;

      data = JSON.stringify(data);

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://${path}/api/${this.session}/send-link-preview`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log(`Mensagem enviada [${phone}]!`);
          resolve(response.data.response[0]);
        })
        .catch((error) => {
          console.log("Error in sendLinkPreviewMessage: ", error);
          if (retryCount > 0) {
            this.sendLinkPreviewMessage(phone, WppMessage, retryCount - 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject(error);
          }
        });
    });
  }

  async sendContactVcard(phone, WppMessage, retryCount = 3) {
    return new Promise(async (resolve, reject) => {
      let data = JSON.stringify({
        phone: phone,
        contactsId: WppMessage.contactsId,
        isGroup: WppMessage.isGroup,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://${path}/api/${this.session}/contact-vcard`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log(`Mensagem enviada [${phone}]!`);
          resolve(response.data.response[0]);
        })
        .catch((error) => {
          console.log("Error in sendContactVcard: ", error);
          if (retryCount > 0) {
            this.sendContactVcard(phone, WppMessage, retryCount - 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject(error);
          }
        });
    });
  }

  async sendPollMessage(phone, WppMessage, retryCount = 3) {
    return new Promise(async (resolve, reject) => {
      console.log("sendPollMessage WppMessage: ", WppMessage);

      let data = JSON.stringify({
        phone: phone,
        isGroup: WppMessage.isGroup,
        name: WppMessage.name,
        choices: WppMessage.choices,
        options: {
          selectableCount: WppMessage.options.selectableCount,
        },
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://${path}/api/${this.session}/send-poll-message`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log(`Mensagem enviada [${phone}]!`);
          resolve(response.data.response[0]);
        })
        .catch((error) => {
          console.log("Error in sendPollMessage: ", error);
          if (retryCount > 0) {
            this.sendPollMessage(phone, WppMessage, retryCount - 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject(error);
          }
        });
    });
  }

  async setTyping(phone, isTyping, retryCount = 3) {
    if (this.isGroupNumber(phone)) return;
    return new Promise(async (resolve, reject) => {
      let data = JSON.stringify({
        phone: phone,
        value: isTyping,
        isGrup: false,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://${path}/api/${this.session}/typing`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log("Erro in setTyping", error);
          if (retryCount > 0) {
            this.setTyping(phone, isTyping, retryCount - 1)
              .then(resolve)
              .catch(reject);
          } else {
            if (isTyping) {
              setTimeout(() => {
                this.setTyping(phone, false, retryCount - 1)
                  .then(resolve)
                  .catch(reject);
              }, 1000);
            }
            resolve();
          }
        });
    });
  }

  /**
   * DEPRECATED
   * {
      phone: phone,
      message: message,
      options: {
        useTemplateButtons: true,
        buttons: [
          {
            url: "https://wppconnect.io/",
            text: "WPPConnect Site",
          },
          {
            phoneNumber: "+55 11 22334455",
            text: "Call me",
          },
          {
            id: "your custom id 1",
            text: "Some text",
          },
          {
            id: "another id 2",
            text: "Another text",
          },
        ],
        title: "Title text",
        footer: "Footer text"
      },
    }
   * @param {*} phone 
   * @param {*} message 
   */
  async sendMessageWithButtons(phone, WppMessage, retryCount = 3) {
    return new Promise(async (resolve, reject) => {
      let data = JSON.stringify({
        phone: phone,
        message: message,
        options: options,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://${path}/api/${this.session}/send-buttons`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log(`Mensagem enviada [${phone}]!`);
          resolve(response.data);
        })
        .catch((error) => {
          console.log("Erro in sendMessageWithButtons", error);
          if (retryCount > 0) {
            this.sendMessageWithButtons(phone, WppMessage, retryCount - 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject(error);
          }
        });
    });
  }

  isGroupNumber(phone) {
    if (phone.length > 13) {
      return true;
    }
    return false;
  }
}
