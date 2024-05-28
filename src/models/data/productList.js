import { additionalList } from "./additionalList.js";

export const productList = [
  {
    Lanches: {
      0: {
        id: 0,
        name: "X-Bacon",
        description: "Pão, hamburguer, bacon, queijo, tomate, alface",
        price: 25.5,
        maxAddQt: 3,
        category: "Lanches",
        additionalList: [
          {
            [additionalList[0].id]: additionalList[0],
            [additionalList[1].id]: additionalList[1],
          },
        ],
      },
      1: {
        id: 1,
        name: "X-Burguer",
        description: "Pão, hamburguer, queijo",
        price: 19.0,
        maxAddQt: 3,
        category: "Lanches",
        additionalList: [
          {
            [additionalList[0].id]: additionalList[0],
            [additionalList[2].id]: additionalList[2],
          },
        ],
      },
      2: {
        id: 2,
        name: "X-Salada",
        description: "Pão, hamburguer, queijo, tomate, alface",
        price: 22.5,
        maxAddQt: 3,
        category: "Lanches",
        additionalList: [
          {
            [additionalList[0].id]: additionalList[0],
          },
        ],
      },
      3: {
        id: 3,
        name: "X-Tudo",
        description: "Pão, hamburguer, bacon, ovo, calabresa, queijo, tomate, alface",
        price: 26.0,
        maxAddQt: 3,
        category: "Lanches",
        additionalList: [
          {
            [additionalList[0].id]: additionalList[0],
            [additionalList[1].id]: additionalList[1],
            [additionalList[2].id]: additionalList[2],
          },
        ],
      },
    },
    Bebidas: {
      4: {
        id: 4,
        name: "Coca-Cola Lata",
        price: 5.5,
        category: "Bebidas",
      },
      5: {
        id: 5,
        name: "Guaraná Lata",
        price: 5.0,
        category: "Bebidas",
      },
      6: {
        id: 6,
        name: "Coca-Cola 2L",
        price: 13.0,
        category: "Bebidas",
      },
      7: {
        id: 7,
        name: "Agua com gás",
        price: 4.0,
        category: "Bebidas",
      },
    },
  },
  {
    Pasteis: {
      0: {
        id: 0,
        name: "Pastel de Queijo",
        description: "",
        price: 15.5,
        maxAddQt: 3,
        category: "Pasteis",
        additionalList: [
          {
            [additionalList[0].id]: additionalList[0],
            [additionalList[1].id]: additionalList[1],
          },
        ],
      },
      1: {
        id: 1,
        name: "Pastel de Carne",
        description: "",
        price: 19.0,
        maxAddQt: 3,
        category: "Pasteis",
        additionalList: [
          {
            [additionalList[0].id]: additionalList[0],
            [additionalList[2].id]: additionalList[2],
          },
        ],
      },
      2: {
        id: 2,
        name: "Pastel de Carne c/ Queijo",
        description: "",
        price: 22.5,
        maxAddQt: 3,
        category: "Pasteis",
        additionalList: [
          {
            [additionalList[0].id]: additionalList[0],
          },
        ],
      },
      3: {
        id: 3,
        name: "Pastel de Palmito",
        description: "",
        price: 16.0,
        maxAddQt: 3,
        category: "Pasteis",
        additionalList: [
          {
            [additionalList[0].id]: additionalList[0],
            [additionalList[1].id]: additionalList[1],
            [additionalList[2].id]: additionalList[2],
          },
        ],
      },
    },
    Bebidas: {
      4: {
        id: 4,
        name: "Pepsi Lata",
        price: 5.5,
        category: "Bebidas",
      },
      5: {
        id: 5,
        name: "Guaraná Lata",
        price: 5.0,
        category: "Bebidas",
      },
      6: {
        id: 6,
        name: "Tubaina 2L",
        price: 13.0,
        category: "Bebidas",
      },
      7: {
        id: 7,
        name: "Agua sem gás",
        price: 4.0,
        category: "Bebidas",
      },
    },
  },
];

// Pizzas: {
//   8: {
//     id: 8,
//     name: "Pizza BROTO 1 Sabor",
//     description: '30 cm',
//     price: 55.0,
//     flavorQt: 1,
//     flavorPriceIsProductPrice: true,
//     flavorList: [
//       {
//         [flavorList[0].id]: flavorList[0],
//         [flavorList[1].id]: flavorList[1],
//         [flavorList[2].id]: flavorList[2],
//       },
//     ],
//   },
//   9: {
//     id: 9,
//     name: "Pizza GRANDE 1 Sabor",
//     description: '40 cm',
//     price: 72.0,
//     flavorQt: 1,
//     flavorPriceIsProductPrice: true,
//     flavorList: [
//       {
//         [flavorList[0].id]: flavorList[0],
//         [flavorList[1].id]: flavorList[1],
//         [flavorList[2].id]: flavorList[2],
//       },
//     ],
//   },
//   9: {
//     id: 9,
//     name: "Pizza GRANDE 2 Sabores",
//     description: '40 cm',
//     price: 72.0,
//     flavorQt: 2,
//     flavorPriceIsProductPrice: true,
//     flavorList: [
//       {
//         [flavorList[0].id]: flavorList[0],
//         [flavorList[1].id]: flavorList[1],
//         [flavorList[2].id]: flavorList[2],
//       },
//     ],
//   },
//   12: {
//     id: 12,
//     name: "Pizza GIGANTE 2 Sabores",
//     description: '50 cm',
//     price: 86.0,
//     flavorQt: 2,
//     flavorPriceIsProductPrice: true,
//     flavorList: [
//       {
//         [flavorList[0].id]: flavorList[0],
//         [flavorList[1].id]: flavorList[1],
//         [flavorList[2].id]: flavorList[2],
//       },
//     ],
//   },
//   13: {
//     id: 13,
//     name: "Pizza GIGANTE 3 Sabores",
//     description: '50 cm',
//     price: 86.0,
//     flavorQt: 3,
//     flavorPriceIsProductPrice: true,
//     flavorList: [
//       {
//         [flavorList[0].id]: flavorList[0],
//         [flavorList[1].id]: flavorList[1],
//         [flavorList[2].id]: flavorList[2],
//       },
//     ],
//   },
//   14: {
//     id: 14,
//     name: "Pizza GIGANTE 4 Sabores",
//     description: '50 cm',
//     price: 86.0,
//     flavorQt: 4,
//     flavorPriceIsProductPrice: true,
//     flavorList: [
//       {
//         [flavorList[0].id]: flavorList[0],
//         [flavorList[1].id]: flavorList[1],
//         [flavorList[2].id]: flavorList[2],
//       },
//     ],
//   },
// },
