import getCardapioOnlineContexts from "./cardapio-online.js";
import getCardapioWhatsAppContexts from "./cardapio-whatsapp.js";

export default function getContextList(chatbot) {
  const contextList = {};

  contextList["cardapio-online"] = getCardapioOnlineContexts(chatbot);
  contextList["cardapio-whatsapp"] = getCardapioWhatsAppContexts(chatbot);

  return contextList;
}
