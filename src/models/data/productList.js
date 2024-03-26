import { additionalList } from "./additionalList"

export const productList = {
    0 : {
        id: 0,
        name: 'X-Bacon',
        price: 22.50,
        additionalList: {
            [additionalList[0].id]: additionalList[0],
            [additionalList[1].id]: additionalList[1]
        }
    },
    1 : {
        id: 1,
        name: 'X-Burguer',
        price: 23.00,
        additionalList: {
            [additionalList[0].id]: additionalList[0],
            [additionalList[2].id]: additionalList[2]
        }
    },
    2 : {
        id: 2,
        name: 'X-Salada',
        price: 22.50,
        additionalList: {
            [additionalList[0].id]: additionalList[0]
        }
    },
    3 : {
        id: 3,
        name: 'X-Tudo',
        price: 26.0,
        additionalList: {
            [additionalList[0].id]: additionalList[0],
            [additionalList[1].id]: additionalList[1],
            [additionalList[2].id]: additionalList[2]
        }
    },
    4 : {
        id: 4,
        name: 'Coca-Cola Lata',
        price: 5.50
    },
    5 : {
        id: 5,
        name: 'Guaraná Lata',
        price: 5.0
    },
    6 : {
        id: 6,
        name: 'Coca-Cola 2L',
        price: 13.0
    },
    7 : {
        id: 7,
        name: 'Agua com gás',
        price: 4.0
    }
}