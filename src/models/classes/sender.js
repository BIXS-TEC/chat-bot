import WppSender from "../../APIs/wppconnect-server/wpp-sender.js";
import wpp from "../../interfaces/wppconnect.js";

export async function sendMessage(response) {
  try {
    switch (response.platform) {
      case "wppconnect": {
        let requestResponseList = [];
        for (let message of response.responseObjects) {
          const phone = message.groupPhone || response.clientPhone;
          switch (message.type) {
            case "text": {
              const WppMessage = wpp.defaultToWPPConnectResponseTextMessage(message);
              await WppSender.setTyping(phone, true);
              const requestResponse = await WppSender.sendMessage(phone, WppMessage);
              await WppSender.setTyping(phone, false);
              requestResponseList.push(requestResponse);
              break;
            }
            case "listMessage": {
              const WppMessage = wpp.defaultToWPPConnectResponseListMessage(message);
              await WppSender.setTyping(phone, true);
              const requestResponse = await WppSender.sendListMessage(phone, WppMessage);
              await WppSender.setTyping(phone, false);
              requestResponseList.push(requestResponse);
              break;
            }
            case "replyMessage": {
              const WppMessage = wpp.defaultToWPPConnectResponseReplyMessage(message);
              await WppSender.setTyping(phone, true);
              const requestResponse = await WppSender.sendReplyMessage(phone, WppMessage);
              await WppSender.setTyping(phone, false);
              requestResponseList.push(requestResponse);
              break;
            }
            case "linkPreview": {
              const WppMessage = wpp.defaultToWPPConnectResponseLinkPreview(message);
              await WppSender.setTyping(phone, true);
              const requestResponse = await WppSender.sendLinkPreviewMessage(phone, WppMessage);
              await WppSender.setTyping(phone, false);
              requestResponseList.push(requestResponse);
              break;
            }
            default:
              break;
          }
        }
        return requestResponseList;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Error in sendMessage: ", error);
  }
}

export async function sendGroupRequests(requestList) {
  try {
    const responseList = await Promise.all(
      requestList.map(async (request) => {
        switch (request.type) {
          case "get-all-groups": {
            let response = await WppSender.getAllGroups();
            response = wpp.WppGroupsToDefault(response);
            return response;
          }
          case "create-group": {
            let response = await WppSender.createGroup(request.name, request.participants);
            response = wpp.WppCreatedGroupToDefault(response, request.participants);
            return response;
          }
          default:
            return null;
        }
      })
    );

    return responseList.filter((response) => response !== null);
  } catch (error) {
    console.error("Error in groups: ", error);
  }
}
