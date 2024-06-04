import { create, Whatsapp } from "@wppconnect-team/wppconnect";
import config from "./wpp-session-config.js";
// const wppconnect = require('@wppconnect-team/wppconnect');

async function sendRequest(message, retryCount = 1) {
  console.log("Enviando requisição com a mensagem:" /*, message*/);
  return new Promise((resolve, reject) => {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://20e4-2804-4d98-260-5c00-2db7-84f7-ab70-6136.ngrok-free.app",
      data: message,
    };

    axios
      .request(config)
      .then((response) => {
        console.log("\x1b[32m%s\x1b[0m", "Mensagem enviada para chatbot.");
        resolve(response);
      })
      .catch((error) => {
        // console.log('\x1b[31m%s\x1b[0m', "Erro in dist/util/createSessionUtil/sendRequest", error.code);
        console.log("Configuração da requisição que falhou:" /*, config*/);
        if (retryCount > 0) {
          console.log(`Tentando novamente... Tentativas restantes: ${retryCount - 1}`);
          this.sendRequest(message, retryCount - 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(error);
        }
      });
  });
}

create({ session: config.session })
  .then((client) => start(client))
  .catch((error) => console.log(error));

async function start(client) {
  await client.onMessage((message) => {
    // console.log('\n\n\n\n onAnyMessage message from: ', JSON.stringify(message, null, 2));
  });

  await client.onAnyMessage(async (message) => {
    message.session = client.session;
    message.platform = "wppconnect";
    message.interaction = "cardapio-whatsapp";
    console.log('\n\n\n\n onAnyMessage message from: ', JSON.stringify(message, null, 2));
    // sendRequest(message);
  });
}
