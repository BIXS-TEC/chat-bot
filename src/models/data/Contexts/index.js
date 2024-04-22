import getCardapioOnlineContexts from "./cardapio-online.js";
import getCardapioWhatsAppContexts from "./cardapio-whatsapp.js";

export default function getContextList() {
  const contextList = {};

  contextList["cardapio-online"] = getCardapioOnlineContexts();
  contextList["cardapio-whatsapp"] = getCardapioWhatsAppContexts();

  return contextList;
}
