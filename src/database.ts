import { Business } from "./interfaces";
import Controller from "./business";
import * as XLSX from 'xlsx';

const controller: Controller = new Controller()

const Marcelo_Lanches: Business = {
  name: "AAAAAAAAAAAAAAA",
  FBTOKEN: "5234523452345234523452345234aaaaaaaaaaaaaaaaaaaaaaaaa",
  botNumberID: "66666666666",
  botNumber: "222222222",
  products: [],
  orders: { ordersList: {} },
  botChat: {}
};

controller.writeBusinessDB(controller.createBusiness(Marcelo_Lanches.name, Marcelo_Lanches.FBTOKEN, Marcelo_Lanches.botNumberID, Marcelo_Lanches.botNumber));

(async () => { 
  const data = await controller.readBusinessDB(Marcelo_Lanches.botNumberID)
  console.log('\n\nBUSINESS ---------------\n', data)
})()

controller.writeIntentToBusinessDB(Marcelo_Lanches.botNumberID, controller.createIntent('cardapio', ['cardapio', 'ola', 'bom dia'], ['bemvindo'], function bemvindo(): string {
  return `Bem-vindo ao atendimento rápido.
como posso ajuda-lo?

*[1]* Quero fazer um pedido
*[2]* Quero acompanhar meu pedido
*[3]* Quero falar com um atendente`}));

(async () => { 
  const data = await controller.readIntentFromBusinessDB(Marcelo_Lanches.botNumberID, 'bemvindo')
  console.log('\n\nINTENT ---------------\n', JSON.stringify(data))
})()

controller.writeClientToBusinessOrderListDB(Marcelo_Lanches.botNumberID, controller.createClient('Marcelo', '1234567890', '4791025923'));

(async () => { 
  const data = await controller.readClientFromBusinessDB(Marcelo_Lanches.botNumberID, '4791025923')
  console.log('\n\nCLIENT ---------------\n', JSON.stringify(data))
})()

const workbook = XLSX.readFile('./texto-contexto.xlsx');

const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

console.log(data);
const foundItem = data.find(item => item['texto'] === '1');

console.log(foundItem['quantidade'])

// Cadastrar nome da pessoa