import Context from "../classes/context.js";

export default function getContextList() {
  const contextList = {};

  /**
   * 'name' : Context {
   *      id = "id",
   *      name = "name",
   *      previousContexts = ["previousContext"]
   *      response = "response()",
   *      action = "action()",
   *      activationKeywords: ["activationKeyword"]
   *      buttons: [
   *        { url: "http://site.com.br/", text: "Button Label" },
   *        { phoneNumber: "+55 00 11223344", text: "Button Label" },
   *        { id: "button_id", text: "Button Label" },
   *      ]
   * }
   */

  contextList["bem-vindo"] = new Context({
    id: "0",
    name: "bem-vindo",
    previousContexts: ["nenhum"],
    response: (chatbot, client) => {
      return `Olá ${client.name}!\nEu sou o ${chatbot.botName}.\n\nEm que posso ajuda-lo?`;
    },
    action: (chatbot, client) => {
      try {
        client.changeContext(contextList["bem-vindo"].name);
      } catch (error) {
        throw new Error('Error in "bem-vindo" context', error);
      }
    },
    activationKeywords: [],
    buttons: [
      { url: "http://printweb.vlks.com.br/", text: "Ver cardápio" },
      { phoneNumber: "+55 48 91620244", text: "Falar com atendente" },
      { id: "faq", text: "Perguntas Frequentes" },
    ]
  });

  contextList["teste"] = new Context({
    id: "1",
    name: "teste",
    previousContexts: ["bem-vindo"],
    response: (chatbot, client) => {
      return `Isso é um teste!!`;
    },
    action: (chatbot, client) => {
      client.changeContext(contextList["teste"].name);
      console.log("\x1b[36m%s\x1b[0m", `Chatbot ${chatbot.botName} testando com ${client.name}`);
    },
    activationKeywords: [],
    buttons: []
});

  return contextList;
}

console.log("\nContext List:\n", getContextList());
