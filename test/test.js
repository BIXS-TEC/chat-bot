import xlsx from 'xlsx';

// Função para ler dados da planilha e salvar em um objeto
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

    result[category][item.Codigo] = {
      id: item.Codigo,
      name: item.NomeProduto,
      price: parseFloat(item.Valor.toString().replace(',', '.')), // Converte o valor para número e troca vírgula por ponto
      category: category
    };
  });

  return result;
}

// Caminho para o arquivo Excel
const filePath = 'test/notes/produtos.xlsx';

// Chama a função e imprime o resultado
const result = readExcelToObject(filePath);
console.log(JSON.stringify(result, null, 2));
