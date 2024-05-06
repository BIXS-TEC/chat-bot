import axios from "axios";
import config from "@wppconnect/server/dist/config.js";

const WppSender = {}
export default WppSender;

const secretKey = config.default.secretKey || "BIXTOKEN";
const session = "NERDWHATS_AMERICA";

let token = null;
let tokenPromise = null;

WppSender.generateWPPToken = async function () {
  if (!tokenPromise) {
    tokenPromise = new Promise((resolve, reject) => {
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `http://localhost:21465/api/${session}/${secretKey}/generate-token`,
        headers: {
          Accept: "*/*",
        },
      };

      axios
        .request(config)
        .then((response) => {
          token = response.data.token;
          console.log("\x1b[32;1m%s\x1b[0m", "Token gerado com sucesso!");
          console.log("Token: ", token);
          resolve(token);
        })
        .catch((error) => {
          tokenPromise = null; // Reset a Promise se houver erro
          reject("Error generating WPP token:\n", error);
        });
    });
  }
  return tokenPromise;
}

WppSender.generateWPPToken();

WppSender.closeSession = async function() {
  return new Promise(async (resolve, reject) => {
    token = await WppSender.generateWPPToken();

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://localhost:21465/api/${session}/close-session`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .request(config)
      .then((response) => {
        console.log("Session closed: ", JSON.stringify(response.data));
        resolve(response);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

WppSender.createGroup = async function (name, participants, retryCount = 0) {
  return new Promise(async (resolve, reject) => {
    token = await WppSender.generateWPPToken();

    let data = JSON.stringify({
      name: name,
      participants: participants,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://localhost:21465/api/${session}/create-group`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(`Grupo criado [${name}]!`);
        resolve(response);
      })
      .catch((error) => {
        console.log("Erro in createGroup", error);
        if (retryCount > 0) {
          createGroup(name, participants, retryCount - 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(error);
        }
      });
  });
}

WppSender.getAllGroups = async function (retryCount = 0) {
  return new Promise(async (resolve, reject) => {
    token = await WppSender.generateWPPToken();

    let data = JSON.stringify({
      "onlyGroups": true
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://localhost:21465/api/${session}/list-chats`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: data
    };

    axios
      .request(config)
      .then((response) => {
        const onlyGroups = response.data.filter(obj => obj.isGroup !== false);
        resolve(onlyGroups);
      })
      .catch((error) => {
        console.log("Erro in getAllGroups");
        if (retryCount > 0) {
          getAllGroups(retryCount - 1)
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
WppSender.sendMessage = async function (phone, WppMessage, retryCount = 3) {
  return new Promise(async (resolve, reject) => {
    token = await WppSender.generateWPPToken();

    let data = JSON.stringify({
      phone: phone,
      message: WppMessage.message,
      isNewsletter: WppMessage.isNewsletter,
      isGroup: WppMessage.isGroup,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://localhost:21465/api/${session}/send-message`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
          sendMessage(phone, WppMessage, retryCount - 1)
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
WppSender.sendListMessage = async function (phone, WppMessage, retryCount = 3) {
  // Sections options must have between 1 and 10 options - Error: Sections options must have between 1 and 10 options
  return new Promise(async (resolve, reject) => {
    token = await WppSender.generateWPPToken();

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
      url: `http://localhost:21465/api/${session}/send-list-message`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
          sendListMessage(phone, WppMessage, retryCount - 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(error);
        }
      });
  });
}

WppSender.sendReplyMessage = async function (phone, WppMessage, retryCount = 3) {
  return new Promise(async (resolve, reject) => {
    token = await WppSender.generateWPPToken();

    let data = JSON.stringify({
      phone: phone,
      message: message,
      messageId: messageId,
      isGroup: isGroup,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://localhost:21465/api/${session}/send-reply`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
          sendReplyMessage(phone, WppMessage, retryCount - 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(error);
        }
      });
  });
}

WppSender.sendLinkPreviewMessage = async function (phone, WppMessage, retryCount = 3) {
  return new Promise(async (resolve, reject) => {
    token = await WppSender.generateWPPToken();

    let data = {
      phone: phone,
      url: WppMessage.url,
    };

    if (WppMessage.caption) data.caption = WppMessage.caption;

    data = JSON.stringify(data);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://localhost:21465/api/${session}/send-link-preview`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
          sendLinkPreviewMessage(phone, WppMessage, retryCount - 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(error);
        }
      });
  });
}

WppSender.setTyping = async function (phone, isTyping, retryCount = 3) {
  return new Promise(async (resolve, reject) => {
    token = await WppSender.generateWPPToken();

    let data = JSON.stringify({
      phone: phone,
      value: isTyping,
      isGrup: false,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://localhost:21465/api/${session}/typing`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
          setTyping(phone, isTyping, retryCount - 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(error);
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
WppSender.sendMessageWithButtons = async function (phone, WppMessage, retryCount = 3) {
  return new Promise(async (resolve, reject) => {
    token = await WppSender.generateWPPToken();

    let data = JSON.stringify({
      phone: phone,
      message: message,
      options: options,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://localhost:21465/api/${session}/send-buttons`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
          setTyping(phone, WppMessage, retryCount - 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(error);
        }
      });
  });
}
