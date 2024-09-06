import Chatbot from "../classes/chatbot.js";
import { productList } from "./productList.js";
// import { filteredProductList } from "./productsXLSX.js";

export default function getChatbotList() {
  const chatbotList = {};

  chatbotList["5548912345678"] = new Chatbot({
    id: "0", // ID do chatbot, para o banco de dados (não utilizado ainda)
    businessName: "Assistente Bix", // Nome de perfil do Whats App
    phoneNumber: "5548912345678", // Numero de telefone
    clientList: {}, // Lista de clientes
    employeeList: {}, // Lista de funcionários
    productList: productList, // Lista de produtos, esta lista é controlada em src\models\utils\time.js
    config: {
      recurrentTime: 1 * 10 * 1000, // minutos * segundos * milisegundos // Tempo para enviar a mensagem de produtos recorrentes
      recurrentCategories: ['Bebidas', 'Drinks'], // Categorias de produtos que se forem pedidos, devem ser recomendados como recorrentes
      timeToCloseBill: 60 * 60 * 1000,  // Tempo para fechar a conta, caso não responda a pesquisa de satisfação
      flow: ["WhatsApp"], // Opções: ['WhatsApp', 'PrintWeb']  // Fluxos aceitos
      modality: ["Mesa"], // Opções: ['Mesa', 'Comanda', 'Cartela', 'Ficha']  // Modalidades aceitas
      groupNames: ["Cozinha", "Garçom", "Atendente", "Caixa"],  // Nome dos Grupos de Whats App a serem criados
      topProductsId: [[0, 1, 4, 5],[1, 3, 5, 6]], // Lista dos IDs dos produtos mais pedidos
      orderCompletionMessage: 'Um garçom irá trazer o seu pedido',  // Mensagem quando finaliza o pedido, pode variar de acordo com a forma como o estabelecimento entrega o pedido
      enableRecommendProducts: true, // Habilitar recomendação de produtos
      enableRecurrentProducts: true, // Habilitar produtos recorrentes
      tableInterval: {  // Numeros de mesas/comandas válidos para serem utilizados pelos clientes
        min: 0,
        max: 10,
        excludedValues: [], // Valores nesse intervalo que devem ser setados como inactive=true
      },
      serviceOptions: { // Opções de funcionalidades
        pedidos: true,  // Grupo pedidos
        caixa: true,  // Grupo Caixa
        atendente: true,  // Grupo Atendente
        garcom: true, // Grupo Garçom
        faq: true,  // Perguntas frequentes
        pesquisaSatisfacao: true, // Pesquisa de satisfação
        onlyTopProducts: false, // Mostrar no fluxo de cardapio no Whats App apenas os produtos mais pedidos
        "cardapio-online": true,  // Possui site configurado para mostrar o cardapio online, associar link em url.cardapio
      },
      url: {
        faq: "https://printweb.vlks.com.br/", // Link para site com perguntas frequentes
        cardapio: "https://tocadosurubim.menudigital.net.br/#/catalogo", // Link para cardapio online
      },
    },
  });

  return chatbotList;
}
