import Chatbot from "../classes/chatbot.js";
import getContextList from "./contexts/index.js";
import { productList } from "./productList.js";

export default function getChatbotList() {
  const chatbotList = {};

  chatbotList["554891487526"] = new Chatbot(
    '0',
    'Restaurante Bix',
    '554891487526',
    {faq: "https://printweb.vlks.com.br/", cardapio: "https://printweb.vlks.com.br/"},
    {},
    productList,
    ['Cozinha', 'Bar', 'Garçom', 'Atendente'],
  );

  // chatbotList["123123123"] = new Chatbot(
  //   '1',
  //   'uai',
  //   '123123123',
  //   {},
  //   {},
  //   getContextList(),
  // );

  return chatbotList;
}