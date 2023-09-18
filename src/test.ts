import { BotAdditional, BotProduct } from "./interfaces";

function extractProductOrdersFromMessage(mensagem): {
    mesa: string | null;
    pedidos: BotProduct[];
    totalPedido: number | null;
} {
    const regexMesa = /Mesa: (\d+)/;
    const regexCodigo = /Cod: (\d+)/;
    const regexPedido = /(\d+) - ([^\n]+) \.\.\.\.\.\. R\$ ([\d,]+)/;
    const regexTotal = /Total do pedido: R\$ ([\d,]+)/;
    const regexSabores = /Sabores:/;
    const regexQtdSabores = /(\d+) - (\d+)/;
    const regexVazia = /^\s*\n/gm;

    let mesa: string | null = null;
    let pedidos: BotProduct[] = [];
    let totalPedido: number | null = null;

    const lines = mensagem.split('\n');

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if (line.match(regexMesa)) {
            mesa = line.match(regexMesa)[1];
        }
        else if (line.match(regexCodigo)) {
            const codigo = line.match(regexCodigo)[1];
            line = lines[i + 1].trim();
            const [, quantidade, nome, preco] = line.match(regexPedido);
            if (codigo && quantidade && nome && preco) {
                ++i;
                line = lines[i + 1].trim();
                const addList: BotAdditional[] = []
                if (line.match(regexSabores)){
                    ++i;
                    do {
                        line = lines[++i].trim();
                        const [, qtdSabor, codSabor] = line.match(regexQtdSabores)
                        addList.push({
                            ProductCode: codigo,
                            AddCode: codSabor,
                            orderQtdAdd: qtdSabor
                        });
                        line = lines[i+1].trim();
                    } while (line.match(regexQtdSabores))
                }
                pedidos.push({
                    codeProd: codigo,
                    nameProd: nome.trim(),
                    priceProd: parseFloat(preco.replace(',', '.')),
                    orderQtdProd: parseInt(quantidade),
                    AdditionalList: addList
                });
            }
        } else if (line.match(regexTotal)) {
            totalPedido = parseFloat(line.match(regexTotal)[1].replace(',', '.'));
            break;
        }
    }
    return {
        mesa: mesa,
        pedidos: pedidos,
        totalPedido: totalPedido,
    };
}

let mensagem = `Mesa: 3

Cod: 1229618
1 - XBacon ...... R$ 13,00

Cod: 1272635
2 - Pizza 4 sabores ...... R$ 51,90
Sabores: 
1 - 12344 
3 - 77732

Cod: 1560447
1 - XSalada ...... R$ 13,00

Total do pedido: R$ 77,90`

console.log(JSON.stringify(extractProductOrdersFromMessage(mensagem), null, 2))