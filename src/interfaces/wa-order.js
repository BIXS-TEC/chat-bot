import lodash from 'lodash';

const order = {};
export default order;

order.uniteClientProducts = function (client) {
  if (!Object.keys(client.chatbot.orderList).length) return;
  // const clientCopy = { ...client };
  const clientCopy = lodash.cloneDeep(client);
  client.chatbot.orderList = {};
  console.log('uniteClientProducts clientCopy:', clientCopy);
  for (let productId in clientCopy.chatbot.orderList) {
    if (client.chatbot.approvedOrderList[productId]) {
      client.chatbot.approvedOrderList[productId].quantity += clientCopy.chatbot.orderList[productId].quantity;
      if (clientCopy.chatbot.orderList[productId].additionalList?.length) {
        if (!client.chatbot.approvedOrderList[productId].additionalList?.length) client.chatbot.approvedOrderList[productId].additionalList = [];
        console.log("additionalList: ", clientCopy.chatbot.orderList[productId].additionalList);
        client.chatbot.approvedOrderList[productId].additionalList.push([...clientCopy.chatbot.orderList[productId].additionalList]);
      }
    } else {
      const { additionalList, ...noAdditionalProd } = { ...clientCopy.chatbot.orderList[productId] };
      client.chatbot.approvedOrderList[productId] = noAdditionalProd;
      if (additionalList?.length) {
        client.chatbot.approvedOrderList[productId].additionalList = [];
        client.chatbot.approvedOrderList[productId].additionalList.push(additionalList);
      }
    }
    // console.log("sendClientOrder client.chatbot.approvedOrderList: \n", JSON.stringify(client.chatbot.approvedOrderList, null, 2));
  }
  console.log('uniteClientProducts clientCopy:', clientCopy);
  return clientCopy;
};

order.convertToMessage = function (client) {
  const order = client.chatbot.orderList;

  let message = `# ${client.name} (${client.chatbot.modality} ${client.chatbot.modalityId})`;
  /** Produto */
  for (const productName in order) {
    // 1. Pedidos da Cozinha
    const product = order[productName];
    message += `\n\n*(${product.quantity}x) - ${product.name}*`;
    /** Adicionais de cada produto */
    if (product.additionalList && product.additionalList.length) {
      for (let i = 0; i < product.additionalList.length; i++) {
        message += `\n  ${i + 1}º`;
        /** Adicional */
        const additionals = Object.values(product.additionalList[i]);
        if (additionals.length) {
          for (let j = 0; j < additionals.length; j++) {
            message += `    ${j > 0 ? "      " : ""}${additionals[j].name} - ${
              additionals[j].quantity ? `${additionals[j].quantity}x` : additionals[j].text
            }\n`;
          }
        } else {
          message += `    Tradicional\n`;
        }
      }
    }
    // 2. Pedidos do Bar
  }

  return message;
};
