import wppconnect from "@wppconnect-team/wppconnect";
import { handleRequest } from "../system/selector.js";

export async function startWppConnection() {
  return new Promise((resolve, reject) => {
    try {
      wppconnect
        .create({
          session: "assistente-bix", // Pass the name of the client you want to start the bot
          catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
            console.log("Number of attempts to read the qrcode: ", attempts);
            console.log("Terminal qrcode: ", asciiQR);
            // console.log('base64 image string qrcode: ', base64Qrimg);
            // console.log('urlCode (data-ref): ', urlCode);
          },
          statusFind: (statusSession, session) => {
            console.log("Status Session: ", statusSession); // return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
            // Create session wss return "serverClose" case server for close
            console.log("Session name: ", session);
          },
          headless: "new", // Headless chrome
          devtools: false, // Open devtools by default
          useChrome: true, // If false will use Chromium instance
          debug: false, // Opens a debug session
          logQR: true, // Logs QR automatically in terminal
          browserWS: "", // If u want to use browserWSEndpoint
          browserArgs: [""], // Parameters to be added into the chrome browser instance
          puppeteerOptions: {}, // Will be passed to puppeteer.launch
          disableWelcome: false, // Option to disable the welcoming message which appears in the beginning
          updatesLog: true, // Logs info updates automatically in terminal
          autoClose: 60000, // Automatically closes the wppconnect only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
          tokenStore: "file", // Define how work with tokens, that can be a custom interface
          folderNameToken: "./tokens", // folder name when saving tokens
          // BrowserSessionToken
          // To receive the client's token use the function await clinet.getSessionTokenBrowser()
          sessionToken: {
            WABrowserId: '"UnXjH....."',
            WASecretBundle: '{"key":"+i/nRgWJ....","encKey":"kGdMR5t....","macKey":"+i/nRgW...."}',
            WAToken1: '"0i8...."',
            WAToken2: '"1@lPpzwC...."',
          },
        })
        .then((client) => {
          console.log('\x1b[35;1m%s\x1b[0m','Aguardando mensagens...');
          start(client);
        })
        .then(() => {
          resolve(null);
        })
        .catch((error) => {
          console.log("controllers/init/wppconnect.ts:Error in startWppConnection function.\n", error);
          reject(error);
        });
    } catch (error) {
      console.log("Error in startWppConnection function");
    }
  });
}

async function start(client) {
  client.onMessage(async (message) => {
    (async () => {
      message.platform = "wppconnect";
      const response = await handleRequest(message);
      console.log("message.from: ", message.from);
      console.log("response: ", response);
      client
        .sendText(message.from, response, {
          useTemplateButtons: true, // False for legacy
          buttons: [
            {
              url: 'https://wppconnect.io/',
              text: 'WPPConnect Site'
            },
            {
              phoneNumber: '+55 11 22334455',
              text: 'Call me'
            },
            {
              id: 'your custom id 1',
              text: 'Some text'
            },
            {
              id: 'another id 2',
              text: 'Another text'
            }
          ],
          title: 'Title text',
          footer: 'Footer text'
         })
        .catch((erro) => {
          console.error("Erro ao enviar mensagem:", erro);
        });
    })();
  });
}