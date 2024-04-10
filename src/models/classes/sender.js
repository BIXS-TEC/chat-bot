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

  async sendMessage(message) {
    switch (message.platform) {
      case "wppconnect": {
        let responseList = [];
        for (let messageType in message.responseObjects) {
          switch (messageType) {
            case "text": {
              const msg = defaultToWPPConnectResponseTextMessage(message);
              await this.WppSender.setTyping(msg.phone, true);
              const requestResponse = await this.WppSender.sendMessage(msg.phone, msg.message);
              await this.WppSender.setTyping(msg.phone, false);
              responseList.push(requestResponse);
              break;
            }
            case "listMessage": {
              const msg = defaultToWPPConnectResponseListMessage(message);
              await this.WppSender.setTyping(msg.phone, true);
              const requestResponse = await this.WppSender.sendListMessage(msg.phone, msg.description, msg.buttonText, msg.sections);
              await this.WppSender.setTyping(msg.phone, false);
              responseList.push(requestResponse);
              break;
            }
            case "replyMessage": {
              const msg = defaultToWPPConnectResponseReplyMessage(message);
              await this.WppSender.setTyping(msg.phone, true);
              const requestResponse = await this.WppSender.sendReplyMessage(msg.phone, msg.message, msg.messageId);
              await this.WppSender.setTyping(msg.phone, false);
              responseList.push(requestResponse);
              break;
            }
            case "linkPreview": {
              const msg = defaultToWPPConnectResponseLinkPreview(message);
              await this.WppSender.setTyping(msg.phone, true);
              const requestResponse = await this.WppSender.sendLinkPreviewMessage(msg.phone, msg.url);
              await this.WppSender.setTyping(msg.phone, false);
              responseList.push(requestResponse);
              break;
            }
            default:
              break;
          }
        }
        return responseList
      }
      default:
        break;
    }
  }
}
