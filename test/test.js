// export function buildSection(title, sectionsName, args = {}) {
//   try {
//     const sectionMappings = {
//       cardapio: {
//         rowId: "cardapio",
//         title: "Ver cardápio 🍔",
//         description: "Fazer um pedido",
//       },
//       atendente: {
//         rowId: "atendente",
//         title: "Falar com um atendente 📲",
//         description: "Transferir para um atendente, caso precise resolver um problema específico",
//       },
//       faq: {
//         rowId: "faq",
//         title: "Perguntas Frequentes ❔",
//         description: "Horário de funcionamento, localização, eventos etc...",
//       },
//       "editar-pedido": {
//         rowId: "editar-pedido",
//         title: "Remover item ✏️",
//         description: "Mudou de ideia? Remova um item da sua lista!",
//       },
//       "finalizar-pedido": {
//         rowId: "finalizar-pedido",
//         title: "Finalizar pedido ✅",
//         description: "Se estiver tudo pronto, finalize seu pedido!",
//       },
//     };

//     // Adiciona as seções de incluir recomendado dinamicamente
//     if (sectionsName.includes("incluir-recomendado")) {
//       const rows = Array.from({ length: args.qtdRecommended }, (_, index) => ({
//         rowId: `incluir-recomendado${index + 1}`,
//         title: `Incluir +${index + 1} no meu pedido`,
//         description: `+R$ ${(args.recommended.price).toFixed(2).replace(".", ",")} cada`,
//       }));
//       sectionMappings["incluir-recomendado"] = rows;
//       // console.log('sectionMappings["incluir-recomendado"]: ', sectionMappings["incluir-recomendado"]);
//     }
    
//     const rows = sectionsName.flatMap(name => sectionMappings[name]);

//     return {
//       title: title,
//       rows: rows,
//     };
//   } catch (error) {
//     console.log("Error in getSections: ", error);
//   }
// }

// const recommended = {
//   name: 'Coca Cola Lata',
//   price: 5.50
// }

// const sections = [ 
//   buildSection(`Selecione a quantidade de ${recommended.name}`, ["incluir-recomendado"], {recommended: recommended, qtdRecommended: 3}),
//   buildSection("🔽 Outras opções", ["editar-pedido", "finalizar-pedido", "atendente"]),
// ]

// console.log(JSON.stringify(sections, null, 2));

/* ---------------------------------------------- */

// import CryptoJS from 'crypto-js';

// export function checkIDCode(id, code) {
//   const hash = CryptoJS.MD5(id).toString();
//   if (code === hash.slice(-5)) return true;
//   return false;
// }

// console.log(checkIDCode("10", "3e820"));
// console.log(checkIDCode("3", "7baf3"));
// console.log(checkIDCode("1", "5849b"));
// console.log(checkIDCode("86", "cebd9"));
// console.log(checkIDCode("110", "f9f3e"));
// console.log(checkIDCode("300", "4988c"));

/* ---------------------------------------------- */

// Mensagem exemplo: 'Olá gostaria de ver as opções! #Mesa:3 #ID:7baf3'

// const msg = 'Olá gostaria de ver as opções! Mesa:3 ID:7baf3';

// const info = msg.split('#');
// console.log(info);
// const place = info[info.length - 2].split(':');
// const code = info[info.length - 1].split(':');
// console.log(place);
// console.log(code);

function Groups(id, name) {
    return {
        id,
        name,
    }
}

console.log(Groups('3', 'Cozinha'));