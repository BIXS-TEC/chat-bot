const order = {};
export default order;

order.convertToMessage = function (client) {
  const order = client.orderList;

  let message = `${client.name} (${client.chatbot.modality} ${client.chatbot.modalityId})`;
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
          for (let j=0; j<additionals.length; j++) {
            message += `    ${j>0 ? '      ' : '' }${additionals[j].name} - ${additionals[j].quantity}x\n`;
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
