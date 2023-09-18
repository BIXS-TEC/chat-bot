"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var controller_1 = require("./controller");
var controller = new controller_1.default();
var negocioTeste = controller.negocioTeste();
var productList = [
    {
        name: "X-Tudo",
        price: 28.50,
        category: "Lanche",
        description: "Pão de hamburguer, Hamburguer 180g, 4 fatias de Bacon, Frango, Ovo frito, Calabresa, Mussarela, Tomate, Alface, Cebola, Molho Especial",
        id: "1",
        additional: [
            { name: "Bacon Extra", price: 3.50, orderCode: '12345' },
            { name: "Calabresa Extra", price: 3.50, orderCode: '12345' },
            { name: "Ovo Extra", price: 3.00, orderCode: '12345' },
            { name: "Frango Extra", price: 3.50, orderCode: '12345' },
            { name: "Queijo Extra", price: 2.50, orderCode: '12345' },
        ]
    },
    {
        name: "X-Frango",
        price: 26.00,
        category: "Lanche",
        description: "Pão de hamburguer, Hamburguer 180g, Frango, Mussarela, Tomate, Alface, Cebola, Molho Especial",
        id: "2",
        additional: [
            { name: "Frango Extra", price: 3.50, orderCode: '12345' },
            { name: "Queijo Extra", price: 2.50, orderCode: '12345' },
            { name: "Ovo", price: 3.00, orderCode: '12345' },
        ]
    }
];
controller.writeBusinessDB(controller.createBusiness("Marcelo Lanches", "123456789qwertyuiopasdfghjklzxcvbnm", "111222333444555", "00099988877"));
controller.writeBusinessDB(negocioTeste);
//
console.log("\n\n\n");
console.log('businessList -->', controller.businessList);
console.log('products -->', controller.businessList[negocioTeste.botNumberID].products);
controller.addProductToBusiness(negocioTeste.botNumberID, productList);
//
console.log('businessList -->', controller.businessList);
console.log('products -->', controller.businessList[negocioTeste.botNumberID].products);
var pedido = {
    name: "Marcelo",
    orderCode: "123456789",
    numberClient: "4791025923",
    addressClient: "Rua Brasil, 123",
    conversationContext: "none",
    BotProdutoPedidos: productList
};
// controller.writeClientToBusinessOrderListDB(negocioTeste.botNumberID, pedido)
var pedido2 = {
    name: "Bruno",
    orderCode: "123123123",
    numberClient: "47912312312",
    addressClient: "Rua Brasil, 456",
    conversationContext: "none",
    BotProdutoPedidos: [{
            name: "X-Bacon",
            price: 28.50,
            category: "Lanche",
            description: "Pão de hamburguer, Hamburguer 180g, 4 fatias de Bacon , Mussarela, Tomate, Alface, Cebola, Molho Especial",
            id: "1",
            additional: [
                { name: "Bacon Extra", price: 3.50, orderCode: '12345' },
                { name: "Queijo Extra", price: 2.50, orderCode: '12345' },
            ]
        }]
};
// controller.writeClientToBusinessOrderListDB(negocioTeste.botNumberID, pedido2)
// //
// console.log('orders -->', controller.businessList[negocioTeste.botNumberID].orders)
// console.log('BotProdutoPedidos -->', controller.businessList[negocioTeste.botNumberID].orders.ordersList[pedido.numberClientID].BotProdutoPedidos)
// controller.addProductToClient(negocioTeste.botNumberID, pedido2, productList)
//
// console.log('orders -->', controller.businessList[negocioTeste.botNumberID].orders)
// console.log('BotProdutoPedidos -->', controller.businessList[negocioTeste.botNumberID].orders.ordersList[pedido2.numberClientID].BotProdutoPedidos)
// controller.removeProductFromClient(negocioTeste.botNumberID, pedido2, "X-Tudo")
// //
// console.log('\n\n\nBotProdutoPedidos -->', controller.businessList[negocioTeste.botNumberID].orders.ordersList[pedido2.numberClientID].BotProdutoPedidos)
// const intencao1: Intent = {
//     name: 'bemvindo',
//     activationText: ['oi', 'olá', 'ola', 'oii', 'oiii', 'bom dia', 'boa tarde', 'boa noite'],
//     context: ['none'],
//     response: function bemvindo(businessName: string, clientName: string) {
//         this.context = ['bemvindo']
//         return `Olá ${clientName}!!!
//                 Bem-vindo ao atendimento rápido ${businessName}.
//                 Como posso ajuda-lo?
//                 *[1]* Quero fazer um pedido
//                 *[2]* Quero acompanhar meu pedido
//                 *[3]* Quero falar com um atendente`;
//     }
// }
// controller.writeIntentToBusinessDB(negocioTeste.botNumberID, intencao1)
// //
// console.log(controller.businessList[negocioTeste.botNumberID].botChat[intencao1.name])
// console.log(controller.businessList[negocioTeste.botNumberID].botChat[intencao1.name].response(negocioTeste.name, pedido.name))
// controller
// const intencao2: Intent = {
//     name: 'cardapio',
//     activationText: ['1', '[1]', 'cardapio', 'ver cardapio', 'quero ver o cardapio', 'gostaria de ver o cardapio', 'quero pedir', 'quero fazer um pedido'],
//     context: ['bemvindo', 'none'],
//     response: function cardapio(business: Business) {
//         this.context = ['cardapio']
//         let mensagem: string = "No CARDÁPIO de hoje temos:\n"
//         let i = 0;
//         for (const product of business.products) {
//             let formattedPrice = product.price.toLocaleString("pt-BR", {
//                 style: "currency",
//                 currency: "BRL",
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//             });
//             mensagem += `*[${++i}]* ${product.name} - R$ ${formattedPrice}\n${product.description}\n\n`
//         }
//         mensagem += 'Por favor, digite o numero do seu pedido,\n*um pedido por mensagem*'
//         return mensagem;
//     }
// }
// controller.writeIntentToBusinessDB(negocioTeste.botNumberID, intencao2)
// //
// console.log(controller.businessList[negocioTeste.botNumberID].botChat[intencao2.name])
// console.log(controller.businessList[negocioTeste.botNumberID].botChat[intencao2.name].response(negocioTeste))
//# sourceMappingURL=debbug.js.map