import xlsx from 'xlsx';

/**
 * Função para ler dados da planilha e salvar em um objeto
 * @param {string} filePath 
 * @returns 
 */
function readExcelToObject(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  const data = xlsx.utils.sheet_to_json(sheet);

  const result = {};

  data.forEach((item, index) => {
    const category = item.Categoria;
    if (!result[category]) {
      result[category] = {};
    }

    if (!item.Codigo || !item.NomeProduto || !item.Valor || !category) console.log('\x1b[33m',`Invalid Codigo:${item.Codigo} NomeProduto:${item.NomeProduto} Valor:${item.Valor} category:${category}`, '\x1b[0m')

    result[category][item.Codigo] = {
      id: item.Codigo,
      name: item.NomeProduto,
      price: parseFloat(item.Valor.toString().replace(',', '.')), // Converte o valor para número e troca vírgula por ponto
      category: category
    };
  });

  return result;
}

// Caminho para o arquivo Excel src/models/data/productsXLSX.js
const filePath = '../../../test/notes/produtos.xlsx';

// Chama a função e imprime o resultado
const result = readExcelToObject(filePath);
// console.log(JSON.stringify(result, null, 2));

export const filteredProductList = readExcelToObject(filePath);
