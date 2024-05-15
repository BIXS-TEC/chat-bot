import getAdminContexts from "./admin.js";
import getCardapioOnlineContexts from "./cardapio-online.js";
import getCardapioWhatsAppContexts from "./cardapio-whatsapp.js";

const context = {};
export default context;

context.getContextList = function (chatbot) {
  const contextList = {};

  contextList["admin"] = getAdminContexts(chatbot);
  if (chatbot.config.flow.includes("PrintWeb")) contextList["cardapio-online"] = getCardapioOnlineContexts(chatbot);
  if (chatbot.config.flow.includes("WhatsApp")) contextList["cardapio-whatsapp"] = getCardapioWhatsAppContexts(chatbot);

  if (!Object.keys(contextList).length) throw new Error("Nenhuma lista de contexto selecionada!");

  return contextList;
}
