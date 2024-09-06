import Context from "../../classes/context.js";

function contextSetup(contextList, chatbot) {
  const contextNames = [];
  for (const contextName in contextList) {
    contextNames.push(`${contextName}`);
  }
}

/**
 * Obter os contextos para comando do admin, com conversa com seu próprio numero
 * @param {Chatbot} chatbot 
 * @returns 
 */
export default function getAdminContexts(chatbot) {
  const contextList = {};

  /*
  contextList["context-name"] = new Context({
    id: "0",
    name: "context-name",                                 // Same as self contextList index
    previuosContext: ["context-name1", "context-name2"],  // Only such contexts will precede this context
    action: function(),                                   // Data managment of this context, returns args that can be passed to responseObjects()
    activationKeywords: ["key1", "key2"],                 // If more than one context is eligible, words present in activationKeywords will break the tie
    responseObjects: function(),                          // Object containing selectable cases in sendMessage of the Sender class, should return following responseObjects
   });
   */

  contextList["."] = new Context({
    id: "0",
    name: "finalizar-atendimento",
    previuosContext: ["admin"],
    activationKeywords: ["."],
    action: function (client) {
      chatbot.clientList[client.phoneNumber].chatbot.humanChating = false;
      return true;
    },
    responseObjects: function (client, args = {}) {
      // console.log("lastResponseBeforeAtendente: ", client.chatbot.lastResponseBeforeAtendente);
      const returnMessage = [
        {
          type: "text",
          message: "Vamos continuar de onde paramos?",
          dontSave: true,
        },
      ];
      returnMessage.push(...client.chatbot.lastResponseBeforeAtendente);
      // console.log("returnMessage :", returnMessage);
      delete client.chatbot.lastResponseBeforeAtendente;
      return returnMessage;
    },
  });

  contextSetup(contextList, chatbot);

  return contextList;
}
