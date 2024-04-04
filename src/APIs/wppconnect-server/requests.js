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

      setTimeout(() => {
        axios
          .request(config)
          .then((response) => {
            this.token = response.data.token;
            console.log('\x1b[32;1m%s\x1b[0m','Token gerado com sucesso!')
            resolve(response.token);
          })
          .catch((error) => {
            reject("Error generating WPP token:\n", error);
          });
      }, 10000);
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
        console.log(`Mensagem enviada [${phone}]!`);
      })
      .catch((error) => {
        console.log("Erro in sendMessage", error);
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
        console.log(`Mensagem enviada [${phone}]!`);
      })
      .catch((error) => {
        console.log("Erro in sendListMessage", error);
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
      })
      .catch((error) => {
        console.log("Erro in sendMessageWithButtons", error);
      });
  }
}
