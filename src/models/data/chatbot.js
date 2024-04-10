import Chatbot from "../classes/chatbot.js";
import getContextList from "./context.js";
import { productList } from "./productList.js";

export default function getChatbotList() {
  const chatbotList = {};

  chatbotList["554891487526"] = new Chatbot(
    '0',
    'bix',
    '554891487526',
    {},
    productList,
    getContextList(),
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