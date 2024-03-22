//Cores de texto:

console.log('\x1b[30m%s\x1b[0m','Texto preto');      // Preto
console.log('\x1b[31m%s\x1b[0m','Texto vermelho');   // Vermelho - Erros de tipo ou estrutura de dados
console.log('\x1b[32m%s\x1b[0m','Texto verde');      // Verde
console.log('\x1b[33m%s\x1b[0m','Texto amarelo');    // Amarelo
console.log('\x1b[34m%s\x1b[0m','Texto azul');       // Azul
console.log('\x1b[35m%s\x1b[0m','Texto magenta');    // Magenta - Erros de configuração lógica
console.log('\x1b[36m%s\x1b[0m','Texto ciano');      // Ciano - Mensagens locais de objeto 
console.log('\x1b[37m%s\x1b[0m','Texto branco');     // Branco

// Cores negrito (Mais importantes)
console.log('\x1b[30;1m%s\x1b[0m','Texto preto');      // Preto
console.log('\x1b[31;1m%s\x1b[0m','Texto vermelho');   // Vermelho - Erros de tipo ou estrutura de dados
console.log('\x1b[32;1m%s\x1b[0m','Texto verde');      // Verde
console.log('\x1b[33;1m%s\x1b[0m','Texto amarelo');    // Amarelo
console.log('\x1b[34;1m%s\x1b[0m','Texto azul');       // Azul
console.log('\x1b[35;1m%s\x1b[0m','Texto magenta');    // Magenta - Erros de configuração lógica
console.log('\x1b[36;1m%s\x1b[0m','Texto ciano');      // Ciano - Mensagens locais de objeto 
console.log('\x1b[37;1m%s\x1b[0m','Texto branco');     // Branco

//Estilos de texto:
console.log('\x1b[1m%s\x1b[0m','Texto em negrito');     // Negrito
console.log('\x1b[4m%s\x1b[0m','Texto sublinhado');     // Sublinhado
console.log('\x1b[7m%s\x1b[0m','Texto com inversão');   // Cores invertidas (fundo e texto)
console.log('\x1b[8m%s\x1b[0m','Texto oculto');         // Oculto
console.log('\x1b[0m');                                 // Restaura o estilo padrão

console.log('\x1b[1m\x1b[31m%s\x1b[0m','Texto vermelho em negrito')