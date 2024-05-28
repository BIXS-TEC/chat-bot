import Chatbot from "../classes/chatbot.js";
import { productList } from "./productList.js";
import { filteredProductList } from "./productsXLSX.js";

export default function getChatbotList() {
  const chatbotList = {};

  chatbotList["554891487526"] = new Chatbot({
    id: "0",
    businessName: "Restaurante Bix",
    phoneNumber: "554891487526",
    clientList: {},
    productList: productList,
    config: {
      recurrentTime: 1 * 10 * 1000, // minutos * segundos * milisegundos
      recurrentCategories: ['Bebidas', 'Drinks'],
      flow: ["WhatsApp"], // Opções: ['WhatsApp', 'PrintWeb']
      modality: ["Mesa"], // Opções: ['Mesa', 'Comanda', 'Cartela', 'Ficha']
      groupNames: ["Cozinha", "Garçom", "Atendente", "Caixa"],
      topProductsId: [0, 1, 4, 5],
      serviceOptions: {
        atendente: true,
        garcom: true,
        faq: true,
      },
      url: {
        faq: "https://printweb.vlks.com.br/",
        cardapio: "https://printweb.vlks.com.br/",
      },
    },
  });

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
