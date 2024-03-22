import Context from "../classes/context.js";

export default function getContextList() {
  const contextList = {};

  /**
   * 'name' : Context {
   *      id = "id",
   *      name = "name",
   *      response = "response()",
   *      action = "action()",
   *      previousContexts = ["previousContexts"]
   * }
   */

  contextList["bem-vindo"] = new Context(
    "0",
    "bem-vindo",
    ["nenhum"],
    (chatbot, client) => {
      return `Olá ${client.name}!\nEu sou o ${chatbot.botName}.\n\nEm que posso ajuda-lo?`;
    },
    (chatbot, client) => {
      try {
        client.chatbot.context =  contextList["bem-vindo"].name;
      } catch (error) {
        throw new Error('Error in "bem-vindo" context', error)
      }
    },
    [],
    ["Ver cardápio", "Falar com atendente"]
  );

  contextList["teste"] = new Context(
    "0",
    "teste",
    ["bem-vindo"],
    () => {
      return `Isso é um teste!!`;
    },
    (chatbot, client) => {
      client.chatbot.context = 'teste';
      console.log('\x1b[36m%s\x1b[0m',`Chatbot ${chatbot.botName} testando com ${client.name}`);
    },
    [],
    []
  );

  return contextList;
}

console.log('\nContext List:\n', getContextList());