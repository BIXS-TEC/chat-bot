const client = {
  id: "554791025923@c.us",
  name: "Marcelo",
  phoneNumber: "554791025923",
  platform: "wppconnect",
  chatbot: {
    currentMessage: "Fechar conta e pagar 🧾",
    messageType: "list_response",
    messageTo: "554891487526",
    interaction: "cardapio-whatsapp",
    chatbotPhoneNumber: "554891487526",
    itemId: "solicitar-fechamento",
    context: "solicitar-fechamento",
    lastChatbotMessage: [
      {
        type: "text",
        message: "Seu pedido já esta sendo preparado!!!\n\nO tempo de espera é de +- *30 minutos*\n\nAgradecemos pela preferência! 😊",
      },
      {
        type: "listMessage",
        description: "Continue pedindo!",
        buttonText: "SELECIONE UMA OPÇÃO",
        sections: [
          {
            title: "🔽 Selecione uma das opções",
            rows: [
              {
                rowId: "cardapio",
                title: "Voltar ao cardápio 🍔",
                description: "",
              },
              {
                rowId: "solicitar-fechamento",
                title: "Fechar conta e pagar 🧾",
                description: "",
              },
              {
                rowId: "garcom",
                title: "Solicitar garçom à mesa 🤵",
                description: "",
              },
              {
                rowId: "atendente",
                title: "Transferir conversa para atendente 📲",
                description: "",
              },
              {
                rowId: "faq",
                title: "Perguntas Frequentes ❔",
                description: "Horário de funcionamento, localização, eventos etc...",
              },
            ],
          },
        ],
      },
    ],
    modalityId: "3",
    modality: "Mesa",
    messageHistory: [
      "nenhum&&3",
      "informar-id&&3",
      "bem-vindo&&cardapio",
      "cardapio&&0",
      "cardapio&&1",
      "cardapio&&4",
      "cardapio&&adicionais",
      "adicionais&&1:0:0",
      "adicionais&&4:0:observation",
      "incluir-observacao&&Hjhhhhhhhh",
      "adicionais&&editar-pedido",
      "editar-pedido&&cardapio",
      "cardapio&&5",
      "cardapio&&recomendar-produto",
      "recomendar-produto&&finalizar-pedido",
      "finalizar-pedido&&solicitar-fechamento",
    ],
    orderList: {},
    approvedOrderList: {
      0: {
        id: 0,
        name: "X-Bacon",
        description: "Pão, hamburguer, bacon, queijo, tomate, alface",
        price: 25.5,
        maxAddQt: 3,
        category: "Lanches",
        quantity: 3,
        additionalList: [
          [
            {
              0: {
                id: 0,
                name: "Queijo",
                price: 2,
                quantity: 1,
              },
              1: {
                id: 1,
                name: "Bacon",
                price: 5,
                quantity: 1,
              },
            },
            {
              0: {
                id: 0,
                name: "Queijo",
                price: 2,
                quantity: 1,
              },
              observation: {
                text: "Obssssssss",
                name: "Observação",
              },
            },
          ],
          [
            {
              0: {
                id: 0,
                name: "Queijo",
                price: 2,
                quantity: 3,
              },
            },
          ],
        ],
      },
      1: {
        id: 1,
        name: "X-Burguer",
        description: "Pão, hamburguer, queijo",
        price: 19,
        maxAddQt: 3,
        category: "Lanches",
        quantity: 2,
        additionalList: [
          [
            {
              2: {
                id: 2,
                name: "Hamburguer",
                price: 8,
                quantity: 1,
              },
            },
            {},
          ],
        ],
      },
      2: {
        id: 2,
        name: "X-Salada",
        description: "Pão, hamburguer, queijo, tomate, alface",
        price: 22.5,
        maxAddQt: 3,
        category: "Lanches",
        quantity: 1,
        additionalList: [[{}]],
      },
      4: {
        id: 4,
        name: "Coca-Cola Lata",
        price: 5.5,
        category: "Bebidas",
        quantity: 1,
      },
      5: {
        id: 5,
        name: "Guaraná Lata",
        price: 5,
        category: "Bebidas",
        quantity: 1,
      },
    },
    humanChating: false,
    messageIds: {
      saveResponse: "",
    },
    context: "solicitar-fechamento",
  },
};

export default client;
