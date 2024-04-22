import { WppSender } from "../../APIs/wppconnect-server/wpp-sender.js";
import {
  defaultToWPPConnectResponseTextMessage,
  defaultToWPPConnectResponseListMessage,
  defaultToWPPConnectResponseLinkPreview,
  defaultToWPPConnectResponseReplyMessage,
} from "../../interfaces/wppconnect.js";

export class MessageSender {
  constructor() {
    this.WppSender = new WppSender();
  }

  async sendMessage(response) {
    switch (response.platform) {
      case "wppconnect": {
        let requestResponseList = [];
        for (let message of response.responseObjects) {
          switch (message.type) {
            case "text": {
              const WppMessage = defaultToWPPConnectResponseTextMessage(message);
              await this.WppSender.setTyping(response.clientPhone, true);
              const requestResponse = await this.WppSender.sendMessage(response.clientPhone, WppMessage);
              await this.WppSender.setTyping(response.clientPhone, false);
              requestResponseList.push(requestResponse);
              break;
            }
            case "listMessage": {
              const WppMessage = defaultToWPPConnectResponseListMessage(message);
              await this.WppSender.setTyping(response.clientPhone, true);
              const requestResponse = await this.WppSender.sendListMessage(response.clientPhone, WppMessage);
              await this.WppSender.setTyping(response.clientPhone, false);
              requestResponseList.push(requestResponse);
              break;
            }
            case "replyMessage": {
              const WppMessage = defaultToWPPConnectResponseReplyMessage(message);
              await this.WppSender.setTyping(response.clientPhone, true);
              const requestResponse = await this.WppSender.sendReplyMessage(response.clientPhone, WppMessage);
              await this.WppSender.setTyping(response.clientPhone, false);
              requestResponseList.push(requestResponse);
              break;
            }
            case "linkPreview": {
              const WppMessage = defaultToWPPConnectResponseLinkPreview(message);
              await this.WppSender.setTyping(response.clientPhone, true);
              const requestResponse = await this.WppSender.sendLinkPreviewMessage(response.clientPhone, WppMessage);
              await this.WppSender.setTyping(response.clientPhone, false);
              requestResponseList.push(requestResponse);
              break;
            }
            default:
              break;
          }
        }
        return requestResponseList
      }
      default:
        break;
    }
  }
}
