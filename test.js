const itemId = "1:1"

const [productId, index, additionalId] = itemId.split(":").map((num) => parseInt(num));

console.log(productId, index, additionalId);