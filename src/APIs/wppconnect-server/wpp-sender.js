import axios from "axios";
import config from "@wppconnect/server/dist/config.js";

const secretKey = config.default.secretKey;

export class WppSender {
  constructor(session) {
    console.log("secretKey: ", secretKey);

    this.session = "NERDWHATS_AMERICA";
    this.secretKey = secretKey || "BIXTOKEN";
    this.generateWPPToken();
  }

  async generateWPPToken() {
    return new Promise((resolve, reject) => {
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://localhost:21465/api/${this.session}/${this.secretKey}/generate-token`,
        headers: {
          Accept: "*/*",
        },
      };

      axios
        .request(config)
        .then((response) => {
          this.token = response.data.token;
          console.log("\x1b[32;1m%s\x1b[0m", "Token gerado com sucesso!");
          console.log("Token: ", this.token);
          resolve(response.token);
        })
        .catch((error) => {
          reject("Error generating WPP token:\n", error);
        });
    });
  }

  async closeSession() {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://localhost:21465/api/${this.session}/close-session`,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };

    axios
      .request(config)
      .then((response) => {
        console.log("Session closed: ", JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
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
  async sendMessage(phone, message, isNewsletter = false, isGroup = false) {
    return new Promise((resolve, reject) => {
      let data = JSON.stringify({
        phone: phone,
        message: message,
        isNewsletter: isNewsletter,
        isGroup: isGroup,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://localhost:21465/api/${this.session}/send-message`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log(`Mensagem enviada [${phone}]!\n${JSON.stringify(response.data.response[0], null, 2)}`);
          resolve(response.data.response[0]);
        })
        .catch((error) => {
          console.log("Erro in sendMessage", error);
          reject(error);
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
  async sendListMessage(phone, description, buttonText, sections, isGroup = false) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        phone: phone,
        isGroup: isGroup,
        description: description,
        buttonText: buttonText,
        sections: sections,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://localhost:21465/api/${this.session}/send-list-message`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log(`Mensagem enviada [${phone}]!\n${JSON.stringify(response.data.response[0], null, 2)}`);
          resolve(response.data.response[0]);
        })
        .catch((error) => {
          console.log("Erro in sendListMessage", error);
          reject(error);
        });
    });
  }

  async sendReplyMessage(phone, message, messageId, isGroup = false) {
    return new Promise((resolve, reject) => {
      let data = JSON.stringify({
        phone: phone,
        message: message,
        messageId: messageId,
        isGroup: isGroup,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://localhost:21465/api/${this.session}/send-reply`,
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
          console.log(error);
          reject(error);
        });
    });
  }

  async sendLinkPreviewMessage(phone, url, caption = "") {
    return new Promise((resolve, reject) => {
      let data = {
        phone: phone,
        url: url,
      };

      if (caption) data.caption = caption;

      data = JSON.stringify(data);

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://localhost:21465/api/${this.session}/send-link-preview`,
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
          console.log(error);
          reject(error);
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
  async sendMessageWithButtons(phone, message, options) {
    return new Promise((resolve, reject) => {
      let data = JSON.stringify({
        phone: phone,
        message: message,
        options: options,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://localhost:21465/api/${this.session}/send-buttons`,
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
          reject(error);
        });
    });
  }

  async setTyping(phone, isTyping) {
    return new Promise((resolve, reject) => {
      let data = JSON.stringify({
        phone: phone,
        value: isTyping,
        isGrup: false,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://localhost:21465/api/${this.session}/typing`,
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
          console.log(error);
          reject(error);
        });
    });
  }
}