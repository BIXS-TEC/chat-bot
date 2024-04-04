import { WppSender } from "../../APIs/wppconnect-server/requests.js";
import { defaultToWPPConnectResponseTextMessage, defaultToWPPConnectResponseListMessage } from "../../interfaces/wppconnect.js";

export class ResponseSender {
  constructor() {
    this.WppSender = new WppSender();
  }

  sendResponse(response) {
    switch (response.platform) {
      case "wppconnect": {
        switch (response.type) {
          case "text": {
            const res = defaultToWPPConnectResponseTextMessage(response);
            this.WppSender.sendMessage(res.phone, res.message);
            break;
          }
          case "buttons": {
            this.WppSender.sendMessageWithButtons(res.clientPhone, res.message, res.options);
            break;
          }
          case "items-list": {
            const res = defaultToWPPConnectResponseListMessage(response);
            this.WppSender.sendListMessage(res.phone, res.description, res.buttonText, res.sections);
            break;
          }

          default:
            break;
        }

        break;
      }
      default:
        break;
    }
  }
}
