import Context from "../../classes/context.js";
import { caixa } from "./templates/group-functions.js";

function contextSetup(contextList, chatbot) {
  const contextNames = [];
  for (const contextName in contextList) {
    contextNames.push(`${contextName}`);
  }
}

export default function getGroupContexts(chatbot) {
  const contextList = {};
  /**
    contextList["context-name"] = new Context({
     id: "0",
     name: "context-name",                                 // Same as self contextList index
     previuosContext: ["context-name1", "context-name2"],  // Only such contexts will precede this context
     activationKeywords: ["key1", "key2"],                 // If more than one context is eligible, words present in activationKeywords will break the tie
     action: function() {},                                // Data managment of this context, returns args that can be passed to responseObjects()
     responseObjects: function() {},                       // Object containing selectable cases in sendMessage of the Sender class, should return following responseObjects
    });
    
    responseObjects: {
      {
        type: 'listMessage',
        description: "description",
        buttonText: "buttonText",
        sections: [
          {
            title: "title",
            rows: [
              {
                rowId: "rowId",
                title: "title",
                description: "description",
              },
              ...
            ],
          },
          ...
        ],
      },
      {
        type: 'text',
        message: "message" 
      },
      {
        type: 'linkPreview',
        url: "https://example.com.br/",
        caption: "caption" // Optional
      },
      replyMessage: {
        message: "message",
        messageId: "messageId"
      }
    }
   */

    contextList["Caixa"] = new Context({
      id: "0",
      name: "Caixa",
      previuosContext: ["nenhum"],
      activationKeywords: [],
      action: function (client) {
        // console.log("contextList['Caixa'] currentMessage:", `[0]:(${client.chatbot.currentMessage[0]})  ` ,client.chatbot.currentMessage)
        if (client.chatbot.currentMessage[0] !== '#') {
        const command = client.chatbot.currentMessage.split(' ')[0].toLowerCase();
        if (!caixa[command]) return caixa['invalido']();
        return caixa[command](this, chatbot, client);
        }
        return ;
      },
      responseObjects: function (client, args = {}) {
        return args.responseObjects;
      },
     });

    
    
  contextSetup(contextList, chatbot);

  return contextList;
}
