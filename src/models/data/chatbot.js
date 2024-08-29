import Chatbot from "../classes/chatbot.js";
import { productList } from "./productList.js";
// import { filteredProductList } from "./productsXLSX.js";

export default function getChatbotList() {
  const chatbotList = {};

  chatbotList["5548912345678"] = new Chatbot({
    id: "0",
    businessName: "Assistente Bix",
    phoneNumber: "5548912345678",
    clientList: {},
    employeeList: {},
    productList: productList,
    config: {
      recurrentTime: 1 * 10 * 1000, // minutos * segundos * milisegundos
      recurrentCategories: ['Bebidas', 'Drinks'],
      timeToCloseBill: 60 * 60 * 1000,
      flow: ["WhatsApp"], // Opções: ['WhatsApp', 'PrintWeb'] 
      modality: ["Mesa"], // Opções: ['Mesa', 'Comanda', 'Cartela', 'Ficha']
      groupNames: ["Cozinha", "Garçom", "Atendente", "Caixa"],
      topProductsId: [[0, 1, 4, 5],[1, 3, 5, 6]],
      orderCompletionMessage: 'Um garçom irá trazer o seu pedido',
      enableRecommendProducts: true,
      enableRecurrentProducts: true,
      tableInterval: {
        min: 0,
        max: 10,
        excludedValues: [],
      },
      serviceOptions: {
        pedidos: true,
        caixa: true,
        atendente: true,
        garcom: true,
        faq: true,
        pesquisaSatisfacao: true,
        onlyTopProducts: false,
        "cardapio-online": true,
      },
      url: {
        faq: "https://printweb.vlks.com.br/",
        cardapio: "https://tocadosurubim.menudigital.net.br/#/catalogo",
      },
    },
  });

  return chatbotList;
}
