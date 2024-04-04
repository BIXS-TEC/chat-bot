import Context from "../classes/context.js";

export default function getContextList() {
  const contextList = {};

  /**
   * 'name' : Context {
   *      id = "id",
   *      name = "name",
   *      previousContexts = ["previousContext"]
   *      response = "response()",
   *      action = "action()",
   *      activationKeywords: ["activationKeyword"]
   *      buttons: [
   *        { url: "http://site.com.br/", text: "Button Label" },
   *        { phoneNumber: "+55 00 11223344", text: "Button Label" },
   *        { id: "button_id", text: "Button Label" },
   *      ]
   * }
   */

  contextList["bem-vindo"] = new Context({
    id: "0",
    name: "bem-vindo",
    type: "items-list",
    previousContexts: ["nenhum"],
    response: (chatbot, client) => {
      return `Olá ${client.name}!\nEu sou o ${chatbot.botName}.\n\nEm que posso ajuda-lo?`;
    },
    action: (chatbot, client) => {
      try {
        client.changeContext(contextList["bem-vindo"].name);
      } catch (error) {
        throw new Error('Erro no contexto "bem-vindo"', error);
      }
    },
    itemsList: {
      buttonText: "Clique para ver as opções",
      sections: [
        {
          title: "Escolha uma das opções",
          rows: [
            {
              rowId: "ver-cardapio",
              title: "Ver cardápio",
              description: "Mostrar lista de opções",
            },
            {
              rowId: "atendente",
              title: "Falar com atendente",
              description: "Enviar cartão de contato",
            },
            {
              rowId: "faq",
              title: "Perguntas Frequentes",
              description: "Horário de funcionamento, localização, eventos etc...",
            },
          ],
        },
      ],
    },
  });

  contextList["cardapio"] = new Context({
    id: "0",
    name: "cardapio",
    type: "items-list",
    previousContexts: ["bem-vindo"],
    activationKeywords: ['ver-cardapio'],
    itemsList: {
      buttonText: "Ver Cardápio",
    },
    response: (chatbot, client) => {
      return `Selecione as opções desejadas na lista abaixo.`;
    },
    action: function(chatbot, client) {
      try {
        client.changeContext(contextList["cardapio"].name);
        
        const sections = [];
        console.log(`chatbot.productList: ${chatbot.productList}`);
        for (let category in chatbot.productList) {
          console.log(`category: ${category}`);
          const products = chatbot.productList[category];
          const rows = [];
          
          for (let productId in products) {
            const product = products[productId];
            console.log(`product: ${JSON.stringify(product)}`);
            rows.push({
              rowId: `${product.id}`,
              title: product.name,
              description: `R$ ${product.price.toFixed(2).replace(".", ",")}`,
            });
            
          }
          sections.push({
            title: category,
            rows: rows,
          });
          console.log('sections: ', sections);
        }
        this.itemsList.sections = sections;
        console.log('this.itemsList: ', this.itemsList);

      } catch (error) {
        throw new Error('Erro no contexto "cardápio"', error);
      }
    },
  });

  contextList["faq"] = new Context({
    id: "1",
    name: "faq",
    type: "text",
    previousContexts: ["bem-vindo"],
    activationKeywords: ['faq'],
    response: (chatbot, client) => {
      return `
_*Perguntas Frequentes*_

*Horário de funcionamento*:
seg-sex 11:00 as 20:00
sab-dom 11:00 as 23:00

*Endereço Local*:
Av. Paulista, 3527 - Bela Vista, São Paulo

*Proxímos eventos*:
•Night Show - Blues ao vivo
12/05 - 19:00
•Dazaranha - ao vivo
20/05 - 19:00

Mais informações em
https://printweb.vlks.com.br/`;
    },
    action: (chatbot, client) => {
      client.changeContext(contextList["faq"].name);
    }
  });

  return contextList;
}

console.log("\nContext List:\n", getContextList());
