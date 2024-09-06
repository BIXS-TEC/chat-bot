import wpp from "../../interfaces/wppconnect.js";

const sender = {};
export default sender;

// Enviar a mensagem de acordo com o tipo
// Configurada no método responseObjects de cada contexto
sender.sendMessage = async function (chatbot, response) {
  try {
    if (!response.responseObjects) return;
    switch (response.platform) {
      case "wppconnect": {
        let requestResponseList = [];
        for (let message of response.responseObjects) {
          const phone = message.groupPhone || response.clientPhone;
          switch (message.type) {
            case "text": {
              const WppMessage = wpp.defaultToWPPConnectResponseTextMessage(message);
              if (!message.isGroup) await chatbot.setTyping(phone, true);
              const requestResponse = await chatbot.sendMessage(phone, WppMessage);
              if (!message.isGroup) await chatbot.setTyping(phone, false);
              requestResponseList.push(requestResponse);
              break;
            }
            case "listMessage": {
              const WppMessage = wpp.defaultToWPPConnectResponseListMessage(message);
              await chatbot.setTyping(phone, true);
              const requestResponse = await chatbot.sendListMessage(phone, WppMessage);
              await chatbot.setTyping(phone, false);
              requestResponseList.push(requestResponse);
              break;
            }
            case "replyMessage": {
              const WppMessage = wpp.defaultToWPPConnectResponseReplyMessage(message);
              await chatbot.setTyping(phone, true);
              const requestResponse = await chatbot.sendReplyMessage(phone, WppMessage);
              await chatbot.setTyping(phone, false);
              requestResponseList.push(requestResponse);
              break;
            }
            case "linkPreview": {
              const WppMessage = wpp.defaultToWPPConnectResponseLinkPreview(message);
              await chatbot.setTyping(phone, true);
              const requestResponse = await chatbot.sendLinkPreviewMessage(phone, WppMessage);
              await chatbot.setTyping(phone, false);
              requestResponseList.push(requestResponse);
              break;
            }
            case "contactVcard": {
              const WppMessage = wpp.defaultToWPPConnectContactVcard(message);
              await chatbot.setTyping(phone, true);
              const requestResponse = await chatbot.sendContactVcard(phone, WppMessage);
              await chatbot.setTyping(phone, false);
              requestResponseList.push(requestResponse);
              break;
            }
            case "pollMessage": {
              const WppMessage = wpp.defaultToWPPConnectPollMessage(message);
              await chatbot.setTyping(phone, true);
              const requestResponse = await chatbot.sendPollMessage(phone, WppMessage);
              await chatbot.setTyping(phone, false);
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

// Enviar requisições para obter informações dos grupos presentes no perfil do Whats App sincronizado
sender.sendGroupRequests = async function (chatbot, requestList) {
  try {
    const responseList = await Promise.all(
      requestList.map(async (request) => {
        switch (request.type) {
          case "get-all-groups": {
            let response = await chatbot.getAllGroups();
            response = wpp.WppGetAllGroupsToDefault(response);
            return response;
          }
          case "create-group": {
            let response = await chatbot.createGroup(request.name, request.participants);
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
