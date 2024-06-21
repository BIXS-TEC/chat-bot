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
        recommendedProductId: 4,
        preparationTime: 15,
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
        recommendedProductId: 4,
        preparationTime: 15,
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
        preparationTime: 15,
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
        preparationTime: 18,
        additionalList: [
          {
            [additionalList[0].id]: additionalList[0],
            [additionalList[1].id]: additionalList[1],
            [additionalList[2].id]: additionalList[2],
          },
        ],
      },
    },
    // "Pizza Salgada": {
    //   8: {
    //     id: 8,
    //     name: "Pizza Média 2 Sabores",
    //     description: "",
    //     price: 0,
    //     flavorQt: 2,
    //     category: "Pizza Salgada",
    //     flavorList: [
    //       {
    //         [flavorList[0].id]: flavorList[0],
    //         [flavorList[1].id]: flavorList[1],
    //         [flavorList[2].id]: flavorList[2],
    //       },
    //     ],
    //     additionalList: [
    //       {
    //         [additionalList[0].id]: additionalList[0],
    //         [additionalList[1].id]: additionalList[1],
    //         [additionalList[2].id]: additionalList[2],
    //       },
    //     ],
    //   },
    //   9: {
    //     id: 9,
    //     name: "Pizza Média 3 Sabores",
    //     description: "",
    //     price: 0,
    //     flavorQt: 3,
    //     category: "Pizza Salgada",
    //     flavorList: [
    //       {
    //         [flavorList[0].id]: flavorList[0],
    //         [flavorList[1].id]: flavorList[1],
    //         [flavorList[2].id]: flavorList[2],
    //       },
    //     ],
    //     additionalList: [
    //       {
    //         [additionalList[0].id]: additionalList[0],
    //         [additionalList[1].id]: additionalList[1],
    //         [additionalList[2].id]: additionalList[2],
    //       },
    //     ],
    //   },
    //   10: {
    //     id: 10,
    //     name: "Pizza Grande 2 Sabores",
    //     description: "",
    //     price: 0,
    //     flavorQt: 2,
    //     category: "Pizza Salgada",
    //     flavorList: [
    //       {
    //         [flavorList[0].id]: flavorList[0],
    //         [flavorList[1].id]: flavorList[1],
    //         [flavorList[2].id]: flavorList[2],
    //       },
    //     ],
    //     additionalList: [
    //       {
    //         [additionalList[0].id]: additionalList[0],
    //         [additionalList[1].id]: additionalList[1],
    //         [additionalList[2].id]: additionalList[2],
    //       },
    //     ],
    //   },
    //   11: {
    //     id: 11,
    //     name: "Pizza Grande 3 Sabores",
    //     description: "",
    //     price: 0,
    //     flavorQt: 3,
    //     category: "Pizza Salgada",
    //     flavorList: [
    //       {
    //         [flavorList[0].id]: flavorList[0],
    //         [flavorList[1].id]: flavorList[1],
    //         [flavorList[2].id]: flavorList[2],
    //       },
    //     ],
    //     additionalList: [
    //       {
    //         [additionalList[0].id]: additionalList[0],
    //         [additionalList[1].id]: additionalList[1],
    //         [additionalList[2].id]: additionalList[2],
    //       },
    //     ],
    //   },
    // },
    Bebidas: {
      4: {
        id: 4,
        name: "Coca-Cola Lata",
        price: 5.5,
        category: "Bebidas",
        recommendedProductId: 0,
        preparationTime: 5,
      },
      5: {
        id: 5,
        name: "Guaraná Lata",
        price: 5.0,
        category: "Bebidas",
        recommendedProductId: 0,
        preparationTime: 5,
      },
      6: {
        id: 6,
        name: "Coca-Cola 2L",
        price: 13.0,
        category: "Bebidas",
        preparationTime: 5,
      },
      7: {
        id: 7,
        name: "Agua com gás",
        price: 4.0,
        category: "Bebidas",
        preparationTime: 5,
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
        recommendedProductId: 4,
        preparationTime: 15,
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
        recommendedProductId: 4,
        preparationTime: 15,
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
        preparationTime: 15,
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
        preparationTime: 15,
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
        recommendedProductId: 1,
        preparationTime: 5,
      },
      5: {
        id: 5,
        name: "Guaraná Lata",
        price: 5.0,
        category: "Bebidas",
        recommendedProductId: 1,
        preparationTime: 5,
      },
      6: {
        id: 6,
        name: "Tubaina 2L",
        price: 13.0,
        category: "Bebidas",
        preparationTime: 5,
      },
      7: {
        id: 7,
        name: "Agua mineral",
        price: 4.0,
        category: "Bebidas",
        preparationTime: 5,
      },
    },
  },
];