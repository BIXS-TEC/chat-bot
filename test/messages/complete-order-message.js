import client from "../objects/client-final.js";

function getCompleteOrderMessage(client) {
  let totalPrice = 0.0;
  let message = "";
  const orderList = client.chatbot.approvedOrderList;
  console.log("client.orderList :", JSON.stringify(orderList, null, 2));
  for (const productId in orderList) {
    const product = orderList[productId];
    if (product.additionalList?.length) {
      //&& !product.additionalList.every((obj) => Object.keys(obj).length === 0)) {
      let prodNum = 1;
      for (let orderNum = 0; orderNum < product.additionalList.length; orderNum++) {
        // message += product.additionalList.length>1 ? `\n Pedido nº ${orderNum + 1} :` : '';
        for (let i = 0; i < product.additionalList[orderNum].length; i++) {
          message += `\n• ${product.name} nº${prodNum++} R$ ${product.price.toFixed(2).replace(".", ",")}`;
          totalPrice += product.price;
          if (Object.keys(product.additionalList[orderNum][i]).length) {
            for (const additionalId in product.additionalList[orderNum][i]) {
              const additional = product.additionalList[orderNum][i][additionalId];
              console.log("\x1b[34;1m%s\x1b[0m", "additional: ", additional);
              if (additional.name === "Observação") {
                message += "\n   +`Obs: " + additional.text + "`";
              } else {
                message +=
                  "\n   +`" +
                  `${additional.name} x${additional.quantity} +${(additional.price * additional.quantity).toFixed(2).replace(".", ",")}` +
                  "`";
                totalPrice += additional.price * additional.quantity;
              }
            }
          } else {
            message += "\n   `tradicional`";
          }
        }
      }
    } else {
      const price = product.price;
      const qnt = product.quantity;
      message += `\n• ${product.name} x${qnt} (R$ ${(price * qnt).toFixed(2).replace(".", ",")})`;
      totalPrice += price * qnt;
    }
  }
  message = `Seu pedido: (Total R$ ${totalPrice.toFixed(2).replace(".", ",")})` + message;
  return message;
}

console.log(getCompleteOrderMessage(client));
