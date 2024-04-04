import { productList } from "./src/models/data/productList.js";

for (let category in productList) {
  // Imprime o nome da categoria
  console.log(`Categoria: ${category}`);

  // Acessa o objeto da categoria atual
  const products = productList[category];

  // Itera sobre as chaves do objeto de produtos
  for (let productId in products) {
    // Acessa o objeto do produto atual
    const product = products[productId];

    // Itera sobre as chaves e valores do objeto do produto
    for (let key in product) {
      // Imprime o nome do atributo e o valor correspondente
      console.log(`${key}: ${product[key]}`);
    }
  }
}